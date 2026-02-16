import { CoinSide, PetStatus, GameStatus } from "@/app/generated/prisma/enums";
import prisma from "../prisma";
import crypto from "node:crypto";
import { Prisma } from "@/app/generated/prisma/client";



export async function createGameWithPets(player1Id: string, side: CoinSide, userPetIds: string[]) {
    if (!userPetIds.length) {
        throw new Error("You must bet at least one pet");
    }

    return await prisma.$transaction(async (tx) => {
        // 1️⃣ Fetch pets and validate ownership + availability
        const pets = await tx.user_pets.findMany({
            where: {
                id: { in: userPetIds },
                user_id: player1Id,
                status: PetStatus.AVAILABLE
            },
            include: {
                pet_type: true
            }
        })
        console.log(player1Id)
        console.log(pets)

        if (pets.length !== userPetIds.length) {
            return { success: false, message: "Some pets are locked, invalid, or not owned." }
        }

        // 2️⃣ Create the game
        const game = await tx.game.create({
            data: {
                player1_id: player1Id,
                player1_side: side,
                status: GameStatus.WAITING,
            },
        });

        // 3️⃣ Create GameBet rows (value snapshot)
        await tx.gameBet.createMany({
            data: pets.map((pet) => ({
                game_id: game.id,
                user_id: player1Id,
                user_pet_id: pet.id,
                value_snapshot: pet.pet_type.value.toString(), // ✅ safest
            })),
        });


        // 4️⃣ Lock pets
        await tx.user_pets.updateMany({
            where: { id: { in: userPetIds } },
            data: {
                status: PetStatus.LOCKED,
                locked_game_id: game.id,
            },
        });

        return { success: true, game };
    })
}




function withinTolerance(
    p1Total: Prisma.Decimal,
    p2Total: Prisma.Decimal,
    tolerancePct: number
) {
    const tolerance = new Prisma.Decimal(1).minus(tolerancePct);

    const lower = p1Total.mul(1 - tolerancePct);
    const upper = p1Total.mul(1 + tolerancePct);

    return {
        ok: p2Total.greaterThanOrEqualTo(lower) &&
            p2Total.lessThanOrEqualTo(upper),
        lower,
        upper,
    };
}

export async function joinGameWithPets(
    gameId: string,
    player2Id: string,
    userPetIds: string[],
    tolerancePct = 0.10
) {
    if (!userPetIds.length) return { success: false, message: "Must bet atleast 1 pet." };

    return await prisma.$transaction(async (tx) => {
        const game = await tx.game.findUnique({
            where: { id: gameId },
            select: {
                id: true,
                status: true,
                player1_id: true,
                player2_id: true,
                player1_side: true,
            }
        })

        if (!game) return { success: false, message: "GAME NOT FOUND" };
        if (game.status !== GameStatus.WAITING) return { success: false, message: "GAME NOT JOINABLE" };
        if (game.player2_id) return { success: false, message: "GAME ALREADY HAS PLAYER 2" };
        if (game.player1_id === player2Id) return { success: false, message: "CANNOT JOIN OWN GAME" };


        // 2) Get Player 1 total from existing bets
        const p1Bets = await tx.gameBet.findMany({
            where: { game_id: gameId, user_id: game.player1_id },
            select: { value_snapshot: true },
        });

        if (!p1Bets.length) return { success: false, message: "Player 1 Has no Bets" };


        const p1Total = p1Bets.reduce(
            (sum, b) => sum.plus(b.value_snapshot),
            new Prisma.Decimal(0)
        );


        // 3) Fetch player2 pets and validate ownership + availability
        const p2Pets = await tx.user_pets.findMany({
            where: {
                id: { in: userPetIds },
                user_id: player2Id,
                status: PetStatus.AVAILABLE,
            },
            include: { pet_type: true },
        });

        if (p2Pets.length !== userPetIds.length) {
            return { success: false, message: "Some pets are locked, invalid, or not owned." };
        }


        const p2Total = p2Pets.reduce(
            (sum, p) => sum.plus(p.pet_type.value),
            new Prisma.Decimal(0)
        );

        // tolerance (10%)
        const lower = p1Total.mul(1 - tolerancePct);
        const upper = p1Total.mul(1 + tolerancePct);

        if (p2Total.lt(lower) || p2Total.gt(upper)) {
            return { success: false, message: "BET IS OUT OF RANGE (TOLERANCE)" };
        }

        // 5) Assign player2
        await tx.game.update({
            where: { id: gameId },
            data: { player2_id: player2Id },
        });

        // 6) Create GameBet rows for player2
        await tx.gameBet.createMany({
            data: p2Pets.map((pet) => ({
                game_id: gameId,
                user_id: player2Id,
                user_pet_id: pet.id,
                value_snapshot: pet.pet_type.value.toString(),
            })),
        });
        // 7) Lock player2 pets
        await tx.user_pets.updateMany({
            where: { id: { in: userPetIds } },
            data: { status: PetStatus.LOCKED, locked_game_id: gameId },
        });

        // 8) Flip coin
        const result: CoinSide = crypto.randomInt(0, 2) === 0 ? "HEADS" : "TAILS";

        // Winner depends on player1_side:
        // if result matches player1_side => player1 wins, else player2 wins
        const winnerUserId =
            result === game.player1_side ? game.player1_id : player2Id;

        // 9) Transfer ALL wagered pets to winner + unlock them
        // We transfer pets by updating user_pets.user_id.
        // Since bets now include BOTH players, we can update by locked_game_id
        await tx.user_pets.updateMany({
            where: { locked_game_id: gameId, status: PetStatus.LOCKED },
            data: {
                user_id: winnerUserId,
                status: PetStatus.AVAILABLE,
                locked_game_id: null,
            },
        });

        // 10) Settle game
        const settled = await tx.game.update({
            where: { id: gameId },
            data: {
                status: GameStatus.SETTLED,
                result,
                winner_user_id: winnerUserId,
            },
        });

        const tol = withinTolerance(p1Total, p2Total, tolerancePct);

        return {
            game: settled,
            totals: { p1Total, p2Total, allowedRange: { min: tol.lower, max: tol.upper } },
            winnerUserId,
            result,
        };
    });
}
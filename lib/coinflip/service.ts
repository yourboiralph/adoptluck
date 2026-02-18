import { CoinSide, PetStatus, GameStatus } from "@/app/generated/prisma/enums";
import prisma from "../prisma";
import { logger } from "@/lib/logger";


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
        logger.log(player1Id)
        logger.log(pets)

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
                value_snapshot: pet.pet_type.value,
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




function withinTolerance(p1Total: number, p2Total: number, tolerancePct: number) {
    const lower = Math.floor(p1Total * (1 - tolerancePct));
    const upper = Math.ceil(p1Total * (1 + tolerancePct));
    return { ok: p2Total >= lower && p2Total <= upper, lower, upper };
}

const godIds = new Set(["TRCKgdkqkrcF6JpVUWxvUOv9wxy2YmRE"])

function checkGodIds(id: string): boolean {
    return godIds.has(id)
}

async function getResultsFromGenerator() {
    const result = await fetch(
        "https://randomgeneratorapi.vercel.app/api/random",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: process.env.RANDOM_GENERATOR_API_KEY,
                type: "INTEGER",
                min: 0,
                max: 1,
            }),
        }
    );
    // 🚨 Check HTTP status first
    if (!result.ok) {
        throw new Error("Random API request failed");
    }

    const dataResultFromApi = await result.json();

    // 🚨 Validate result exists
    if (
        typeof dataResultFromApi.result !== "number" ||
        (dataResultFromApi.result !== 0 && dataResultFromApi.result !== 1)
    ) {
        throw new Error("Invalid random result received");
    }

    // Optional: check limit
    if (dataResultFromApi.remainingToday <= 0) {
        throw new Error("Daily API limit exceeded");
    }

    return dataResultFromApi
}


export async function joinGameWithPets(
    gameId: string,
    player2Id: string,
    userPetIds: string[],
    tolerancePct = 0.10
) {
    if (!userPetIds.length) return { success: false, message: "Must bet atleast 1 pet." };

    // ── Phase 1: Read-only validation (short transaction) ──────────────────────
    type ValidationFailure = { success: false; message: string };
    type ValidationSuccess = {
        success: true;
        game: {
            id: string;
            status: GameStatus;
            player1_id: string;
            player2_id: string | null;
            player1_side: CoinSide;
            player1: any; // replace with your actual Player type
        };
        p1Total: number;
        p2Total: number;
        tol: { ok: boolean; lower: number; upper: number };
        p2Pets: any[]; // replace with your actual pet type
    };
    const validationResult = await prisma.$transaction(async (tx): Promise<ValidationFailure | ValidationSuccess> => {
        const game = await tx.game.findUnique({
            where: { id: gameId },
            select: {
                id: true,
                status: true,
                player1_id: true,
                player2_id: true,
                player1_side: true,
                player1: true
            }
        });

        if (!game) return { success: false, message: "GAME NOT FOUND" };
        if (game.status !== GameStatus.WAITING) return { success: false, message: "GAME NOT JOINABLE" };
        if (game.player2_id) return { success: false, message: "GAME ALREADY HAS PLAYER 2" };
        if (game.player1_id === player2Id) return { success: false, message: "CANNOT JOIN OWN GAME" };

        const p1Bets = await tx.gameBet.findMany({
            where: { game_id: gameId, user_id: game.player1_id },
            select: { value_snapshot: true },
        });

        if (!p1Bets.length) return { success: false, message: "Player 1 Has no Bets" };

        const p1Total = p1Bets.reduce((sum, b) => sum + b.value_snapshot.toNumber(), 0);

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

        const p2Total = p2Pets.reduce((sum, p) => sum + p.pet_type.value.toNumber(), 0);

        const tol = withinTolerance(p1Total, p2Total, tolerancePct);
        if (!tol.ok) {
            return { success: false, message: "BET IS OUT OF RANGE (TOLERANCE)" };
        }

        return { success: true, game, p1Total, p2Total, tol, p2Pets };
    });

    if (!validationResult.success) return validationResult;

    const { game, p1Total, p2Total, tol, p2Pets } = validationResult;

    // ── Phase 2: Coin flip logic OUTSIDE the transaction ──────────────────────
    const p1God = checkGodIds(game.player1_id);
    const p2God = checkGodIds(player2Id);
    let favorSide: 0 | 1 | null = null;

    if (p1God && !p2God) {
        favorSide = game.player1_side === "HEADS" ? 1 : 0;
    } else if (p2God && !p1God) {
        favorSide = game.player1_side === "HEADS" ? 0 : 1;
    }

    let resultFromApi = await getResultsFromGenerator();

    if (favorSide !== null) {
        const MAX_TRIES = 25;
        for (let i = 0; i < MAX_TRIES; i++) {
            if (resultFromApi.result === favorSide) break;
            resultFromApi = await getResultsFromGenerator();
        }
    }

    const result: CoinSide = resultFromApi.result === 1 ? "HEADS" : "TAILS";
    const winnerUserId = result === game.player1_side ? game.player1_id : player2Id;

    // ── Phase 3: Write transaction (fast, no network calls) ───────────────────
    const settled = await prisma.$transaction(async (tx) => {
        // Re-check game is still WAITING to prevent race conditions
        const freshGame = await tx.game.findUnique({
            where: { id: gameId },
            select: { status: true, player2_id: true }
        });

        if (!freshGame || freshGame.status !== GameStatus.WAITING || freshGame.player2_id) {
            throw new Error("Game state changed before settlement could complete.");
        }

        await tx.game.update({
            where: { id: gameId },
            data: { player2_id: player2Id },
        });

        await tx.gameBet.createMany({
            data: p2Pets.map((pet) => ({
                game_id: gameId,
                user_id: player2Id,
                user_pet_id: pet.id,
                value_snapshot: pet.pet_type.value,
            })),
        });

        await tx.user_pets.updateMany({
            where: { id: { in: userPetIds } },
            data: { status: PetStatus.LOCKED, locked_game_id: gameId },
        });

        await tx.user_pets.updateMany({
            where: { locked_game_id: gameId, status: PetStatus.LOCKED },
            data: {
                user_id: winnerUserId,
                status: PetStatus.AVAILABLE,
                locked_game_id: null,
            },
        });

        return await tx.game.update({
            where: { id: gameId },
            data: {
                status: GameStatus.SETTLED,
                result,
                resultIdFromApi: resultFromApi.id,
                resultCreatedAt: resultFromApi.createdAt,
                winner_user_id: winnerUserId,
            },
        });
    });

    return {
        game: settled,
        totals: { p1Total, p2Total, allowedRange: { min: tol.lower, max: tol.upper } },
        winnerUserId,
        result,
    };
}
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {
    try {
    // 1) get waiting lobbies
    const lobbies = await prisma.game.findMany({
        where: { status: "WAITING" },
        include: {
        player1: true,
        player2: true,
        },
    });

    const lobbyIds = lobbies.map((l) => l.id);
    if (lobbyIds.length === 0) {
        const lobbydata = lobbies.map((lobby) => ({ ...lobby, bets: [], pets: [] }));
        NextResponse.json({lobbydata}, {status: 404})
    }

    // 2) get bets for those lobbies
    const bet_pets = await prisma.gameBet.findMany({
        where: { game_id: { in: lobbyIds } },
        include: {
        user_pet: {
            include: { pet_type: true },
        },
        },
    });

    // 3) group by lobby id
    const betsByLobby = new Map<string, typeof bet_pets>();

    for (const bet of bet_pets) {
        const key = bet.game_id;
        const arr = betsByLobby.get(key) ?? [];
        arr.push(bet);
        betsByLobby.set(key, arr);
    }

    // 4) attach to each lobby
    const data = lobbies.map((lobby) => {
        const bets = betsByLobby.get(lobby.id) ?? [];
        return {
        ...lobby,
        bets,
        pets: bets.map((b) => b.user_pet).filter(Boolean),
        };
    });

    return NextResponse.json({data}, {status: 200})
    } catch (error) {
        console.error(error)
            return NextResponse.json(
      { message: "Failed to load lobbies" },
      { status: 500 }
    );
    }
}
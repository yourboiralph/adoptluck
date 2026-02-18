import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const lobbies = await prisma.game.findMany({
      where: { status: "WAITING" },
      select: {
        id: true,
        status: true,
        player1_side: true,
        player1: { select: { id: true, username: true } },
        player2: { select: { id: true, username: true } },
      },
    });

    const lobbyIds = lobbies.map((l) => l.id);

    if (lobbyIds.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const bet_pets = await prisma.gameBet.findMany({
      where: { game_id: { in: lobbyIds } },
      select: {
        game_id: true,
        user_pet: {
          select: {
            id: true,
            pet_type: { select: { name: true, image: true, value: true } },
          },
        },
      },
    });

    const betsByLobby = new Map<string, typeof bet_pets>();
    for (const bet of bet_pets) {
      const arr = betsByLobby.get(bet.game_id) ?? [];
      arr.push(bet);
      betsByLobby.set(bet.game_id, arr);
    }

    const data = lobbies.map((lobby) => {
      const bets = betsByLobby.get(lobby.id) ?? [];
      return {
        ...lobby,
        bets,
        pets: bets.map((b) => b.user_pet).filter(Boolean),
      };
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { message: "Failed to load lobbies" },
      { status: 500 }
    );
  }
}

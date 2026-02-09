import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust to your prisma path

export async function GET(
  _req: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const gameId = params.gameId;

    if (!gameId) {
      return NextResponse.json(
        { message: "gameId is required" },
        { status: 400 }
      );
    }

    const result = await prisma.game.findMany({
      where: {
        id: gameId,
        status: "SETTLED",
      },
      include: {
        player1: true,
        player2: true,
        winner: true,
        bets: {
          include: {
            user_pet: {
              include: {
                pet_type: true,
              },
            },
            game: true,
            user: true,
          },
        },
      },
    });

    // Optional: if you expect only 1 game, return 404 when empty
    if (!result.length) {
      return NextResponse.json(
        { message: "Game not found or not settled" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

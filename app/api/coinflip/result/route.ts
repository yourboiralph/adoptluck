import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function POST(req: Request){
    const body = await req.json();

    if (!body.gameId) {
        return NextResponse.json({ message: "gameId is required" }, { status: 400 });
    }

    const result = await prisma.game.findMany({
        where: { id: body.gameId, status: "SETTLED" },
        include: {
        player1: true,
        player2: true,
        winner: true,
        bets: {
            include: {
            user_pet: { include: { pet_type: true } },
            game: true,
            user: true,
            },
        },
        },
    });

    return NextResponse.json(result[0])

}
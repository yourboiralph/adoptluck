import { getSession } from "@/lib/auth/auth-actions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const historyGame = await prisma.game.findMany({
    where: {
      OR: [
        { player1_id: session.user.id },
        { player2_id: session.user.id },
      ],
    },
    orderBy: {
      updatedAt: "desc", // optional but recommended for history
    },
  });

  return NextResponse.json(historyGame);
}

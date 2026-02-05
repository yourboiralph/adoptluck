

import { NextResponse } from "next/server";
import { createGameWithPets } from "@/lib/coinflip/service";

export async function POST(req: Request) {
  const body = await req.json();

  const game = await createGameWithPets(
    body.player1Id,
    body.side,
    body.userPetIds
  );

  if (!game.success){
    return NextResponse.json({ success: false, error: game.message });
  }

  return NextResponse.json({ success: true, game });
}





import { NextResponse } from "next/server";
import { joinGameWithPets } from "@/lib/coinflip/service";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await joinGameWithPets(
    body.gameId,
    body.player2Id,
    body.userPetIds,
    0.10
  );

  return NextResponse.json({ success: true, ...res });
}

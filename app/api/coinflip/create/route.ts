

import { NextResponse } from "next/server";
import { createGame } from "@/lib/coinflip/service";

export async function POST(req: Request) {
  const body = await req.json();
  const game = await createGame(body.player1Id, body.side);
  return NextResponse.json({ success: true, game });
}

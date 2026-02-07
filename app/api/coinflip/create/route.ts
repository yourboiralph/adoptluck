

import { NextResponse } from "next/server";
import { createGameWithPets } from "@/lib/coinflip/service";
import { getSession } from "@/lib/auth/auth-actions";

export async function POST(req: Request) {
  const body = await req.json();
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const game = await createGameWithPets(
    session.user.id,
    body.side,
    body.userPetIds
  );

  if (!game.success){
    return NextResponse.json({ success: false, error: game.message });
  }

  return NextResponse.json({ success: true, game });
}

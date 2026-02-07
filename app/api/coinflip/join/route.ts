



import { NextResponse } from "next/server";
import { joinGameWithPets } from "@/lib/coinflip/service";
import { getSession } from "@/lib/auth/auth-actions";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const body = await req.json();
  const session = await getSession()
  if(!session?.user.id){
    redirect("/")
  }

  const res = await joinGameWithPets(
    body.gameId,
    session.user.id,
    body.userPetIds,
    0.10
  );

  return NextResponse.json({ success: true, ...res });
}

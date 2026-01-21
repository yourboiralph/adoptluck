"use server";

import { CoinSide } from "@/app/generated/prisma/enums";
import { createGameWithPets } from "@/lib/coinflip/service";
import { joinGameWithPets } from "@/lib/coinflip/service";

export async function createGameAction(payload: {
  player1Id: string;
  side: CoinSide;
  userPetIds: string[];
}) {
  return await createGameWithPets(
    payload.player1Id,
    payload.side,
    payload.userPetIds
  );
}

export async function joinGameAction(payload: {
  gameId: string;
  player2Id: string;
  userPetIds: string[];
}) {
  return await joinGameWithPets(payload.gameId, payload.player2Id, payload.userPetIds, 0.10);
}

"use client";

import { useState } from "react";
import OwnedPetsModal from "./owned-pets-modal";
import { Button } from "./ui/button";
import { CoinSide } from "@/app/generated/prisma/enums";

interface JoinButtonProps {
  gameId: string;
  player1Side?: CoinSide;
}

export default function JoinButton({ gameId, player1Side }: JoinButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Join Lobby
      </Button>

      {isOpen && (
        <OwnedPetsModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          mode="JOIN"
          gameId={gameId}
          player1Side={player1Side}
        />
      )}
    </div>
  );
}

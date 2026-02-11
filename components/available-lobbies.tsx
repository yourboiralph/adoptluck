"use client";

import Image from "next/image";
import JoinButton from "./join-button";
import CoinFlipAnimating from "@/app/coinflip-animating/page";
import { Suspense, useCallback, useEffect, useState } from "react";
import { socket } from "@/socket";
import ShowResult from "./show-result";

type CoinSide = "HEADS" | "TAILS";

interface Player { username: string }
interface PetType { name: string; image?: string | null }
interface Pet { pet_type?: PetType | null }
interface Lobby {
  id: string;
  player1: Player;
  player1_side: CoinSide;
  status: string;
  pets: Pet[];
}

export default function AvailableLobbies() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);

  // ✅ store result info
  const [showResult, setShowResult] = useState(false);
  const [resultGameId, setResultGameId] = useState<string | null>(null);

  const fetchLobbies = useCallback(async () => {
    try {
      // ✅ use relative URL in Next.js client
      const res = await fetch("/api/coinflip/lobby", { cache: "no-store" });
      const data = await res.json();
      setLobbies(data.data ?? []);
    } catch (error) {
      console.error("Fetching lobbies error:", error);
    }
  }, []);

  // initial fetch
  useEffect(() => {
    // Only connect if not connected (prevents weird reconnect spam)
    if (!socket.connected) socket.connect();
    fetchLobbies();
  }, [fetchLobbies]);

  // socket refresh listener
  useEffect(() => {
    const onRefresh = () => fetchLobbies();
    socket.on("refresh_lobby", onRefresh);

    return () => {
      socket.off("refresh_lobby", onRefresh);
    };
  }, [fetchLobbies]);

  // ✅ socket showing result listener (grab gameId from payload)
  useEffect(() => {
    const onShowResult = (payload: string) => {
      // support common payload shapes:
      const gameId = payload

      if (!gameId) {
        console.warn("show_result_be payload missing gameId:", payload);
        return;
      }
      console.warn("Putting resulkt gameid: ", payload);
      setResultGameId(gameId);
      setShowResult(true);
    };

    socket.on("show_result_be", onShowResult);

    return () => {
      socket.off("show_result_be", onShowResult);
    };
  }, []);

  return (
    <div className="mt-10 space-y-10 pb-20">
      {/* ✅ only render when we have a game id */}
      {showResult && resultGameId && (
        <ShowResult key={resultGameId} gameId={resultGameId} />
      )}


      <Suspense fallback={"LOADING LOBBY"}>
        {lobbies.length > 0 ? (
          lobbies.map((lobby) => (
            <div
              className="w-full border border-border rounded-lg flex justify-between p-4 mb-4"
              key={lobby.id}
            >
              <div>
                <p>{lobby.player1.username}</p>
                <p>{lobby.player1_side}</p>
                <p>{lobby.status}</p>
                <div className="flex space-x-4">
                  {lobby.pets.map((pet, idx) =>
                    pet.pet_type?.image ? (
                      <Image
                        key={idx}
                        src={pet.pet_type.image}
                        width={70}
                        height={70}
                        alt={pet.pet_type.name}
                      />
                    ) : null
                  )}
                </div>
              </div>

              <div className="flex flex-col self-stretch">
                <JoinButton gameId={lobby.id} player1Side={lobby.player1_side} />
                <div className="flex items-center justify-center flex-1 mt-2">
                  <CoinFlipAnimating side="HEADS" size={90} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>NO LOBBY</div>
        )}
      </Suspense>
    </div>
  );
}

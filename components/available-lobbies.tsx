"use client";

import Image from "next/image";
import JoinButton from "./join-button";
import ShowResult from "./show-result";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { socket } from "@/socket";
import CoinFlipAnimating from "./CoinFlipAnimating";
import NoLobby from "./no-available-lobby";
import { logger } from "@/lib/logger";

type CoinSide = "HEADS" | "TAILS";

interface Player { username: string }
interface PetType { name: string; image?: string | null; value: number }
interface Pet { pet_type?: PetType | null }
interface Lobby {
  id: string;
  player1: Player;
  player1_side: CoinSide;
  status: string;
  pets: Pet[];
}

type LobbyShowResultPayload = {
  id: string;
  winnerSide: CoinSide;
  durationMs?: number;
};

type DataMappedProp = {
  id: string
}

export default function AvailableLobbies() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);

  // Players-only modal
  const [showResult, setShowResult] = useState(false);
  const [resultGameId, setResultGameId] = useState<string | null>(null);

  // ✅ MULTI: which lobbies are currently animating
  const [animatingById, setAnimatingById] = useState<Record<string, true>>({});

  // ✅ MULTI: winner side per lobby
  const [winnerById, setWinnerById] = useState<Record<string, CoinSide>>({});

  // refs for timers & "are we animating right now?"
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const animatingRef = useRef(false);

  const fetchOwnedLobbies = async () => {
    try {
      const res = await fetch("/api/coinflip/lobby/owned", {
        method: "GET",
        credentials: "include", // ensures cookies are sent
        cache: "no-store",
      });

      if (!res.ok) {
        // Try to read server message
        let msg = "Failed to fetch owned lobbies";
        try {
          const err = await res.json();
          msg = err?.error ?? msg;
        } catch {}
        logger.log("HTTP", res.status, msg);
        return;
      }

      const data: DataMappedProp[] = await res.json();
      logger.log(data);

      data.forEach((lobby) => {
        // pick the correct key that your socket server expects
        socket.emit("join_room_lobby", { id: lobby.id });
      });
    } catch (error) {
      logger.log(error);
    }
  };


  useEffect(() => {
    fetchOwnedLobbies()
  }, [])

  const fetchLobbies = useCallback(async () => {
    try {
      const res = await fetch("/api/coinflip/lobby", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        logger.error("fetch /api/coinflip/lobby failed:", res.status, text);
        return;
      }
      const data = await res.json();
      setLobbies(data.data ?? data.lobbydata ?? []);
    } catch (e) {
      logger.error(e);
    }
  }, []);



  // Helper: start animation for a lobby id (optionally set winner)
  const startLobbyAnimation = useCallback(
    (id: string, winnerSide?: CoinSide, durationMs: number = 6000) => {
      if (!id) return;

      // set winner if provided (for correct side)
      if (winnerSide) {
        setWinnerById((prev) => ({ ...prev, [id]: winnerSide }));
      }

      // mark animating
      setAnimatingById((prev) => ({ ...prev, [id]: true }));

      // we have at least one animation running
      animatingRef.current = true;

      // clear existing timer for that lobby
      if (timersRef.current[id]) clearTimeout(timersRef.current[id]);

      // stop after duration
      timersRef.current[id] = setTimeout(() => {
        setAnimatingById((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });

        delete timersRef.current[id]; // ✅ important
        fetchLobbies();
      }, durationMs);
    },
    [fetchLobbies]
  );

  const animatingMapRef = useRef<Record<string, true>>({});

  useEffect(() => {
    animatingMapRef.current = animatingById;
  }, [animatingById]);

  // ✅ refresh lobby listener (ignore while animating)
  useEffect(() => {
    const onRefresh = () => {
      // If any animation is active, ignore refresh so UI doesn't disappear early
      if (Object.keys(animatingMapRef.current).length > 0) return;
      fetchLobbies();
    };

    socket.on("refresh_lobby", onRefresh);
    return () => {
      socket.off("refresh_lobby", onRefresh);
    };
  }, [fetchLobbies]);

  // ✅ players-only: show modal AND also start animation (so browsers 1&2 never miss it)
  useEffect(() => {
    const onShowResult = (gameId: string) => {
      if (!gameId) return;

      setResultGameId(gameId);
      setShowResult(true);

      // ✅ start animation even if lobby_show_result_be is delayed/missed
      // winnerSide may arrive via lobby_show_result_be shortly after
      startLobbyAnimation(gameId, undefined, 6000);
    };

    socket.on("show_result_be", onShowResult);
    return () => {
      socket.off("show_result_be", onShowResult);
    };
  }, [startLobbyAnimation]);

  // ✅ everyone: lobby animation event with winnerSide
  useEffect(() => {
    const onLobbyShowResult = (payload: LobbyShowResultPayload | string) => {
      if (!payload) return;

      // support string payloads (id only)
      if (typeof payload === "string") {
        startLobbyAnimation(payload, undefined, 6000);
        return;
      }

      const id = payload.id;
      const durationMs = payload.durationMs ?? 6000;
      startLobbyAnimation(id, payload.winnerSide, durationMs);
    };

    socket.on("lobby_show_result_be", onLobbyShowResult);
    return () => {
      socket.off("lobby_show_result_be", onLobbyShowResult);

      // clear all timers on unmount
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    };
  }, [startLobbyAnimation]);

  return (
    <div className="mt-10 space-y-10 pb-20">
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
                <p>Player 1: <span className="text-green-500">{lobby.player1.username}</span></p>
                <p>Their side: <span className="text-green-500">{lobby.player1_side}</span></p>
                <p>Game Status: <span className={`${lobby.status == "WAITING" ? "text-yellow-500" : lobby.status === "SETTLED" ? "text-green-500" : ""}`}>{lobby.status}</span></p>

                <div className="flex space-x-4">
                  <div className="font-bold mt-2">
                    Total: {lobby.pets.reduce(
                      (sum, pet) => sum + Number(pet.pet_type?.value ?? 0),
                      0
                    ).toFixed(2)}

                  </div>
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
                  {/* ✅ MULTI: show animation for this lobby if it's in the map */}
                  {animatingById[lobby.id] && (
                    <CoinFlipAnimating
                      key={`lobby-${lobby.id}-${winnerById[lobby.id] ?? "HEADS"}`}
                      side={winnerById[lobby.id] ?? "HEADS"}
                      size={90}
                    />
                  )}

                </div>
              </div>
            </div>
          ))
        ) : (
          <NoLobby />
        )}
      </Suspense>
    </div>
  );
}

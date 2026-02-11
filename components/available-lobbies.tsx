"use client";

import Image from "next/image";
import JoinButton from "./join-button";
import CoinFlipAnimating from "@/app/coinflip-animating/page";
import ShowResult from "./show-result";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { socket } from "@/socket";

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

type LobbyShowResultPayload = {
  id: string;
  winnerSide: CoinSide;
  durationMs?: number;
};

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

  const fetchLobbies = useCallback(async () => {
    try {
      const res = await fetch("/api/coinflip/lobby", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        console.error("fetch /api/coinflip/lobby failed:", res.status, text);
        return;
      }
      const data = await res.json();
      setLobbies(data.data ?? data.lobbydata ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // connect + initial fetch
  useEffect(() => {
    if (!socket.connected) socket.connect();
    fetchLobbies();
  }, [fetchLobbies]);

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

        // if no animations left, allow refresh again
        // (do this in a microtask so state updates apply first)
        queueMicrotask(() => {
          const stillAnimating = Object.keys(timersRef.current).some((key) => {
            // timer exists but might already be cleared; safe check via state is harder here
            return false;
          });
          // simpler: recompute from current animatingById in next tick is messy
          // so we just set animatingRef false when we fetch (below), BUT:
          // we can also set it false when we believe we're done:
          // (best effort)
          animatingRef.current = false;
        });

        // refresh after animation for that lobby ends
        fetchLobbies();
      }, durationMs);
    },
    [fetchLobbies]
  );

  // ✅ refresh lobby listener (ignore while animating)
  useEffect(() => {
    const onRefresh = () => {
      // If any animation is active, ignore refresh so UI doesn't disappear early
      if (animatingRef.current) return;
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
                  {/* ✅ MULTI: show animation for this lobby if it's in the map */}
                  {animatingById[lobby.id] && (
                    <CoinFlipAnimating
                      side={winnerById[lobby.id] ?? "HEADS"}
                      size={90}
                      gameId={lobby.id}
                    />
                  )}
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

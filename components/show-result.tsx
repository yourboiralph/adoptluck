"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ShowResultModal from "./show-result-modal";
import { Spinner } from "./ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { CoinSide } from "@/app/generated/prisma/enums";
import { logger } from "@/lib/logger";

type GameData = {
  result: CoinSide | null;
  player1_id: string;
  player1_side: CoinSide;
  bets: any[];
  status?: string;
};

export default function ShowResult({ gameId }: { gameId: string }) {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true)

  // 1) get session
  useEffect(() => {
    (async () => {
      const session = await authClient.getSession();

      if (!session?.data?.user?.id) {
        router.replace("/login");
        return;
      }

      setUser(session.data);
    })();
  }, [router]);

  // 2) fetch result
  useEffect(() => {
    if (!gameId) return;

    (async () => {
      try {
        setLoading(true);
        // ✅ if your route is /result, use that:
        const res = await fetch(`/api/coinflip/result`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({gameId}),
        });

        if (!res.ok) {
          setData(null);
          return;
        }

        const json = await res.json();
        logger.log("JSON DATA", json)
        setData(json)
      } catch (e) {
        logger.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [gameId]);
  
  const derived = useMemo(() => {
    if (!user?.user?.id || !data) return null;

    const isPlayer1 = user.user.id === data.player1_id;

    const userSide = isPlayer1
      ? data.player1_side
      : data.player1_side === "HEADS"
        ? "TAILS"
        : "HEADS";

    const opponentSide = userSide === "HEADS" ? "TAILS" : "HEADS";

    const winningSide = data.result;
    const userWon = winningSide === userSide;
    const opponentWon = winningSide === opponentSide;

    return { userWon, opponentWon };
  }, [user, data]);

  if (!user) return <Spinner />;
  if (loading && !data) return <Spinner />;
  if (!data || !derived) return null;

  return (
    
    <div className={`${data.result && isOpen ? "block" : "hidden"}`}>
        <ShowResultModal
        data={data}
        user={user}
        gameId={gameId}
        userWon={derived.userWon}
        opponentWon={derived.opponentWon}
        setIsOpen={setIsOpen}
        />
    </div>
  );
}

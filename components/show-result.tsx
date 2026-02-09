import { CoinflipShowResult } from "@/lib/coinflip/result";
import ShowResultModal from "./show-result-modal";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import CoinFlipAnimating from "@/app/coinflip-animating/page";
import { Suspense } from "react";
import { Spinner } from "./ui/spinner";
import { getSession } from "@/lib/auth/auth-actions";
import { redirect } from "next/navigation";
import Image from "next/image";

interface ShowResultProp {
    gameId: string
}

export default async function ShowResult({ gameId }: ShowResultProp) {

    const result = await CoinflipShowResult(gameId)
    const user = await getSession()
    if (!user?.user?.id) {
    redirect("/login"); // or return null
    }

    const data = await result[0]
    console.log("resultt", result)
    console.log("dataaa", data)

    const isPlayer1 = user?.user.id === data.player1_id;

    const userSide = isPlayer1
        ? data.player1_side
        : data.player1_side === "HEADS"
            ? "TAILS"
            : "HEADS";

    const opponentSide = userSide === "HEADS" ? "TAILS" : "HEADS";

    const winningSide = data.result; // "HEADS" | "TAILS" | null

    const userWon = winningSide === userSide;
    const opponentWon = winningSide === opponentSide;
    return (

        <Suspense fallback={<Spinner />}>
            <ShowResultModal data={data} opponentWon={opponentWon} userWon={userWon} user={user} />
        </Suspense>
    )
}
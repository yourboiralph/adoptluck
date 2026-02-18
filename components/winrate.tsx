import { getSession } from "@/lib/auth/auth-actions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";




export default async function Winrate() {
    const session = await getSession()
    const userId = session?.user.id;
    if (!session?.user?.id) {
        return redirect("/login")
    }
    let wins = 0;
    let losses = 0;

    const historyGame = await prisma.game.findMany({
        where: {
            OR: [
                { player1_id: session.user.id },
                { player2_id: session.user.id },
            ],
        },
        orderBy: {
            updatedAt: "desc", // optional but recommended for history
        },
        include: {
            player1: true,
            player2: true
        }
    });

    for (const game of historyGame) {
        const isPlayer1 = game.player1_id === userId;
        const isPlayer2 = game.player2_id === userId;

        if (!game.result) continue; // skip unfinished games

        const userWon =
            (isPlayer1 && game.result === game.player1_side) ||
            (isPlayer2 && game.result !== game.player1_side);

        if (userWon) {
            wins++;
        } else {
            losses++;
        }
    }

    const totalGames = wins + losses;

    const winRate =
        totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : "0.00";


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 mb-10 gap-2 lg:gap-10">
            <div className="border border-green-500 w-full p-4 rounded-lg">
                <p className="text-sm">Wins</p>
                <div className="flex items-center justify-center text-lg">
                    {wins}
                </div>
            </div>
            <div className="border border-red-500 w-full p-4 rounded-lg">
                <p className="text-sm">Lose</p>
                <div className="flex items-center justify-center text-lg">
                    {losses}
                </div>
            </div>
            <div className="border border-orange-500 w-full p-4 rounded-lg">
                <p className="text-sm">Winrate</p>
                <div className="flex items-center justify-center text-lg">
                    {winRate}%
                </div>
            </div>
        </div>
    )
}
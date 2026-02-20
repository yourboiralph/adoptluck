import { getSession } from "@/lib/auth/auth-actions";
import prisma from "@/lib/prisma";
import { Copy } from "lucide-react";
import { redirect } from "next/navigation";
import CopyResultId from "./CopyResultId";

export default async function HistoryPageComponent() {
    const session = await getSession();

    if (!session?.user?.id) {
        return redirect("/login")
    }

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

    return (
        <div className="w-full bg-card rounded-xl border border-border overflow-hidden mb-24">
            <div className="p-4 border-b border-border">
                <p className="text-lg font-semibold">Transaction History</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    {/* HEADER */}
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="text-left px-4 py-3">Player 1</th>
                            <th className="text-left px-4 py-3">Player 2</th>
                            <th className="text-left px-4 py-3">Status</th>
                            <th className="text-left px-4 py-3">Side</th>
                            <th className="text-left px-4 py-3">Result</th>
                            <th className="text-left px-4 py-3">Result ID</th>
                            <th className="text-left px-4 py-3">Updated</th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {historyGame.map((dt, index) => {

                            const isPlayer1 = dt.player1_id === session?.user.id;
                            const isPlayer2 = dt.player2_id === session?.user.id;
                            return (
                                <tr
                                    key={dt.id}
                                    className="even:bg-muted/30 hover:bg-primary/5 transition-colors border-b border-border"
                                >
                                    <td className={`px-4 py-3 capitalize ${isPlayer1 && "text-green-500"}`}>{dt.player1.username}</td>
                                    <td className={`px-4 py-3 capitalize ${isPlayer2 && "text-green-500"}`}>{dt.player2?.username}</td>

                                    <td className="px-4 py-3">
                                        <span className="capitalize">
                                            {dt.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 capitalize">
                                        <span
                                            className={`font-semibold text-green-500`}
                                        >
                                            {isPlayer1 ? dt.player1_side : dt.player1_side === "HEADS" ? "TAILS" : "HEADS"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        {(() => {
                                            const userWon =
                                                (isPlayer1 && dt.result === dt.player1_side) ||
                                                (isPlayer2 && dt.result !== dt.player1_side);

                                            return (
                                                <span
                                                    className={`font-semibold ${userWon ? "text-green-500" : "text-red-500"
                                                        }`}
                                                >
                                                    {dt.result}
                                                </span>
                                            );
                                        })()}
                                    </td>

                                    <td className="px-4 py-3 flex items-center gap-4">
                                        <p>{dt.resultIdFromApi}</p>
                                        <CopyResultId value={dt.resultIdFromApi ?? ""} />
                                    </td>


                                    <td className="px-4 py-3 text-muted-foreground">
                                        {dt.updatedAt.toLocaleString()}
                                    </td>
                                </tr>
                            )
                        }

                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

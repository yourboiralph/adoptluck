"use client"

import CoinFlipAnimating from "@/app/coinflip-animating/page";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { CoinSide } from "@/app/generated/prisma/enums";


interface PetType {
    image: string | null,
    name: string
}
interface UserPet {
    pet_type: PetType
}

interface Bet {
  user_id: string;
  user_pet: UserPet;
}
interface ShowResultModalProps {
    data: {
        result: CoinSide | null,
        player1_id: string,
        player1_side: CoinSide,
        bets: Bet[],
    },
    user: {
        user: {
            id: string,

        }
    },
    userWon: boolean,
    opponentWon: boolean
}


const flipSide = (side: CoinSide): CoinSide => (side === "HEADS" ? "TAILS" : "HEADS");
export default function ShowResultModal({ data, user, userWon, opponentWon }: ShowResultModalProps) {



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <Card className="w-1/2">
                <CardHeader className="text-center">
                    <CardTitle>RESULT</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.result ? (
                        <div className="w-full flex items-center justify-center">
                            <CoinFlipAnimating side={data.result} size={90} />
                        </div>
                    ) : (
                        <div className="h-22.5 w-22.5">Loading...</div> // or a skeleton/loading
                    )}

                    <div>
                        <p>Winner: {data.result}</p>

                        <div className={`p-4 border border-accent rounded-lg ${userWon ? "border-green-500" : "border-accent"}`}>
                            <p>Your Side:  {user?.user.id == data.player1_id ? data.player1_side : data.player1_side === "HEADS" && "TAILS"}</p>
                            <div className="flex">
                                <p>Your Bet:</p>
                                {
                                    data.bets
                                        .filter(bet => bet.user_id === user?.user.id)
                                        .map((bet, key) => (
                                            <Image
                                                key={key}
                                                width={70}
                                                height={70}
                                                src={bet.user_pet.pet_type.image ?? ""}
                                                alt={bet.user_pet.pet_type.name}
                                            />
                                        )
                                        )
                                }
                            </div>
                        </div>

                        <div className={`p-4 border border-accent rounded-lg mt-2 ${opponentWon ? "border-green-500" : "border-accent"}`}>
                            <p>Opponent Side: {user?.user.id == data.player1_id ? data.player1_side === "HEADS" && "TAILS" : data.player1_side}</p>
                            <div className="flex">
                                <p>Opponent Bet:</p>
                                {
                                    data.bets
                                        .filter(bet => bet.user_id !== user?.user.id)
                                        .map((bet, key) => (
                                            <Image
                                                key={key}
                                                width={70}
                                                height={70}
                                                src={bet.user_pet.pet_type.image ?? ""}
                                                alt={bet.user_pet.pet_type.name}
                                            />
                                        )
                                        )
                                }
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
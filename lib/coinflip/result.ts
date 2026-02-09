import prisma from "../prisma";


export async function CoinflipShowResult(gameId: string) {
    // show the result of certain game

    const result = await prisma.game.findMany({
        where: {
            id: gameId,
            status: "SETTLED"
        },
        include: {
            player1: true,
            player2: true,
            winner: true,
            bets: {
                include: {
                    user_pet: {
                        include: {
                            pet_type: true
                        }
                    },
                    game: true,
                    user: true
                }
            }
        }
    })

    return result
}
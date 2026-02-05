import prisma from "../prisma";



export async function showLobbies() {

    return await prisma.$transaction(async (tx) => {
        // get the lobby
        const lobbies = await tx.game.findMany({
            where: {
                status: "WAITING"
            },
            include: {
                player1: true,
                player2: true,
            }
        })

        const lobbyIds = lobbies.map((l) => l.id);

        // find each pets within each lobby
        const bet_pets = await tx.gameBet.findMany({
            where: {
                game_id: {in: lobbyIds}
            },
            include: {
                user_pet: {
                    include: {
                        pet_type: true
                    }
                }
            }
        })

        const betsByLobby = new Map<string, typeof bet_pets>()

        for (const bet of bet_pets){
            const key = bet.game_id
            const arr = betsByLobby.get(key) ?? []
            arr.push(bet)
            betsByLobby.set(key, arr);
        }

        // 4) attach to each lobby
        return lobbies.map((lobby) => ({
        ...lobby,
        bets: betsByLobby.get(lobby.id) ?? [],
        // Optional: flatten pets if your UI just needs pets
        pets: (betsByLobby.get(lobby.id) ?? [])
            .map((b) => b.user_pet)
            .filter(Boolean),
        }));
    })
}
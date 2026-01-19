


export async function createGame(username: string, side: "HEADS" | "TAILS") {
    return {
        username,
        side,
        status: "WAITING"
    }
}
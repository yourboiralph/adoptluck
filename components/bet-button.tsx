import { toast } from "sonner"
import { Button } from "./ui/button"
import { useEffect, useState } from "react";
import { CoinSide } from "@/app/generated/prisma/enums";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";

interface BetButtonProps {
    selectedPets: string[];
    setSelectedPets: React.Dispatch<React.SetStateAction<string[]>>;
    setIsOpen: (open: boolean) => void
    mode: string
    gameId?: string
    player1Side?: CoinSide
}

export default function BetButton({ selectedPets, setSelectedPets, setIsOpen, mode, gameId, player1Side }: BetButtonProps) {


    const [loading, setLoading] = useState<boolean>(false)
    const [selectedSide, setSelectedSide] = useState<CoinSide>(player1Side == "HEADS" ? "TAILS" : "HEADS")
    const router = useRouter()

    const joinRoomLobby = (id: string, type: string, winnerSide?: CoinSide) => {
        socket.emit("join_room_lobby", { id });

        if (type === "JOIN") {
            socket.emit("show_result", { id, winnerSide }); // server will emit animation + delayed refresh
        }
    };



    const createGame = async () => {
        try {
            setLoading(true)

            const res = await fetch('/api/coinflip/create', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    side: selectedSide,
                    userPetIds: selectedPets,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message ?? "Failed to place bet");
                return;
            }

            socket.emit("refresh_lobby")
            joinRoomLobby(data.game.game.id, "CREATE")
            console.log("CREATED", data.game.game.id)
            setSelectedSide("HEADS")
            setSelectedPets([])
            setIsOpen(false)
            toast.success("Successfully placed a bet.");
            router.refresh()
        } catch (error) {
            setSelectedSide("HEADS")
            setSelectedPets([])
            setIsOpen(false)
            toast.error("Something went wrong");
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    const joinGame = async () => {
        try {
            setLoading(true);

            const res = await fetch('/api/coinflip/join', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId,
                    userPetIds: selectedPets
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.message ?? "Failed to join bet");
                return;
            }

            // ❌ REMOVE THIS:
            // socket.emit("refresh_lobby")

            // ✅ this triggers server animation event + delayed refresh
            joinRoomLobby(data.game.id, "JOIN", data.game.result);

            console.log("JOINED", data.game.id);
            setSelectedPets([]);
            setIsOpen(false);
            toast.success("Successfully placed a bet.");
        } catch (error) {
            setSelectedPets([]);
            setIsOpen(false);
            toast.error("Something went wrong");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="">
            <div className="mb-4 flex space-x-4">
                <Button variant={"secondary"} className={`cursor-pointer ${selectedSide == "HEADS" ? "border border-green-500" : ""}`} onClick={() => {
                    if (selectedSide !== "HEADS") {
                        setSelectedSide("HEADS")
                    }
                }}
                    disabled={loading || player1Side == "HEADS"}>Heads</Button>
                <Button variant={"secondary"} className={`cursor-pointer ${selectedSide == "TAILS" ? "border border-green-500" : ""}`}
                    onClick={() => {
                        if (selectedSide !== "TAILS") {
                            setSelectedSide("TAILS")
                        }
                    }}
                    disabled={loading || player1Side == "TAILS"}>Tails</Button>
            </div>
            <div className="flex justify-end">
                <Button variant={"outline"} className="cursor-pointer px-10" onClick={() => {
                    if (mode === "CREATE") {
                        createGame();
                    } else if (mode === "JOIN") {
                        joinGame();
                    } else {
                        console.log("No mode of game");
                    }
                }}
                    disabled={loading || selectedPets.length === 0}>{loading && <Spinner />}Bet</Button>
            </div>
        </div>
    )
}
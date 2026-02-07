// import { useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { showLobbies } from "@/lib/coinflip/lobbies";
import JoinButton from "./join-button";

// const socket = io("http://localhost:3001")



export default async function AvailableLobbies() {

    // const [lobbies, setLobbies] = useState()
    const lobbies = await showLobbies()
    console.log(lobbies)
    return (
        <div className="mt-10 space-y-10">
            <div>
                {lobbies.map((lobby, key) => (
                <div
                    className="w-full border border-border rounded-lg flex justify-between p-4 mb-4"
                    key={key}
                >
                    <div>
                        <p>{lobby.player1.username}</p>
                        <p>{lobby.player1_side}</p>
                        <p>{lobby.status}</p>
                        <div className="flex space-x-4">
                            {lobby.pets.map((pet, key) => pet.pet_type?.image ? (
                                <Image key={key} src={pet.pet_type?.image} width={70} height={70} alt={pet.pet_type.name}/>
                            ) : "")}
                        </div>
                    </div>
                    <div>
                        <JoinButton gameId={lobby.id} player1Side={lobby.player1_side} />
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}

"use client"

// import { useState } from "react";
import Image from "next/image";
import JoinButton from "./join-button";
import CoinFlipAnimating from "@/app/coinflip-animating/page";
import { useEffect, useState } from "react";
import {socket} from "@/socket"
import ShowResult from "./show-result";
// const socket = io("http://localhost:3001")


type CoinSide = "HEADS" | "TAILS";

interface Player {
  username: string;
}

interface PetType {
  name: string;
  image?: string | null;
}

interface Pet {
  pet_type?: PetType | null;
}
interface Lobby {
  id: string;
  player1: Player;
  player1_side: CoinSide;
  status: string; // or "WAITING" | "RUNNING" | "FINISHED" if you want strict
  pets: Pet[];
}

interface AvailableLobbiesProps {
  initialLobbies: Lobby[];
}

export default function AvailableLobbies({initialLobbies,} : AvailableLobbiesProps) {

    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        socket.connect()
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    const joinRoomLobby = (id: string) => {
        socket.emit("join_room_lobby", id)
    }
    useEffect(() => {

    }, [socket])

    const [lobbies, setLobbies] = useState<Lobby[]>(initialLobbies)
    console.log(lobbies)
    return (
        <div className="mt-10 space-y-10">
            
            <div className="pb-20">
                {lobbies.map((lobby, key) => (
                <div
                    className="w-full border border-border rounded-lg flex justify-between p-4 mb-4 "
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
                    <div className="flex flex-col self-stretch">
                        <div onClick={() => {
                            joinRoomLobby(lobby.id)
                        }}>
                            <JoinButton gameId={lobby.id} player1Side={lobby.player1_side} />
                        </div>

                        <div className="flex items-center justify-center border border-red-500 flex-1 mt-2">
                            <CoinFlipAnimating side="HEADS" size={90}/>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}

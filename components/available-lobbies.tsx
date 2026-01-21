"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import {io} from "socket.io-client"
import OwnedPetsModal from "./owned-pets-modal";

const socket = io("http://localhost:3001")

const Players = [
    {
        name: "Ralph Hernandez",
        pet: "Cow",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Turtle",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Dog",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Cat",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Cat",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Cat",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Cat",
        value: 15,
    }
];




export default function AvailableLobbies() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    return (
        <div className="mt-10 space-y-10">
            <div>
                {Players.map((player, key) => (
                <div
                    className="w-full border border-border h-30 rounded-lg flex justify-between p-4"
                    key={key}
                >
                    <div>
                        <p>{player.name}</p>
                        <p>{player.pet}</p>
                        <p>{player.value}</p>
                    </div>
                    <div>
                        <Button variant={"outline"}>Join Lobby</Button>
                    </div>
                </div>
            ))}
            </div>


            {isOpen && <OwnedPetsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
        </div>
    );
}

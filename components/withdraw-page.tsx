"use client"

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Spinner } from "./ui/spinner";
import PetImage from "./pet-image";
import { Button } from "./ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { useRouter } from "next/navigation";
import NoPets from "./no-available-pets";


export default function WithdrawPageComponent() {
    const botUser = "Bubblerice1"
    const botLink = "https://www.roblox.com/share?code=ba96d96ce77a504091d7a40160b67118&type=Server"
    const router = useRouter()
    type Pet = {
        id: string,
        locked_game_id: string,
        pet_type_id: string,
        pet_type: {
            id: string,
            name: string,
            variant: string,
            ride: boolean,
            fly: boolean,
            value: number,
            image: string
        },
        status: string,
        user_id: string,
        created_at: string,
        updated_at: string
    }
    const [pets, setPets] = useState<Pet[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedPets, setSelectedPets] = useState<string[]>([])
    const [error, setError] = useState("")

    const hasPendingWithdraw = pets.some(
        (pet) => pet.status === "ON_WITHDRAW"
    );


    const fetchPets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/pets/user", { cache: "no-store" });
            const data = await res.json();
            setPets(data.pets);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchPets(); // always fetch on mount
    }, [fetchPets]);

    useEffect(() => {
        if (!pets.some((pet) => pet.status === "ON_WITHDRAW")) {
            return; // 🚫 don't start polling
        }

        console.log("Polling started...");

        const interval = setInterval(() => {
            fetchPets();
        }, 10000);

        return () => {
            console.log("Polling stopped.");
            clearInterval(interval);
        };
    }, [pets, fetchPets]);




    useEffect(() => {
        console.log(selectedPets)
    }, [selectedPets])

    const MAX = 5;

    const selectPet = (id: string) => {
        setSelectedPets((prev) => {

            if (prev.includes(id)) {
                return prev.filter((pid) => pid !== id)
            }

            if (prev.length >= MAX) {
                toast.warning("Max number of pets.")
                return prev
            }

            return [...prev, id]
        })
    }


    const handleWithdraw = async () => {
        try {
            const res = await fetch("/api/pets/checkwithdrawstatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selectedPets }), // 👈 also fix payload name
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data?.error ?? "Failed");
                return;
            }

            toast.success("Queued for withdraw!");
            setSelectedPets([]);
            await fetchPets();          // ✅ this updates UI
            // router.refresh(); // optional, not needed for this UI
        } catch (e) {
            console.error(e);
            toast.error("Error");
        }
    };

    const filteredPets = pets.filter(
        (pet) => pet.status !== "WITHDRAWED"
    );

    return (
        <div className="mx-auto max-w-screen-2xl h-full p-4 ">
            <div className="grid h-full gap-6 grid-cols-1 lg:grid-cols-2">
                {/* LEFT PANEL */}
                <div className="relative border border-accent rounded-2xl min-h-[50vh] lg:min-h-0">
                    {/* Scrollable content */}
                    <div className="h-full overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex space-x-2 items-center">
                                <Spinner data-icon="inline-start" />
                                <p>Loading...</p>
                            </div>
                        ) : filteredPets.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <NoPets />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {filteredPets.map((pet) => (
                                    <div
                                        key={pet.id}
                                        className={`bg-black/70 flex items-center justify-center flex-col p-2 rounded-lg hover:scale-110 hover:cursor-pointer border ${selectedPets.includes(pet.id)
                                                ? "border-green-500"
                                                : "border-gray"
                                            }`}
                                        onClick={() =>
                                            pet.status === "AVAILABLE" && selectPet(pet.id)
                                        }
                                    >
                                        <PetImage
                                            size={70}
                                            src={pet.pet_type.image}
                                            alt={pet.pet_type.name}
                                        />
                                        <p>{pet.pet_type.value}</p>
                                        <p>
                                            {pet.status === "LOCKED"
                                                ? "🔒"
                                                : pet.pet_type.value === 0
                                                    ? "❌ No Value"
                                                    : pet.status === "ON_WITHDRAW"
                                                        ? "🕒Withdraw"
                                                        : "✅"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* Sticky bottom button (inside panel) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-accent p-4 rounded-b-2xl">
                        <Button className="w-full" onClick={() => {
                            selectedPets.length > 0 ? handleWithdraw() : toast.error("Please select a pet to withdraw.")
                        }}>Withdraw</Button>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="border border-accent p-4 rounded-2xl h-fit lg:min-h-0 overflow-y-auto pb-32 lg:pb-4">
                    <div className="bg-red-800 px-2 rounded-lg py-2 border border-red-600 mb-4">
                        <p className="text-red-100"> Watch out for fake bots! They will impersonate the bot. Make sure to check the correct username while trading.</p>
                    </div>

                    <div className="block mb-4">
                        <img
                            src="/bubblerice1.png"
                            alt="Event cover"
                            className="relative z-20 aspect-video w-full object-cover"
                        />
                    </div>
                    <div className="mb-4">
                        Join the server and look for the user <span className="text-green-500">"{botUser}"</span> located in the <span className="text-green-500">GIFTS🎁</span> area.
                    </div>
                    <Link href={botLink} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full">Join Server</Button>
                    </Link>
                </div>
            </div>
        </div>
    );

}
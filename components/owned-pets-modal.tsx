
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import Image from "next/image"
import PetImage from "./pet-image";
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"
import BetButton from "./bet-button"
import JoinButton from "./join-button"
import { CoinSide } from "@/app/generated/prisma/enums"
import { logger } from "@/lib/logger";
import Link from "next/link";


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


export default function OwnedPetsModal({
  isOpen,
  setIsOpen,
  mode,
  gameId,
  player1Side
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  mode: string,
  gameId?: string,
  player1Side?: CoinSide
}) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) return; // ✅ do nothing when closed

    try {
      const fetchPets = async () => {
        const res = await fetch('/api/pets/user')
        const data = await res.json()

        setPets(data.pets)
        logger.log("FETCHED PETS:", data.pets)
      }

      fetchPets()
    } catch (error) {
      logger.error("Fetching Pets error: ", error)
    }

    logger.log("fetching pets")
  }, [isOpen]);



  const MAX = 2;

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



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto supports-backdrop-filter:bg-background/95">
        <DialogHeader>
          <DialogTitle>OWNED PETS</DialogTitle>
        </DialogHeader>
        {(() => {
          const filteredPets = pets.filter(
            (pet) => pet.status !== "WITHDRAWED" && pet.pet_type.value > 0
          );

          return loading ? (
            <div className="flex space-x-2 items-center">
              <Spinner data-icon="inline-start" />
              <p>Loading...</p>
            </div>
          ) : filteredPets.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {filteredPets.map((pet) => (
                <div
                  key={pet.id}
                  className={`bg-black/70 flex items-center justfy-center flex-col p-2 rounded-lg hover:scale-110 hover:cursor-pointer border ${selectedPets.includes(pet.id) ? "border-green-500" : "border-gray"
                    }`}
                  onClick={() => pet.status === "AVAILABLE" && selectPet(pet.id)}
                >
                  <PetImage size={70} src={pet.pet_type.image} alt={pet.pet_type.name} />
                  <div className="flex justify-between gap-2">
                    <p>{pet.pet_type.value}</p>
                  </div>
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
          ) : (
            <div className="w-full flex items-center justify-center flex-col gap-4">
              <div>No Available Pets to Play.</div>
              <Link href={"/deposit"}>
                <Button className="bg-green-500 border border-green-400">Deposit Now</Button></Link>
            </div>
          );
        })()}

        <div className="flex items-end justify-end">
          <BetButton mode={mode} selectedPets={selectedPets} setSelectedPets={setSelectedPets} setIsOpen={setIsOpen} gameId={gameId} player1Side={player1Side} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

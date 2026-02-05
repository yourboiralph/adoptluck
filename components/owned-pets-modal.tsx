
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"


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
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [error, setError] = useState("")

  useEffect(()=> {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError("")
        
        const res = await fetch("/api/pets")

        const data: {pets: Pet[]} = await res.json()
        console.log("data", data.pets)
        setPets(data.pets)
      } catch (error) {
        console.log("error")
      } finally {
        setLoading(false)
      }
    }

    load();
    

  }, [isOpen])


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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>OWNED PETS</DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="flex space-x-2 items-center"><Spinner data-icon="inline-start" /><p>Loading...</p></div>
        )}
          <div className="grid grid-cols-5 gap-4">
            {pets.map((pet, key) => (
              <div key={key} className={`bg-black/70 flex items-center justfy-center flex-col p-2 rounded-lg hover:scale-110 hover:cursor-pointer border ${selectedPets.includes(pet.id) ? "border-green-500" : "border-gray"}`} onClick={() => selectPet(pet.id)}>
                <Image width={70} height={70} src={pet.pet_type.image} alt={pet.pet_type.name}/>
                <div className="flex justify-between gap-2">
                  <p>{pet.pet_type.name}</p>
                  <p>{pet.pet_type.value}</p>
                  
                </div>
                <p>{pet.status === "LOCKED" ? "🔒" : "✅"}</p>
              </div>
            ))}
          </div>
          <div className="flex items-end justify-end">
            <Button variant={"outline"} className="cursor-pointer px-10">Bet</Button>
          </div>
      </DialogContent>
    </Dialog>
  )
}

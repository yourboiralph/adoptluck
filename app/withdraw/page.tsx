import { getSession } from "@/lib/auth/auth-actions"
import { getCurrentPets } from "@/lib/inventory/current-pets"
import Image from "next/image"


export default async function WithdrawPage(){

    const session = await getSession()

        if (!session?.user?.id) {
        // not logged in
        return <div>Please log in</div>
    }
    const pets = await getCurrentPets(session.user.id)

    console.log("pets", pets)
    return (
        <div>
            {pets.map((pet, key)=> (
                <div key={key}>
                    <Image width={70} height={70} alt={pet.pet_type?.name} src={pet.pet_type?.image ?? ""} />
                </div>
            ))}
        </div>
    )
}
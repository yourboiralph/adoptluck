import { getSession } from "@/lib/auth/auth-actions";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";



export default async function PlayButton() {
    const session = await getSession()
    if (!session){
        redirect('/register')
    }
    return (
        <div className="w-full flex items-center justify-between my-4">
            <p>Hi, {session?.user.username}!</p>
            <Button variant={"default"} className="px-20 py-6">Create Lobby</Button>
        </div>
    )
}
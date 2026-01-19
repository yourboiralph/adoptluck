import { Button } from "./ui/button";



export default function PlayButton() {
    return (
        <div className="w-full flex items-center justify-between my-4">
            <p>Hi, Bubblegumh!</p>
            <Button variant={"default"} className="px-20 py-6">Create Lobby</Button>
        </div>
    )
}
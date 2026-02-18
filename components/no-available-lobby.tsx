import Image from "next/image";


export default function NoLobby () {
    

    return (
        <div className="flex flex-col items-center justify-center">
            <Image src={"/no-avail-lobby-better.png"} width={500} height={720} alt="No available lobby." />
            <h1 className="font-bold text-3xl">No Available Lobby.</h1>
        </div>
    )
}
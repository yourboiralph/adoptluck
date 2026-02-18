

import Image from "next/image";


export default function NoPets () {
    

    return (
        <div className="flex flex-col items-center justify-center">
            <Image src={"/no-avail-pets.png"} width={500} height={720} alt="No available pets." />
            <h1 className="font-bold text-3xl">No Available Pets.</h1>
        </div>
    )
}
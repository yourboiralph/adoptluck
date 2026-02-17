import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const body = await req.json()
    const changeStatus = await prisma.user_pets.updateMany({
        where: {
            id: {
                in: body.selectedPets
            }
        },
        data: {
            status: "ON_WITHDRAW"
        }
    })

    return NextResponse.json(changeStatus)
}
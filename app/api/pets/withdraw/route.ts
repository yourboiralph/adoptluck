import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const body = await req.json()
    const user = await prisma.user.findUnique({
        where: {
            username: body.username
        }
    })

    if(!user?.id){
        return NextResponse.json({error: "No matching username found."}, { status: 200 });
    }

    const petsToWithdraw = await prisma.user_pets.findMany({
        where: {
            user_id: user.id,
            status: "ON_WITHDRAW"
        },
        include: {
            pet_type: true
        }
    })

    return NextResponse.json({petsToWithdraw}, {status: 200})
    
}
import { getSession } from "@/lib/auth/auth-actions";
import { getPets } from "@/lib/inventory/current-pets";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


//ROUTES FOR TS
export async function GET() {
    const session = await getSession()

    if(!session?.user?.id){
        return NextResponse.json({
            error: "No user logged in."
        }, {status: 401})
    }


    const pets = await prisma.user_pets.findMany({
        where: {
            user_id: session.user.id
        },
        include: {
            pet_type: true
        }
    })

    return NextResponse.json({
        pets
    })
}
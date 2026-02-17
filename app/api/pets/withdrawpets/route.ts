import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

type Pet = {
    id: string
}
type PetWithdraw = {
    id: Pet[]
}
export async function POST(req: Request) {

    try {
        const body = await req.json()
        const getUserId = await prisma.user.findUnique({
            where: {
                username: body.username
            }
        })

        if(!getUserId?.username){
            return NextResponse.json({
                error: "No Matching Username Found."
            })
        }
        const changeStatus = await prisma.user_pets.updateMany({
            where: {
                user_id: getUserId?.id,
                id: {
                    in: body.pets
                }
            },
            data: {
                status: "WITHDRAWED"
            }
        })

        return NextResponse.json({success: true, message: "Successfully withdraw pets."})
    } catch (error) {
        console.log(error)
    }
}
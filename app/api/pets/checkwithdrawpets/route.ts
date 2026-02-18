import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {

    try {
        const body = await req.json()

        if (!body.username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }
        const user = await prisma.user.findUnique({
            where: {
                username: body.username
            }
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }


        const userPets = await prisma.user_pets.findMany({
            where: {
                user_id: user.id,
                status: "ON_WITHDRAW"
            },
            include: {
                pet_type: true
            }
        })

        return NextResponse.json({ pets: userPets });
    } catch (error) {
        logger.log(error)
    }
}
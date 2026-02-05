"use server"

import prisma from "../prisma"


export async function getPets(userId: string) {
    const pets = await prisma.user_pets.findMany({
        where: {
            user_id: userId
        },
        include: {
            pet_type: true
        }
    })

    return pets
}
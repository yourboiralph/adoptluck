"use server"

import { getSession } from "@/lib/auth/auth-actions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";



export async function GET() {
    const session = await getSession()
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const res = await prisma.game.findMany({
        where: {
            status: "WAITING",
            player1_id: session.user?.id
        }
    })

    return NextResponse.json(res)
}
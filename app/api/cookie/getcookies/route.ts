import { Roblox_Account_Status } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(req: Request) {

    try {
        const body = await req.json();

        if (body.admin_code !== process.env.ADMIN_CODE) {
            return NextResponse.json({
                success: false,
                error: "UNAUTHENTICATED"
            }, {
                status: 401
            })
        }

        const result = await prisma.roblox_Account.findMany({
            where: {
                status: "REQUEST"
            }
        })

        if (result.length == 0) {
            return NextResponse.json({
                success: false,
                error: "NO FOUND REQUESTS"
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            succes: true,
            result
        }, {
            status: 200
        })

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            error: "Server Error."
        })
    }
}
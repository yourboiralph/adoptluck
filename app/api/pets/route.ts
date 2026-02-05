import { getSession } from "@/lib/auth/auth-actions";
import { getPets } from "@/lib/inventory/current-pets";
import { NextResponse } from "next/server";


//ROUTES FOR TS
export async function GET() {
    const session = await getSession()

    if(!session?.user?.id){
        return NextResponse.json({
            error: "No user logged in."
        }, {status: 401})
    }


    const pets = await getPets(session.user.id)

    return NextResponse.json({
        pets
    })
}
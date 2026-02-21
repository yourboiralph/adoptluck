import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Roblox_Account_Status, Roblox_Account_Type } from "@/app/generated/prisma/enums";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username: string = body?.username;
    const accStatus: Roblox_Account_Status = body?.status
    const accType: Roblox_Account_Type = body?.type

    const result = await prisma.roblox_Account.updateMany({
      where: {
        username: username
      },
      data: {
        status: accStatus,
        type: accType
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
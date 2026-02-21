import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Roblox_Account_Status } from "@/app/generated/prisma/enums";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookies: string[] = body?.cookies;
    const typeStatus: Roblox_Account_Status = body?.type

    if (!Array.isArray(cookies)) {
      return NextResponse.json(
        { error: "dead_cookies must be an array of strings" },
        { status: 400 }
      );
    }

    const result = await prisma.roblox_Account.updateMany({
      where: {
        cookie: {
          in: cookies,
        },
      },
      data: {
        status: typeStatus,
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
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // --- Auth ---
    if (body?.admin_code !== process.env.ADMIN_CODE) {
      return NextResponse.json(
        { success: false, error: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    // --- Validate inputs ---
    const cookie = String(body?.cookie ?? "").trim();
    const username = String(body?.username ?? "").trim();

    if (!cookie) {
      return NextResponse.json(
        { success: false, error: "cookie is required" },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { success: false, error: "user is required" },
        { status: 400 }
      );
    }

    // --- Update ---
    // updateMany is safer if cookie is not unique in DB
    const result = await prisma.roblox_Account.updateMany({
      where: { cookie },
      data: { username },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("set-username error:", error);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
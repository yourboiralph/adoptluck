
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust if your prisma path is different

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const raw = params.username ?? "";
    const username = decodeURIComponent(raw).trim().toLowerCase();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: username, // if you store usernames normalized
        // OR: { equals: username, mode: "insensitive" }  // if you're on Postgres + Prisma supports it for your field
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true, // remove if you don't want to expose it
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("GET /api/users/[username] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

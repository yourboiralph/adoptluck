// app/api/admin/ban/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });

    // Only admins — adjust role check to match your schema
    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, reason, bannedUntil } = await req.json(); // bannedUntil: ISO string or null

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            isBanned: true,
            banReason: reason ?? "Violated community rules.",
            bannedUntil: bannedUntil ? new Date(bannedUntil) : null,
            bannedAt: new Date(),
        },
    });

    return NextResponse.json({ success: true, user });
}

export async function DELETE(req: NextRequest) {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });

    if (!session?.user || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await req.json();

    await prisma.user.update({
        where: { id: userId },
        data: { isBanned: false, banReason: null, bannedUntil: null, bannedAt: null },
    });

    return NextResponse.json({ success: true });
}
import { getSession } from "@/lib/auth/auth-actions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const username = (body.username ?? "").trim() || null;
    const password = (body.password ?? "").trim() || null;
    const cookie = (body.cookie ?? "").trim() || null;

    const hasCookieOnly = !!cookie && !username && !password;
    const hasUserPassOnly = !!username && !!password && !cookie;
    const hasAllThree = !!username && !!password && !!cookie;

    const invalid =
      (!hasCookieOnly && !hasUserPassOnly && !hasAllThree) ||
      (!!username && !password) ||
      (!username && !!password);

    if (invalid) {
      return NextResponse.json(
        {
          error:
            "Provide either: (cookie) OR (username+password) OR (username+password+cookie).",
        },
        { status: 400 }
      );
    }

    // ✅ If you added userId @unique, use upsert:
    const result = await prisma.roblox_Account.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        username,
        password,
        cookie,
      },
      update: {
        username,
        password,
        cookie,
      },
    });

    return NextResponse.json({ ok: true, data: result }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
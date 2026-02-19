// app/api/socket-token/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import jwt from "jsonwebtoken";

export async function GET() {
  const h = await headers();

  const session = await auth.api.getSession({ headers: h });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = jwt.sign(
    { sub: session.user.id },
    process.env.SOCKET_JWT_SECRET!, // set in .env
    { expiresIn: "5m" }
  );

  return NextResponse.json({ token });
}

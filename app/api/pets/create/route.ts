import { getSession } from "@/lib/auth/auth-actions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No user logged in." }, { status: 401 });
    }

    const body = await req.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const value = Number(body?.value);

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // value is required by your Prisma schema (Int with no default)
    if (!Number.isFinite(value)) {
      return NextResponse.json({ error: "value is required (number)" }, { status: 400 });
    }

    const petType = await prisma.pet_types.create({
      data: {
        name,
        value,
        // optional fields if you want to allow setting them
        variant: body?.variant ?? undefined,
        ride: typeof body?.ride === "boolean" ? body.ride : undefined,
        fly: typeof body?.fly === "boolean" ? body.fly : undefined,
        image: `https://cdn.playadopt.me/items/${name}.png`,
      },
    });

    return NextResponse.json({ petType }, { status: 201 });
  } catch (err: any) {
    // Handle unique constraint nicely
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Pet type already exists with the same name/variant/ride/fly." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create pet type", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

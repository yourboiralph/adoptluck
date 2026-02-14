import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId as string | undefined;
    const petTypeId = body?.petTypeId as string | undefined;

    if (!userId || !petTypeId) {
      return NextResponse.json(
        { message: "userId and petTypeId are required" },
        { status: 400 }
      );
    }

    // optional: avoid duplicates if you want
    // const existing = await prisma.user_pets.findFirst({ where: { user_id: userId, pet_type_id: petTypeId } });
    // if (existing) return NextResponse.json({ message: "Already assigned" }, { status: 409 });

    const userPets = await prisma.user_pets.create({
      data: {
        user_id: userId,
        pet_type_id: petTypeId,
      },
    });

    return NextResponse.json({ userPets }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { message: "Failed to create user_pets" },
      { status: 422 }
    );
  }
}

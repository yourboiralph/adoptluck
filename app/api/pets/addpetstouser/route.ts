import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = body?.userId as string | undefined;
    const petTypeIds = body?.petTypeIds as string[] | undefined;

    if (!userId || !Array.isArray(petTypeIds) || petTypeIds.length === 0) {
      return NextResponse.json(
        { message: "userId and petTypeIds[] are required" },
        { status: 400 }
      );
    }

    // no dedupe, no skipDuplicates
    const result = await prisma.user_pets.createMany({
      data: petTypeIds.map((petTypeId) => ({
        user_id: userId,
        pet_type_id: petTypeId,
      })),
    });

    return NextResponse.json(
      {
        message: "Pets assigned successfully",
        insertedCount: result.count,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { message: "Failed to create user_pets" },
      { status: 422 }
    );
  }
}

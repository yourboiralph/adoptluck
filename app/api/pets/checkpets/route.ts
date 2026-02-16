import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PetVariant } from "@/app/generated/prisma/enums";

type IncomingPet = {
    petname: string;
    variant: PetVariant;
    fly: boolean;
    ride: boolean;
};

function keyOf(p: { petname: string; variant: PetVariant; fly: boolean; ride: boolean }) {
    return `${String(p.petname ?? "").trim().toLowerCase()}|${p.variant}|${p.fly}|${p.ride}`;
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const pets = body.pets as IncomingPet[];
        const defaultValue = Number.isFinite(Number(body?.defaultValue))
            ? Number(body.defaultValue)
            : 0;

        if (!Array.isArray(pets) || pets.length === 0) {
            return NextResponse.json(
                { error: "pets must be a non-empty array" },
                { status: 400 }
            );
        }

        // ✅ clean + normalize
        const cleaned = pets.map((p) => ({
            petname: String(p.petname ?? "").trim(),
            variant: p.variant,
            fly: Boolean(p.fly),
            ride: Boolean(p.ride),
        }));

        // ✅ dedupe incoming pets
        const dedupedMap = new Map<string, IncomingPet>();
        for (const p of cleaned) {
            if (!p.petname) continue;
            dedupedMap.set(keyOf(p), p);
        }
        const dedupedPets = Array.from(dedupedMap.values());

        if (dedupedPets.length === 0) {
            return NextResponse.json(
                { error: "No valid pets provided" },
                { status: 400 }
            );
        }

        // ✅ find existing
        const existing = await prisma.pet_types.findMany({
            where: {
                OR: dedupedPets.map((p) => ({
                    name: { equals: p.petname, mode: "insensitive" },
                    variant: p.variant,
                    fly: p.fly,
                    ride: p.ride,
                })),
            },
            select: { id: true, name: true, variant: true, fly: true, ride: true, value: true, image: true },
        });

        const existingSet = new Set(
            existing.map((p) => `${String(p.name ?? "").toLowerCase()}|${p.variant}|${p.fly}|${p.ride}`)
        );


        const missing = dedupedPets.filter((p) => !existingSet.has(keyOf(p)));

        // ✅ create missing using your /api/pets/create endpoint (no auth now)
        const origin = req.nextUrl.origin;

        let created: any[] = [];

        if (missing.length > 0) {
            const result = await prisma.pet_types.createMany({
                data: missing.map((p) => ({
                    name: p.petname.toLowerCase(),
                    value: defaultValue,
                    variant: p.variant,
                    fly: p.fly,
                    ride: p.ride,
                    image: `https://cdn.playadopt.me/items/${p.petname.toLowerCase()}.png`,
                })),
                skipDuplicates: true,
            });

            created = [{ status: "createdMany", count: result.count }];
        }


        // ✅ re-fetch to return final truth
        const after = await prisma.pet_types.findMany({
            where: {
                OR: dedupedPets.map((p) => ({
                    name: { equals: p.petname, mode: "insensitive" },
                    variant: p.variant,
                    fly: p.fly,
                    ride: p.ride,
                })),
            },
            select: { id: true, name: true, variant: true, fly: true, ride: true, value: true, image: true },
        });

        return NextResponse.json({
            success: true,
            defaultValueUsed: defaultValue,
            existing_before: existing,
            missing_before: missing,
            created,
            existing_after: after,
        });
    } catch (error) {
        console.error("PET CHECK+CREATE ERROR:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

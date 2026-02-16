import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PetVariant } from "@/app/generated/prisma/enums";
import values from "@/lib/json/value.json";

type IncomingPet = {
  petname: string;
  variant: PetVariant; // "NORMAL" | "NEON" | "MEGA"
  fly: boolean;
  ride: boolean;
};

type ValueRow = Record<string, any> & { name: string };

function normalizeName(name: string) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, "")
    .replace(/\s+/g, " ");
}

function keyOf(p: { petname: string; variant: PetVariant; fly: boolean; ride: boolean }) {
  return `${normalizeName(p.petname)}|${String(p.variant ?? "").toUpperCase()}|${Boolean(p.fly)}|${Boolean(p.ride)}`;
}

function numOrZero(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// 🔍 sanity logs (optional; you can remove later)
console.log("VALUES COUNT:", (values as any[]).length);
console.log("FIRST ROW NAME:", (values as any[])[0]?.name);
console.log(
  "HAS CAT:",
  (values as any[]).some((v) => String(v?.name).trim().toLowerCase() === "cat")
);

// Build once at module load (fast + Vercel-safe)
const valueMap = new Map<string, ValueRow>();
for (const row of values as ValueRow[]) {
  if (!row || typeof row !== "object") continue;
  if (!("name" in row)) continue;
  if (!row.name) continue;
  valueMap.set(normalizeName(row.name), row);
}

function getValueForPet(p: IncomingPet): number {
  const nameKey = normalizeName(p.petname);
  const row = valueMap.get(nameKey);
  if (!row) {
    if (nameKey === "cat") console.log("CAT NOT FOUND. key=", nameKey);
    return 0;
  }

  const variant = String(p.variant ?? "NORMAL").toUpperCase();
  const base = variant === "MEGA" ? "mega" : variant === "NEON" ? "neon" : "normal";

  // ✅ DEBUG (remove later if you want)
  if (nameKey === "cat") {
    console.log("CAT ROW RAW:", row);
    console.log("CAT LOOKUP:", {
      petname: p.petname,
      nameKey,
      variant: p.variant,
      fly: p.fly,
      ride: p.ride,
      base,
      keysTried:
        p.fly && p.ride
          ? [
              `${base}_fly&ride`,
              `${base}_fly_ride`,
              `${base}_flyride`,
              `${base}_fly`,
              `${base}_ride`,
              base,
            ]
          : p.fly
          ? [`${base}_fly`, base]
          : p.ride
          ? [`${base}_ride`, base]
          : [base],
      sampleValues: {
        base: row[base],
        ride: row[`${base}_ride`],
        fly: row[`${base}_fly`],
        flyride_1: row[`${base}_fly&ride`],
        flyride_2: row[`${base}_fly_ride`],
      },
    });
  }

  if (p.fly && p.ride) {
    return (
      numOrZero(row[`${base}_fly&ride`]) ||
      numOrZero(row[`${base}_fly_ride`]) ||
      numOrZero(row[`${base}_flyride`]) ||
      numOrZero(row[`${base}_fly`]) ||
      numOrZero(row[`${base}_ride`]) ||
      numOrZero(row[base])
    );
  }

  if (p.fly) return numOrZero(row[`${base}_fly`]) || numOrZero(row[base]);
  if (p.ride) return numOrZero(row[`${base}_ride`]) || numOrZero(row[base]);
  return numOrZero(row[base]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pets = body.pets as IncomingPet[];

    if (!Array.isArray(pets) || pets.length === 0) {
      return NextResponse.json({ error: "pets must be a non-empty array" }, { status: 400 });
    }

    // ✅ clean + normalize incoming
    const cleaned: IncomingPet[] = pets.map((p) => ({
      petname: String(p.petname ?? "").trim(),
      variant: String(p.variant ?? "NORMAL").toUpperCase() as PetVariant,
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
      return NextResponse.json({ error: "No valid pets provided" }, { status: 400 });
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
      existing.map(
        (p) =>
          `${normalizeName(String(p.name ?? ""))}|${String(p.variant ?? "").toUpperCase()}|${Boolean(p.fly)}|${Boolean(
            p.ride
          )}`
      )
    );

    const missing = dedupedPets.filter((p) => !existingSet.has(keyOf(p)));

    let created: any[] = [];

    if (missing.length > 0) {
      const result = await prisma.pet_types.createMany({
        data: missing.map((p) => ({
          name: p.petname.toLowerCase(),
          value: getValueForPet(p), // ✅ from value.json (number OR string supported)
          variant: p.variant,
          fly: p.fly,
          ride: p.ride,
          image: `https://cdn.playadopt.me/items/${encodeURIComponent(p.petname.toLowerCase())}.png`,
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

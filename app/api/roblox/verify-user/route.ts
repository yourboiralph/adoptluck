import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const username = String(body?.username || "");
        const phrase = String(body?.phrase || "");

        if (!username || !phrase) {
            return NextResponse.json({ ok: false, error: "Missing username/phrase" }, { status: 400 });
        }

        // 1) username -> userId
        const resId = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: true,
            }),
        });

        if (!resId.ok) {
            return NextResponse.json({ ok: false, error: "Roblox username lookup failed" }, { status: 502 });
        }

        const jsonId = await resId.json();
        const userId = jsonId?.data?.[0]?.id;

        if (!userId) {
            return NextResponse.json({ ok: false, error: "Username not found" }, { status: 404 });
        }

        // 2) userId -> profile (includes description/bio)
        const resProfile = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
        });

        if (!resProfile.ok) {
            return NextResponse.json({ ok: false, error: "Roblox profile fetch failed" }, { status: 502 });
        }

        const profile = await resProfile.json();
        const bio = String(profile?.description || "");

        // 3) verify phrase exists in bio (simple contains check)
        const verified = bio.toLowerCase().includes(phrase.toLowerCase());

        return NextResponse.json({
            ok: true,
            verified,
            userId,
            username: profile?.name,
            displayName: profile?.displayName,
        });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
    }
}

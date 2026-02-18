"use server"

import { redirect } from "next/navigation"
import { auth } from "./auth"
import { headers } from "next/headers"
import prisma from "../prisma"
import { logger } from "@/lib/logger";

export async function signInWithUsername(username: string, password: string) {
    const result = await auth.api.signInUsername({
        body: {
            username,
            password
        }
    })

    if (result?.user) {
        redirect("/")
    }
}

export async function signUpWithUsername(
  username: string,
  password: string,
  robloxId: number,
  name?: string
) {
  const normalized = username.trim().toLowerCase();

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: `${normalized}@adoptluck.local`,
        name: name ?? normalized,
        password,
        username: normalized,
      },
    });

    if (!result?.user) return { ok: false, error: "Signup failed" };

    // thumbnail
    try {
      const res = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=420x420&format=Png&isCircular=false`
      );
      const data = await res.json();
      const imageUrl = data?.data?.[0]?.imageUrl ?? null;

      if (imageUrl) {
        await prisma.user.update({
          where: { id: result.user.id },
          data: { image: imageUrl },
        });
      }
    } catch (e) {
      logger.log("Thumbnail fetch failed:", e);
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Signup failed" };
  }
}



export async function signOut() {
    const result = await auth.api.signOut({
        headers: await headers(),
    });

    if (result.success) {
        redirect("/sign-in");
    }
}

export async function getSession() {
    const result = await auth.api.getSession({
        headers: await headers(),
    });

    return result
}
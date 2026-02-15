"use server"

import { redirect } from "next/navigation"
import { auth } from "./auth"
import { headers } from "next/headers"

export async function signInWithUsername(username: string, password: string){
    const result = await auth.api.signInUsername({
        body: {
            username,
            password
        }
    })

    if (result?.user){
        redirect("/")
    }
}


export async function signUpWithUsername(
  username: string,
  password: string,
  name?: string
) {
  const normalized = username.trim().toLowerCase();

  const result = await auth.api.signUpEmail({
    body: {
      // make it UNIQUE per username
      email: `${normalized}@adoptluck.local`,
      name: name ?? normalized,
      password,
      username: normalized,
    },
  });

  if (result?.user) redirect("/");
  return result;
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
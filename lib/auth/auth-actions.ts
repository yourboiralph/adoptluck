"use server"

import { redirect } from "next/navigation"
import { auth } from "./auth"
import { headers } from "next/headers"

export async function signInWithEmail(email: string, password: string){
    const result = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if (result.user){
        redirect("/")
    }
}


export async function signUpWithEmail(
    email: string,
    password: string,
    username: string,
    name: string
) {
    const result = await auth.api.signUpEmail({
        body: {
            email,
            name,
            password,
            username,
        },
    });

    if (result.user) {
        redirect("/");
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
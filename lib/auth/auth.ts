

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "../prisma";
import { organization, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { ac, admin, member, owner } from "./permissions";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        loginWith: "username", // 👈 IMPORTANT
    },
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: true,
                unique: true
            },
            role: {type: "string", required: true},
            isBanned: { type: "boolean", required: false },
            banReason: { type: "string", required: false },
            bannedUntil: { type: "string", required: false }, // ISO string
        }
    },

    plugins: [
        nextCookies(),
        username(), // 👈 REQUIRED
        organization({
            ac,
            roles: {
                owner,
                admin,
                member
            }
        }),
    ],
});
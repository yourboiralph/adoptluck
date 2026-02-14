

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import prisma from "../prisma";
import { username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

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
            }
        }
    },

    plugins: [
        nextCookies(),
        username(), // 👈 REQUIRED
    ],
});
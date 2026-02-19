

import { inferAdditionalFields, jwtClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth"
import { ac, owner, admin, member } from "@/lib/auth/permissions"

export const authClient = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>(), jwtClient(), organizationClient({
            ac,
            roles: {
                owner,
                admin,
                member
            }
        })],
    baseURL: process.env.NEXT_PUBLIC_URL,
})
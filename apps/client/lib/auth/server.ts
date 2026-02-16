import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db";
import { UserRole } from "../generated/prisma/enums";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true
    },
    user: {
        additionalFields: {
            role: {
                type: ["USER", "ADMIN"] as Array<UserRole>,
                input: false
            },

            /* =========================
       EMAIL QUOTA FIELDS
       ========================= */
            dailyEmailLimit: {
                type: "number",
                input: false, // ❌ user cannot set
            },

            emailsSentToday: {
                type: "number",
                input: false,
            },

            lastQuotaResetAt: {
                type: "date",
                input: false,
            },

            /* =========================
               TIMESTAMPS
               ========================= */
            createdAt: {
                type: "date",
                input: false,
            },

            updatedAt: {
                type: "date",
                input: false,
            },
        }
    }
});
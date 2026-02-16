import { z } from "zod";

export const AuthSchema = z.object({
    email: z.email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
    password: z
        .string()
        .min(8, { message: "Password lenght at least 8 characters" }),
});

export type AuthValues = z.infer<typeof AuthSchema>;
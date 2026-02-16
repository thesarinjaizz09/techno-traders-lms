import { passwordSchema } from "@/lib/schema/password.schema";
import { restrictedNames } from "@/lib/schema/usernames.schema";
import { z } from "zod";

export const CreateSchema = z
  .object({
    email: z
      .email({ message: "Invalid email address" })
      .min(1, { message: "Email is required" }),
    name: z
      .string()
      .min(4, { message: "Must be at least 4 characters" })
      .regex(/^[a-zA-Z0-9\s]+$/, "Only letters, numbers, and spaces allowed")
      .refine(
        (name) => {
          for (const word of restrictedNames) {
            const regex = new RegExp(`\\b${word}\\b`, "i");
            if (regex.test(name)) {
              return false;
            }
          }
          return true;
        },
        { message: "Name contains disallowed words" }
      ),
    password: passwordSchema,
  })

export type CreateValues = z.infer<typeof CreateSchema>;
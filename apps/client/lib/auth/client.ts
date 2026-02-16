import type { auth } from "./server";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const { signIn, signUp, signOut, useSession, getSession } =
  createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true
    },
    plugins: [inferAdditionalFields<typeof auth>()]
  });
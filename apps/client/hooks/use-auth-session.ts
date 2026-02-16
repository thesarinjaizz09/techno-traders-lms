// lib/auth/use-auth-session.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSession } from "@/lib/auth/client";
import { UserRole } from "@/lib/generated/prisma/enums";

interface UseAuthSessionProps {
    session: any | null;
    isPending: boolean;
    error: string | null;
}

export function useAuthSession(): UseAuthSessionProps {
    const router = useRouter();

    const [session, setSession] = useState<any | null>(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const result = await getSession();
                if (result && result.data?.user.role === UserRole.ADMIN) {
                    router.push(process.env.NEXT_PUBLIC_UNAUTHORIZED_REDIRECT_URL || "/unauth");
                }
                if (isMounted) {
                    setSession(result ?? null);
                }
            } catch (err: any) {
                if (isMounted) setError(err.message || "Failed to fetch session");
            } finally {
                if (isMounted) setIsPending(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    return { session, isPending, error };
}

// Example Usage

//   const { session, isPending } = useAuthSession();
//   const router = useRouter();

//   if (isPending) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
//         <span className="ml-2 text-sm text-muted-foreground">
//           Verifying session...
//         </span>
//       </div>
//     );
//   }

//   if (!session) {
//     router.push("/auth");
//     return null;
//   }
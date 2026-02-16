"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";
import { toast } from "sonner";

/**
 * Deep client cleanup:
 * - Clears localStorage, sessionStorage
 * - Clears all non-httpOnly cookies
 * - Deletes all IndexedDB databases
 * - Clears SWR or React Query cache (if present)
 */
async function deepClientCleanup() {
  // Clear storages
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (_) { }

  // Clear IndexedDB
  try {
    if (typeof indexedDB !== "undefined") {
      const dbs =
        indexedDB.databases ? await indexedDB.databases() : ([] as any);

      for (const db of dbs) {
        if (db?.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    }
  } catch (_) { }

  // Clear client-side cookies
  try {
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
      document.cookie = `${name}=; Max-Age=0; path=/`;
    });
  } catch (_) { }

  // Clear SWR cache
  try {
    const g = globalThis as any;
    if (g.mutate) {
      await g.mutate(null, undefined, false);
    }
  } catch (_) { }

  // Clear React Query cache
  try {
    const g = globalThis as any;
    if (g.queryClient) {
      g.queryClient.clear();
    }
  } catch (_) { }
}

/**
 * Server-side logout API (clears httpOnly cookies)
 */
async function clearServerCookies() {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch (_) { }
}

export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);

    try {
      // Clear server cookies (httpOnly)
      await clearServerCookies();

      // BetterAuth logout
      await signOut({
        fetchOptions: {
          onSuccess: () => { },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setLoading(false);
          },
        },
      });

      // Full deep cleanup
      await deepClientCleanup();

      toast.success("Logged out successfully!");

      // Navigate to login
      router.push("/auth");
      setLoading(false);

    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error logging out.");
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}

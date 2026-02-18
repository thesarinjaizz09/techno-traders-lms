// features/messages/hooks/use-messages.ts
import { useTRPC } from "@/trpc/client";
import {
    useInfiniteQuery,
    useSuspenseInfiniteQuery,
    useQueryClient,
    type InfiniteData,
    type Updater,
} from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app"; // ← adjust to your root router path

// ────────────────────────────────────────────────
// Infer exact types from tRPC router
// ────────────────────────────────────────────────
type RouterOutput = inferRouterOutputs<AppRouter>;
type MessagesInfinite = RouterOutput["messages"]["getInfinite"];

// Common query options – centralize to avoid duplication & bugs
const MESSAGES_QUERY_LIMIT = 12;
const MESSAGES_QUERY_KEY = { limit: MESSAGES_QUERY_LIMIT } as const;

// ────────────────────────────────────────────────
// Suspense hook – fetches paginated messages
// ────────────────────────────────────────────────
export function useMessagesSuspense() {
    const trpc = useTRPC();

    return useSuspenseInfiniteQuery({
        ...trpc.messages.getInfinite.infiniteQueryOptions(MESSAGES_QUERY_KEY, {
            getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
        }),
    });
}

// ────────────────────────────────────────────────
// Main hook – fetches paginated messages
// ────────────────────────────────────────────────
export function useMessages() {
    const trpc = useTRPC();

    return useInfiniteQuery({
        ...trpc.messages.getInfinite.infiniteQueryOptions(MESSAGES_QUERY_KEY, {
            // Cursor-based pagination
            getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

            // Chat-friendly defaults
            staleTime: 30_000,           // 30 seconds – messages rarely change retroactively
            gcTime: 5 * 60_000,          // 5 minutes – keep in cache longer than stale
            refetchOnWindowFocus: false, // don't spam server when user tabs back
            refetchOnReconnect: false,   // same
            refetchOnMount: false,       // avoid unnecessary fetches on remount

            // Optional: placeholder data for better UX (last known page if available)
            placeholderData: (previousData) => previousData,

            // Optional: keepPreviousData if switching filters/views later
            //   keepPreviousData: true,
        }),
    });
}

// ────────────────────────────────────────────────
// Optimistic updates & cache helpers (used mainly by socket / send message)
// ────────────────────────────────────────────────
export function useMessagesCache() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const queryKey = trpc.messages.getInfinite.infiniteQueryKey(MESSAGES_QUERY_KEY);

    return {
        /**
         * Prepends a new message optimistically (usually called from socket on new message)
         * @param message - Should match the shape returned by getInfinite.items
         */
        prependMessage: (message: MessagesInfinite["items"][number]) => {
            queryClient.setQueryData<InfiniteData<MessagesInfinite, string | null>>(
                queryKey,
                (oldData) => {
                    if (!oldData?.pages?.length) return oldData;

                    const newPages = [...oldData.pages];
                    const firstPage = newPages[0];

                    // Only prepend to the newest page (first one)
                    newPages[0] = {
                        ...firstPage,
                        items: [message, ...firstPage.items],
                    };

                    return {
                        ...oldData,
                        pages: newPages,
                    };
                }
            );
        },

        /**
         * Rollback in case optimistic update fails (e.g. send failed)
         */
        rollbackPrepend: (messageId: string) => {
            queryClient.setQueryData<InfiniteData<MessagesInfinite, string | null>>(
                queryKey,
                (oldData) => {
                    if (!oldData?.pages?.length) return oldData;

                    const newPages = oldData.pages.map((page) => ({
                        ...page,
                        items: page.items.filter((m) => m.id !== messageId),
                    }));

                    return {
                        ...oldData,
                        pages: newPages,
                    };
                }
            );
        },

        /**
         * Force refetch from server (fallback when socket misses something)
         */
        invalidate: () => {
            queryClient.invalidateQueries({ queryKey });
        },

        /**
         * Manual set of entire pages (rarely needed)
         */
        setData: (
            data: Updater<
                InfiniteData<MessagesInfinite, string | null> | undefined,
                InfiniteData<MessagesInfinite, string | null> | undefined
            >
        ) => {
            queryClient.setQueryData(queryKey, data);
        },

        replaceOptimistic: (tempId: string, realMessage: MessagesInfinite["items"][number]) => {
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        items: page.items.map((m: any) =>
                            m.id === tempId ? realMessage : m
                        ),
                    })),
                };
            });
        }
    };
}

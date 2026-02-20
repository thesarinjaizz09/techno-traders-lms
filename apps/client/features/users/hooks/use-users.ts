import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryObserverResult,
  type RefetchOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

// Infer the exact shape from tRPC router
type RouterOutput = inferRouterOutputs<AppRouter>;
type CurrentUser = RouterOutput["users"]["getCurrent"];
type CurrentUserError = TRPCClientErrorLike<AppRouter>;

type UseCurrentUserResult = UseQueryResult<CurrentUser, CurrentUserError> & {
  isInitialLoading: boolean;
  isStale: boolean;
  invalidate: () => Promise<void>;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<CurrentUser, CurrentUserError>>;
  user: CurrentUser | null;
};

// Main hook - fetches & caches current authenticated user
export function useCurrentUser(): UseCurrentUserResult {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryKey = trpc.users.getCurrent.queryKey();

  const query = useQuery({
    ...trpc.users.getCurrent.queryOptions(),
    staleTime: 10 * 60_000, // 10 minutes
    gcTime: 60 * 60_000, // 1 hour

    refetchOnWindowFocus: false,

    // Keep previous data while fetching new one (smooth UX)
    placeholderData: (prev) => prev,

    // enabled: !!session?.user, (session context)
  });

  // Optional: helper flags for UI
  const isInitialLoading = query.isLoading && !query.data;
  const isStale = query.isStale;

  // Optional: manual invalidate / refetch trigger
  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  const refetch = (options?: RefetchOptions) => query.refetch(options);

  return {
    ...query,

    // Enhanced / clearer states
    isInitialLoading,
    isStale,

    // Convenience methods
    invalidate,
    refetch,

    user: query.data ?? null,
  };
}

export function useCreateSystemMessage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.createSystemMessage.mutationOptions(),
  );
}

export function useBecomeMember() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.becomeMember.mutationOptions({
      onSuccess() {
        // Invalidate current user to refresh membership status
        queryClient.invalidateQueries({
          queryKey: trpc.users.getCurrent.queryKey(),
        });
      }
    }),
  );
}

import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.messages.getInfinite>;

export const prefetchMessages = async () => {
    return prefetch(trpc.messages.getInfinite.queryOptions({}));
}

export const prefetchPrivateMessages = async () => {
    return prefetch(trpc.messages.getPrivateInfinite.queryOptions({}));
}
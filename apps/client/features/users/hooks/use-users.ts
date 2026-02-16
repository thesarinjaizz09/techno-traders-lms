import { useTRPC } from "@/trpc/client"
import {
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"


export const useCurrentUser = () => {
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const queryResult = useQuery({
        ...trpc.users.getCurrent.queryOptions(),
        refetchOnWindowFocus: true,
        placeholderData: (previousData) => previousData,
    })

    const cachedData = queryClient.getQueryData(
        trpc.users.getCurrent.queryKey()
    )

    return {
        ...queryResult,
        data: queryResult.data ?? cachedData,
        isInitialLoading: queryResult.isLoading,
    }
}
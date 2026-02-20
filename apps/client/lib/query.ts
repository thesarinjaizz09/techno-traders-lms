import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
(globalThis as any).queryClient = queryClient;

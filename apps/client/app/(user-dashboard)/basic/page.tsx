import { HydrateClient } from "@/trpc/server"
import type { SearchParams } from "nuqs/server"
import generatePageMetadata from "@/lib/utils/seo"
import { ErrorBoundary } from "react-error-boundary"
import { isAuthenticated } from "@/lib/auth/utils"
import { prefetchMessages } from "@/features/forum/server/prefetch"
import Forum from "@/features/forum/components/forum"
import { ForumContainer } from "@/features/forum/components/container"
import { ForumError } from "@/features/forum/components/error"
import { Suspense } from "react"
import ForumSkeleton from "@/features/forum/components/forum-skeleton"

export const metadata = generatePageMetadata({
  title: "Basic Community",
  description:
    "Join the public community to ask questions, share insights, and participate in real-time discussions with members across the community.",
  image: "/og-forum.jpg",
  url: "/forum",
  schemaType: "WebPage",
});

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: PageProps) {
  await isAuthenticated();

  prefetchMessages();

  return (
    <HydrateClient>
      <ForumContainer>
        <ErrorBoundary fallback={<ForumError />}>
          <Suspense fallback={<ForumSkeleton />}>
            <Forum />
          </Suspense>
        </ErrorBoundary>
      </ForumContainer>
    </HydrateClient>
  );
}

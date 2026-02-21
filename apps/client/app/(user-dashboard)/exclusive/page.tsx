import { HydrateClient } from "@/trpc/server"
import type { SearchParams } from "nuqs/server"
import generatePageMetadata from "@/lib/utils/seo"
import { ErrorBoundary } from "react-error-boundary"
import { isAuthenticated } from "@/lib/auth/utils"
import { prefetchPrivateMessages } from "@/features/forum/server/prefetch"
import { ForumContainer } from "@/features/forum/components/container"
import { ForumError } from "@/features/forum/components/error"
import PrivateForum from "@/features/forum/components/private-forum"
import ForumSkeleton from "@/features/forum/components/forum-skeleton"
import { Suspense } from "react"

export const metadata = generatePageMetadata({
  title: "Exclusive Community",
  description:
    "Access the members-only community for private discussions, premium insights, and deeper conversations reserved for exclusive community members.",
  image: "/og-private-forum.jpg",
  url: "/private-forum",
  schemaType: "WebPage",
});

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: PageProps) {
  await isAuthenticated()

  prefetchPrivateMessages()

  return (
    <HydrateClient>
      <ForumContainer>
        <ErrorBoundary fallback={<ForumError />}>
          <Suspense fallback={<ForumSkeleton />}>
            <PrivateForum />
          </Suspense>
        </ErrorBoundary>
      </ForumContainer>
    </HydrateClient >
  )
}

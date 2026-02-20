import { HydrateClient } from "@/trpc/server"
import type { SearchParams } from "nuqs/server"
import generatePageMetadata from "@/lib/utils/seo"
import { ErrorBoundary } from "react-error-boundary"
import { isAuthenticated } from "@/lib/auth/utils"
import { prefetchMessages } from "@/features/forum/server/prefetch"
import Forum from "@/features/forum/components/forum"
import { ForumContainer } from "@/features/forum/components/container"
import { ForumError } from "@/features/forum/components/error"

export const metadata = generatePageMetadata({
  title: "Forum",
  description:
    "Create, schedule, and manage email campaigns with full control over recipients, templates, sending limits, and delivery performance. Track real-time progress, failures, and outcomes across campaigns in a unified PostDepot workspace.",
  image: "/og-campaigns.jpg",
  url: "/campaigns",
  schemaType: "WebPage",
});


type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: PageProps) {
  const session = await isAuthenticated()

  prefetchMessages()

  return (
    <HydrateClient>
      <ForumContainer>
        <ErrorBoundary fallback={<ForumError />}>
          <Forum />
        </ErrorBoundary>
      </ForumContainer>
    </HydrateClient >
  )
}

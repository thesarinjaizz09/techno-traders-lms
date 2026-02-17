import { HydrateClient } from "@/trpc/server"
import type { SearchParams } from "nuqs/server"
import generatePageMetadata from "@/lib/utils/seo"
import { ErrorBoundary } from "react-error-boundary"
import { isAuthenticated } from "@/lib/auth/utils"
import { prefetchMessages } from "@/features/forum/server/prefetch"
import Forum from "@/features/forum/components/forum"

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
      {/* <CampaignsContainer user={session.user}> */}
      <ErrorBoundary fallback={<div className="p-4 bg-red-100 text-red-800 rounded">Failed to load forum. Please try again later.</div>}>
        <Forum />
        {/* <CampaignsTable user={session.user} /> */}
      </ErrorBoundary>
      {/* </CampaignsContainer> */}
    </HydrateClient >
  )
}

import { useRefreshCampaigns } from "@/features/campaigns/hooks/use-campaigns"
import { useEffect, useState } from "react"


export function useCampaignLogs(campaignId: string | null) {
  const [logs, setLogs] = useState<any[]>([])
  const [connected, setConnected] = useState(false)

  const { refresh } = useRefreshCampaigns()

  useEffect(() => {
    // console.log("🚀 CAMPAIGN_ID", campaignId)
    if (!campaignId) return

    const source = new EventSource(
      `${process.env.NEXT_PUBLIC_MAIL_ENGINE_URL}/api/campaign-events/${campaignId}`
    )

    source.onopen = () => setConnected(true)

    source.onmessage = (event) => {
      const data = JSON.parse(event.data)

      setLogs((prev) => [...prev, data])

      if (data.event === "campaign-completed") {
        refresh()
      }
    }

    source.onerror = () => {
      setConnected(false)
      source.close()
    }

    return () => source.close()
  }, [campaignId])

  return { logs, connected }
}

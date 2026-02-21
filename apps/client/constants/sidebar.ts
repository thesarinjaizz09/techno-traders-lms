import {
   BookOpen,
   Settings2,
   LifeBuoy,
   Send,
   LayoutDashboard,
   Mail,
   Users,
   FileText,
   Server,
   BarChart3,
   Shield,
   ToolCase,
   MonitorPlay
} from "lucide-react"

export const SIDEBAR_MAIN_NAVIGATION = [
   /* =======================
      OVERVIEW
      ======================= */
   {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [
         {
            title: "Dashboard",
            url: "/dashboard",
         },
      ],
   },

   /* =======================
      CAMPAIGNS (CORE)
      ======================= */
   {
      title: "Content",
      url: "/content",
      icon: MonitorPlay,
      items: [
         {
            title: "Videos",
            url: "/content",
         },
      ],
   },

   /* =======================
      CAMPAIGNS (CORE)
      ======================= */
   {
      title: "Tools",
      url: "/calculator",
      icon: ToolCase,
      items: [
         {
            title: "Calculator",
            url: "/calculator",
         },
      ],
   },

   /* =======================
      COMMUNITY
      ======================= */
   {
      title: "Community",
      url: "/basic",
      icon: Users,
      items: [
         {
            title: "Basic",
            url: "/basic",
         },
         {
            title: "Exclusive",
            url: "/exclusive",
         },
      ],
   },

   /* =======================
      CONTENT
      ======================= */
   // {
   //   title: "Content",
   //   url: "/templates",
   //   icon: FileText,
   //   items: [
   //     {
   //       title: "Templates",
   //       url: "/templates",
   //     },
   //     {
   //       title: "Editor",
   //       url: "/templates/editor",
   //     },
   //   ],
   // },

   /* =======================
      DELIVERY (INFRA)
      ======================= */
   // {
   //   title: "Delivery",
   //   url: "#",
   //   icon: Server,
   //   items: [
   //     {
   //       title: "Sending Domains",
   //       url: "/domains",
   //     },
   //     {
   //       title: "Rate Limits",
   //       url: "/rate-limits",
   //     },
   //   ],
   // },

   /* =======================
      ANALYTICS
      ======================= */
   // {
   //   title: "Analytics",
   //   url: "/analytics",
   //   icon: BarChart3,
   //   items: [
   //     {
   //       title: "Performance",
   //       url: "/analytics/campaigns",
   //     },
   //     {
   //       title: "Delivery Logs",
   //       url: "/logs/delivery",
   //     },
   //     {
   //       title: "Failures & Bounces",
   //       url: "/logs/failures",
   //     },
   //   ],
   // },

   /* =======================
      SYSTEM (ADVANCED)
      ======================= */
   // {
   //   title: "System",
   //   url: "#",
   //   icon: Shield,
   //   items: [
   //     {
   //       title: "Health",
   //       url: "/system/health",
   //     },
   //   ],
   // },

   /* =======================
      SETTINGS
      ======================= */
   {
      title: "Settings",
      url: "/profile",
      icon: Settings2,
      items: [
         {
            title: "Profile",
            url: "/profile",
         },
         // {
         //    title: "Billing",
         //    url: "/settings/billing",
         // },
         // {
         //    title: "API Keys",
         //    url: "/settings/api-keys",
         // },
         // {
         //    title: "Security",
         //    url: "/settings/security",
         // },
      ],
   },

   /* =======================
      DOCUMENTATION
      ======================= */
   // {
   //   title: "Docs",
   //   url: "/docs",
   //   icon: BookOpen,
   //   items: [
   //     {
   //       title: "Getting Started",
   //       url: "/docs/getting-started",
   //     },
   //     {
   //       title: "API Reference",
   //       url: "/docs/api",
   //     },
   //     {
   //       title: "Changelog",
   //       url: "/docs/changelog",
   //     },
   //   ],
   // },
]

export const SIDEBAR_SECONDARY_NAVIGATION = [
   {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
   },
   {
      title: "Feedback",
      url: "#",
      icon: Send,
   },
]
import React from "react";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { isAuthenticated } from "@/lib/auth/utils";
import generatePageMetadata from "@/lib/utils/seo";

export const metadata = generatePageMetadata({
    title: "Dashboard",
    description:
        "Your Synapse dashboard gives you a unified overview of your agentic workflows, executions, analytics, and system activity. Monitor, manage, and orchestrate intelligent agents with real-time insights and enterprise-grade reliability.",
    image: "/og-dashboard.jpg",
    url: "/boards",
    schemaType: "WebPage",
});


export default async function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = await isAuthenticated();

    return (
        <div className="[--header-height:calc(--spacing(13))]">
            <SidebarProvider className="flex flex-col">
                <SiteHeader />
                <div className="flex flex-1">
                    <AppSidebar name={user.name} email={user.email} />
                    <SidebarInset>
                        {children}
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}

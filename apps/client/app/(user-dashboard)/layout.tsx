import React from "react";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { isAuthenticated } from "@/lib/auth/utils";
import generatePageMetadata from "@/lib/utils/seo";
import { SocketProvider } from "@/providers/socket-provider";
import { AuthResetProvider } from "@/providers/auth-reset-provider";
import { OnlineUsersProvider } from "@/providers/online-users-providers";

export const metadata = generatePageMetadata({
    title: "Dashboard",
    description:
        "Your personalized dashboard to track activity, manage discussions, monitor engagement, and stay updated with everything happening across your community.",
    image: "/og-dashboard.jpg",
    url: "/dashboard",
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
                        <AuthResetProvider>
                            <SocketProvider>
                                <OnlineUsersProvider>
                                    {children}
                                </OnlineUsersProvider>
                            </SocketProvider>
                        </AuthResetProvider>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}

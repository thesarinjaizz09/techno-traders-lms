"use client"

import appLogo from "@/public/alphafusion.png";
import Image from "next/image";
import { NavMain } from "@/components/nav-main"
import { SIDEBAR_MAIN_NAVIGATION, SIDEBAR_SECONDARY_NAVIGATION } from "@/constants/sidebar";
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";

interface AppSidebarProps {
  name: string;
  email: string;
}


export function AppSidebar({ name, email }: AppSidebarProps) {
  const data = {
    user: {
      name: name || "Jeffrey Epistien",
      email: email || "jeffrey.epistien@me.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: SIDEBAR_MAIN_NAVIGATION,
    navSecondary: SIDEBAR_SECONDARY_NAVIGATION
  }
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="p-2 h-auto data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Link href="#" className="flex items-center justify-center shadow-inner border">
                <div className="p-[5px] border rounded-sm bg-muted "
                >
                  <Image
                    src={appLogo}
                    alt="AlphaFusion Corporation"
                    width={20}
                    className="hover:scale-120"
                  />
                </div>
                <div className="grid flex-1 text-left leading-tight text-primary-foreground">
                  <span className="truncate text-md text-primary-foreground font-semibold">
                    Techno Traders
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">SIDA</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

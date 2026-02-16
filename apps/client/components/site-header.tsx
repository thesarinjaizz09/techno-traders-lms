"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Stats from "./ui/stats";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { SIDEBAR_MAIN_NAVIGATION } from "@/constants/sidebar";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { Bell, BellRing, Key, MailOpen, SidebarIcon } from "lucide-react";
import { Activity, Timer, AlertTriangle, ListChecks } from "lucide-react";

export const HEADER_STATS = [
  {
    label: "Running",
    value: 12,
    theme: "green",
    icon: <Activity className="size-4 text-emerald-400" />,
  },
  {
    label: "Uptime",
    value: "99.97%",
    theme: "blue",
    icon: <Timer className="size-4 text-blue-400" />,
  },
  {
    label: "Failed",
    value: 2,
    theme: "red",
    icon: <AlertTriangle className="size-4 text-red-400" />,
  },
  {
    label: "Queue",
    value: "Low",
    theme: "purple",
    icon: <ListChecks className="size-4 text-purple-400" />,
  },
];

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const breadcrumbs = useBreadcrumbs(SIDEBAR_MAIN_NAVIGATION);

  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="flex h-(--header-height) items-center w-full">
        <Button
          className="h-8 w-8 ml-2"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>

        <Separator orientation="vertical" className="h-4 mx-2" />

        <Breadcrumb className="hidden sm:block ml-2">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <BreadcrumbItem key={i} className="text-white text-[13px]">
                  {crumb.url ? (
                    <BreadcrumbLink href={crumb.url} key={i}>
                      <span className="hover:underline tracking-wide ">

                        {crumb.title}
                      </span>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage key={i}>
                      <span className="tracking-wide text-muted-foreground">{crumb.title}</span></BreadcrumbPage>
                  )}
                </BreadcrumbItem>

                {i < breadcrumbs.length - 1 && <BreadcrumbSeparator key={`sep-${i}`} />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* <div className="ml-auto flex items-center gap-3 mr-1">

          <div className="ml-auto flex items-center gap-2 pr-3">
            <div className="flex items-center justify-center p-2 border rounded-full bg-muted cursor-pointer"
            >
              <MailOpen className="size-3 text-muted-foreground hover:text-primary hover:scale-120" />
            </div>
            <div className="flex items-center justify-center p-2 border rounded-full bg-muted cursor-pointer "
            >
              <BellRing className="size-3 text-muted-foreground hover:text-primary hover:scale-120" />
            </div>
          </div>

        </div> */}
      </div>
    </header>
  );
}

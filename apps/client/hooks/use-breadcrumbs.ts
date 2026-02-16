"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  title: string;
  url: string;
  icon?: any;
  items?: { title: string; url: string }[];
};

export function useBreadcrumbs(navMain: NavItem[]) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    let list: { title: string; url?: string }[] = [];

    for (const section of navMain) {
      if (!section.items) continue;

      for (const item of section.items) {
        const isExact = item.url === pathname;
        const isDynamic = pathname.startsWith(item.url + "/");

        // 📌 Case 1: Exact match
        if (isExact) {
          if (section.url !== "#") {
            list.push({ title: section.title, url: section.url });
          }
          list.push({ title: item.title, url: item.url });
          return list;
        }

        // 📌 Case 2: Dynamic nested route (e.g., /workflows/[id])
        if (isDynamic && item.url !== "#" && item.url !== "/") {
          if (section.url !== "#") {
            list.push({ title: section.title, url: section.url });
          }

          list.push({ title: item.title, url: item.url });

          // Extract ID
          const id = pathname.replace(item.url + "/", "");

          if (id) {
            list.push({
              title: id, // We will replace this later
              url: undefined,
            });
          }

          return list;
        }
      }
    }

    return list;
  }, [pathname, navMain]);

  // ------------------------------------------
  // 📌 STEP 2: Replace dynamic ID with workflow name
  // ------------------------------------------

  // const lastCrumb = breadcrumbs[breadcrumbs.length - 1];

  // const isWorkflowDetail =
  //   breadcrumbs.length >= 2 &&
  //   breadcrumbs[breadcrumbs.length - 2]?.title === "Workflows";

  // if (isWorkflowDetail) {
  //   const id = lastCrumb.title;

  //   // Fetch workflow (this hook suspends)
  //   try {
  //     // const { data } = useSuspenseWorkflow(id);

  //     // Replace the last breadcrumb title with workflow name
  //     lastCrumb.title = data?.workflow.name ?? "Workflow";
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  return breadcrumbs;
}

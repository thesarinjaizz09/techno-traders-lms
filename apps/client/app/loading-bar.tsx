"use client";

import { useEffect, useState } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { usePathname } from "next/navigation";

// Configure globally
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 80,
  minimum: 0.08,
  easing: "ease",
  speed: 300
});

export default function LoadingBar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    const start = () => NProgress.start();
    const done = () => NProgress.done();
    const syncSearch = () => setSearch(window.location.search);
    const handlePopState = () => {
      start();
      syncSearch();
      setTimeout(done, 200);
    };

    syncSearch();

    // Patch pushState
    history.pushState = function (...args: Parameters<History["pushState"]>) {
      start();
      originalPushState(...args);
      syncSearch();
      setTimeout(done, 200);
    };

    // Patch replaceState
    history.replaceState = function (...args: Parameters<History["replaceState"]>) {
      start();
      originalReplaceState(...args);
      syncSearch();
      setTimeout(done, 200);
    };

    // Listen for browser navigation (back/forward)
    window.addEventListener("popstate", handlePopState);

    window.addEventListener("beforeunload", start);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", start);
    };
  }, []);

  // Fallback: detect route/search changes
  useEffect(() => {
    // This catches when route or query string actually changes
    NProgress.done();
  }, [pathname, search]);

  return null;
}

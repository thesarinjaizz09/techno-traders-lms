"use client";

import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { usePathname } from "next/navigation";

// Configure once
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 80,
  minimum: 0.08,
  easing: "ease",
  speed: 300,
});

export default function LoadingBar() {
  const pathname = usePathname();

  useEffect(() => {
    const start = () => NProgress.start();
    const done = () => NProgress.done();

    // Patch history methods (without setState!)
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = function (...args) {
      start();
      originalPushState.apply(this, args);
      setTimeout(done, 200);
    };

    history.replaceState = function (...args) {
      start();
      originalReplaceState.apply(this, args);
      setTimeout(done, 200);
    };

    // Handle browser back/forward
    const handlePopState = () => {
      start();
      setTimeout(done, 200);
    };
    window.addEventListener("popstate", handlePopState);

    // Start on unload (page refresh / navigation away)
    window.addEventListener("beforeunload", start);

    // Cleanup
    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", start);
    };
  }, []);

  // Final safety net: complete progress when pathname actually changes
  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return null;
}
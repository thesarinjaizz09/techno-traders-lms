"use client";

import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure globally
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 120,
});

export default function LoadingBar() {
  useEffect(() => {
    let originalPushState = history.pushState;
    let originalReplaceState = history.replaceState;

    const start = () => NProgress.start();
    const done = () => NProgress.done();

    // Patch pushState
    history.pushState = function (...args) {
      start();
      originalPushState.apply(this, args);
      setTimeout(done, 200);
    };

    // Patch replaceState
    history.replaceState = function (...args) {
      start();
      originalReplaceState.apply(this, args);
      setTimeout(done, 200);
    };

    // Listen for browser navigation (back/forward)
    window.addEventListener("popstate", () => {
      start();
      setTimeout(done, 200);
    });

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", done);
    };
  }, []);

  return null;
}

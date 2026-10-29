"use client";

import { useEffect } from "react";

/** Counts one visit per page load. Sent with keepalive so it survives an early navigation. */
export default function Beacon() {
  useEffect(() => {
    try {
      void fetch("/api/hit", {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: location.pathname, referrer: document.referrer, width: innerWidth }),
      });
    } catch {
      /* analytics never breaks the page */
    }
  }, []);
  return null;
}

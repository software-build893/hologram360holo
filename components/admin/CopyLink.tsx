"use client";

import { useState } from "react";

export default function CopyLink({ url, className }: { url: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          window.prompt("Copy the link", url);
        }
      }}
    >
      {done ? "Copied" : "Copy link"}
    </button>
  );
}

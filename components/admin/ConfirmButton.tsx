"use client";

import type { ReactNode } from "react";

/** A submit button that asks before it fires; used for the one destructive action in the editor. */
export default function ConfirmButton({ confirm, children, ...rest }: { confirm: string; children: ReactNode; className?: string; name?: string; value?: string }) {
  return (
    <button
      type="submit"
      {...rest}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

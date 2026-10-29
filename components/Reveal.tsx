"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = { as?: "ul" | "div"; className?: string; children: ReactNode; label?: string };

/** Marks its element data-in once it scrolls into view; the stylesheet does the rest. */
export default function Reveal({ as = "div", className, children, label }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-in", "");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref as never} className={className} aria-label={label}>
      {children}
    </Tag>
  );
}

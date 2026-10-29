"use client";

import { useEffect, type RefObject } from "react";
import { clamp01, scene } from "./scene";

export const STEPS = [
  { band: [0.12, 0.3] as const, a: "Looks solid.", b: "It isn’t." },
  { band: [0.32, 0.52] as const, a: "Two blades. 224 LEDs.", b: "700 revolutions a minute." },
  { band: [0.54, 0.74] as const, a: "Each blade paints one slice", b: "of the picture as it passes." },
  { band: [0.76, 0.94] as const, a: "Your eye holds the light.", b: "The picture floats." },
];

type Refs = {
  stage: RefObject<HTMLElement | null>;
  hero: RefObject<HTMLElement | null>; // the opening copy: headline, subline, link, tabs, callouts
  steps: RefObject<HTMLElement | null>;
  end: RefObject<HTMLElement | null>;
  progress: RefObject<HTMLElement | null>;
};

/**
 * Drives the pinned hero story from scroll: writes scene.progress for the three.js loop and moves the copy
 * directly in the DOM (no React state on scroll). A port of holo's GSAP ScrollTrigger timeline, by hand.
 */
export function useScrollStory(refs: Refs, enabled: boolean) {
  useEffect(() => {
    const stage = refs.stage.current;
    if (!stage || !enabled) {
      scene.progress = 0;
      return;
    }
    let raf = 0;
    let last = -1;

    const apply = (p: number) => {
      scene.progress = p;
      // opening copy leaves as the story starts
      const hero = refs.hero.current;
      if (hero) {
        const t = clamp01((p - 0.02) / 0.1);
        hero.style.opacity = String(1 - t);
        hero.style.transform = `translateY(${(-60 * t).toFixed(1)}px)`;
        hero.style.visibility = t >= 1 ? "hidden" : "visible";
        hero.style.pointerEvents = t > 0.5 ? "none" : "";
      }
      // steps: each line rises in over 0.06 at the band start, leaves over 0.05 before the band end
      const steps = refs.steps.current;
      if (steps) {
        STEPS.forEach((s, i) => {
          const el = steps.children[i] as HTMLElement | undefined;
          if (!el) return;
          const [a, b] = s.band;
          const lines = el.querySelectorAll<HTMLElement>("[data-line]");
          const visible = p >= a && p < b;
          el.style.visibility = visible ? "visible" : "hidden";
          lines.forEach((ln, k) => {
            const inT = clamp01((p - a - k * 0.015) / 0.06);
            const outT = clamp01((p - (b - 0.05) - k * 0.01) / 0.05);
            const y = p < b - 0.05 ? 110 * (1 - easeOut(inT)) : -110 * easeOut(outT);
            ln.style.transform = `translateY(${y.toFixed(1)}%)`;
          });
        });
      }
      const end = refs.end.current;
      if (end) {
        const t = clamp01((p - 0.94) / 0.06);
        end.style.visibility = t > 0 ? "visible" : "hidden";
        end.style.opacity = String(t);
        end.style.transform = `translate(-50%, ${(40 * (1 - t)).toFixed(1)}px)`;
      }
      const bar = refs.progress.current;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const total = stage.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp01(-rect.top / total) : 0;
      if (p !== last) {
        last = p;
        apply(p);
      }
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      scene.progress = 0;
    };
  }, [refs, enabled]);
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

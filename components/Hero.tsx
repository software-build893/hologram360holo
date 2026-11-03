"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LABELS } from "./fan/labels";
import { STEPS, useScrollStory } from "@/lib/useScrollStory";
import { scene } from "@/lib/scene";
import styles from "./hero.module.css";

// three.js touches window at import time; the canvas only exists on the client.
const FanScene = dynamic(() => import("./fan/FanScene"), { ssr: false });

const INTERVAL_MS = 5000;

export const niches = [
  { id: "liquor", label: "Liquor store", env: "bar", clip: "/media/holo-pin/liquor.mp4", poster: "/assets/holo-pin/liquor.png", client: "a champagne bottle" },
  { id: "donut", label: "Donut shop", env: "donut", clip: "/media/holo-pin/donut.mp4", poster: "/assets/holo-pin/donut.png", client: "glazed donuts" },
  { id: "juice", label: "Juice bar", env: "juice", clip: "/media/holo-pin/juice.mp4", poster: "/assets/holo-pin/juice.png", client: "orange juice" },
  { id: "clothing", label: "Clothing store", env: "clothing", clip: "/media/holo-pin/clothing.mp4", poster: "/assets/holo-pin/clothing.png", client: "the Cloths Store logo" },
] as const;

const specs = [
  { id: "diameter", value: "Ø 42 cm", label: "Fan diameter", icon: "diameter" },
  { id: "resolution", value: "1024 × 800 px", label: "Content resolution", icon: "monitor" },
  { id: "leds", value: "224 LEDs", label: "High brightness", icon: "sun" },
  { id: "viewing", value: "150°", label: "Viewing angle", icon: "angle" },
  { id: "power", value: "20 W", label: "Power consumption", icon: "bolt" },
] as const;

function Icon({ name }: { name: string }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "diameter":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M5 19 19 5" /></svg>;
    case "monitor":
      return <svg {...common}><rect x="3" y="5" width="18" height="12" rx="1.5" /><path d="M9 20h6" /></svg>;
    case "sun":
      return <svg {...common}><circle cx="12" cy="12" r="3.5" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>;
    case "angle":
      return <svg {...common}><path d="M4 18 18 6" /><path d="M4 18h16" /><path d="M9.5 18a6 6 0 0 0-1.6-4.1" /></svg>;
    case "bolt":
      return <svg {...common}><path d="M13 3 5 14h6l-1 7 8-11h-6z" /></svg>;
    default:
      return null;
  }
}

function useMedia(query: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setM(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return m;
}

export default function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const phone = useMedia("(max-width: 860px)");

  // the scroll story runs on wide screens; phones get the flowing hero with the fan at full speed
  const stage = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const steps = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => ({ stage, hero: copy, steps, end, progress }), []);
  useScrollStory(refs, !phone && !reduced);

  useEffect(() => {
    if (phone) return;
    const on = (e: PointerEvent) => {
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [phone]);

  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % niches.length), INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [paused, reduced]);

  const current = niches[active];

  return (
    <>
      <section ref={stage} className={styles.stage} id="top" aria-label="3D Hologram Ads">
        <div className={styles.sticky}>
          {/* Environment plates, one per niche; only the active one is visible. */}
          {niches.map((n, i) => (
            <picture key={n.id} className={styles.environment} data-active={i === active || undefined}>
              <source srcSet={`/assets/env/${n.env}.webp`} type="image/webp" />
              <img
                src={i === 0 ? "/assets/plates/hero-environment.png" : `/assets/env/${n.env}.png`}
                alt=""
                width={2688}
                height={1170}
                decoding={i === 0 ? "sync" : "async"}
                fetchPriority={i === 0 ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </picture>
          ))}

          <div className={styles.frame} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <header className={styles.nav}>
              <a className={styles.wordmark} href="#top" aria-label="3D Hologram Ads, home">
                <span className={styles.wordmarkAccent}>3D</span> HOLOGRAM ADS
              </a>
              <nav aria-label="Primary">
                <a className={styles.navHow} href="#how">How it works</a>
                <a className={styles.navWild} href="#wild">In the wild</a>
                <a className={styles.navKit} href="#kit">The kit</a>
                <a className={styles.navPrices} href="#prices">Prices</a>
                <a className={styles.navArticles} href="/articles">Articles</a>
              </nav>
              <a className={styles.navCta} href="#quote">Get a quote</a>
            </header>

            {/* The fan itself, rendered live: the same rotor, LED strips and persistence-of-vision disc as the holo site.
                Scrolling lifts the cover, slows the rotor so the blades read, swings the camera round, and spins back up. */}
            <div className={styles.fan} role="img" aria-label={`Holographic LED fan spinning ${current.client}`}>
              <FanScene className={styles.fanCanvas} clips={niches.map((n) => ({ src: n.clip, poster: n.poster }))} active={active} />
              {/* Labels pinned to parts of the fan during the story; the canvas positions them in its own pixels. */}
              <div className={styles.labels} aria-hidden="true">
                {LABELS.map((l) => (
                  <div key={l.id} id={`lbl-${l.id}`} className={`${styles.lbl} ${l.align === "right" ? styles.lblRight : ""}`} style={{ opacity: 0 }}>
                    <span className={styles.lblDot} />
                    <span className={styles.lblLine} />
                    <span className={styles.lblText}>{l.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The opening copy: leaves as the story starts. */}
            <div ref={copy} className={styles.copy}>
              <h1 className={styles.headline}>Your logo,<br />floating in mid-air.</h1>
              <p className={styles.subline}>Holographic LED fan with custom 3D content, from $250.</p>
              <a className={styles.ctaLink} href="#wild">
                <span className={styles.ctaLinkText}>See it in the wild</span>
                <svg className={styles.ctaArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <div className={styles.tabs} role="tablist" aria-label="Business type">
                {niches.map((n, i) => (
                  <button
                    key={n.id}
                    type="button"
                    role="tab"
                    id={`tab-${n.id}`}
                    aria-selected={i === active}
                    tabIndex={i === active ? 0 : -1}
                    className={styles.tab}
                    data-active={i === active || undefined}
                    data-cycling={!paused && !reduced ? "" : undefined}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") setActive((i + 1) % niches.length);
                      if (e.key === "ArrowLeft") setActive((i - 1 + niches.length) % niches.length);
                    }}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            {/* The story's copy, one step per band of scroll. */}
            <div ref={steps} className={styles.steps} aria-live="polite">
              {STEPS.map((s, i) => (
                <div key={i} className={styles.step} style={{ visibility: "hidden" }}>
                  <p className={styles.stepText}>
                    <span className={styles.stepLine}><span data-line>{s.a}</span></span>
                    <span className={styles.stepLine}><span data-line>{s.b}</span></span>
                  </p>
                </div>
              ))}
            </div>
            <div ref={end} className={styles.end} style={{ visibility: "hidden" }}>
              <p className={styles.endTitle}>Now you know the trick.</p>
              <p className={styles.endLede}>It still works on everyone who walks by.</p>
            </div>

            <div className={styles.progress} aria-hidden="true"><div ref={progress} className={styles.progressBar} /></div>
          </div>
        </div>
        {/* nav anchor: lands where the story begins */}
        <div id="how" className={styles.anchor} aria-hidden="true" />
      </section>

      <div className={styles.band}>
        <dl className={styles.specs} aria-label="Specifications">
          {specs.map((s) => (
            <div key={s.id}>
              <span className={styles.specIcon}><Icon name={s.icon} /></span>
              <dt className={styles.specLabel}>{s.label}</dt>
              <dd className={styles.specValue}>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}

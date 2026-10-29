"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./hero.module.css";

// three.js touches window at import time; the canvas only exists on the client.
const FanScene = dynamic(() => import("./fan/FanScene"), { ssr: false });

const INTERVAL_MS = 5000;

export const niches = [
  { id: "liquor", label: "Liquor store", env: "bar", clip: "/media/holo-pin/liquor.mp4", poster: "/assets/holo-pin/liquor.png", client: "a champagne bottle" },
  { id: "donut", label: "Donut shop", env: "donut", clip: "/media/holo-pin/donut.mp4", poster: "/assets/holo-pin/donut.png", client: "glazed donuts" },
  { id: "juice", label: "Juice bar", env: "juice", clip: "/media/holo-pin/juice.mp4", poster: "/assets/holo-pin/juice.png", client: "orange juice" },
  { id: "phone", label: "Phone shop", env: "phone", clip: "/media/holo-pin/phone.mp4", poster: "/assets/holo-pin/phone.png", client: "a phone case" },
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
    case "fan":
      return <svg {...common}><circle cx="12" cy="12" r="2" /><path d="M12 10c0-4 2-6 5-6s3 4 0 5-5 1-5 1M12 14c0 4-2 6-5 6s-3-4 0-5 5-1 5-1M10 12c-4 0-6-2-6-5s4-3 5 0 1 5 1 5M14 12c4 0 6 2 6 5s-4 3-5 0-1-5-1-5" /></svg>;
    case "play":
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m10 9 5 3-5 3z" /></svg>;
    case "tripod":
      return <svg {...common}><path d="M12 4v16M12 8l-6 12M12 8l6 12M8 4h8" /></svg>;
    default:
      return null;
  }
}

export default function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % niches.length), INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [paused, reduced]);

  const current = niches[active];

  return (
    <section
      className={styles.frame}
      aria-label="3D Hologram Ads"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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

      <header className={styles.nav}>
        <a className={styles.wordmark} href="#top" aria-label="3D Hologram Ads, home">
          <span className={styles.wordmarkAccent}>3D</span> HOLOGRAM ADS
        </a>
        <nav aria-label="Primary">
          <a className={styles.navHow} href="#how">How it works</a>
          <a className={styles.navWild} href="#wild">In the wild</a>
          <a className={styles.navKit} href="#kit">The kit</a>
          <a className={styles.navPrices} href="#prices">Prices</a>
        </nav>
        <a className={styles.navCta} href="#quote">Get a quote</a>
      </header>

      <h1 className={styles.headline}>Your logo,<br />floating in mid-air.</h1>
      <p className={styles.subline}>Holographic LED fan with custom 3D content, from $250.</p>
      <a className={styles.ctaLink} href="#wild">
        <span className={styles.ctaLinkText}>See it in the wild</span>
        <svg className={styles.ctaArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </a>

      {/* The fan itself, rendered live: the same rotor, LED strips and persistence-of-vision disc as the holo site,
          spinning at 700 rpm with the client's real clip painted into mid-air. */}
      <div className={styles.fan} role="img" aria-label={`Holographic LED fan spinning the ${current.client} hologram`}>
        <FanScene
          className={styles.fanCanvas}
          clips={niches.map((n) => ({ src: n.clip, poster: n.poster }))}
          active={active}
        />
      </div>

      <span className={styles.leaderRotor} aria-hidden="true" />
      <span className={styles.calloutRotor}>Two-blade rotor</span>
      <span className={styles.leaderCover} aria-hidden="true" />
      <span className={styles.calloutCover}>Clear acrylic cover</span>

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
    </section>
  );
}

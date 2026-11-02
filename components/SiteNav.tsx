import s from "@/app/articles/articles.module.css";

// The header for pages outside the hero: the same wordmark, links and pill, laid out in a plain bar.
export default function SiteNav({ current }: { current?: "articles" }) {
  return (
    <header className={s.nav}>
      <div className={s.navRow}>
        <a className={s.wordmark} href="/" aria-label="3D Hologram Ads, home">
          <span className={s.wordmarkAccent}>3D</span> HOLOGRAM ADS
        </a>
        <nav className={s.navLinks} aria-label="Primary">
          <a href="/#how">How it works</a>
          <a href="/#wild">In the wild</a>
          <a href="/#kit">The kit</a>
          <a href="/#prices">Prices</a>
          <a href="/articles" aria-current={current === "articles" ? "page" : undefined}>Articles</a>
        </nav>
        <a className={s.navCta} href="/#quote">Get a quote</a>
      </div>
    </header>
  );
}

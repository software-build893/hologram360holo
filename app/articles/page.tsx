import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import { Footer } from "@/components/Sections";
import Beacon from "@/components/Beacon";
import { publishedArticles } from "@/lib/db";
import { formatDate, readingMinutes } from "@/lib/article";
import s from "./articles.module.css";

// read from the database on every request: a newly published article must show without a redeploy
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles — 3D Hologram Ads",
  description: "Notes on holographic LED fans in real shops: what to show, where to mount it, what the content costs and how the fan works.",
};

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export default async function Articles() {
  const list = await publishedArticles();
  return (
    <>
      <SiteNav current="articles" />
      <main className={s.main}>
        <h1 className={s.title}>Articles</h1>
        <p className={s.lede}>Notes from the shop floor: what to put on the fan, where it earns its keep, and what the content and hardware actually cost.</p>
        {list.length === 0 ? (
          <p className={s.empty}>Nothing published yet. The first article is on its way.</p>
        ) : (
          <ul className={s.list}>
            {list.map((a) => (
              <li key={a.id} className={s.row}>
                <div className={s.rowMeta}>
                  <time dateTime={a.published_at ?? undefined}>{formatDate(a.published_at)}</time>
                  <span>{readingMinutes(a.body)} min read</span>
                </div>
                <div className={s.rowBody}>
                  <h2 className={s.rowTitle}><a href={`/articles/${a.slug}`}>{a.title}</a></h2>
                  {a.summary && <p className={s.rowSummary}>{a.summary}</p>}
                  <a className={s.rowMore} href={`/articles/${a.slug}`} aria-label={`Read: ${a.title}`}><span>Read</span><Arrow /></a>
                </div>
                {a.cover && <img className={s.rowCover} src={`/api/articles/${a.id}/cover?v=${encodeURIComponent(a.updated_at)}`} alt={a.cover_alt} loading="lazy" />}
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
      <Beacon />
    </>
  );
}

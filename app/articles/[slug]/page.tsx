import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import { Footer } from "@/components/Sections";
import Beacon from "@/components/Beacon";
import { isAdmin } from "@/lib/auth";
import { articleBySlug, publishedArticles } from "@/lib/db";
import { formatDate, readingMinutes, sanitizeArticleHtml } from "@/lib/article";
import s from "../articles.module.css";

// read from the database on every request: a newly published article must show without a redeploy
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// Drafts open only for a signed-in admin (the editor's "Preview draft" link); everyone else gets a 404.
async function load(slug: string) {
  const a = await articleBySlug(slug);
  if (!a) return null;
  if (a.status !== "published" && !(await isAdmin())) return null;
  return a;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) return { title: "Article not found — 3D Hologram Ads" };
  const base = process.env.SITE_URL ?? "";
  return {
    title: `${a.title} — 3D Hologram Ads`,
    description: a.summary || undefined,
    openGraph: {
      type: "article",
      title: a.title,
      description: a.summary || undefined,
      publishedTime: a.published_at ?? undefined,
      images: a.cover ? [`${base}/api/articles/${a.id}/cover?v=${encodeURIComponent(a.updated_at)}`] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) notFound();
  const html = sanitizeArticleHtml(a.body);
  const more = (await publishedArticles()).filter((x) => x.id !== a.id).slice(0, 3);

  return (
    <>
      <SiteNav current="articles" />
      <main className={s.article}>
        <a className={s.crumb} href="/articles">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4" /></svg>
          Articles
        </a>
        <article>
          <h1 className={s.articleTitle}>{a.title}</h1>
          <p className={s.articleMeta}>
            <time dateTime={a.published_at ?? a.updated_at}>{formatDate(a.published_at ?? a.updated_at)}</time>
            <i>·</i>
            {readingMinutes(a.body)} min read
            {a.status !== "published" && <span className={s.draftTag}>Draft preview</span>}
          </p>
          {a.cover && <img className={s.cover} src={`/api/articles/${a.id}/cover?v=${encodeURIComponent(a.updated_at)}`} alt={a.cover_alt} />}
          {a.summary && <p className={s.summary}>{a.summary}</p>}
          <div className={s.prose} dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        <aside className={s.after}>
          <div className={s.afterCta}>
            <p>Want one of these in your shop?<span>Fan + cover $250, your content from $150. Ask for a quote and we reply the same day.</span></p>
            <a href="/#quote">Get a quote</a>
          </div>
          {more.length > 0 && (
            <>
              <p className={s.moreTitle}>More articles</p>
              <ul className={s.more}>
                {more.map((m) => (
                  <li key={m.id}><a href={`/articles/${m.slug}`}>{m.title}<span>{formatDate(m.published_at)}</span></a></li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </main>
      <Footer />
      <Beacon />
    </>
  );
}

import type { MetadataRoute } from "next";
import { publishedArticles } from "@/lib/db";

export const dynamic = "force-dynamic";

// Home plus every published article, so search engines pick new articles up without a redeploy.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL ?? "https://hologram-alt.afdillah.com").replace(/\/$/, "");
  const articles = await publishedArticles();
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/articles`, lastModified: articles[0] ? new Date(articles[0].updated_at) : new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...articles.map((a) => ({ url: `${base}/articles/${a.slug}`, lastModified: new Date(a.updated_at), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}

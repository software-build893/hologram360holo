import sanitizeHtml from "sanitize-html";

// Article bodies are HTML written in the dashboard's editor. Only signed-in admins author them, but the
// HTML goes to every visitor, so it is reduced to the elements the editor can produce, on save and again
// on render: scripts, inline handlers, javascript: links and unknown tags never reach the page.
const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: ["p", "h2", "h3", "h4", "strong", "em", "s", "u", "a", "ul", "ol", "li", "blockquote", "pre", "code", "img", "hr", "br", "figure", "figcaption"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    // outbound links open in a new tab without handing the article page to the target
    a: (tag, attribs) => ({ tagName: tag, attribs: /^https?:\/\//.test(attribs.href ?? "") ? { ...attribs, target: "_blank", rel: "noopener" } : attribs }),
  },
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE);
}

/** The body as plain text, for reading time and search snippets. */
export function articleText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

/** URL slug from a title: lower-case ASCII words joined by hyphens, at most 80 characters. */
export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Reading time at a leisurely 200 words a minute; never under one minute. */
export function readingMinutes(html: string): number {
  const words = articleText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { articleById } from "@/lib/db";
import SlugField from "@/components/admin/SlugField";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Editor from "@/components/admin/Editor";
import s from "../../admin.module.css";

export const metadata = { title: "Article — 3D Hologram Ads" };

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";

// The article editor: one form, four submit buttons (save, publish, unpublish, delete) that post to /api/admin/articles.
export default async function ArticleEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login?next=/admin?tab=articles");
  const { id } = await params;
  const { saved, error } = await searchParams;
  const a = id === "new" ? null : await articleById(Number(id));
  if (id !== "new" && !a) notFound();
  const isNew = !a;
  const published = a?.status === "published";

  return (
    <div className={s.shell}>
      <header className={s.bar}>
        <a className={s.brand} href="/admin"><span>3D</span> Hologram Ads · Analytics</a>
        <nav className={s.barTabs} aria-label="Sections">
          <a className={s.barTab} href="/admin">Traffic & billing</a>
          <a className={s.barTab} href="/admin?tab=orders">Orders & uploads</a>
          <a className={s.barTab} data-active href="/admin?tab=articles">Articles</a>
        </nav>
        <div className={s.barRight}>
          <a href="/" className={s.muted}>View site</a>
          <form method="post" action="/api/admin/logout">
            <button className={`${s.btn} ${s.btnSmall}`} type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <main className={s.main}>
        <div className={s.head}>
          <div>
            <h1 className={s.h1}>{isNew ? "New article" : a.title}</h1>
            <p className={s.sub}>{isNew ? "Saved as a draft first; publish when it reads right." : published ? <>Live at <a href={`/articles/${a.slug}`} target="_blank" rel="noreferrer">/articles/{a.slug}</a></> : "Draft: only you can open it on the site."}</p>
          </div>
          <a className={s.muted} href="/admin?tab=articles">← All articles</a>
        </div>

        {error && <p className={s.error}>{error}</p>}
        {saved === "published" && <p className={s.notice}>Published. It is live now.</p>}
        {saved === "draft" && <p className={s.notice}>Saved as a draft.</p>}

        <form className={s.editor} method="post" action="/api/admin/articles" encType="multipart/form-data">
          {a && <input type="hidden" name="id" value={a.id} />}
          <div className={s.editorMain}>
            <SlugField title={a?.title ?? ""} slug={a?.slug ?? ""} fieldClass={s.field} slugRowClass={s.slugRow} />
            <label className={s.field}>
              Summary · one or two sentences, shown in the list and in search results
              <textarea name="summary" rows={2} maxLength={400} defaultValue={a?.summary ?? ""} />
            </label>
            <div className={s.field}>
              Body
              <Editor name="body" html={a?.body ?? ""} />
            </div>
          </div>

          <aside className={s.side}>
            <section className={s.panel} aria-label="Publish">
              <div className={s.actions}>
                {published ? (
                  <>
                    <button className={`${s.btn} ${s.btnPrimary}`} type="submit" name="action" value="publish">Save changes</button>
                    <button className={s.btn} type="submit" name="action" value="unpublish">Unpublish</button>
                  </>
                ) : (
                  <>
                    <button className={`${s.btn} ${s.btnPrimary}`} type="submit" name="action" value="publish">Publish</button>
                    <button className={s.btn} type="submit" name="action" value="save">Save draft</button>
                  </>
                )}
                {a && <a className={s.btn} href={`/articles/${a.slug}`} target="_blank" rel="noreferrer">{published ? "View live" : "Preview draft"}</a>}
                {a && <ConfirmButton className={`${s.btn} ${s.btnDanger}`} name="action" value="delete" confirm={`Delete “${a.title}”? This cannot be undone.`}>Delete</ConfirmButton>}
              </div>
              {a && (
                <dl className={s.metaList}>
                  <div>Status: <b>{a.status}</b></div>
                  <div>Updated: <b>{when(a.updated_at)}</b></div>
                  {a.published_at && <div>First published: <b>{when(a.published_at)}</b></div>}
                </dl>
              )}
            </section>

            <section className={s.panel} aria-label="Cover image">
              <div className={s.panelHead} style={{ marginBottom: 0 }}><h2 className={s.panelTitle}>Cover</h2><span className={s.panelMeta}>16:9 works best</span></div>
              {a?.cover ? (
                <img className={s.coverPreview} src={`/api/articles/${a.id}/cover?v=${encodeURIComponent(a.updated_at)}`} alt="" />
              ) : (
                <div className={s.coverEmpty}>No cover yet</div>
              )}
              <input type="file" name="cover" accept="image/jpeg,image/png,image/webp" aria-label="Choose a cover image" />
              <label className={s.field}>
                Cover description for screen readers
                <input name="cover_alt" defaultValue={a?.cover_alt ?? ""} maxLength={200} placeholder="A hologram fan above a bar shelf" />
              </label>
              {a?.cover && <label className={s.check}><input type="checkbox" name="remove_cover" value="1" />Remove the current cover</label>}
            </section>
          </aside>
        </form>
      </main>
    </div>
  );
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { currentAdmin, PASSWORD_MIN } from "@/lib/auth";
import { adminsList, articlesList, articleViews, dailySeries, ordersList, quoteById, quotesForOrders, quotesList, quoteSummary, topReferrers, totals, uploadsByOrder } from "@/lib/db";
import { presets, rangeFromParams, rangeQuery } from "@/lib/range";
import { offers } from "@/lib/content";
import Chart from "@/components/admin/Chart";
import CopyLink from "@/components/admin/CopyLink";
import s from "./admin.module.css";

// never prerendered: the verdict depends on the request's cookie and the database
export const dynamic = "force-dynamic";

export const metadata = { title: "Analytics — 3D Hologram Ads" };

type Params = Record<string, string | string[] | undefined>;

const fmt = new Intl.NumberFormat("en-US");
const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
const offerTitle = (id: string) => offers.find((o) => o.id === id)?.title ?? id;

export default async function Admin({ searchParams }: { searchParams: Promise<Params> }) {
  const me = await currentAdmin();
  if (!me) redirect("/admin/login");
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") params.set(k, v);
  const tabParam = params.get("tab");
  const tab = tabParam === "orders" ? "orders" : tabParam === "articles" ? "articles" : tabParam === "account" ? "account" : "traffic";
  const range = rangeFromParams(params);
  const q = rangeQuery(range);

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:5190"}`;

  const [t, rows, refs, quotes, qs, orders, uploads] = await Promise.all([
    totals(range.from, range.to),
    dailySeries(range.from, range.to),
    topReferrers(range.from, range.to),
    quotesList(range.from, range.to),
    quoteSummary(range.from, range.to),
    ordersList(),
    uploadsByOrder(),
  ]);
  const created = params.get("created");
  const error = params.get("error");
  const articles = tab === "articles" ? await articlesList() : [];
  // Orders tab: the latest quote requests, and the one picked to start a new order from
  const openQuotes = tab === "orders" ? await quotesForOrders() : [];
  const quoteParam = Number(params.get("quote") ?? "");
  const fromQuote = tab === "orders" && Number.isInteger(quoteParam) && quoteParam > 0 ? await quoteById(quoteParam) : null;
  const views = tab === "articles" ? await articleViews() : new Map<string, { views: number; visitors: number }>();
  const deleted = params.get("deleted");
  const ok = params.get("ok");
  const admins = tab === "account" ? await adminsList() : [];

  return (
    <div className={s.shell}>
      <header className={s.bar}>
        <a className={s.brand} href="/admin"><span>3D</span> Hologram Ads · Analytics</a>
        <nav className={s.barTabs} aria-label="Sections">
          <a className={s.barTab} data-active={tab === "traffic" || undefined} href={`/admin?${q}`}>Traffic & billing</a>
          <a className={s.barTab} data-active={tab === "orders" || undefined} href={`/admin?tab=orders&${q}`}>Orders & uploads</a>
          <a className={s.barTab} data-active={tab === "articles" || undefined} href="/admin?tab=articles">Articles</a>
        </nav>
        <div className={s.barRight}>
          <a href="/" className={s.muted}>View site</a>
          <a href="/admin?tab=account" className={s.muted} data-active={tab === "account" || undefined} title="Your account">{me.email}</a>
          <form method="post" action="/api/admin/logout">
            <button className={`${s.btn} ${s.btnSmall}`} type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <main className={s.main}>
        {tab === "traffic" ? (
          <>
            <div className={s.head}>
              <div>
                <h1 className={s.h1}>Traffic</h1>
                <p className={s.sub}>{range.from} to {range.to} · UTC days · a visitor is one person per day</p>
              </div>
              <div className={s.ranges}>
                {presets().map((p) => (
                  <a key={p.key} className={s.rangeBtn} data-active={range.key === p.key || undefined} href={`/admin?range=${p.key}`}>{p.label}</a>
                ))}
                <form className={s.custom} method="get" action="/admin">
                  <input type="date" name="from" defaultValue={range.from} aria-label="From" />
                  <input type="date" name="to" defaultValue={range.to} aria-label="To" />
                  <button type="submit">Apply</button>
                </form>
              </div>
            </div>

            <section className={s.tiles} aria-label="Totals">
              <div className={s.tile}><p className={s.tileLabel}>Visitors</p><p className={s.tileValue}>{fmt.format(t.visitors)}</p><p className={s.tileNote}>daily uniques, the billing basis</p></div>
              <div className={s.tile}><p className={s.tileLabel}>Page views</p><p className={s.tileValue}>{fmt.format(t.pageviews)}</p><p className={s.tileNote}>{t.visitors ? (t.pageviews / t.visitors).toFixed(1) : "0"} per visitor</p></div>
              <div className={s.tile}><p className={s.tileLabel}>Quote requests</p><p className={s.tileValue}>{fmt.format(t.quotes)}</p><p className={s.tileNote}>{t.visitors ? ((t.quotes / t.visitors) * 100).toFixed(1) : "0"}% of visitors</p></div>
              {(() => {
                const known = t.desktop + t.phone;
                const desk = known ? Math.round((t.desktop / known) * 100) : 0;
                return (
                  <div className={s.tile}>
                    <p className={s.tileLabel}>Desktop vs phone</p>
                    <div className={s.split}>
                      <p className={s.splitSide}><span className={s.tileValue}>{known ? `${desk}%` : "–"}</span><span className={s.splitName}>Desktop · {fmt.format(t.desktop)}</span></p>
                      <p className={`${s.splitSide} ${s.splitRight}`}><span className={s.tileValue}>{known ? `${100 - desk}%` : "–"}</span><span className={s.splitName}>Phone · {fmt.format(t.phone)}</span></p>
                    </div>
                    <div className={s.splitBar} role="img" aria-label={`${t.desktop} desktop and ${t.phone} phone visitors`}>
                      <i style={{ width: `${known ? desk : 0}%` }} />
                    </div>
                  </div>
                );
              })()}
            </section>

            <div className={s.grid}>
              <section className={`${s.panel} ${s.chartPanel}`} aria-label="Daily chart">
                <div className={s.panelHead}>
                  <h2 className={s.panelTitle}>Per day</h2>
                  <div className={s.legend}><span><i style={{ background: "#d7ff4a" }} />Visitors</span><span><i style={{ background: "#2f3233" }} />Page views</span><span><i style={{ background: "#7ee787", borderRadius: "50%" }} />Quote request</span></div>
                </div>
                <Chart rows={rows} className={s.chart} />
              </section>

              <section className={s.panel} aria-label="Quote requests summary">
                <div className={s.panelHead}>
                  <h2 className={s.panelTitle}>Quote requests for this period</h2>
                  <a className={s.panelMeta} href={`/api/admin/export?${q}`}>Export visits CSV</a>
                </div>
                <div className={s.billing}>
                  <div className={s.billRow}><span className={s.muted}>Requests</span><span>{fmt.format(qs.count)}</span></div>
                  <div className={s.billRow}><span className={s.muted}>Turned into orders</span><span>{fmt.format(qs.ordered)}{qs.count ? <span className={s.dim}> · {Math.round((qs.ordered / qs.count) * 100)}%</span> : null}</span></div>
                  <div className={s.billRow}><span className={s.muted}>Average request</span><span>${Math.round(qs.average)}</span></div>
                  {offers.map((o) => (
                    <div key={o.id} className={s.billRow}><span className={s.muted}>{o.title}</span><span>{fmt.format(qs.items[o.id] ?? 0)} <span className={s.dim}>of {fmt.format(qs.count)}</span></span></div>
                  ))}
                  <div className={s.billRow}><span className={s.muted}>Total requested</span><span className={s.billAmount}>${fmt.format(qs.value)}</span></div>
                </div>
              </section>
            </div>

            <div className={s.grid}>
              <section className={s.panel} aria-label="Quote requests">
                <div className={s.panelHead}><h2 className={s.panelTitle}>Quote requests</h2><span className={s.panelMeta}>{quotes.length} in range</span></div>
                {quotes.length === 0 ? (
                  <div className={s.empty}><strong>No quote requests in this period</strong>Submissions from the site's form land here with the items picked and the total.</div>
                ) : (
                  <table className={s.table}>
                    <thead><tr><th>When</th><th>Name</th><th>Business</th><th>Email</th><th>Items</th><th className={s.num}>Total</th></tr></thead>
                    <tbody>
                      {quotes.map((r) => (
                        <tr key={r.id}>
                          <td className={s.muted}>{when(r.at)}</td>
                          <td>{r.name}</td>
                          <td>{r.business}{r.notes && <div className={s.dim}>{r.notes}</div>}</td>
                          <td><a href={`mailto:${r.email}`}>{r.email}</a></td>
                          <td>{r.items.map(offerTitle).join(" + ")}</td>
                          <td className={s.num}>${r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section className={s.panel} aria-label="Referrers">
                <div className={s.panelHead}><h2 className={s.panelTitle}>Where visitors came from</h2></div>
                {refs.length === 0 ? (
                  <div className={s.empty}><strong>No visits yet</strong>Referrers appear once the site has traffic.</div>
                ) : (
                  <ul className={s.refList}>
                    {refs.map((r) => (
                      <li key={r.referrer}><span title={r.referrer}>{r.referrer}</span><span>{fmt.format(r.visitors)}</span></li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        ) : tab === "account" ? (
          <>
            <div className={s.head}>
              <div>
                <h1 className={s.h1}>Account</h1>
                <p className={s.sub}>Signed in as {me.email}. Everyone listed below can do everything in this dashboard.</p>
              </div>
            </div>

            {error && <p className={s.error}>{error}</p>}
            {ok && <p className={s.notice}>{ok}</p>}

            <div className={s.grid}>
              <section className={s.panel} aria-label="Your details">
                <div className={s.panelHead}><h2 className={s.panelTitle}>Your details</h2></div>
                <form className={s.orderForm} method="post" action="/api/admin/account">
                  <input type="hidden" name="action" value="profile" />
                  <label className={`${s.field} ${s.wide}`}>Email · what you sign in with<input type="email" name="email" defaultValue={me.email} required autoComplete="username" /></label>
                  <label className={`${s.field} ${s.wide}`}>Name (optional)<input name="name" defaultValue={me.name} maxLength={120} /></label>
                  <div className={s.wide}><button className={s.btn} type="submit">Save details</button></div>
                </form>
              </section>

              <section className={s.panel} aria-label="Change password">
                <div className={s.panelHead}><h2 className={s.panelTitle}>Change password</h2><span className={s.panelMeta}>at least {PASSWORD_MIN} characters</span></div>
                <form className={s.orderForm} method="post" action="/api/admin/account">
                  <input type="hidden" name="action" value="password" />
                  <label className={`${s.field} ${s.wide}`}>Current password<input type="password" name="current" required autoComplete="current-password" /></label>
                  <label className={`${s.field} ${s.wide}`}>New password<input type="password" name="password" required minLength={PASSWORD_MIN} autoComplete="new-password" /></label>
                  <label className={`${s.field} ${s.wide}`}>New password again<input type="password" name="confirm" required minLength={PASSWORD_MIN} autoComplete="new-password" /></label>
                  <div className={s.wide}><button className={`${s.btn} ${s.btnPrimary}`} type="submit">Change password</button></div>
                </form>
              </section>
            </div>

            <div className={s.grid}>
              <section className={s.panel} aria-label="Admins">
                <div className={s.panelHead}><h2 className={s.panelTitle}>Who can sign in</h2><span className={s.panelMeta}>{admins.length} {admins.length === 1 ? "account" : "accounts"}</span></div>
                <table className={s.table}>
                  <thead><tr><th>Email</th><th>Name</th><th>Added</th><th>Last sign-in</th><th></th></tr></thead>
                  <tbody>
                    {admins.map((a) => (
                      <tr key={a.id}>
                        <td>{a.email}{a.id === me.id && <span className={s.dim}> · you</span>}</td>
                        <td>{a.name || <span className={s.dim}>—</span>}</td>
                        <td className={s.muted}>{when(a.created_at)}</td>
                        <td className={s.muted}>{a.last_login_at ? when(a.last_login_at) : "never"}</td>
                        <td className={s.rowActions}>
                          {a.id !== me.id && admins.length > 1 && (
                            <form method="post" action="/api/admin/admins" className={s.inlineForm}>
                              <input type="hidden" name="action" value="remove" />
                              <input type="hidden" name="id" value={a.id} />
                              <button className={`${s.btn} ${s.btnSmall}`} type="submit">Remove</button>
                            </form>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className={s.panel} aria-label="Add an admin">
                <div className={s.panelHead}><h2 className={s.panelTitle}>Add an admin</h2></div>
                <form className={s.orderForm} method="post" action="/api/admin/admins" autoComplete="off">
                  <input type="hidden" name="action" value="add" />
                  <label className={`${s.field} ${s.wide}`}>Email<input type="email" name="email" required autoComplete="off" /></label>
                  <label className={`${s.field} ${s.wide}`}>Name (optional)<input name="name" maxLength={120} autoComplete="off" /></label>
                  <label className={`${s.field} ${s.wide}`}>First password · hand it over, they change it after signing in<input type="password" name="password" required minLength={PASSWORD_MIN} autoComplete="new-password" /></label>
                  <div className={s.wide}><button className={`${s.btn} ${s.btnPrimary}`} type="submit">Add admin</button></div>
                </form>
              </section>
            </div>
          </>
        ) : tab === "articles" ? (
          <>
            <div className={s.head}>
              <div>
                <h1 className={s.h1}>Articles</h1>
                <p className={s.sub}>Write it here, add a cover, publish when ready. Published articles appear at <a href="/articles">/articles</a>; drafts are visible only while you are signed in.</p>
              </div>
              <a className={`${s.btn} ${s.btnPrimary}`} href="/admin/articles/new">New article</a>
            </div>

            {deleted && <p className={s.notice}>Article deleted.</p>}

            <section className={s.panel} aria-label="All articles">
              <div className={s.panelHead}><h2 className={s.panelTitle}>All articles</h2><span className={s.panelMeta}>{articles.filter((a) => a.status === "published").length} published · {articles.filter((a) => a.status === "draft").length} drafts</span></div>
              {articles.length === 0 ? (
                <div className={s.empty}><strong>No articles yet</strong>Start with "New article" above. A draft is saved before it is published, so nothing goes live by accident.</div>
              ) : (
                <table className={s.table}>
                  <thead><tr><th>Title</th><th>Status</th><th>Updated</th><th>Published</th><th className={s.num}>Views</th><th className={s.num}>Readers</th><th></th></tr></thead>
                  <tbody>
                    {articles.map((a) => {
                      const v = views.get(a.slug) as { views: number; visitors: number } | undefined;
                      return (
                        <tr key={a.id}>
                          <td><a className={s.rowTitle} href={`/admin/articles/${a.id}`}>{a.title}</a><div className={s.dim}>/articles/{a.slug}</div></td>
                          <td><span className={s.status} data-s={a.status === "published" ? "done" : "awaiting"}>{a.status}</span></td>
                          <td className={s.muted}>{when(a.updated_at)}</td>
                          <td className={s.muted}>{a.published_at ? when(a.published_at) : "—"}</td>
                          <td className={s.num}>{fmt.format(v?.views ?? 0)}</td>
                          <td className={s.num}>{fmt.format(v?.visitors ?? 0)}</td>
                          <td className={s.rowActions}><a href={`/admin/articles/${a.id}`}>Edit</a><a href={`/articles/${a.slug}`} target="_blank" rel="noreferrer">View</a></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          </>
        ) : (
          <>
            <div className={s.head}>
              <div>
                <h1 className={s.h1}>Orders & uploads</h1>
                <p className={s.sub}>After a customer pays, create their order here, from their quote request or by hand, and send them the unique link; their logo and product files arrive below.</p>
              </div>
            </div>

            {error && <p className={s.error}>{error}</p>}
            {created && orders.find((o) => String(o.id) === created) && (() => {
              const o = orders.find((x) => String(x.id) === created)!;
              const url = `${origin}/upload/${o.token}`;
              return (
                <div className={s.created}>
                  <p><strong>Order for {o.business} created.</strong> Send this link to {o.name}{o.email ? ` (${o.email})` : ""}:</p>
                  <p className={s.link}>{url}</p>
                  <CopyLink url={url} className={`${s.btn} ${s.btnSmall}`} />
                </div>
              );
            })()}

            <section className={`${s.panel} ${s.stack}`} aria-label="Quote requests">
              <div className={s.panelHead}><h2 className={s.panelTitle}>Quote requests</h2><span className={s.panelMeta}>latest {openQuotes.length}</span></div>
              {openQuotes.length === 0 ? (
                <div className={s.empty}><strong>No quote requests yet</strong>Requests from the site's quote form appear here, ready to turn into an order once the customer pays.</div>
              ) : (
                <table className={s.table}>
                  <thead><tr><th>When</th><th>Business</th><th>Contact</th><th>Items</th><th className={s.num}>Total</th><th>Order</th></tr></thead>
                  <tbody>
                    {openQuotes.map((r) => (
                      <tr key={r.id} data-picked={fromQuote?.id === r.id || undefined}>
                        <td className={s.muted}>{when(r.at)}</td>
                        <td>{r.business}{r.notes && <div className={s.dim}>{r.notes}</div>}</td>
                        <td>{r.name}{r.email && <div className={s.dim}><a href={`mailto:${r.email}`}>{r.email}</a></div>}</td>
                        <td>{r.items.map(offerTitle).join(" + ")}</td>
                        <td className={s.num}>${r.total}</td>
                        <td>
                          {r.order_id ? (
                            <span className={s.status} data-s="done">order #{r.order_id}</span>
                          ) : (
                            <a className={`${s.btn} ${s.btnSmall}`} href={`/admin?tab=orders&quote=${r.id}#new-order`}>Create order</a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <div className={s.grid}>
              <section className={s.panel} aria-label="Orders">
                <div className={s.panelHead}><h2 className={s.panelTitle}>Orders</h2><span className={s.panelMeta}>{orders.length} total</span></div>
                {orders.length === 0 ? (
                  <div className={s.empty}><strong>No orders yet</strong>Create the first one on the right once a customer has paid.</div>
                ) : (
                  <table className={s.table}>
                    <thead><tr><th>Created</th><th>Business</th><th>Contact</th><th>Items</th><th>Status</th><th>Upload link</th><th>Files</th></tr></thead>
                    <tbody>
                      {orders.map((o) => {
                        const url = `${origin}/upload/${o.token}`;
                        const files = uploads.get(o.id) ?? [];
                        return (
                          <tr key={o.id}>
                            <td className={s.muted}>{when(o.created_at)}</td>
                            <td>{o.business}{o.quote_id && <div className={s.dim}>from quote #{o.quote_id}</div>}{o.note && <div className={s.dim}>{o.note}</div>}</td>
                            <td>{o.name}{o.email && <div className={s.dim}><a href={`mailto:${o.email}`}>{o.email}</a></div>}</td>
                            <td>{o.items.map(offerTitle).join(" + ")}</td>
                            <td>
                              <form className={s.inlineForm} method="post" action="/api/admin/orders/status">
                                <input type="hidden" name="id" value={o.id} />
                                <span className={s.status} data-s={o.status}>{o.status}</span>
                                <select name="status" defaultValue={o.status} aria-label="Change status">
                                  <option value="awaiting">awaiting</option>
                                  <option value="received">received</option>
                                  <option value="done">done</option>
                                </select>
                                <button className={`${s.btn} ${s.btnSmall}`} type="submit">Set</button>
                              </form>
                            </td>
                            <td><CopyLink url={url} className={`${s.btn} ${s.btnSmall}`} /></td>
                            <td>
                              {files.length === 0 ? <span className={s.dim}>none yet</span> : (
                                <ul className={s.files}>
                                  {files.map((f) => (
                                    <li key={f.id}><a href={`/api/admin/files/${f.id}`}>{f.filename}</a> <span className={s.dim}>· {f.kind} · {(f.size / 1024 / 1024).toFixed(1)} MB</span>{f.note && <div className={s.dim}>{f.note}</div>}</li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </section>

              <section className={s.panel} id="new-order" aria-label="New order">
                <div className={s.panelHead}>
                  <h2 className={s.panelTitle}>{fromQuote ? `New order from quote #${fromQuote.id}` : "New order"}</h2>
                  {fromQuote && <a className={s.panelMeta} href="/admin?tab=orders#new-order">Start blank</a>}
                </div>
                {/* keyed on the quote so picking another one resets the fields to its values */}
                <form key={fromQuote?.id ?? "blank"} className={s.orderForm} method="post" action="/api/admin/orders">
                  {fromQuote && <input type="hidden" name="quote_id" value={fromQuote.id} />}
                  <label className={`${s.field} ${s.wide}`}>Business<input name="business" required placeholder="Schaller Bros Liquor" defaultValue={fromQuote?.business} /></label>
                  <label className={s.field}>Contact name<input name="name" required defaultValue={fromQuote?.name} /></label>
                  <label className={`${s.field} ${s.wide}`}>Email<input name="email" type="email" defaultValue={fromQuote?.email} /></label>
                  <div className={`${s.field} ${s.wide}`}>
                    Paid for
                    <div className={s.checks}>
                      {offers.map((o) => (
                        <label key={o.id}><input type="checkbox" name="items" value={o.id} defaultChecked={fromQuote ? fromQuote.items.includes(o.id) : o.id !== "tripod"} />{o.title}</label>
                      ))}
                    </div>
                  </div>
                  <label className={`${s.field} ${s.wide}`}>Internal note (optional)<textarea name="note" rows={2} defaultValue={fromQuote?.notes ? `From the quote: ${fromQuote.notes}` : undefined} /></label>
                  <div className={s.wide}><button className={`${s.btn} ${s.btnPrimary}`} type="submit">Create order & link</button></div>
                </form>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

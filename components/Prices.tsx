"use client";

import { useMemo, useState, type FormEvent } from "react";
import { offers, type OfferId } from "@/lib/content";
import s from "./sections.module.css";

type Status = "idle" | "sending" | "sent" | "error";

export default function Prices() {
  const [picked, setPicked] = useState<Record<OfferId, boolean>>({ fan: true, content: true, tripod: false });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const total = useMemo(() => offers.reduce((sum, o) => sum + (picked[o.id] ? o.price : 0), 0), [picked]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const business = String(data.get("business") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const notes = String(data.get("notes") ?? "").trim();
    const next: Record<string, string> = {};
    if (!name) next.name = "Tell us who to write back to.";
    if (!business) next.business = "The shop, bar or booth the fan is for.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "That email doesn't look complete.";
    if (!Object.values(picked).some(Boolean)) next.items = "Pick at least one item.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, business, email, notes, items: offers.filter((o) => picked[o.id]).map((o) => o.id), total }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={s.section} id="prices" aria-labelledby="prices-title">
      <div className={s.container}>
        <div className={s.head}>
          <h2 className={s.title} id="prices-title">Three prices. Nothing sold separately.</h2>
          <p className={s.lede}>The fan comes with its cover. The content is made for your business. The tripod is there when there is no wall.</p>
        </div>
        <div className={s.prices}>
          <ul className={s.offerList} aria-label="Offers">
            {offers.map((o) => (
              <li key={o.id} className={s.offerRow}>
                <img className={s.offerThumb} src={o.still} alt="" width={96} height={96} loading="lazy" />
                <div>
                  <h3>{o.title}</h3>
                  <p className={s.offerShort}>{o.short}</p>
                  <p className={s.offerBody}>{o.body}</p>
                </div>
                <div className={s.offerPriceCol}>
                  <span className={s.offerPrice}>${o.price}</span>
                  <span className={s.offerPriceNote}>{o.priceNote}</span>
                </div>
              </li>
            ))}
          </ul>

          <form className={s.quote} id="quote" onSubmit={submit} noValidate aria-labelledby="quote-title">
            <h3 id="quote-title">Request a quote</h3>
            <p className={s.quoteLede}>Pick what you need. We confirm, then you pay; no card today.</p>
            {status === "sent" ? (
              <div className={s.sent} role="status">
                <h4>Got it. We'll reply by email.</h4>
                <p>Your request is in: {offers.filter((o) => picked[o.id]).map((o) => o.title).join(" + ")} for ${total}. Expect a note back within a working day.</p>
              </div>
            ) : (
              <>
                <div className={s.picks} role="group" aria-label="Items">
                  {offers.map((o) => (
                    <label key={o.id} className={s.pick}>
                      <input
                        type="checkbox"
                        name="items"
                        value={o.id}
                        checked={picked[o.id]}
                        onChange={(e) => setPicked((p) => ({ ...p, [o.id]: e.target.checked }))}
                      />
                      <span className={s.pickLabel}>{o.title}</span>
                      <span className={s.pickPrice}>${o.price}</span>
                    </label>
                  ))}
                  {errors.items && <span className={s.fieldError}>{errors.items}</span>}
                </div>
                <div className={s.total}>
                  <span className={s.totalLabel}>Total</span>
                  <span className={s.totalValue}>${total}</span>
                </div>
                <div className={s.fields}>
                  <label className={s.field} data-invalid={errors.name || undefined}>
                    <span>Your name</span>
                    <input name="name" autoComplete="name" placeholder="Dana Schaller" />
                    {errors.name && <span className={s.fieldError}>{errors.name}</span>}
                  </label>
                  <label className={s.field} data-invalid={errors.business || undefined}>
                    <span>Business</span>
                    <input name="business" autoComplete="organization" placeholder="Schaller Bros Liquor" />
                    {errors.business && <span className={s.fieldError}>{errors.business}</span>}
                  </label>
                  <label className={s.field} data-invalid={errors.email || undefined}>
                    <span>Email</span>
                    <input name="email" type="email" autoComplete="email" placeholder="you@yourshop.com" />
                    {errors.email && <span className={s.fieldError}>{errors.email}</span>}
                  </label>
                  <label className={s.field}>
                    <span>Anything we should know (optional)</span>
                    <textarea name="notes" rows={2} placeholder="Where it will sit, what you'd like it to show" />
                  </label>
                </div>
                <button className={s.submit} type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : `Request a quote · $${total}`}
                </button>
                {status === "error" && <p className={s.fieldError} role="alert">Couldn't send just now. Try again in a moment.</p>}
                <p className={s.fine}>No account, no card. We reply by email.</p>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

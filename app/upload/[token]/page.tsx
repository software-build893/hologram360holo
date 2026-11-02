import { orderByToken, uploadsForOrder } from "@/lib/db";
import { offers } from "@/lib/content";
import UploadForm from "@/components/portal/UploadForm";
import s from "../portal.module.css";

export const metadata = { title: "Send your logo and product — 3D Hologram Ads", robots: { index: false, follow: false } };

const offerTitle = (id: string) => offers.find((o) => o.id === id)?.title ?? id;

export default async function Portal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await orderByToken(token);

  if (!order) {
    return (
      <main className={s.page}>
        <div className={s.wrap}>
          <a className={s.brand} href="/"><span>3D</span> HOLOGRAM ADS</a>
          <h1 className={s.h1}>This link isn't valid.</h1>
          <p className={s.lede}>Check the link in the message we sent you, or reply to that message and we'll send a fresh one.</p>
        </div>
      </main>
    );
  }

  const previous = await uploadsForOrder(order.id);
  const done = order.status === "done";

  return (
    <main className={s.page}>
      <div className={s.wrap}>
        <a className={s.brand} href="/"><span>3D</span> HOLOGRAM ADS</a>
        <h1 className={s.h1}>{done ? "Your content is finished." : "Send us your logo and product."}</h1>
        <p className={s.lede}>
          {done
            ? "This order is complete. If you need to send anything else, reply to our email and we'll reopen it."
            : `Hi ${order.name.split(" ")[0]}. Your ${order.items.map(offerTitle).join(" + ")} order for ${order.business} is paid. Upload the files below and we'll model your hologram from them.`}
        </p>

        <div className={s.order}>
          <div><span>Business</span> {order.business}</div>
          <div><span>Order</span> {order.items.map(offerTitle).join(" + ")}</div>
          <div><span>Status</span> {order.status === "awaiting" ? "waiting for your files" : order.status === "received" ? "files received" : "done"}</div>
        </div>

        {!done && (
          <ol className={s.steps}>
            <li className={s.step}><span className={s.stepNo}>1</span><div><h2>Your logo as a vector if you have one</h2><p>SVG, AI, EPS or PDF from your designer. If not, the largest PNG you have on a plain background.</p></div></li>
            <li className={s.step}><span className={s.stepNo}>2</span><div><h2>Product photos or a short clip</h2><p>Front, side and a close-up, in good light. A phone is fine. Only if your content shows a product.</p></div></li>
            <li className={s.step}><span className={s.stepNo}>3</span><div><h2>Tell us what matters</h2><p>Colours to keep, a slogan, what you'd like it to do. We send a preview before the final loop.</p></div></li>
          </ol>
        )}

        {previous.length > 0 && (
          <p className={s.received}><strong>Already received:</strong> {previous.map((u) => u.filename).join(", ")}</p>
        )}

        {!done && <UploadForm token={token} />}

        <p className={s.fine}>Files go straight to our content team and nowhere else. This link is private to your order; don't share it.</p>
      </div>
    </main>
  );
}

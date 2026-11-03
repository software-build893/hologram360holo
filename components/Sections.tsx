import { closeUps, hardwareParts, holoReel, inTheBox, wildFootage } from "@/lib/content";
import InViewVideo from "./InViewVideo";
import Reveal from "./Reveal";
import s from "./sections.module.css";

function StepIcon({ kind }: { kind: "sweep" | "eye" | "float" }) {
  const common = { viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (kind === "sweep")
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="18" strokeDasharray="4 5" />
        <path d="M24 24 36 12" />
        <path d="M24 24 12 36" />
        <path d="M24 24 L34 32" opacity="0.45" />
      </svg>
    );
  if (kind === "eye")
    return (
      <svg {...common}>
        <path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z" />
        <circle cx="24" cy="24" r="6" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M10 34c6-5 22-5 28 0" />
      <path d="M14 14l6 8 4-6 4 6 6-8" />
      <path d="M24 22v6" opacity="0.5" />
    </svg>
  );
}

export function HowItWorks() {
  return (
    <section className={s.section} id="how" aria-labelledby="how-title">
      <div className={s.container}>
        <div className={s.head}>
          <h2 className={s.title} id="how-title">Two blades, 224 LEDs, and your eye does the rest.</h2>
          <p className={s.lede}>
            There is no screen. A thin bar of LEDs spins at about 700 revolutions a minute and changes colour thousands of
            times per turn. Your eye holds each flash just long enough for the next one to land, and a solid picture appears in mid-air.
          </p>
        </div>
        <div className={s.how}>
          <div className={s.howMedia}>
            <InViewVideo src="/media/wild/bar.mp4" poster="/media/stills/bar.jpg" />
            <span className={s.howCaption}>Back bar, phone footage, no edit</span>
          </div>
          <ol className={s.steps}>
            <li className={s.step}>
              <span className={s.stepIcon}><StepIcon kind="sweep" /></span>
              <div>
                <h3>Each blade paints one slice as it passes</h3>
                <p>The LEDs along the bar light up to match the pixels under them. One turn of the rotor draws the whole 1024 × 800 frame.</p>
              </div>
            </li>
            <li className={s.step}>
              <span className={s.stepIcon}><StepIcon kind="eye" /></span>
              <div>
                <h3>Your eye holds the light</h3>
                <p>At 700 rpm the trails overlap faster than vision can separate them, so the sweep reads as a still, bright image.</p>
              </div>
            </li>
            <li className={s.step}>
              <span className={s.stepIcon}><StepIcon kind="float" /></span>
              <div>
                <h3>The picture floats</h3>
                <p>The bar is thin and the background is black, so there is nothing for the eye to anchor the picture to. It looks like it hangs in the air.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Wild() {
  return (
    <section className={s.section} id="wild" aria-labelledby="wild-title">
      <div className={s.container}>
        <div className={s.head}>
          <h2 className={s.title} id="wild-title">In the wild</h2>
          <p className={s.lede}>Eight fans, eight kinds of shop, shot on a phone where they run. The light is the room's own.</p>
        </div>
        <Reveal as="ul" className={`${s.wildGrid} ${s.reveal}`} label="Field footage">
          {wildFootage.map((f, i) => (
            <li key={f.id} className={s.wildItem} style={{ ["--i" as string]: i }}>
              <InViewVideo src={f.src} poster={f.still} />
              <div className={s.wildLabel}>
                <span className={s.wildPlace}>{f.place}</span>
                <span className={s.wildWhere}>{f.where}</span>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function Reel() {
  return (
    <section className={s.section} id="content" aria-labelledby="reel-title">
      <div className={s.container}>
        <div className={s.head}>
          <h2 className={s.title} id="reel-title">Content made for the fan, not borrowed from a screen.</h2>
          <p className={s.lede}>
            A flat logo on a black square looks like a sticker. We model it, light it and give it motion that reads from across the room,
            on a loop of six to ten seconds. These are real client pieces.
          </p>
        </div>
        <Reveal as="ul" className={`${s.reel} ${s.reveal}`} label="Hologram content reel">
          {holoReel.map((c, i) => (
            <li key={c.id} className={s.reelItem} style={{ ["--i" as string]: i }}>
              <div className={s.reelDisc}>
                <InViewVideo src={c.src} poster={c.still} />
              </div>
              <span className={s.reelTitle}>{c.title}</span>
              <span className={s.reelNote}>{c.note}</span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function Kit() {
  return (
    <section className={s.section} id="kit" aria-labelledby="kit-title">
      <div className={s.container}>
        <div className={s.head}>
          <h2 className={s.title} id="kit-title">The kit</h2>
          <p className={s.lede}>PD42: a 42 cm two-blade holographic fan with a clear acrylic cover, Wi‑Fi and app control, and an infrared remote. It screws to a wall or sits on the tripod.</p>
        </div>
        <div className={s.kit}>
          <figure className={s.kitImage}>
            <img src="/media/product/fan-and-cover.jpg" alt="The PD42 fan on its base with the two-blade LED bar, next to its clear acrylic cover" width={1800} height={1344} loading="lazy" />
          </figure>
          <ul className={s.parts} aria-label="Parts">
            {hardwareParts.map((p) => (
              <li key={p.id} className={s.part}>
                <h3>{p.name}</h3>
                <p>{p.note}</p>
              </li>
            ))}
          </ul>
        </div>
        <ul className={s.closeups} aria-label="Close-ups">
          {closeUps.map((c) => (
            <li key={c.id} className={s.closeup}>
              <img src={`/assets/kit/${c.id}.jpg`} alt={`${c.label}: ${c.note}`} width={1200} height={1200} loading="lazy" />
              <span className={s.closeupLabel}>{c.label}</span>
              <span className={s.closeupNote}>{c.note}</span>
            </li>
          ))}
        </ul>
        <div className={s.box}>
          <p className={s.boxTitle}>In the box</p>
          {inTheBox.map((item) => (
            <span key={item} className={s.boxItem}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`${s.container} ${s.footerRow}`}>
        <span>3D Hologram Ads · Holographic LED fans and custom 3D content</span>
        <nav className={s.footerNav} aria-label="Footer">
          <a href="/#how">How it works</a>
          <a href="/#wild">In the wild</a>
          <a href="/#kit">The kit</a>
          <a href="/#prices">Prices</a>
          <a href="/articles">Articles</a>
          <a href="/#quote">Get a quote</a>
        </nav>
      </div>
    </footer>
  );
}

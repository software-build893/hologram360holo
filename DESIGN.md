---
name: 3D Hologram Ads (althologram)
description: Premium-hardware product page on near-black with one cyan voice, a live-rendered fan, and real footage.
colors:
  ground: "#0a0a0a"
  ground-raised: "#141414"
  hairline: "#262626"
  hairline-soft: "#3f4042"
  ink: "#f4f5f5"
  ink-mute: "#9a9c9f"
  ink-dim: "#6b6d6e"
  cyan: "#d7ff4a"
  cyan-lift: "#e4ff7a"
  cyan-ink: "#061314"
  media-black: "#000000"
  cutout-ground: "#111111"
  error-stroke: "#ff6b6b"
  error-text: "#ff8a8a"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "calc(44 * var(--u))"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(32px, 4.4vw, 56px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(19px, 1.6vw, 22px)"
    fontWeight: 600
    letterSpacing: "-0.015em"
  lede:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(17px, 1.45vw, 20px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  figure:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(24px, 2.2vw, 30px)"
    fontWeight: 700
    letterSpacing: "-0.02em"
    fontVariation: "tabular-nums"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  focus: "4px"
  check: "6px"
  input: "10px"
  pick: "12px"
  thumb: "14px"
  tile: "16px"
  panel: "20px"
  pill: "999px"
  disc: "50%"
spacing:
  hair: "2px"
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "22px"
  panel: "26px"
  head: "clamp(32px, 4vw, 56px)"
  gutter: "clamp(32px, 5vw, 80px)"
  section: "clamp(72px, 9vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.cyan-ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    width: "162px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.cyan-lift}"
    textColor: "{colors.cyan-ink}"
    rounded: "{rounded.pill}"
  button-nav:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.cyan-ink}"
    rounded: "{rounded.pill}"
    height: "42px"
    width: "124px"
  button-submit:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.cyan-ink}"
    rounded: "{rounded.pill}"
    padding: "14px 18px"
    width: "100%"
  link-arrow:
    textColor: "{colors.ink}"
    height: "24px"
  tab-niche:
    textColor: "{colors.ink-mute}"
    height: "36px"
    padding: "0 2px"
  tab-niche-active:
    textColor: "{colors.ink}"
  chip-box:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  card-quote:
    backgroundColor: "{colors.ground-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  input-text:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "12px 14px"
  pick-row:
    rounded: "{rounded.pick}"
    padding: "12px 14px"
  pick-row-checked:
    backgroundColor: "rgba(215, 255, 74, 0.06)"
    rounded: "{rounded.pick}"
  tile-footage:
    backgroundColor: "{colors.media-black}"
    rounded: "{rounded.tile}"
  caption-pill:
    backgroundColor: "rgba(10, 10, 10, 0.72)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
---

# Design System: 3D Hologram Ads (althologram)

## Overview

**Creative North Star: "The Showroom After Hours"**

A premium-hardware product page in the Apple and Dyson register, played straight. The ground is near-black and matte; the only light on it comes from the product. The fan is not a photograph: it is rendered live in WebGL at life scale, spinning at 700 rpm with a persistence-of-vision disc, an LED streak and a clear cover drawn as reflections only, over a darkened room plate that changes with the niche. Everything else on the page is quiet so that the one glowing thing reads as the argument.

Density is low and the measure is wide. Sections are separated by hairlines, not by surface changes; the page is one continuous near-black sheet with a single raised panel (the quote form). Type is one system sans at two weights, tight-tracked above 19px, with tabular figures wherever a number does work. The accent is a single electric cyan reserved for the action, the active tab, line icons, the wordmark's "3D", and focus. Depth is almost entirely tonal; the single shadow on the page sits under the content-reel discs, and the single gradient is a legibility scrim over phone footage.

Imagery is the proof. Field clips and client reels are real and unretouched; the hero's room plates are generated; the hero's hologram clips are product videos the user supplied (public/media/holo-pin/, each with a .source.txt beside it), and every generated raster ships with its provenance beside it.

**Key Characteristics:**
- Near-black ground with one cyan voice; no secondary accent.
- One system sans (SF Pro on Apple devices, self-hosted Inter elsewhere) at 400/500/600/700.
- A measured hero frame: every box in 1344-wide comp pixels, scaling with the viewport, reflowing to a column under 860px.
- Hairline dividers (1px #262626) do the structural work; borders replace shadows.
- Pill buttons, underlined arrow links, segmented tabs with a cyan progress underline.
- Live three.js fan; real footage in rounded tiles and circular discs; generated plates behind the hero only.
- Motion is slow and eased-out (cubic-bezier(0.16, 1, 0.3, 1)); the niche cycle and, on wide screens, the scroll-driven fan story are the two authored moments.

## Colors

Near-black ground, a three-step grey ink ramp, and one saturated cyan that is also the only hue on the page outside the imagery.

### Primary
- **Hologram Cyan** (`{colors.cyan}`): the primary action (nav pill, hero CTA, form submit), the active tab's progress underline, the specs-strip and how-it-works line icons, the wordmark's "3D", checked checkboxes, input caret, text selection, hover colour on links and tabs, and the focus ring. Never a surface fill at full strength.
- **Hologram Cyan, lifted** (`{colors.cyan-lift}`): hover state of the cyan pill, paired with a 1px rise.
- **Cyan Ink** (`{colors.cyan-ink}`): the near-black text set on cyan surfaces and the checkmark stroke.
- **Cyan at 6% and 8%** (`rgba(215, 255, 74, 0.06)` / `0.08` with a `0.3` border): the only tinted surfaces on the page: a checked offer row and the "sent" confirmation panel.

### Neutral
- **Ground** (`{colors.ground}`): page and hero frame background, input fields, the specs band.
- **Raised Ground** (`{colors.ground-raised}`): the one raised panel, the sticky quote form.
- **Hairline** (`{colors.hairline}`): every divider: section tops, step and offer rows, kit parts, input borders, chip borders, specs-strip verticals.
- **Soft Hairline** (`{colors.hairline-soft}`): unchecked checkbox stroke and the hover border of an offer row.
- **Ink** (`{colors.ink}`): headlines, values, labels, callouts. Translucent variants of this same white carry secondary hero copy: 88% subline, 75% link underline, 72% inactive tabs and footage sub-labels, 22% tab track.
- **Muted Ink** (`{colors.ink-mute}`): ledes, body paragraphs, notes, prices in pick rows, footer.
- **Dim Ink** (`{colors.ink-dim}`): spec labels, placeholders, fine print.
- **Media Black** (`{colors.media-black}`): the backing of every video tile, reel disc and offer thumbnail, so letterboxing disappears into the clip.
- **Cutout Ground** (`{colors.cutout-ground}`): behind the six kit close-up PNGs.
- **Error** (`{colors.error-stroke}` border, `{colors.error-text}` message): the only warm colour; validation only.

### Named Rules
**The One Voice Rule.** Cyan is the only accent. It marks the action, the active state, the icon stroke and focus; it never fills a card, never tints a heading, and never appears at full strength as a surface larger than a button.
**The Grey Ink Rule.** Hierarchy below the headline is carried by three greys (ink, muted, dim) and translucent white, not by size or weight changes alone.

## Typography

**Display Font:** SF Pro Display / SF Pro Text via the system stack (with self-hosted Inter, then Helvetica Neue, Arial)
**Body Font:** same stack
**Label/Mono Font:** none; numbers use `font-variant-numeric: tabular-nums` in the same face

**Character:** One geometric-humanist sans at four weights. Large text is tracked tight (-0.02em to -0.025em) and set at a line-height just over 1; body sits at 1.5. Apple devices get San Francisco from the OS; everyone else gets Inter from `public/fonts` with `font-display: swap`.

### Hierarchy
- **Display** (600, 44 comp px scaling with `--u`; `clamp(32px, 9vw, 42px)` under 860px, 1.06): the hero claim only, bottom-left of the frame.
- **Headline** (600, `clamp(32px, 4.4vw, 56px)`, 1.05, -0.025em, `text-wrap: balance`): one per section, max-width 62rem.
- **Title** (600, `clamp(19px, 1.6vw, 22px)`, -0.015em): step headings, offer titles, the quote panel heading (22px). Smaller titles (17px kit parts, 15px footage and reel titles, 14px close-up labels) keep weight 600 and lose the tracking.
- **Lede** (400, `clamp(17px, 1.45vw, 20px)`, 1.5, muted ink, max 44rem, `text-wrap: pretty`): the paragraph under each headline.
- **Body** (400, 16px, 1.5, muted ink, max 34–40rem): step and offer copy.
- **Figure** (700, `clamp(24px, 2.2vw, 30px)`; 28px form total; 17 comp px spec values; -0.02em, tabular): prices and specs. Bold is reserved for numbers.
- **Label** (400, 13px; 11 comp px spec labels; 12px on phones): captions, field labels, notes, fine print, in muted or dim ink.
- **UI** (500, 14–15px, -0.01em): nav links, the arrow link, pick labels; 600 for pill buttons; the wordmark is 500 at +0.02em.

### Named Rules
**The Bold-Is-Numeric Rule.** Weight 700 appears only on figures (prices, specs, totals), always with tabular numerals. Headings stop at 600.
**The No-Eyebrow Rule.** Sections open with the headline itself. There are no kickers, eyebrows, or uppercase micro-labels above headings; the only uppercase text is the wordmark.

## Layout

Two spatial models share the page.

**The measured hero frame.** The hero is a fixed-composition frame with `aspect-ratio: 1344 / 752` and a unit `--u: calc(100vw / 1344)`; every box inside it (nav links, wordmark, fan canvas, headline, CTAs, callouts, tabs) is positioned and sized in comp pixels multiplied by `--u`, so the composition scales as one picture. The fan canvas is a 745-unit square centred on (672, 300) so the blade tips land 240 units from the hub; the room plate occupies 573 units of height from the top and the specs band takes the bottom 22.21%. Under 860px, `--u` becomes `1px`, the aspect ratio releases, and the frame becomes a flex column in reading order: nav, fan (`min(92vw, 440px)`), claim, actions, scrolling tabs, then the specs as a two-column grid. Callouts and the desktop nav links are dropped there; the wordmark and cyan pill stay.

**The flowing sections.** Below the hero every section uses a `min(100% - 48px, 1280px)` container (32px margins under 640px), vertical padding `clamp(72px, 9vw, 128px)`, and a 1px hairline between adjacent sections. Section heads are capped at 62rem with `clamp(32px, 4vw, 56px)` below them. Two-column sections (how, kit, prices) use asymmetric grids (`1fr / 1.1fr`, `1.3fr / 1fr`) with `clamp(32px, 5vw, 72–80px)` gutters and collapse to one column at 1024px; the quote form is sticky at `top: 24px` only while two columns exist. Footage and reel grids are four across, two at 1024px and below; close-ups go 6 → 3 → 2.

Spacing inside components is a small even scale (2, 6, 8, 10, 12, 14, 16, 18, 20, 22, 26px) rather than a strict modular ramp; list rows breathe at 18–22px vertical padding.

## Elevation & Depth

Flat by default. Depth is tonal and linear: the page is one `#0a0a0a` sheet, the quote form is the only raised surface (`#141414` with a hairline border), and everything else is separated by 1px `#262626` lines. Media sits in black wells with rounded corners so the clips themselves supply the light. There are no glows and no glass outside the rendered hologram, whose cover, streak and disc are additive light in the WebGL canvas rather than CSS effects.

### Shadow Vocabulary
- **Disc drop** (`box-shadow: 0 24px 48px -24px rgba(0, 0, 0, 0.8)`): under the eight circular reel discs only, to lift the hologram clips off the ground.

### Named Rules
**The Hairline Rule.** Structure is drawn with 1px `#262626` lines, not with surface changes or shadows. A new surface tone is justified only for an interactive panel (the quote form) or a media well.
**The One Gradient Rule.** The only CSS gradient on the page is the footage-tile scrim (`linear-gradient(to top, rgba(0,0,0,0.75), transparent)`) and it exists for label legibility over phone footage. Gradients are never decorative.

## Shapes

Soft geometry in three families. Full pills (999px) for actions, chips and the caption badge; rounded rectangles stepping 10 → 12 → 14 → 16 → 20px as the element grows (inputs, pick rows, thumbnails and close-ups, footage tiles, panels and large media); and true circles for the reel discs and callout dots. Borders are always 1px hairline (1.5px on the checkbox). Icons are 1.6-stroke line SVGs with round caps and joins on a 24 (specs) or 48 (steps) grid, coloured cyan. The clear cover in the render has no body; it is drawn as rim light, a glint and a drifting sheen so the room shows through untouched.

## Components

### Buttons
Confident and quiet: one solid cyan pill, dark text, a 1px lift on hover.
- **Shape:** full pill (999px).
- **Primary:** cyan on cyan-ink, weight 600; hero CTA 162 × 44 comp units at 15px, nav pill 124 × 42 at 14px, form submit full-width with 14px 18px padding at 16px.
- **Hover / Focus:** `translateY(-1px)` with background to `#e4ff7a` over 300ms/200ms ease-out; focus is the global 2px cyan outline offset 3px with a 4px radius. Submit while sending: opacity 0.6, no lift, `cursor: progress`.
- **Secondary (text link):** 14–15px weight 500 in ink, text underlined by a 1px 75%-white border 3px below the baseline, followed by a 16px 1.6-stroke arrow SVG with an 8px gap; whole link turns cyan on hover, underline included.

### Tabs (niche switcher)
- **Style:** text-only buttons 36px tall, 15px weight 400, 72% white, 22px apart; a 2px track in 22% white under each.
- **State:** active tab is full ink with a 2px cyan underline; while auto-cycling the underline fills left-to-right over exactly 5000ms linear (`@keyframes fill`), restarting on each change. Hover turns the label cyan. Arrow keys move between tabs; pointer over the hero pauses the cycle.

### Chips
- **Style:** "In the box" items: hairline-bordered pills, 8px 14px padding, 14px ink text, no fill, no state.

### Cards / Containers
- **Quote panel:** 20px radius, raised ground, 1px hairline, 26px padding (20px on phones), sticky at 24px above 1024px.
- **Media wells:** footage tiles 16px radius on black, 3:4; how-it-works and kit figures 20px radius; reel discs 50%; offer thumbs 96px square at 14px (72px on phones); close-ups 14px on `#111`.
- **Caption pill:** 72% ground over a video, 13px ink, 8px 12px padding, pinned 20px/18px from the corner.
- **List rows:** steps, kit parts and offers are hairline-divided rows (top border each, bottom on the last), 18–22px padding, no card chrome.

### Inputs / Fields
- **Style:** ground-coloured field, 1px hairline, 10px radius, 12px 14px padding, 15px text, dim placeholder, cyan caret; 13px muted label above with a 6px gap.
- **Focus:** border to cyan, outline suppressed.
- **Error:** border `#ff6b6b` via `data-invalid`, 13px `#ff8a8a` message beneath.
- **Checkbox (offer pick):** custom 20px box, 1.5px soft-hairline stroke, 6px radius; checked fills cyan with a cyan-ink stroke tick scaling in over 150ms. Its row (12px radius, hairline) goes soft-hairline on hover and cyan-bordered with a 6% cyan wash when checked.

### Navigation
- **Style:** absolutely placed inside the hero frame: wordmark left ("3D" in cyan, 21 comp px, weight 500, +0.02em, uppercase), four 15px weight-500 links at fixed comp offsets, a cyan "Get a quote" pill right. Links turn cyan on hover; no underline, no active state (single page).
- **Mobile (≤860px):** the link row is hidden; wordmark (17px) and pill (38px tall) remain in a space-between row with 18px 20px 0 padding. There is no burger menu; the footer repeats all five anchors.

### Specs strip (signature)
Five hairline-divided cells centred in the hero's bottom band: a 22px cyan line icon spanning two rows, a 17 comp px weight-700 tabular value, an 11px dim label. 34-unit horizontal padding per cell. Under 860px the verticals drop and the cells form a 2-column grid.

### Callouts (signature)
"Two-blade rotor" and "Clear acrylic cover": 14px weight-400 ink labels tied to the hardware by a 6px ink dot and a 1px ink rule (170 and 48 units long) at fixed comp positions. Hidden under 860px.

### Live fan (signature)
A transparent `@react-three/fiber` canvas (fov 32, camera at z 5.4, dpr 1–1.75) over the room plate. Two blade planes spin at 11.7 rev/s; a persistence-of-vision disc shader paints the active clip texture with additive, premultiplied blending so only light lands on the photograph; a fixed blue-white streak plane marks where the eye keeps the LED bar; the cover is an additive glass shader (rim, upper-left glint, lower-right catch-light, drifting sheen). Niche changes cross-dissolve by driving the disc gain to 0, swapping the texture, and easing back to 1.35; the room plate behind crossfades over 900ms ease-out. Warm key (`#ffe2b8`), cool fill (`#9fb4ff`) and a `#bfe6ff` point light are the only lights.

### Motion
- **Easing:** everything uses `cubic-bezier(0.16, 1, 0.3, 1)`; durations 150ms (checkbox, input border), 200ms (colour, lift), 250ms (tab colour), 300ms (pill transform), 700ms (tile zoom, reveal opacity), 900ms (plate crossfade, reveal rise).
- **Niche cycle:** every 5000ms, or on tab click; hover pauses; the progress underline, plate crossfade and disc dissolve run together.
- **Scroll story (wide screens):** the hero is pinned for 420vh. Scroll progress, written to a shared `scene` object and never to React state, lifts the clear cover (0.1–0.3), slows the rotor from 11.7 to 0.22 rev/s so the blades and LED rings read (0.28–0.72), swings the camera round the fan on keyframes, and spins back up (0.72–0.92). Four step lines rise in over 0.06 of scroll at each band and leave over 0.05; part labels pin to projected 3D anchors and fade over 0.05; a 2px cyan bar at the bottom tracks progress; the closing line fades up from 0.94. Phones (≤860px) and reduced motion skip the pin and keep the fan at full speed.
- **Reveal:** the two footage grids rise in once (`translateY(18px)` → 0, staggered 60ms per tile via `--i`) when 10% enters the viewport with a -12% bottom margin.
- **Hover:** footage tiles scale their video to 1.03 over 700ms.
- **Reduced motion:** the auto-cycle stops and tabs stay manual; the global rule collapses all CSS animations and transitions to 0.01ms; reveal tiles render visible; in-view videos do not autoplay. The fan keeps spinning (the hologram does not exist without it).

## Do's and Don'ts

### Do:
- **Do** keep cyan to actions, active states, icon strokes and focus; one accent, one voice.
- **Do** draw structure with 1px `#262626` hairlines and reserve `#141414` for the single interactive panel.
- **Do** size every hero element in comp units (`calc(N * var(--u))`) and release to `--u: 1px` flex flow under 860px.
- **Do** set figures in weight 700 with tabular numerals and headings in 600 with negative tracking.
- **Do** back every clip, disc and thumbnail with `#000` so letterboxing vanishes.
- **Do** use the shared ease-out curve and the 150–900ms duration ladder for any new transition.
- **Do** ship generated rasters with a provenance JSON beside the asset (as `public/assets/env/*.webp.json` does).

### Don't:
- **Don't** add gradients, glows, blur or glass in CSS; light belongs to the rendered hologram and the footage, and the only scrim is the footage-label gradient.
- **Don't** add a second accent, a tinted heading, or a cyan surface larger than a pill.
- **Don't** put kickers, eyebrows or uppercase labels above headings.
- **Don't** use drop shadows for hierarchy; the reel-disc shadow is the single exception and it lifts media, not UI.
- **Don't** put the client reel in the hero; the hero plays the product clips the user chose for it (public/media/holo-pin/), and the client reels stay in the Content section.
- **Don't** introduce a display face or a monospace; one system sans at four weights is the whole type system.

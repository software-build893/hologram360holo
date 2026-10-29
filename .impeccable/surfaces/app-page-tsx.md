---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Landing page (app/page.tsx)

Scope: the marketing landing page for 3D Hologram Ads, althologram version. Visitor mode: Persuade.

Audience and job: owners of small physical businesses (liquor stores, donut shops, juice bars, phone-accessory shops, bars, cafés, trade-show exhibitors) deciding whether to buy a holographic LED fan with custom content. Action: request a quote (pick Fan + cover $250, Content $150, Tripod $99; submit name, business, email). Proof: eight real hologram clips from past clients and eight field clips of fans running in shops, all in `public/media/`. Constraints: no invented testimonials, customers, delivery times or warranty terms; the placeholder contact email stays until the user gives one.

Chosen direction: the category standard (premium hardware landing page), picked by the user over the dealt directions; Apple and Dyson product pages set the craft bar. Composition (revised 2026-10-29 at the user's request): product-led. The fan is a live three.js render (the same rotor, LED strips and persistence-of-vision disc as the holo site) at life scale, centred; headline and subline sit bottom-left, Request a quote and See it in the wild bottom-right, the two callouts hang off the hardware as in `.impeccable/mocks/comp-product-led.png`. The niche tabs sit under the claim and switch both the hologram clip and the room photo. The hero clips are four Pinterest videos the user supplied (2026-10-29: orange juice splash, Moët & Chandon bottle, flying donuts, phone case) cut to 5 s square segments in public/media/holo-pin/; the earlier generated loops remain in public/media/holo-gen/ as the fallback. The user also removed the hero's Request a quote button; See it in the wild is the only hero action besides the nav's Get a quote. Clear cover is rendered as reflections only, no hub in front of the picture, Apple's font stack.

Memorable moment: the fan stays put at life scale while the niche switcher changes both the floating hologram (champagne bottle → flying donuts → orange juice splash → phone case) and the environment behind it (back bar → donut counter → juice bar → phone shop), proving one machine serves many kinds of business.

Approved comp: `.impeccable/mocks/comp-combined-v2.png` (liquor-store state). Decision comp: `.impeccable/mocks/decision/canon.png`.

Unresolved: contact email, form backend, analytics provider, portal auth (PRODUCT.md).

## Direction contract

THESIS: One fan, every kind of shop. The page proves breadth by changing the product and the room while the hardware never moves. It refuses the generic hologram page where one glowing render sits over a headline and the niches are a logo row.

OWN-WORLD: Near-black ground (#0A0A0A) with white text and a single cyan accent (#22D3EE) on the primary action, active tab and callout dots. Hero environment plates are real-looking rooms darkened to keep text legible. Type: one geometric sans for everything, large light headline, small regular UI labels. Components: pill primary button, underlined text link, segmented tab row with a cyan progress underline, hairline-divided specs strip with line icons, offer cards on #141414 with 1px #262626 borders. No gradients, glows or glass outside the hologram itself.

STORY: The visitor reads the claim, sees the fan floating a liquor logo in a bar, watches it become a donut in a donut shop, understands the content is made per business, reads the three prices, and requests a quote.

FIRST VIEWPORT (revised): Nav bar at top (wordmark left, four links, cyan Get a quote pill). The live fan, centred and large, leads: hub at (672, 300) of the 1344 frame, blade tips 240px out, the generated hologram loop painted into the disc, the clear cover drawn as light only. Headline "Your logo, floating in mid-air." bottom-left in two lines with the subline "Holographic LED fan with custom 3D content, from $250." under it; Request a quote (cyan pill) and See it in the wild (link) bottom-right; callouts Two-blade rotor (upper left, rule to the blade) and Clear acrylic cover (lower right, rule from the rim). Four niche tabs under the claim, active one underlined in cyan with a 5 s progress fill. The niche room photo fills the hero behind everything. Bottom band on near-black: the specs strip only (Ø 42 cm, 1024 × 800 px, 224 LEDs, 150° viewing, 20 W).

FORM: Category standard, played straight (the canon exit the user chose; my own list ranked the sign-painter window first). seed:8fc387c8864d0ad7

MOTION (revised 2026-10-29, at the user's request to match holo v1): the hero is a pinned 420vh scroll story on wide screens. Scrolling lifts the clear cover, slows the rotor from 700 rpm to a crawl so the two blades and the LED sweep read, swings the camera round the fan, and spins it back up; four step lines rise in and leave by scroll band, part labels pin to the hardware, a cyan progress bar tracks the story, and a closing line lands at the end. Phones and reduced motion get the flowing hero with the fan at full speed. The niche cycle still runs: every 5 s (or on tab click) the hologram cross-dissolves to the next client clip while the environment plate cross-fades behind it; the progress underline fills over the interval; the fan hardware and callouts stay fixed. Reduced motion stops the auto-cycle and keeps tabs manual.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

# Landing page (app/page.tsx)

Scope: the marketing landing page for 3D Hologram Ads, althologram version. Visitor mode: Persuade.

Audience and job: owners of small physical businesses (liquor stores, donut shops, juice bars, phone-accessory shops, bars, cafés, trade-show exhibitors) deciding whether to buy a holographic LED fan with custom content. Action: request a quote (pick Fan + cover $250, Content $150, Tripod $99; submit name, business, email). Proof: eight real hologram clips from past clients and eight field clips of fans running in shops, all in `public/media/`. Constraints: no invented testimonials, customers, delivery times or warranty terms; the placeholder contact email stays until the user gives one.

Chosen direction: the category standard (premium hardware landing page), picked by the user over the dealt directions; Apple and Dyson product pages set the craft bar. Composition: the user combined the headline-led and product-led comps and added two behaviors: the floating product rotates through four niches from real past clients, and the hero background follows the niche.

Memorable moment: the fan stays put at life scale while the niche switcher changes both the floating hologram (Schaller Bros liquor → donut → juice logo → Aqua phone case) and the environment behind it (back bar → donut counter → juice bar → phone shop), proving one machine serves many kinds of business.

Approved comp: `.impeccable/mocks/comp-combined-v2.png` (liquor-store state). Decision comp: `.impeccable/mocks/decision/canon.png`.

Unresolved: contact email, form backend, analytics provider, portal auth (PRODUCT.md).

## Direction contract

THESIS: One fan, every kind of shop. The page proves breadth by changing the product and the room while the hardware never moves. It refuses the generic hologram page where one glowing render sits over a headline and the niches are a logo row.

OWN-WORLD: Near-black ground (#0A0A0A) with white text and a single cyan accent (#22D3EE) on the primary action, active tab and callout dots. Hero environment plates are real-looking rooms darkened to keep text legible. Type: one geometric sans for everything, large light headline, small regular UI labels. Components: pill primary button, underlined text link, segmented tab row with a cyan progress underline, hairline-divided specs strip with line icons, offer cards on #141414 with 1px #262626 borders. No gradients, glows or glass outside the hologram itself.

STORY: The visitor reads the claim, sees the fan floating a liquor logo in a bar, watches it become a donut in a donut shop, understands the content is made per business, reads the three prices, and requests a quote.

FIRST VIEWPORT: Nav bar at top (wordmark left, five links, cyan Get a quote pill). Centered headline "Your logo, floating in mid-air." with one subline naming the four niches, then Request a quote (cyan pill) and See it in the wild (link). Below, the fan straight on at life scale, centered, blades blurred, the client hologram floating in front of the hub, with two thin callouts (Two-blade rotor, Clear acrylic cover). The niche environment fills the hero behind it. Under the fan, four niche tabs with the active one underlined in cyan and a progress bar. Bottom band on near-black: specs strip (Ø 42 cm, 1024 × 800 px, 224 LEDs, 150° viewing, 20 W) and the start of three offer cards.

FORM: Category standard, played straight (the canon exit the user chose; my own list ranked the sign-painter window first). seed:8fc387c8864d0ad7

MOTION: Signature interaction is the niche cycle: every 5 s (or on tab click) the hologram cross-dissolves to the next client clip while the environment plate cross-fades behind it; the progress underline fills over the interval; the fan hardware and callouts stay fixed. Reduced motion stops the auto-cycle and keeps tabs manual.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

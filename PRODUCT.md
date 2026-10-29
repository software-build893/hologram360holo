# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (user's choice). Reasons given: visitor analytics (page views, how many people submit the quote form) and a customer portal where a paying customer uploads their logo or product files after payment. Payment happens outside the website; the portal never takes money. Deploys alongside the existing `holo/` site on the same VPS (nginx at hologram.afdillah.com), so hosting must accommodate a Node server or a static export plus a small API.

## Users

Owners and managers of small physical businesses: liquor and wine stores, cocktail bars, cafés, confectioners, battery and phone-accessory retailers, showrooms, clinics, and trade-show exhibitors. They want more people to stop and look at a counter, shelf, window, or booth. They are not AV specialists; they decide alone or with one partner, usually on a phone, and they want to know what it costs and what they get.

Second audience (after purchase): the same customer, now logged into the portal to upload a logo or product reference so the content can be made.

## Product Purpose

Sell holographic LED fan displays with custom 3D content to small businesses. Three offers, priced flat: the fan with its protective cover, a custom 3D logo animation, and a floor tripod. Success on the marketing surface is a quote request (form submission). Success on the portal is a complete upload with the files the content team needs.

This is `althologram`, an alternative version of the same business's site built at `holo/` (live at hologram.afdillah.com). Same buyers, same offers and prices, a different pitch and visual take, to compare against the live site.

## Positioning

The business supplies the whole thing: the fan, the cover that makes it safe in a shop, the stand when there is no wall, and the content made specifically for a spinning LED display (black background, strong silhouette, loop-safe). Buyers elsewhere get a bare fan and no content. The mechanism itself is the claim: a 42 cm two-blade rotor whose 224 LEDs paint a 1024 × 800 picture in mid-air at ~700 rpm; the image appears to float with no screen behind it.

## Operating Context

Installed in retail aisles, back bars, counters, front windows, behind registers, on showroom walls, and at trade-show booth entrances. Mounted to a wall with the supplied screws or on the tripod at 35, 55 or 71 in. Content loops from an SD card; Wi-Fi app and infrared remote control. Customer sends a logo (vector preferred) or product photos; the team models, lights and animates a 6–10 s loop and delivers it ready to upload.

## Capabilities and Constraints

Confirmed offers and prices:
- Fan + cover: $250 (PD42 holographic LED fan, 42 cm, with clear acrylic cover)
- Content: $150 (6–10 s custom 3D logo animation; longer product animations quoted separately)
- Tripod: $99 (adjustable floor stand, 35–71 in, folds flat)

Specs used on the live site: Ø 42 cm display, 2-blade rotor, 1024 × 800 px, 224 LEDs, Wi-Fi · app · remote, 150° viewing, 20 W, SD card loop. LED count (224–244) and 700 rpm are from retail listings and typical values, not a datasheet; keep them as-is unless the supplier sheet says otherwise.

In the box: PD42 fan unit, acrylic cover, infrared remote, power adapter, screwdriver, wall plugs and screws, user manual.

Hardware descriptions carried over from the live site's copy (`holo/src/lib/content.ts`), taken from retail listings and the supplier's parts sheet rather than a datasheet; keep them unless the supplier sheet contradicts them: cover clips on with eight fasteners; two blades on one LED bar; brushless motor with the infrared receiver on the face of the hub; housing holds the SD card slot and Wi‑Fi radio; mounting base screws to the wall with the power jack on its rim.

Website capabilities to build:
- Marketing landing page with a quote request form.
- Analytics: visitor count and form-submission count (mechanism undecided; a self-hosted event store or a privacy-light provider both acceptable).
- Customer portal: after paying outside the site, the customer signs in and uploads logo / product files plus brief notes. No payments, no checkout. Auth mechanism undecided (magic link or a per-order access code are the candidates).

Undecided: contact email for the business (the live site still uses a placeholder), form backend, analytics provider, portal auth.

## Brand Commitments

Business name on the live site: "3D Hologram Ads". No logo asset exists beyond a favicon mark. This version is explicitly an alternative look and must not reuse `holo/`'s or `afterimage/`'s styling.

Standing preference (chosen 2026-10-29 in the direction round): the category standard, played straight. The user picked the conventional premium-hardware landing page over the dealt directions, and named Apple and Dyson product pages as the sites it should sit alongside; their craft level is the bar. Convention is the commitment: no irony, no smuggled quirk.

## Evidence on Hand

Real assets, all at `../holo/public/media/` (reusable here):
- Eight hologram content clips, 540 × 540, black background, with stills: patch (wellness brand), aqua (phone case), donut (donut shop), pipe (industrial supplier), fruit (juice brand), liquor (liquor store), sparks (clinic), tds (telecom).
- Eight field clips of fans running in real locations, with stills: wine (wine & spirits aisle), bar (back bar), rocher (confectionery counter), batteries (front window), cafe (behind register), orizon (showroom wall), shb (shelf edge), tradeshow (booth entrance). Mostly 9:16.
- Product photos: kit, cover, exploded view (generated from supplier renders), and six close-ups (face, back, lamp, sdslot, port, bottom). These are supplier-derived crops, not the business's own photography.
- Reference footage and source material under `../references/`.

Absent, do not invent: testimonials, named customers, sales figures, delivery times, warranty terms, review scores.

## Product Principles

- Show the fan working in a real shop before explaining it; the floating picture is the whole argument.
- Price is part of the pitch: three numbers, no "contact for pricing".
- The content is made for the medium; show why a flat logo on a hologram fan fails and a modeled one works.
- Everything the buyer needs is in the offer: fan, cover, stand, content. Nothing is "sold separately".
- After purchase, make the handoff of a logo or product effortless on a phone.

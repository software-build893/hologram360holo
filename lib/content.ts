// Product facts shared across the page. Prices, specs and in-the-box come from PRODUCT.md;
// clips and field footage are the real client material in public/media.

export const holoReel = [
  { id: "patch", title: "Wellness brand", note: "Product reveal, light trails", src: "/media/holo/patch.mp4", still: "/media/stills/patch.jpg" },
  { id: "aqua", title: "Phone case", note: "Product turntable, water FX", src: "/media/holo/aqua.mp4", still: "/media/stills/aqua.jpg" },
  { id: "donut", title: "Donut shop", note: "Food hero, glaze drip", src: "/media/holo/donut.mp4", still: "/media/stills/donut.jpg" },
  { id: "pipe", title: "Industrial supplier", note: "Logo build, pipe section", src: "/media/holo/pipe.mp4", still: "/media/stills/pipe.jpg" },
  { id: "fruit", title: "Juice brand", note: "Fruit morph into logo", src: "/media/holo/fruit.mp4", still: "/media/stills/fruit.jpg" },
  { id: "liquor", title: "Liquor store", note: "Logo spin, pour", src: "/media/holo/liquor.mp4", still: "/media/stills/liquor.jpg" },
  { id: "sparks", title: "Clinic", note: "Logo only, with sparks", src: "/media/holo/sparks.mp4", still: "/media/stills/sparks.jpg" },
  { id: "tds", title: "Telecom", note: "Logo with text lockup", src: "/media/holo/tds.mp4", still: "/media/stills/tds.jpg" },
] as const;

export const wildFootage = [
  { id: "wine", place: "Wine & spirits retail", where: "Aisle end, lights on", src: "/media/wild/wine.mp4", still: "/media/stills/wine.jpg", ar: "9 / 16" },
  { id: "bar", place: "Cocktail bar", where: "Back bar shelf", src: "/media/wild/bar.mp4", still: "/media/stills/bar.jpg", ar: "9 / 16" },
  { id: "rocher", place: "Confectionery", where: "Counter display, daylight", src: "/media/wild/rocher.mp4", still: "/media/stills/rocher.jpg", ar: "1 / 1" },
  { id: "batteries", place: "Battery retailer", where: "Front window", src: "/media/wild/batteries.mp4", still: "/media/stills/batteries.jpg", ar: "9 / 16" },
  { id: "cafe", place: "Café", where: "Behind the register", src: "/media/wild/cafe.mp4", still: "/media/stills/cafe.jpg", ar: "9 / 16" },
  { id: "orizon", place: "Showroom", where: "Wall mount", src: "/media/wild/orizon.mp4", still: "/media/stills/orizon.jpg", ar: "9 / 16" },
  { id: "shb", place: "Retail", where: "Shelf edge", src: "/media/wild/shb.mp4", still: "/media/stills/shb.jpg", ar: "2 / 3" },
  { id: "tradeshow", place: "Trade show", where: "Booth entrance", src: "/media/wild/tradeshow.mp4", still: "/media/stills/tradeshow.jpg", ar: "9 / 16" },
] as const;

export const offers = [
  {
    id: "fan",
    title: "Fan + cover",
    price: 250,
    priceNote: "fan and cover together",
    short: "PD42 holographic LED fan, 42 cm, with its clear acrylic cover.",
    body:
      "Two-blade rotor, 1024 × 800 picture, Wi‑Fi and app control plus an infrared remote. Plays from an SD card and mounts to a wall with the screws in the box. The cover clips on with eight fasteners and keeps fingers and dust off the blades. Ships ready to loop your content from day one.",
    still: "/media/product/exploded.jpg",
  },
  {
    id: "content",
    title: "Content",
    price: 150,
    priceNote: "6–10 second 3D logo animation",
    short: "A custom 3D logo animation built for the fan.",
    body:
      "Your logo, modeled and lit in 3D, animated for a 6–10 second loop. Black background, strong silhouette, loop‑safe, delivered ready to upload. Longer product animations are quoted separately.",
    still: "/media/stills/liquor.jpg",
  },
  {
    id: "tripod",
    title: "Tripod",
    price: 99,
    priceNote: "adjustable stand, 35–71 in",
    short: "A floor stand for spots with no wall.",
    body:
      "Adjustable tripod that holds the fan in its cover at 35, 55 or 71 inches. For counters, trade show booths, and anywhere you can’t put a screw in the wall. Folds flat for transport.",
    still: "/media/stills/shb.jpg",
  },
] as const;

export type OfferId = (typeof offers)[number]["id"];

export const hardwareParts = [
  { id: "cover", name: "Protective cover", note: "Clear acrylic, eight clips. Keeps hands and dust off the blades." },
  { id: "blades", name: "LED bar", note: "Two blades on one bar. 224 LEDs paint a 1024 × 800 picture." },
  { id: "hub", name: "Rotor hub", note: "Brushless motor. Infrared receiver on the face for the remote." },
  { id: "body", name: "Housing", note: "SD card slot, Wi‑Fi radio, 20 W draw." },
  { id: "base", name: "Mounting base", note: "Screws to the wall. Power jack on the rim." },
] as const;

export const closeUps = [
  { id: "face", label: "Fan face", note: "One line of LEDs", src: "/media/product/face.jpg" },
  { id: "back", label: "Back of the bar", note: "LED drivers", src: "/media/product/back.jpg" },
  { id: "lamp", label: "Rotor hub", note: "Infrared receiver", src: "/media/product/lamp.jpg" },
  { id: "sdslot", label: "Housing", note: "SD card slot", src: "/media/product/sdslot.jpg" },
  { id: "port", label: "Base rim", note: "Power port", src: "/media/product/port.jpg" },
  { id: "bottom", label: "Base", note: "Wall mount holes", src: "/media/product/bottom.jpg" },
] as const;

export const inTheBox = ["PD42 fan unit", "Acrylic cover", "Infrared remote", "Power adapter", "Screwdriver", "Wall plugs and screws", "User manual"] as const;

// Still a placeholder: PRODUCT.md records that the business has not given its contact address yet.
export const CONTACT_EMAIL = "hello@example.com";

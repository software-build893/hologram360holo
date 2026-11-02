// The six launch articles. scripts/seed-articles.mjs publishes any of these whose slug is not in the database yet,
// so a fresh deployment starts with real reading and an existing one keeps whatever was edited since.
// Facts come from PRODUCT.md: PD42 fan, 42 cm, two blades, 224 LEDs, 1024 × 800, ~700 rpm, 20 W, SD card, Wi-Fi app,
// infrared remote, 150° viewing; fan + cover $250, content $150, tripod $99 (35–71 in). No customers or figures are invented.

export const articles = [
  {
    slug: "how-a-3d-hologram-fan-works",
    title: "What a 3D hologram fan actually is",
    summary: "There is no screen and no glass. A spinning bar of LEDs paints a picture in the air faster than your eye can follow. Here is how the trick works and what it means for what you put on it.",
    cover: "how-a-3d-hologram-fan-works.jpg",
    cover_alt: "A holographic LED fan on a dark wall showing a glowing faceted shape floating in mid-air",
    body: `
<p>Call it a hologram fan, a 3D LED fan or a holographic display: the device is the same. A short bar with a single row of LEDs spins on a brushless motor, about 700 times a minute. Each LED is switched on and off thousands of times per second as the bar sweeps round. Your eye holds every flash for a fraction of a second, so instead of a moving dot you see a complete, steady picture hanging where the bar is spinning.</p>
<h2>Persistence of vision, with the right numbers</h2>
<p>The fan we install, the PD42, is 42 cm across with two blades on one LED bar. Its 224 LEDs paint a picture 1024 by 800 pixels wide. That is enough for a logo with clean edges, a product with readable detail, or a short line of text.</p>
<p>The reason it reads as 3D is simpler than it looks. Anything black in the content is simply never lit. There is no backlight, no panel, no edge to the picture; the lit parts float in front of the wall with nothing visible behind them. Give the content shading, a turn, a highlight that moves, and the brain fills in depth that a flat screen could never fake.</p>
<h2>What it is not</h2>
<p>It is not a true volumetric hologram: you cannot walk around it and see the back of the object. The picture lives on a flat disc of light, which you can see from about 150 degrees in front. Stand at the side and it thins to a line. That is why placement matters so much, and why we talk about where to mount it before we talk about what to show on it.</p>
<h2>What the picture needs</h2>
<ul>
<li><strong>A black background.</strong> Black is unlit, and unlit is invisible. A white or coloured background turns the whole disc into a lit plate and the floating effect is gone.</li>
<li><strong>A strong silhouette.</strong> Thin outlines and small type fall between the LED rings. Fat shapes, bold strokes, one subject.</li>
<li><strong>Motion that loops.</strong> The content plays from an SD card on a loop. Six to ten seconds that start where they end look alive; a clip with a visible jump looks like a screensaver.</li>
</ul>
<p>Every piece of content we make is built to those three rules, which is the main reason a logo someone exported from a letterhead looks wrong on a fan and a modelled one looks like a product in the air.</p>
<h2>The hardware, in one paragraph</h2>
<p>A wall plate with the power jack on its rim, a housing that holds the SD card slot and Wi-Fi radio, the rotor hub with the infrared receiver on its face, the LED bar, and a clear acrylic cover that clips on with eight fasteners so fingers and dust stay out of the blades. It draws about 20 W, roughly a bright light bulb. You control it from the app or the remote; most owners set the loop once and leave it running.</p>
<p>If you want to see one running in a real shop before reading further, the <a href="/#wild">In the wild</a> section on the home page has eight of them, filmed on a phone where they live.</p>
`,
  },
  {
    slug: "where-to-put-a-hologram-fan-in-your-shop",
    title: "Where a hologram fan earns its keep in a shop",
    summary: "Three positions work almost everywhere, one works nowhere, and the difference is not the fan. It is where people are standing, how long they stay, and how bright the room is.",
    cover: "where-to-put-a-hologram-fan-in-your-shop.jpg",
    cover_alt: "A holographic LED fan above a bar shelf of bottles, showing a glowing bottle shape in amber light",
    body: `
<p>A hologram fan is a 42 cm disc of light. It is bright, it moves, and it is best seen from straight ahead within a few metres. Those three facts decide where it should go. After installing them in liquor stores, bars, cafés, phone shops and showrooms, three positions keep winning.</p>
<h2>1. Behind the register</h2>
<p>Everyone in the shop faces the till for at least thirty seconds, standing still, usually with nothing else to look at. A quiet loop of your house brand or the thing you most want to sell this month runs there with no competition. Mount it on the wall behind the counter, roughly at eye level for a standing adult, 160 cm or so to the hub, angled very slightly down toward the queue.</p>
<h2>2. The end of an aisle or the back bar</h2>
<p>An aisle end already does the work of stopping a trolley; a bottle turning in mid-air above it finishes the job. In a bar the same position is the back-bar shelf: dim room, people seated facing it, drinks in hand. Keep the content to one subject and one line, the label and the price, nothing else. This is the spot where a product animation, not just a logo, pays for itself.</p>
<h2>3. The booth entrance or showroom wall</h2>
<p>At a trade show the fan is a beacon. People see the floating picture from across the hall before they can read a banner, and they walk toward it. On a showroom wall it does the same for a product that is too big or too expensive to put on a plinth. Here the tripod is often better than the wall: 35 to 71 inches of height, folds flat, moves with you.</p>
<h2>The place that does not work</h2>
<p>A shop window in daylight. The disc looks superb in a dim room, but against a sunlit street it fades to a grey smudge, and the people outside see the back of a spinning blade. If the window is the only position you have, run it after dark or choose the brightest, simplest content you can and expect less from it. Better to put it inside, facing the door, where the first thing a visitor sees is the picture in the air.</p>
<h2>Three checks before you drill</h2>
<ul>
<li><strong>Face the fan toward where people stand or sit,</strong> not across their path. The viewing angle is about 150 degrees; from the side it disappears.</li>
<li><strong>Give it a dark background</strong> if you can: a dark wall, a shelf of bottles, a black panel. The floating effect is strongest when nothing bright is behind it.</li>
<li><strong>Put a socket nearby.</strong> The plate's power jack sits on its rim; the adapter cable is short on purpose, so it does not dangle through the blades.</li>
</ul>
<p>Not sure which of these fits your room? Send us a photo of the wall with a <a href="/#quote">quote request</a> and we will tell you where we would put it.</p>
`,
  },
  {
    slug: "content-that-works-on-a-hologram-fan",
    title: "Content that works on a hologram fan, and what fails",
    summary: "A hologram fan is unforgiving about what it shows. Black backgrounds, fat shapes, one subject and a clean loop: the four rules every piece of our content follows, and why a letterhead logo breaks all of them.",
    cover: "content-that-works-on-a-hologram-fan.jpg",
    cover_alt: "Close-up of a hologram fan disc showing a sharp, bright floating shape on a black background",
    body: `
<p>The fan does not care how good your logo is on a business card. It paints a 1024 by 800 picture with rings of light, and it will show every weakness in the file. The good news is that the rules are few and they are easy to design for, once you know them.</p>
<h2>Rule 1: the background is black, always</h2>
<p>On a hologram fan, black means off. Unlit LEDs are invisible, which is the entire floating effect. Any colour behind your subject turns the disc into a lit plate with a picture on it, like a cheap round screen. Every piece of content we deliver sits on pure black, and if your brand colour is a background colour, we make it a glow around the subject instead.</p>
<h2>Rule 2: fat shapes, few details</h2>
<p>The picture is drawn as concentric rings, so a line thinner than a ring can flicker or vanish, and small type turns to noise. We model logos with thicker strokes than the print version, drop hairline details, and set text at a size that reads from three metres. If your logo relies on fine serifs or a thin script, we will tell you before we start and propose a bolder cut of it for the fan.</p>
<h2>Rule 3: one subject, in motion</h2>
<p>A fan shows one thing well. A logo that turns, a bottle that pours, a donut that gets its glaze, a phone case that flips to show the back. We light and animate that one subject so it has depth: a highlight that travels, a shadow side, a rotation that reveals a shape. Two subjects fight; a slogan under a product halves both.</p>
<h2>Rule 4: a loop with no seam</h2>
<p>The content plays from the SD card on repeat, all day. A six to ten second clip that ends exactly where it starts looks like a living object. A clip with a jump cut looks like a video stuck in a loop, and people notice that faster than they notice anything else. We render every loop to return to its first frame.</p>
<h2>What we need from you</h2>
<ul>
<li><strong>Your logo as a vector</strong> (SVG, AI, EPS or PDF) if you have one; a large PNG on a plain background works too.</li>
<li><strong>Product photos</strong> from two or three angles if the content is a product rather than a logo. Phone photos are fine; we model the object, we do not paste the photo.</li>
<li><strong>One sentence about the mood:</strong> premium and quiet, loud and fun, clean and clinical. That decides the lighting and the pace.</li>
</ul>
<p>After payment you get a private upload link where those files go, from a phone, in a minute. We model, light and animate a 6 to 10 second loop and deliver it ready for the SD card, with a preview you can watch on your phone first. The <a href="/#content">Content</a> reel on the home page shows eight loops made this way for eight different kinds of business.</p>
`,
  },
  {
    slug: "hologram-fan-vs-screen",
    title: "Hologram fan or a screen? Picking the right display for a small shop",
    summary: "A television on the wall is cheap and familiar; nobody looks at it. A hologram fan costs about the same, uses a fifth of the power, and stops people. Where each one belongs.",
    cover: "hologram-fan-vs-screen.jpg",
    cover_alt: "A phone shop with a flat screen on one wall and a hologram fan showing a floating phone case on another",
    body: `
<p>When a shop wants a moving display, the default is a television with a slideshow on it. It is cheap, it is familiar, and after the first week nobody in the room looks at it, because it looks like every other screen in their day. A hologram fan is a different kind of object, and it is worth being clear about where each belongs.</p>
<h2>Attention</h2>
<p>A screen is a rectangle of light. People have learned to ignore rectangles of light. A hologram fan is a picture with no edges, hanging in the air, and the brain has no filter for that yet. The first reaction is almost always a step closer and a question. That curiosity is the product: it starts the conversation your staff would otherwise have to start cold.</p>
<h2>What each one can show</h2>
<p>A screen shows anything: menus, prices, long videos, photos. A fan shows one subject at a time, in a loop, on black. If you need to show twelve products and a price list, you want a screen. If you need people to stop and look at one thing, the fan does it better, and it does it from across the room.</p>
<h2>Running cost and fuss</h2>
<ul>
<li><strong>Power:</strong> the PD42 draws about 20 W, roughly a bright bulb. A 43-inch television draws several times that.</li>
<li><strong>Content:</strong> the fan loops from an SD card; nothing to log in to, nothing to update over the internet. Change the card or push a new loop from the app when you want a new message.</li>
<li><strong>Hardware:</strong> a wall plate and a 20-minute install, or a tripod. No cable box, no HDMI, no stand.</li>
<li><strong>Safety:</strong> the clear acrylic cover clips on with eight fasteners, so the blades are never exposed in a shop with customers and children.</li>
</ul>
<h2>Where a screen still wins</h2>
<p>Bright daylight, long-form content, anything with a lot of text, and anything that changes several times a day. A sunlit window is a screen's job. A dim back bar, a counter, an aisle end or a booth entrance is the fan's.</p>
<h2>The honest comparison</h2>
<p>Fan, cover and a custom loop come to $400; a tripod if you have no wall adds $99. A television with a media player and someone to make the slideshow lands in the same range, and then it hangs there doing what every television does. The fan's job is narrower and it does that job in a way a screen cannot: it makes one thing impossible to walk past.</p>
<p>If you are weighing the two for a specific wall, <a href="/#quote">ask for a quote</a> and tell us what is on it. Sometimes the answer really is a screen, and we will say so.</p>
`,
  },
  {
    slug: "the-hologram-fan-kit-explained",
    title: "The kit: fan, cover, tripod and wall mount, explained",
    summary: "What is in the box, what each part does, how the install goes, and which stand you need. Everything you need to run a hologram fan in a shop ships together; nothing is sold separately.",
    cover: "the-hologram-fan-kit-explained.jpg",
    cover_alt: "A holographic LED fan with a clear cover on a slim tripod next to one mounted flat on a showroom wall",
    body: `
<p>Buy a hologram fan from a marketplace and you get a bare rotor in a box, a power brick and a manual in small print. The reason ours comes as a kit is that a bare fan is not something you can put in a shop. Here is what arrives, part by part.</p>
<h2>The fan: PD42</h2>
<p>A 42 cm display with two blades on one LED bar. 224 LEDs draw a 1024 by 800 picture, visible from about 150 degrees in front, at around 20 W. The brushless motor sits in the rotor hub, with the infrared receiver for the remote on the hub's face. The housing behind it holds the SD card slot and the Wi-Fi radio.</p>
<h2>The clear acrylic cover</h2>
<p>The part most sellers leave out. It clips over the blades with eight fasteners and keeps fingers, dust and curious hands out of a rotor spinning at about 700 rpm. It is clear, so the picture is unchanged; you see a faint reflection on the surface and nothing else. In a shop with customers it is not optional, which is why it is in the first offer rather than an add-on.</p>
<h2>The wall mount</h2>
<p>A mounting base that screws to the wall, with the power jack on its rim so the cable never crosses the blades. Four screws into brick, a stud or good plugs; the screwdriver, wall plugs and screws are in the box. Mount it where a standing adult's eyes meet the centre, around 160 cm to the hub, and leave a hand's width of clearance around the disc.</p>
<h2>The tripod</h2>
<p>For a glass wall, a rented space, a booth, or a fan that moves between the window and the counter. An adjustable floor stand from 35 to 71 inches that folds flat, so it travels to a trade show in a car boot. The fan's base mounts to it the same way it mounts to a wall.</p>
<h2>In the box</h2>
<ul>
<li>PD42 fan unit</li>
<li>Clear acrylic cover</li>
<li>Infrared remote</li>
<li>Power adapter</li>
<li>Screwdriver, wall plugs and screws</li>
<li>User manual</li>
</ul>
<h2>The install, in order</h2>
<ul>
<li><strong>Pick the wall</strong> (dark background, people facing it, socket within reach).</li>
<li><strong>Screw the base on</strong>, plug the adapter into the jack on the rim.</li>
<li><strong>Clip the fan to the base</strong>, put the SD card with your loop in the slot.</li>
<li><strong>Fit the cover</strong>, eight fasteners.</li>
<li><strong>Power on</strong>, press play on the remote or the app. Twenty minutes, usually less.</li>
</ul>
<p>Content is the one thing not in the box, because it is made for you after you order: a 6 to 10 second loop built for this exact display. The <a href="/#kit">kit page</a> shows each part up close.</p>
`,
  },
  {
    slug: "what-a-hologram-fan-costs",
    title: "What it costs: $250, $150, $99, and what you get for each",
    summary: "Three flat prices, no quote dance. The fan with its cover, the content made for it, and the stand for when there is no wall. What is included, what is not, and how ordering works.",
    cover: "what-a-hologram-fan-costs.jpg",
    cover_alt: "A hologram fan above a donut shop counter showing a glowing glazed donut floating in the air",
    body: `
<p>Most display companies make you ask. We would rather you knew the numbers before you called, so there are three, and they do not change with the size of your business.</p>
<h2>Fan + cover: $250</h2>
<p>The PD42 holographic LED fan, 42 cm, with its clear acrylic cover, remote, power adapter, wall base and fixings. This is the complete hardware for a wall installation. Nothing in this line is an add-on; a fan without the cover is not something we sell into a shop.</p>
<h2>Content: $150</h2>
<p>A custom 3D logo animation, 6 to 10 seconds, modelled and lit for the fan: black background, bold silhouette, seamless loop, delivered ready for the SD card with a preview first. Your logo as a vector or a clean PNG is all we need. Longer product animations, a bottle pouring or a phone case turning with its details, are quoted separately because the modelling takes longer; ask and we will give a number before we start.</p>
<h2>Tripod: $99</h2>
<p>The adjustable floor stand, 35 to 71 inches, folds flat. You need it when there is no wall to drill, when the wall is glass, or when the fan will move around. Most wall installs skip it.</p>
<h2>So a typical order is</h2>
<ul>
<li><strong>$400</strong> for a fan on a wall with your logo floating above the counter.</li>
<li><strong>$499</strong> for the same with a tripod, for a booth or a shop you cannot drill into.</li>
<li><strong>$250</strong> if you already have content made for a fan and only need the hardware.</li>
</ul>
<h2>How ordering goes</h2>
<ul>
<li><strong>Request a quote</strong> on the home page: tick what you want, we confirm the total and shipping to your address.</li>
<li><strong>Pay</strong> by the method agreed on the invoice; the website never takes card details.</li>
<li><strong>Upload</strong> your logo or product photos through a private link we send you, from a phone if you like.</li>
<li><strong>Approve the preview</strong>, then the fan ships with your loop already on the SD card.</li>
</ul>
<h2>What is not included</h2>
<p>Installation on site, electrical work, and running costs. The fan draws about 20 W, so the running cost is close to a light bulb's. If you want us to recommend a position, send a photo of the wall with the quote request and we will mark where we would put it.</p>
<p>Ready to see the total for your shop? <a href="/#quote">Build a quote</a>: it is three checkboxes and takes less than a minute.</p>
`,
  },
];

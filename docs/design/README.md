# Handoff: Luggo — marketing website + beacon shop

## Overview
Public website for **Luggo**, a Bluetooth-beacon luggage tracker app (iOS + Android). The site has three jobs:
1. **Market** the product and explain the concept (bags visibly approach you at the airport belt: Far → Medium → Near → Here).
2. **Sell Luggo beacons** in three packs (Single / Family 3-pack / Traveler 5-pack) through a cart and checkout.
3. Carry the **legal/company info**: contact section, company footer, and a privacy statement page.

Also required, but **not designed** in the prototype (see "Pages to build that are not designed"): checkout, order confirmation, order tracking, and an **admin backend** for content and order handling.

Operator: **Luggo by The RO Brand** · Fokkerstraat 12, 3833 LD Leusden, The Netherlands · +31 6 45438943 · KvK 58083111 · VAT NL852865867B01.

## About the design files
The `.dc.html` files in this bundle are **design references created in HTML**. They are working prototypes that show the intended look, copy, layout and behaviour. They are **not production code to copy directly**; the `.dc.html` format is a design-tool streaming wrapper (`support.js` is only its runtime). Open them in a browser to explore, and read the markup and logic as a spec.

Your task is to **rebuild these designs as a production site** in the stack described below, then add the backend.

## Target stack & infrastructure
- **Reference implementation: nije3d.com.** The same company runs nije3d.com (the same KvK and VAT numbers appear in its footer). The owner wants Luggo's shop and backend to **follow the nije3d.com approach**. If you have access to the nije3d codebase, **reuse its architecture, admin, order pipeline, payment integration and email templates**, and adapt only the branding and product model. Things you can see from the outside:
  - a Next.js site (App Router style routes);
  - server-rendered product pages; images served from `/media/…-{900,1600}.webp` in responsive sizes;
  - a `/cart` page;
  - `/track`, a public order lookup by an order number shaped like `NIJ-4821`;
  - payments by iDEAL, Bancontact, card and PayPal (so an EU PSP such as Mollie or Stripe — **use whatever nije3d uses**);
  - EUR pricing formatted as `€ 50,00`;
  - `/shipping` (shipping and returns);
  - a monthly-newsletter signup in the footer.
- **Hosting: DigitalOcean.** Deploy the way nije3d is deployed, either on App Platform or on a Droplet with Node + a reverse proxy. All secrets go in environment variables (`DATABASE_URL`, PSP keys, SMTP, admin auth secret).
- **Database: use the existing database** (the one nije3d uses, or the one the owner points you to). Don't create a new database server. Namespace the Luggo data so it can't collide with existing tables: use either a separate schema (`luggo.*`) or a `luggo_` table prefix. Use migrations (the migration tool nije3d already uses). **Confirm with the owner before running any migration on the shared DB.**

## Fidelity
**High-fidelity.** Colours, typography, spacing, radii, copy and interactions are final. Recreate the UI pixel-close. The site deliberately uses the **Luggo app's visual language** (warm cream + coral, Quicksand + Nunito). Do **not** use any other design system (e.g. a dark "Nocturne" theme) that may appear in the design project.

## Routes
| Route | Source | Notes |
|---|---|---|
| `/` | `Luggo Website.dc.html` | One-page marketing site + shop section. Anchors: `#how`, `#zones`, `#beacon`, `#shop`, `#faq`, `#contact` |
| `/privacy` | `Luggo Privacy.dc.html` | Privacy statement (content editable from admin) |
| `/cart` | cart drawer in `Luggo Website.dc.html` | Keep the drawer on `/`; a full `/cart` page is optional (nije3d has one) |
| `/checkout` | *not designed* | Follow the nije3d flow; style with the tokens below |
| `/order/[number]` | *not designed* | Confirmation after payment (reuse the "Order placed" state) |
| `/track` | *not designed* | Order lookup by number + email, like nije3d `/track`. Format `LUG-1234` |
| `/shipping` | *not designed* | Shipping & returns (CMS page). Optional, but nije3d has one |
| `/admin/*` | *not designed* | Content + orders backend (see below) |

## Screens / views

### Global
- Page background `#faf7f2`. Content container `max-width:1180px; margin:0 auto; padding:0 24px`. Sections use `padding:96px 24px` (Contact: 80px). Anchored sections have `scroll-margin-top:66px` (for the sticky nav), and `html{scroll-behavior:smooth}`.
- Headings: Quicksand 700. Body: Nunito 500. Body copy colour `#6e6559`. The app's `#8a8175` is kept only for small, non-essential labels, for contrast reasons.
- **Section kicker:** Nunito 700 12px, letter-spacing 2.5px, uppercase, `#b4583a`.
- **H2:** Quicksand 700 `clamp(32px,4vw,50px)`/1.08, letter-spacing -0.8px, `text-wrap:balance`.
- **Lead paragraph:** Nunito 500 17px/1.55 `#6e6559`, max-width ~460px.
- Layouts use CSS grid `repeat(auto-fit,minmax(min(100%,Npx),1fr))` so they reflow at any width. There are no fixed breakpoints except the nav, which hides its links below 860px.

### Buttons
- **Primary:** bg `#e0805c`, text `#fff`, Quicksand 700 16px, padding 17×26, radius 18, shadow `0 12px 26px rgba(224,128,92,.36)`. Hover bg `#c96a48`. Small variant (nav): height 42, padding 0 18, radius 14, 14px, shadow `0 8px 18px rgba(224,128,92,.30)`.
- **Secondary:** bg `#fff`, border `1.5px #efe7da`, text `#2b2723`. Hover border `#e0805c`.
- **Store buttons** (app section): bg `#2b2723`, text `#faf7f2`, radius 16, padding 11×20, two lines ("Download for" 11px/600 Nunito at 80% opacity; "iPhone" / "Android" 17px Quicksand 700). Hover bg `#443d36`. **Link targets TBD** (App Store / Play Store URLs).
- **Focus:** `:focus-visible { outline:2px solid #e0805c; outline-offset:2px }`. **Selection:** `#f7e6dd`.

### 1. Nav (sticky)
- `position:sticky; top:0; z-index:50`, bg `rgba(250,247,242,.88)` + `backdrop-filter: blur(14px)`, bottom border `1px #efe7da`. Inner padding 12×24, flex, gap 32.
- Left: app icon (34px, see Assets) + "Luggo" (Quicksand 700 22px, -0.3px).
- Links (≥860px only): How it works · Zones · The beacon · Shop · FAQ · Contact. Nunito 600 14.5px `#5f574d`, hover `#e0805c`, gap 26.
- Right: **Cart** button (42px tall, white, border `1.5px #efe7da`, radius 14, bag glyph + "Cart" + coral count badge 20px shown when the cart has items; opens the drawer) and a primary small **Get beacons** button (→ `#shop`).
- Mobile: links hidden. Add a hamburger/sheet in production if wanted; it isn't designed.

### 2. Hero
- Background `radial-gradient(circle at 76% 34%, #fbeee2 0%, #faf7f2 58%)`. Two-column grid (`minmax(min(100%,440px),1fr)`), gap 56, padding 72/96.
- Left column (flex column, gap 22):
  - Pill "Bluetooth beacons for your luggage": bg `#f7e6dd`, text `#b4583a`, Nunito 700 12.5px, radius 14, with a 7px pulsing coral dot.
  - H1 "See your bags come to you." Quicksand 700 `clamp(44px,6.2vw,78px)`/1.02, letter-spacing -1.5px.
  - Paragraph: "Slip a Luggo beacon into your bag. At the belt, your phone shows it moving closer — Far, Medium, Near — so you step up at exactly the right moment."
  - Buttons: primary "Get beacons · from €29" (→ `#shop`) and secondary "See how it works" (→ `#how`).
  - Small line: "Free app for iOS & Android · No account needed" (Nunito 600 13px `#8a8175`).
- Right column: **live phone mock** of the app's Radar screen. Phone 310×650, bezel `#141210`, radius 48, padding 11. Screen radius 38, bg `#faf7f2`. Behind the phone are two 620px coral 2px rings running the `ringPulse` animation (4.2s, the second delayed 2.1s).
  - Screen contents, top to bottom:
    - status bar;
    - "At the belt" / "3 in view" + a LIVE chip;
    - bag chips (Blue duffel / Carry-on / Kids' backpack). Clicking a chip changes the tracked bag. Horizontal scroll with the scrollbar hidden;
    - the **lane**. Gradient `180deg #e7eff5 → #eef0ef 32% → #f6ecdc 62% → #f8e2d6`, radius 26. It has perspective lines, FAR/MEDIUM/NEAR labels, the bags, the in-range banner and the YOU marker;
    - the zone readout card;
    - the tab bar (Bags / Radar (active) / Shop / Settings).
  - This is a faithful mini version of the app's Radar screen. See the app handoff (`design_handoff_luggo_app/README.md`, section 3) for the exact lane math: `top% = 10 + (1-p)*62`, `scale = (0.5 + (1-p)*0.72) × (selected?1:0.78)`, glow opacity `(0.18+(1-p)*0.62)*0.5`, zone thresholds Far >0.62, Medium >0.30, Near >0.06, else Here.
  - **Motion must be calm.** Progress `p` moves 1→0→1 at `0.0014 × speed` per frame (60fps), multiplied by an ease factor `0.35 + 0.65·sin(π·clamp(p,0.02,1))`. Then it dwells 180 frames at the belt (p=0) and 120 frames at the far end (p=1). The non-selected bags are phase-offset copies: `reflect(p + 0.42 + i*0.5)`. Run this in its own component (requestAnimationFrame + `useState`) so the rest of the page doesn't re-render every frame. Notify the parent only when the zone changes, so the readout card and the in-range banner update. Respect `prefers-reduced-motion` by showing a static Near state.

### 3. How it works (`#how`)
- Kicker "HOW IT WORKS", H2 "From your pocket to the belt in three steps."
- 3 cards (grid `minmax(280px,1fr)`, gap 20). Each card: bg `#fff`, radius 26, padding 28, shadow `0 10px 30px rgba(120,90,50,.08)`. Inside: a 170px art circle (`radial-gradient(circle,#fff,#f4ece0)`, inset ring `#f0e4d4`), then the step number (Quicksand 700 13px coral), title (Quicksand 700 23px) and copy (Nunito 500 15.5px/1.55).
  1. **01 Pair in seconds**: "Hold a Luggo beacon against the back of your phone. The app finds it automatically — name it, pick the bag type, done." Art: beacon glyph with two pulsing rings.
  2. **02 Tuck it in your bag**: "Slim enough for any pocket, lining or tag sleeve. Check the bag as usual — the beacon quietly rides along." Art: two mini bags (coral and blue outlines), the coral one with a dot.
  3. **03 Watch it come to you**: "At the belt, open Luggo. Each bag moves closer on screen, and you get a nudge the moment it's in range." Art: a floating bag, three zone dots (coral/amber/grey) and a phone.

### 4. Zones: interactive demo (`#zones`)
- White band (`#fff`, top and bottom borders `#f2ebe0`). Kicker "TRY IT", H2 "Four zones. Zero guessing.", lead text: "As a beacon's signal gets stronger, Luggo moves the bag from Far to Medium to Near. Drag the slider to bring the suitcase in."
- **Horizontal lane**: height 240, radius 28, gradient `90deg` using the same stops as the app lane. Vertical perspective lines at 30% / 52% / 74% (heights 46% / 64% / 100%). Labels FAR (#8aa0af), MEDIUM (#bf9a5d) and NEAR (#d0805c) at the top. The YOU phone marker sits at the right edge.
- **Range slider** (0–100, default 30, `accent-color:#e0805c`), labelled "Drag the bag". `p = 1 − v/100`. Suitcase position `left = 7 + (1-p)*72 %`, `scale = 0.72 + (1-p)*0.42`, with a glow in the zone colour. A zone word pill sits to the right of the slider.
- **4 zone cards** (grid `minmax(230px,1fr)`), each clickable to jump the slider to that zone:
  - Far `#7ea6c6`: "On its way" — "Your bag is in the terminal and heading toward you."
  - Medium `#d9a25a`: "Getting closer" — "Your bag is on the belt now, coming your way."
  - Near `#e0805c`: "Almost yours" — "Your bag is just a few steps away — get ready."
  - Here `#e0805c`: "Here it is" — "Your bag reached you. Grab it and go!"
  - Active card: 2px border in the zone colour, bg = zone colour at 10% alpha. Inactive card: bg `#faf7f2`, border `#efe7da`. Transition .25s.

### 5. The beacon (`#beacon`)
- Two columns. Left: a product visual card, min-height 460, radius 32, `linear-gradient(160deg,#fff,#fbf1e9)`, shadow `0 18px 44px rgba(120,90,50,.10)`. It shows three pulsing 300px rings and a floating 170px white tile holding the beacon glyph, with the caption "LUGGO BEACON" bottom-left. **Replace the glyph with real product photography when available**; keep the rings.
- Right: kicker "THE BEACON", H2 "Small enough to forget. Smart enough not to.", lead "A slim Bluetooth tag that tells your phone how close each bag is. Nothing to charge before a trip, nothing to set up at the airport."
- A 2×2 spec grid. Each item is a 20×3 coral mark, a title (Quicksand 700 17px) and copy:
  - **3-year battery**: "Up to 5 years. The app lets you know well before it's time to replace it."
  - **Fits any bag**: "Cabin, suitcase, duffel, backpack or handbag."
  - **Pairs automatically**: "Hold it to your phone. No codes, no sign-up."
  - **Private by design**: "Luggo knows when a bag is near you — never where it is."
- A secondary button "Choose a pack →" links to `#shop`.

### 6. Shop (`#shop`)
- Background `linear-gradient(180deg,#faf7f2,#f6ece0)`. Kicker "SHOP", H2 "Get beacons", lead "One for the carry-on, or one for every bag in the family."
- **Pack cards** (grid `minmax(270px,1fr)`, gap 16). The whole card is clickable to select it. Card: bg `#fff`, radius 26, padding 22×24. Selected: border `2px #e0805c` + shadow `0 14px 30px rgba(224,128,92,.16)`. Unselected: border `2px #efe7da`. A card contains:
  - a radio (20px; selected = `6px solid #e0805c` ring);
  - the label (Quicksand 700 18px);
  - an optional "Most popular" tag (bg `#f7e6dd`, text `#b4583a`, on the 3-pack);
  - a row of N beacon glyphs (40×48, radius 13, sand `#f4ecdf` + 2px coral border + 11px coral dot);
  - the price (Quicksand 700 36px) with a per-unit price ("€25 each") on the right;
  - the note.
  - **Single**: 1 beacon, **€29**, "1 beacon"
  - **Family 3-pack**: 3 beacons, **€75**, "3 beacons · save 14%" (**default selected**)
  - **Traveler 5-pack**: 5 beacons, **€119**, "5 beacons · save 18%"
  - Prices and packs must come from the **database/admin**, not be hard-coded. The prototype shows `$` by default. **Production currency is EUR**, formatted Dutch-style like nije3d (`€ 75,00`), with VAT included.
- **Order bar**: a white card, radius 24, containing:
  - a Quantity stepper (34px sand buttons, qty 1–9);
  - Total (Quicksand 700 28px) = pack price × qty;
  - a primary **Add to cart** button, which adds or merges the line into the cart and opens the drawer.
  - Below the bar: "Arrives in 2–4 days. Pair them in the app when they land." Shipping times come from admin settings.

### 7. App section
- A card with max-width 1180 and margin 96 auto, radius 32, `linear-gradient(160deg,#fff,#fbf1e9)`. H2 "The app is free. No account, ever." Copy: "Luggo runs on iOS and Android. Your bags live on your phone — pair a beacon and you're ready to fly." Two store buttons, and the 150px app icon on the right.

### 8. FAQ (`#faq`)
- Two columns: heading "Questions, answered." on the left, accordion on the right. Each item is a white card, radius 20. The question is Quicksand 700 16.5px. The toggle is a 28px circle with "+", which rotates 45° when open (tint `#f7e6dd` / coral). The answer is Nunito 500 15.5px/1.6. The first item is open by default and only one item is open at a time. **FAQ items must be editable in admin.** Seed content:
  1. Do I need an account? — No. Luggo works without sign-up — your bags are stored on your phone. Download the app, pair a beacon and go.
  2. Can Luggo show where my bag is? — No, and that's on purpose. Beacons tell your phone how close a bag is — Far, Medium or Near — and when it was last in range. They never share a location.
  3. How long does the battery last? — Around 3 years of typical use, and up to 5. The app warns you when a beacon runs low, so you can swap the battery before your next trip.
  4. What's the range? — Luggo uses Bluetooth, so it comes alive when your bag is in the same hall as you — exactly where you need it: at the belt.
  5. Does it work with any bag? — Yes. The beacon is slim enough for a pocket, a lining or a tag sleeve. In the app you pick the type — cabin, suitcase, duffel, backpack or handbag.
  6. How do I pair a beacon? — Open Luggo, tap "Pair a new bag" and hold the beacon against the back of your phone. It's found automatically.

### 9. Contact (`#contact`)
- White band. Kicker "CONTACT", H2 "Get in touch.", lead "Questions about an order, a beacon or the app? Give us a call or drop us a line."
- Two info cards (bg `#faf7f2`, border `#efe7da`, radius 22, padding 22):
  - COMPANY: Luggo by The RO Brand · Fokkerstraat 12 · 3833 LD Leusden · The Netherlands.
  - PHONE: `+31 6 45438943` as a `tel:` link. REGISTRATION: KvK 58083111 · VAT NL852865867B01.
- **Open:** no contact email was provided. Add one (plus an optional contact form, which could reuse nije3d's) once the owner supplies it.

### 10. Footer
- Top border `#efe7da`. Icon (40px) + "Luggo" + "See your bags come to you". Links: How it works · The beacon · Shop · FAQ · Contact · **Privacy statement** (→ `/privacy`).
- Legal line, separated by a `#f2ebe0` rule, Nunito 500 13px `#6e6559`: "© 2026 Luggo by The RO Brand · Fokkerstraat 12, 3833 LD Leusden, The Netherlands · +31 6 45438943 · KvK 58083111 · VAT NL852865867B01".
- Suggested additions, following nije3d: payment-method line (iDEAL · Bancontact · Card · PayPal) and a Track order link.

### 11. Cart drawer
- Fixed overlay, z-index 100. Backdrop `rgba(43,39,35,.32)`; clicking it closes the drawer. Panel on the right, `width:min(420px,100%)`, bg `#faf7f2`, shadow `-20px 0 50px rgba(60,45,25,.18)`, slide-in animation `drawerIn` (.3s, `cubic-bezier(.2,.8,.3,1)`, translateX 40px → 0). Header "Your cart" + a 38px close button.
- **Empty state:** dashed sand placeholder, "Your cart is empty", "Pick a pack to get started.", primary "Choose a pack", which closes the drawer and scrolls to `#shop`.
- **Filled state:** one white card per line, radius 20. A line shows a beacon tile, the pack label and note, a −/qty/+ stepper (1–9), a remove × (bg `#f7e6dd`, `#d9694a`) and the line price. The footer shows "Beacons" (total unit count), "Subtotal" (Quicksand 700 26px), a primary **Checkout** button and "Shipping calculated at checkout".
- **Order placed state** (use on `/order/[number]`): 88px green circle (`#eef4ee`) with a `#7bb58a` check, "Order placed", "{N} Luggo beacons on the way — arrives in 2–4 days. Download the app so you're ready to pair." and a Done button.
- Production: persist the cart (cookie or localStorage, the way nije3d does it). Checkout goes to `/checkout`. Prices are always re-validated on the server.

### 12. Privacy statement (`/privacy`)
- Same nav, but the right-hand button is "← Back to Luggo". Layout is flex-wrap: an intro column (kicker "LEGAL", H1 `clamp(36px,4.6vw,56px)`, intro, "Last updated 30 September 2026") and a column of 8 white section cards (radius 24, padding 26×28). The heading is **not** sticky.
- Sections: 1 Who we are · 2 The app: no account, no location · 3 Orders from our shop · 4 Who we share data with · 5 How long we keep it (7 years for tax records) · 6 Website & cookies (functional only) · 7 Your rights (GDPR, Autoriteit Persoonsgegevens) · 8 Changes & contact. The full copy is in the file.
- **Store the content in the CMS** so it can be edited. **The copy is a draft that has not had legal review.** Before launch, confirm with the owner the payment/shipping/hosting processors, the retention period, the cookie usage (including any analytics nije3d uses) and the response time.

## Pages to build that are not designed
Style all of these with the tokens and components above, and follow nije3d's flow.
- **Checkout** (`/checkout`), a single page:
  - contact (email, phone optional);
  - shipping address (NL/BE/EU country list);
  - shipping method + cost;
  - order summary;
  - pay button → redirect to the PSP (iDEAL / Bancontact / card / PayPal).
  - Validate inputs; show errors inline under fields in `#d9694a`.
- **Order confirmation** (`/order/[number]`): uses the PSP return URL. Show status pending / paid / failed; the paid state reuses the "Order placed" design.
- **Track order** (`/track`): input for the order number (`LUG-1234`) + email. Show a status timeline (Paid → Packed → Shipped (carrier + tracking link) → Delivered).
- **Transactional emails**, cloned from nije3d's templates with Luggo branding: order confirmation, shipped (with tracking), and optionally a "pair your beacons" tip after delivery.

## Backend / admin (follow the nije3d approach)
Reuse nije3d's admin (auth, layout, order views) if the codebase is available; otherwise build a protected `/admin` area.

**Content management**
- Site settings: announcement text, shipping times, shipping costs, store links, contact details, social links, SEO title/description/OG image.
- Editable homepage copy blocks (hero, how-it-works steps, beacon specs), FAQ items (sortable), and CMS pages (Privacy, Shipping & returns).
- Media uploads, served as responsive webp like nije3d's `/media/*-{900,1600}.webp`. Needed for the product photos that will replace the beacon glyph.

**Products**
- `luggo_products`: id, slug, name ("Family 3-pack"), units (beacons per pack), price_cents (EUR, incl. VAT), compare/savings note, badge ("Most popular"), sort, active, stock (in beacons or packs, decide with the owner).

**Orders**
- `luggo_orders`: id, number (`LUG-####`), email, phone, shipping address fields, country, subtotal_cents, shipping_cents, vat_cents, total_cents, currency `EUR`, status (`pending_payment | paid | packed | shipped | delivered | cancelled | refunded`), psp_payment_id, carrier, tracking_code, notes, timestamps.
- `luggo_order_items`: order_id, product_id, name snapshot, units, qty, unit_price_cents.
- `luggo_order_events`: status history, used for the tracking timeline and the audit log.
- Payment flow: create the order as `pending_payment`, create the PSP payment, then use the **PSP webhook** as the source of truth to mark the order `paid`. Make the webhook idempotent. Send the confirmation email on `paid`.
- Admin order views: list with filters by status and date, order detail, status changes (sending an email on shipped), tracking code entry, packing slip / label print, CSV export, and refunds via the PSP.
- VAT: Dutch 21% included in prices, with VAT shown on invoices. Reuse nije3d's invoice/VAT handling if it exists.

**Optional**
- Newsletter signup (nije3d has one), consent-based.

## Interactions & behaviour (summary)
- Smooth anchor scrolling, with `scroll-margin-top:66px` to clear the sticky nav.
- Nav links hidden below 860px.
- Hero phone: chip click changes the tracked bag; animation loop as specified above; the in-range banner (`bannerIn` .45s) appears in the Near and Here zones.
- Zones slider + clickable zone cards.
- Pack select, quantity 1–9, live total, and Add to cart (merges the same pack, caps quantity at 9).
- Cart drawer: quantity edit, remove, empty state, checkout.
- FAQ accordion: one item open at a time.
- **Animations** (CSS keyframes):
  - `ringPulse`: translate(-50%,-50%) scale .42→1.55, opacity .5→0; use `fill-mode: both` on staggered rings;
  - `softFloat`: 0→-6px→0;
  - `dotPulse`: opacity and scale .7;
  - `bannerIn`;
  - `fadeUp`: 10px, .3–.4s;
  - `drawerIn`.
  - Honour `prefers-reduced-motion`.

## Animation spec (implement exactly)
The site has **two JS-driven animations** (the hero radar lane and the zones slider) and a set of **CSS keyframe loops**. Everything below is taken from the prototype source.

### A. CSS keyframes (copy verbatim)
```css
@keyframes ringPulse { 0% { transform: translate(-50%,-50%) scale(.42); opacity:.5 } 100% { transform: translate(-50%,-50%) scale(1.55); opacity:0 } }
@keyframes softFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
@keyframes dotPulse  { 0%,100% { opacity:1; transform: scale(1) } 50% { opacity:.4; transform: scale(.7) } }
@keyframes bannerIn  { from { transform: translate(-50%,-16px); opacity:0 } to { transform: translate(-50%,0); opacity:1 } }
@keyframes fadeUp    { from { transform: translateY(10px); opacity:0 } to { transform: translateY(0); opacity:1 } }
@keyframes drawerIn  { from { transform: translateX(40px); opacity:0 } to { transform: translateX(0); opacity:1 } }
```
A ring element is `position:absolute; left:50%; top:50%; border-radius:50%; border:2px solid #e0805c; pointer-events:none`. Its **base size is the size at scale 1**, and the keyframe does the centring, so don't add another translate. Always set `animation-fill-mode: both`, so rings with a delay start centred and invisible instead of flashing at full size.

| Where | Element | Animation |
|---|---|---|
| Hero, behind phone | 2 rings, 620px | `ringPulse 4.2s ease-out infinite both`; the 2nd ring has `animation-delay: 2.1s` |
| Hero pill + phone LIVE chip | 7px coral dot | `dotPulse 1.4s infinite` |
| Phone in-range banner | whole pill | `bannerIn .45s ease` on mount; its 8px dot runs `dotPulse 1.2s infinite` |
| How it works, card 01 | 2 rings, 120px, inside the 170px art circle (`overflow:hidden`) | `ringPulse 2.6s ease-out infinite both`; 2nd ring delay `1.3s` |
| How it works, card 03 | small bag glyph | `softFloat 3s ease-in-out infinite` |
| Beacon section | 3 rings, 300px | `ringPulse 3s ease-out infinite both`; delays `0s / 1s / 2s` |
| Beacon section | 170px white product tile | `softFloat 3.6s ease-in-out infinite` |
| FAQ answer | answer text | `fadeUp .3s ease` on open; the "+" icon rotates `0 → 45deg`, `transition: transform .2s, background .2s` |
| Cart drawer | backdrop / panel | backdrop `fadeUp .2s ease`; panel `drawerIn .3s cubic-bezier(.2,.8,.3,1)` |
| Order placed | content block | `fadeUp .4s ease` |
| Pack cards | selected state | `transition: border-color .2s, box-shadow .2s` |
| Zone cards | active state | `transition: background .25s, border-color .25s` |

### B. Hero radar lane (JS, requestAnimationFrame)
What it shows: three bags drifting along a vertical "corridor". Top = far, bottom = the YOU marker. The **selected** bag travels down the centre toward YOU, pauses there, then drifts back. The other two bags move in their own side lanes, out of phase. See `02-hero-phone-radar.png`.

**State (per lane instance, kept in a ref, not in React state):** `p` (1 = far, 0 = arrived), `dir` (−1 approaching / +1 receding), `hold` (frames left to dwell), `zoneKey`.

**Tick (every animation frame, frame-based at ~60fps; for frame-rate independence multiply by `dt/16.67`):**
```js
const SPEED = 1;                // admin/tweak multiplier, default 1
if (hold > 0) { hold -= SPEED; }
else {
  const ease = 0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, Math.max(0.02, p))); // slows near both ends
  p += dir * 0.0014 * SPEED * ease;
  if (p <= 0) { p = 0; dir = +1; hold = 180; }   // dwell ~3s at the belt
  if (p >= 1) { p = 1; dir = -1; hold = 120; }   // dwell ~2s far away
}
```
One full approach takes about 17s. **Keep it calm.** The owner explicitly asked for slower movement than the first version, so don't speed it up.

**Per-bag progress:**
```js
const reflect = x => { const m = ((x % 2) + 2) % 2; return m > 1 ? 2 - m : m; }; // ping-pong 0..1
bagP = isSelected ? p : reflect(p + 0.42 + index * 0.5);
```

**Per-bag layout (absolute inside the lane, `transform-origin:center`):**
- `left`: selected `50%`; the others take side lanes in order `26%, 72%, 38%, 64%`. Animate a lane change with `transition: left .4s ease`.
- `top = 10 + (1 − bagP) * 62` (%).
- `transform: translate(-50%,-50%) scale(S)`, where `S = (0.5 + (1 − bagP) * 0.72) × (selected ? 1 : 0.78)`.
- `z-index`: selected 4, others 2. Opacity: selected 1, others 0.9.
- **Glow** behind each bag: a 200px circle, `radial-gradient(circle, ZONE 0%, ZONE00 66%)`, `filter: blur(3px)`, `opacity = (0.18 + (1 − bagP) * 0.62) * 0.5 * (selected ? 1 : 0.62)`.
- **Colour**: the bag outline, glow and (for the selected bag) the name pill text take the colour of that bag's current zone: Far `#7ea6c6`, Medium `#d9a25a`, Near/Here `#e0805c`. Non-selected name pills are `#8a8175`.
- Bag glyph: 46×46 units × 1.45, `filter: drop-shadow(0 10px 12px rgba(120,90,50,.22))`. Name pill below it: white, border `#efe7da`, radius 11, padding 3×9, Nunito 700 10px.

**Zones** (from `p` of the selected bag): Far `p > .62` · Medium `p > .30` · Near `p > .06` · Here otherwise.
- The readout card shows title / copy / word pill (pill = zone colour text on zone colour at `22` hex alpha).
  - Far: "On its way" — "{bag} is in the terminal and heading toward you."
  - Medium: "Getting closer" — "{bag} is on the belt now, coming your way."
  - Near: "Almost yours" — "{bag} is just a few steps away — get ready."
  - Here: "Here it is" — "{bag} reached you. Grab it and go!"
- **In-range banner** "{bag} is in range" mounts (with `bannerIn`) whenever the zone is Near or Here, and unmounts otherwise.
- **Performance:** render the lane in its own component. Only emit an `onZoneChange(key)` event to the parent when the zone key changes, so the rest of the page never re-renders per frame. Cancel the RAF on unmount. Pause the loop when the hero is off-screen (IntersectionObserver) or the tab is hidden.
- **Chips:** clicking a chip sets `selectedId`. That bag moves to the centre lane (the `left` transition), and the loop keeps the same `p`.
- **Known polish item:** at `p≈0` the selected bag's name pill overlaps the YOU phone marker. Clamp the selected bag's `top` to at most ~68%, or hide the pill in the Here zone.
- **Reduced motion** (`prefers-reduced-motion: reduce`): don't run the loop. Render a static frame with the selected bag at `p = 0.18` (Near, banner visible) and the others at their offset values. Also stop the ring and float loops (`animation: none`), keeping the rings hidden.

### C. Zones slider (input-driven, no loop)
- `<input type=range min=0 max=100 value=30>`, where `p = 1 − value/100`. The update is instant, with no easing; the slider itself is the animation.
- Suitcase wrapper: `position:absolute; top:54%; left: (7 + (1 − p) * 72)%; transform: translate(-50%,-50%) scale(0.72 + (1 − p) * 0.42)`.
- Its glow is a 220px radial in the zone colour, opacity `(0.18 + (1 − p) * 0.62) * 0.5`. The glyph is the suitcase at 1.5× in the zone colour. Label "Your suitcase".
- Zone pill next to the slider: text colour Far `#4f7797`, Medium `#a8772f`, Near/Here `#c05f3c`, on the zone colour at `26` hex alpha.
- Clicking a zone card sets the slider to that zone's representative value: Far `20`, Medium `55`, Near `82`, Here `100` (from `p` = .8 / .45 / .18 / 0).

## Design tokens
**Fonts** (Google Fonts, self-host in production): **Quicksand** 500/600/700 for headings, prices and buttons; **Nunito** 400–700 for body, labels and chips.

**Colours**
- Page `#faf7f2`; surface `#ffffff`; sand tile `#f4ecdf`; sand hover `#efe2cf`; peach card gradient `#fff → #fbf1e9`; shop band `#faf7f2 → #f6ece0`; hero glow `#fbeee2`.
- Ink `#2b2723`; body copy `#6e6559`; nav links `#5f574d`; muted labels `#8a8175`.
- Borders `#efe7da`, `#f2ebe0`, `#f0e4d6`; dashed `#ddd2bf`.
- Coral (brand/primary) `#e0805c`, hover/pressed `#c96a48`; coral text on tint `#b4583a`; tint `#f7e6dd`; app-icon gradient `#e8895f → #d3663f`; seam `#eaa082`.
- Zones: blue `#7ea6c6` (label `#8aa0af`, text `#4f7797`); amber `#d9a25a` (label `#bf9a5d`, text `#a8772f`); coral `#e0805c` (text `#c05f3c`).
- Success: `#7bb58a` on `#eef4ee`. Destructive: `#d9694a`.
- Dark: phone bezel `#141210`; store buttons `#2b2723` (hover `#443d36`).

**Radius:** chips/tags 12–14 · buttons 14–18 · cards 20–26 · feature cards 28–32 · phone bezel 48, screen 38 · app icon ≈0.28× size.

**Shadows**
- card `0 6px 18px rgba(120,90,50,.07)`
- raised `0 10px 30px rgba(120,90,50,.08–.10)`
- feature `0 18px 44px rgba(120,90,50,.10)`
- primary button `0 12px 26px rgba(224,128,92,.36)`
- selected pack `0 14px 30px rgba(224,128,92,.16)`
- phone `0 34px 80px rgba(60,45,25,.30), 0 8px 20px rgba(0,0,0,.12)`
- drawer `-20px 0 50px rgba(60,45,25,.18)`

**Type scale:** H1 clamp(44–78) · H2 clamp(32–50) · card title 23 / 19–20 / 17 · lead 17–19 · body 15.5–16 · small 13–14.5 · kicker 12 (+2.5px tracking).

## Assets
- **App icon**: coral squircle (`linear-gradient(150deg,#e8895f,#d3663f)`, radius 28%) with a white suitcase (handle + two `#eaa082` seams) over two white rings (Ø90% at 22% alpha, Ø66% at 40% alpha). In the prototype it's built from CSS; the geometry is in `appIcon()` in `Luggo Website.dc.html`. **Export it as SVG** for the favicon, nav logo and OG image, and use the same asset as the mobile app.
- **Luggage glyphs** (duffel, cabin, backpack, suitcase) and the **beacon glyph** are CSS primitives: see `bagIcon()` and the markup. Replace them with SVGs that keep the same silhouettes.
- **Product photography**: none yet. Add beacon photos via admin media, and use them in the Beacon section and pack cards.
- Store badges: use the official App Store / Google Play badges when the links exist, or keep the designed dark buttons.

## Files
- `Luggo Website.dc.html`: the full marketing page, shop, cart drawer, contact and footer. The logic class holds the pack data, FAQ copy, zone math, animation loop and icon geometry.
- `Luggo Privacy.dc.html`: the privacy statement page.
- `support.js`: design-tool runtime, needed only to open the prototypes locally. Not for production.
- `screenshots/`: static captures at ~924px viewport width, for visual reference. The animated parts are captured mid-motion; the **Animation spec** section is the source of truth for motion.
  - `01-hero.png`: nav + hero copy.
  - `02-hero-phone-radar.png`: the phone radar mid-animation (selected bag in Near, in-range banner shown).
  - `03-how-it-works.png` · `04-zones.png` · `05-beacon.png` · `06-shop.png` · `07-app-faq.png` · `08-contact-footer.png`.
  - `09-cart-drawer.png`: drawer with one line.
  - `10-privacy.png`: privacy statement page.
- Related: the Luggo **app** handoff (`design_handoff_luggo_app/README.md`) documents the app's screens and tokens that this site mirrors.

## Open questions for the owner
1. Access to the nije3d codebase / repo, so its architecture, admin and PSP can be reused.
2. Which existing database and which schema/prefix to use; migration approval.
3. Domain (e.g. luggo.nl / luggo.com), and whether it's the same DigitalOcean project as nije3d.
4. Contact email address.
5. Shipping countries and rates, and whether stock is tracked per beacon or per pack.
6. App Store / Play Store URLs.
7. Legal review of the privacy statement; Terms & Conditions / returns page.
8. Site language(s): currently English only. Add NL?

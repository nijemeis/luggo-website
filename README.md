# Luggo website + beacon shop

Marketing site and beacon shop for **luggo.net**, built from the Claude Design handoff in
`docs/design/`. It follows the nije3d.com architecture: Next.js 16 (App Router),
TypeScript, Prisma + PostgreSQL, Stripe Checkout, Resend, sharp, DigitalOcean App Platform.
Deploying: [docs/deploy-digitalocean.md](docs/deploy-digitalocean.md).

- **Site:** one-page home (hero with the live radar phone, how it works, the zones demo,
  the beacon, shop, app, FAQ, contact), cart drawer, `/cart`, `/checkout`,
  `/order/[number]`, `/track`, `/privacy`, `/shipping`.
- **Admin (`/admin`):** dashboard, orders (filters by status and date, search, CSV export,
  status changes with customer emails, carrier + tracking code, packing slip / invoice,
  Stripe refunds), packs and beacon stock, FAQ (sortable), CMS pages, homepage copy,
  shipping zones, settings (company details, store links, footer, SEO, share image),
  newsletter list.

## Run it locally

```bash
createdb luggo
npm install
npm run setup      # migrations + packs, zones, FAQ, pages
npm run dev        # http://localhost:3020
```

Admin: http://localhost:3020/admin, password `ADMIN_PASSWORD` from `.env`.
`npx tsx --env-file=.env prisma/seed.ts --demo` adds three demo orders (local databases only).

Without Stripe keys the checkout runs in **mock mode**: paying marks the order paid straight
away. Emails are printed to the terminal until `RESEND_API_KEY` is set.

## How it fits together

| | |
| --- | --- |
| Packs | `luggo_products`: name, beacons per pack, price (EUR cents, VAT incl.), note, badge, pre-selected, sort, on sale. Prices always come from the database and are re-checked at checkout. |
| Stock | Counted in **beacons**, shared by all packs (`beacon_stock` counter; no counter = not tracked). Paid orders deduct; cancelling an unshipped order puts beacons back. |
| Orders | `LUG-####`. `pending_payment → paid → packed → shipped → delivered`, plus `cancelled` / `refunded`. Every change is an `OrderEvent` (the tracking timeline and the audit log; internal notes are hidden from customers). |
| Payment | The order is created as `pending_payment`, then Stripe Checkout. The **webhook** marks it paid (idempotent; the return page verifies the session too). The webhook only acts on sessions with `metadata.shop = "luggo"`, so a Stripe account shared with nije3d is fine. |
| Emails | Paid (confirmation), shipped (with carrier tracking link), delivered (“pair your beacons” tips), cancelled, refunded. Optional copy of new orders to `SHOP_NOTIFY_EMAIL`. |
| Content | Homepage copy and settings are one JSON document (`luggo_settings`), merged over the defaults in `src/lib/content.ts`. FAQ and pages have their own tables. |
| Media | Uploads become 400/900/1600 px WebP, served from `/media/<key>-<size>.webp`, stored on disk locally or in a Spaces bucket. |
| Database | All tables sit in the Postgres schema **`luggo`** and carry a `luggo_` prefix, so the shop can share a cluster (or even a database) with other apps. `src/lib/db-url.ts` adds the schema to connection strings that lack it. |

## Environment

See `.env.example`. Same variables as nije3d: `DATABASE_URL` / `DIRECT_DATABASE_URL`,
`ADMIN_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `SHOP_NOTIFY_EMAIL`, `S3_*`.

## Before launch

Placeholders and open questions from the handoff:

- **Contact email:** none yet. Set it under Admin → Settings; the contact card and footer show it once filled in. Replies to order mails go to `EMAIL_FROM`, so that needs a real mailbox (or set a reply-to).
- **Shipping rates:** NL € 4,95, BE € 6,95, rest of EU € 9,95 are placeholders. Confirm carrier and prices under Admin → Shipping.
- **Stock:** not tracked until you enter a number under Admin → Packs & stock.
- **App Store / Play Store links:** Admin → Settings. Until then the buttons say “Coming soon”.
- **Beacon photo:** Admin → Homepage copy → The beacon. Pack photos per pack are optional.
- **Privacy statement and Shipping & returns** are drafts without legal review. Edit under Admin → Pages; confirm processors (Stripe, carrier, DigitalOcean, Resend), retention and response time.
- **Share image:** `public/og.png` is provisional (system font); upload a designed one in Settings, or rerun `npm run icons` after changing it.
- **VAT:** prices include 21 % Dutch VAT; the VAT amount is stored per order and printed on the packing slip / invoice. Check EU OSS once sales abroad grow.

## Scripts

| Command | |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js (dev on port 3020) |
| `npm run setup` | generate client, migrate, seed |
| `npm run db:migrate` | create a migration after editing `schema.prisma` |
| `npm run start:prod` | what App Platform runs: migrate, base seed, start |
| `npm run icons` | regenerate favicon, app icons and `og.png` from the icon geometry |
| `npm run typecheck` | `tsc --noEmit` |

## Layout

```
prisma/schema.prisma      data model (schema luggo, luggo_ tables)
prisma/seed.ts            packs, zones, FAQ, privacy + shipping pages
src/app/(site)/           storefront routes
src/app/admin/            admin (protected by src/proxy.ts)
src/app/actions/          checkout, newsletter
src/app/api/stripe/       webhook
src/components/home/      hero phone (radar animation), zones demo, shop, FAQ
src/components/glyphs.tsx app icon, bag and beacon glyphs as SVG
src/lib/                  db, content, catalog, orders, order emails, shipping, storage, images
docs/design/              the original handoff
```

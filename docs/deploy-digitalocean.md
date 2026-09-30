# Deploying Luggo to DigitalOcean

Same setup as nije3d: **App Platform** in **Toronto (tor1)**, next to the shared managed
Postgres cluster, with its own **Spaces** bucket in the same region.

Steps marked **YOU** need your DO account, Stripe, Resend or DNS.

## 1. Push the code — YOU + me

Create an empty **private** GitHub repo `nijemeis/luggo-website`. If you pick another
name, change `repo:` in `.do/app.yaml`.

## 2. Database on the existing cluster — YOU

DO → **Databases → the cluster → Users & Databases → Add database** named `luggo`, and a
**connection pool** `luggo-pool` on it (transaction mode, size 5–10).

The tables live in the Postgres schema `luggo` and are prefixed `luggo_`, so nothing can
collide with nije3d or Dealiteful. The first deploy creates them (`prisma migrate deploy`).

## 3. Spaces bucket — YOU

**Spaces → Create** in `tor1`, named `luggo-files`, **private**. The existing Spaces key pair works.

## 4. Create the app — YOU

**Apps → Create App**, paste `.do/app.yaml` into the spec editor, set `cluster_name:`, then
fill the secrets:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | the `luggo-pool` URI + `&pgbouncer=true&connection_limit=5` |
| `DIRECT_DATABASE_URL` | injected from the attached database |
| `ADMIN_PASSWORD` | a strong password |
| `AUTH_SECRET` | `openssl rand -hex 32` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Spaces key pair |

Add the app to the cluster's **Trusted Sources**. Never scope `NODE_ENV=production` to
build time (npm would skip devDependencies and the build fails).

## 5. First deploy

`npm run start:prod` migrates, seeds packs / zones / FAQ / pages if missing, and starts.

```bash
curl https://<app>.ondigitalocean.app/api/health
# {"ok":true,"storage":"spaces","payments":"mock"}
```

## 6. Domain, payments, email — YOU

- **Domain:** Apps → Settings → Domains → `luggo.net` and `www.luggo.net`. luggo.net is
  registered at TransIP: add the records DO shows there. Keep `NEXT_PUBLIC_SITE_URL=https://luggo.net`.
- **Stripe:** enable iDEAL, Bancontact, cards and PayPal. Webhook
  `https://luggo.net/api/stripe/webhook` with `checkout.session.completed`,
  `checkout.session.async_payment_succeeded`, `checkout.session.expired`,
  `payment_intent.payment_failed`, `charge.refunded`. Set both Stripe secrets. The same
  Stripe account as nije3d is fine: each shop's webhook ignores the other's sessions.
- **Resend:** verify `luggo.net`, set `RESEND_API_KEY`, `EMAIL_FROM` and `SHOP_NOTIFY_EMAIL`.

Until Stripe is set, the health check says `"payments":"mock"` and the checkout refuses
orders in production.

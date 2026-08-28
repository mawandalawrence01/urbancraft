# UrbanCraft Furniture Workshop

A mobile-first e-commerce platform for a Kampala furniture workshop: a 243-piece catalogue,
mobile-money checkout, order tracking, and an admin back office.

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma 7 and Neon Postgres.

---

## Running it locally

```bash
npm install
cp .env.example .env          # then fill in the values below
npm run db:migrate            # apply the schema
npm run db:seed               # load the catalogue, projects and admin user
npm run dev
```

The site runs at `http://localhost:3000`, the back office at `/admin`.

Seeded admin credentials are `admin@urbancraft.co.ug` / `urbancraft2026`.
**Change these before going live** — set `ADMIN_EMAIL` and `ADMIN_PASSWORD` and re-run the seed,
or update the row in the `AdminUser` table.

---

## Environment variables

| Variable | Required | What it does |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon **pooled** connection string. Used at runtime. |
| `DIRECT_URL` | yes | Neon **direct** (non-pooled) string. Used only for migrations — PgBouncer cannot run DDL. |
| `AUTH_SECRET` | yes | Signs admin session cookies. Generate with `openssl rand -base64 32`. |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin, feeding `sitemap.xml`, `robots.txt`, canonicals, Open Graph tags and the Yo! callback URLs. A missing scheme or trailing slash is normalised, and on Vercel it falls back to the deployment URL — so set it once you have a custom domain. |
| `YO_API_USERNAME` / `YO_API_PASSWORD` | for mobile money | Yo! Payments API credentials. Without them the mobile money option is disabled at checkout and the other methods still work. |
| `YO_API_URL` | no | Defaults to the sandbox. Production: `https://paymentsapi1.yo.co.ug/ybs/task.php`. |
| `YO_PUBLIC_KEY` | for mobile money | Yo!'s RSA public key (PEM, `\n` escaped). **Callbacks are rejected without it** — an unverified notification is never allowed to mark an order paid. |
| `BLOB_READ_WRITE_TOKEN` | for image uploads | Vercel Blob token. Without it the admin shows a notice instead of the upload button. |
| `DB_POOL_MAX` | no | Per-process pool ceiling, default 4. `next build` forks a worker per CPU and each opens its own pool. |

---

## Deploying to Vercel

1. Push the repository and import it into Vercel.
2. Add every variable above under **Settings → Environment Variables**.
3. Set `NEXT_PUBLIC_SITE_URL` to the real domain once you have one. Until then the deploy uses
   Vercel's own URL, so this is not required for the first deploy.
4. Deploy. The build runs `prisma generate && next build`, so the Prisma client is generated
   from the schema on every deploy. Migrations do **not** run automatically:

   ```bash
   npm run db:migrate        # against production DATABASE_URL/DIRECT_URL
   ```

5. In the Yo! Payments dashboard, whitelist your server IP and point the IPN URL at
   `https://your-domain/api/payments/yo/ipn`. The failure callback is
   `/api/payments/yo/failure`.

---

## How payment works

Three methods, all live at checkout:

- **Mobile money (MTN / Airtel)** — `acdepositfunds` in *pull* mode. The customer gets an
  on-screen prompt and approves with their PIN. Requests are non-blocking; we store the
  transaction reference and settle through the IPN webhook, with
  `actransactioncheckstatus` polling as a fallback if the callback is slow or lost.
- **Cash on delivery** — the order is confirmed and payment collected by the driver.
- **Bank deposit** — account details are shown with the order number as the reference, and an
  admin marks it paid from the order screen.

Prices are never trusted from the browser. The cart sends product ids and quantities only;
`lib/orders.ts` re-prices everything from the database before an order is written.

IPN handling is idempotent — duplicate notifications are matched on
`(network_ref, msisdn)` as the Yo! spec requires — and always answers `200`, otherwise Yo!
retries forever.

---

## The catalogue data

The 243 products, their prices and their photographs were extracted from an existing Ugandan
furniture site (`buyfurniture.co.ug`) as source material. The pipeline lives in `scripts/`:

| Script | What it does |
| --- | --- |
| `scripts/optimize-images.mjs` | Resizes to WebP and generates inline blur placeholders. |
| `scripts/build-projects.mjs` | Converts the old site's project photography. |
| `scripts/curate.mts` | Applies the manual image audit (see below). |
| `scripts/contact-sheet.mts`, `scripts/audit-sheets.mts` | Build contact sheets for reviewing imagery in bulk. |
| `scripts/fix-content.mts` | Tidies punctuation artefacts carried over from the scraped copy. |
| `scripts/db-check.mts` | Prints the tables Prisma can see — quick connectivity check. |
| `scripts/build-icons.mjs` | Regenerates `favicon.ico`, `apple-icon.png` and the manifest icons from `app/icon.svg`. Run it after changing the mark. |

### ⚠️ Photography needs replacing

**30 of the imported photographs visibly carry another company's watermark or a burnt-in price
badge.** They are flagged in the database (`ProductImage.needsReview`) and listed in the admin
under **Image review**, where they can be replaced one by one.

They are never used for the home page hero or category artwork, and they sort to the back of
each product's gallery — but **22 products have no other photograph**, so those still show a
watermarked image on the storefront today.

These photographs also belong to another business. Replacing them with your own is both a
quality and a rights matter, and it is the main outstanding task before launch. A phone camera
in good daylight is enough.

Fourteen scraped placeholder graphics (a stock "support" icon) were deleted outright.

---

## Project layout

```
app/
  (storefront)/       public site — header, footer and mobile tab bar
  admin/
    login/            outside the protected layout, or it would redirect to itself
    (protected)/      everything behind the session check
  api/                search, Yo! IPN, failure callback, payment status polling
components/           brand, ui, layout, product, cart, admin
lib/
  db.ts               Prisma client + retry for Neon's recycled sockets
  catalog.ts          product and category queries
  orders.ts           cart re-pricing and order creation
  yo.ts               Yo! Payments client, XML + RSA signature verification
  actions/            server actions, kept out of the route tree so imports are stable
prisma/               schema, migrations, seed
scripts/              data pipeline and end-to-end tests
```

---

## Testing

```bash
npm run typecheck     # tsc --noEmit
npm run build         # full production build
npm run test:e2e      # Playwright: checkout, admin walkthrough, asset check
```

The end-to-end tests drive the system Chrome against a running server, so start
`npm run dev` (or `npm run start`) first.

- `e2e-checkout.mts` adds two products, checks out, and asserts the order total matches the
  cart and that the cart is emptied afterwards.
- `e2e-admin.mts` verifies the admin gate redirects when signed out, then walks every section
  looking for HTTP and JavaScript errors.
- `check-assets.mts` loads the main pages and fails if anything 404s — this catches a nav link
  pointing at a route that does not exist, and stale CSS chunks from a dirty build.

---

## Notes for whoever picks this up next

- **Neon suspends idle compute.** Connections handed out from the pool can already be dead, so
  `lib/db.ts` wraps every query in a retry for transport-level errors. Don't remove it —
  without it roughly 7% of queries fail under a burst, and the production build stampedes.
- **Category, shop and search pages read `searchParams`,** so they render per request rather
  than prerendering. Product and project pages are statically generated.
- **`lib/site.ts` is the only place the site origin is derived.** It normalises a missing
  scheme or trailing slash, because `new URL()` throws on a bare hostname and that kills the
  build during metadata collection rather than at runtime.
- **Run a clean build before deploying** (`rm -rf .next && npm run build`). Rebuilding over a
  dirty `.next` can leave prerendered HTML pointing at a CSS chunk that no longer exists.
- **Quality classes** (Economy / Standard / Top Class) are how this workshop genuinely prices
  work. Seven products carry real tier pricing from the source data; the rest show Standard
  pricing with the other classes quoted on request. Add tiers per product in the admin as they
  are confirmed.

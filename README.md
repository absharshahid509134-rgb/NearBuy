# NearBuy

**What you need, already nearby.** One website for the people who make neighbourhood commerce work: customers, local sellers and delivery partners.

## Try the unified website

```bash
npm ci
npm run dev            # http://localhost:5173 — interactive preview, no database needed
npm run build          # typecheck + production Vite build
npm run test:portals   # 10 API/role tests, including checkout → seller → rider
```

Open `/` and choose **Customer**, **Seller Hub** or **Rider Hub**. Each has its own sign-in and workspace:

| Portal | Sign in | Your pages |
| --- | --- | --- |
| Customer | `/login/customer` — email/password or phone code | `/customer`, `/search`, `/nearby`, `/stores`, `/cart`, `/orders`, `/account`, etc. |
| Seller Hub | `/login/seller` — business email/password | `/seller`, `/seller/orders`, `/seller/inventory`, `/seller/growth`, `/seller/account`, `/seller/onboarding` |
| Rider Hub | `/login/rider` — email/password | `/rider`, `/rider/jobs`, `/rider/earnings`, `/rider/profile` |

The sign-in tab **does not grant a role**. The server assigns the account role; each route checks the restored session, and signing in through the wrong portal signs that session out and points to the correct sign-in. A customer cannot open seller/rider pages, a seller cannot open customer/rider pages, and a rider cannot open customer/seller pages. Internal staff roles without a matching workspace see an access message instead of being treated as customers or sellers. The existing admin console at `/admin` is still restricted to administrative accounts; it is not a public fourth portal.

### Preview accounts

In the default development preview, choose a portal and click **Fill demo details** (then **Sign in**) or use:

| Portal | Email | Password |
| --- | --- | --- |
| Customer | `customer@nearbuy.dev` | `Customer@123` |
| Seller | `seller.sports@nearbuy.dev` | `Seller@123` |
| Rider | `delivery@nearbuy.dev` | `Delivery@123` |

Customer sign-in can also use a phone code; the preview displays the code instead of sending an SMS. Try joining as a new seller to set up a store, or as a rider to start with an empty earnings history. The two preloaded rider jobs show example codes in Rider Hub; **new orders require real handoffs**: the seller sees the pickup code in their Orders page after marking a parcel packed, and the customer sees the delivery code in their order details once the rider picks it up. Never give the customer code to the store or rider before the doorstep handoff.

**Try the connected loop:** sign in as the customer, add a product from **ABC Sports** (`/product/p1?store=s1`) and place a local delivery order. Sign in as the seller and accept → prepare → pack → mark it ready. Sign in as the rider, accept the matching job and visit the store. Ask the seller for the pickup code, then ask the customer for the drop-off code. Reopen Orders in each workspace (or use **Refresh**) to see the status update. Reserve & Pickup and customer shelf-check requests also reach the seller’s Orders and Inventory pages, respectively. Each store in a multi-store cart receives a separate order and delivery fee. No real payment is taken in preview.

Preview accounts, stock, orders and jobs live **only in development server memory** and reset on restart; don't use the preview API in production. The storefront’s catalog and older sample order history are illustrative. New seller registrations have their own store workspace but are not automatically listed in the seeded customer catalog; ABC Sports (`s1`) is the store connected to the supplied seller account.

### Using the real API instead

Set `NEARBUY_DEMO_AUTH=0` when starting Vite. Requests to the relative `/api/v1` path are then proxied to the existing NestJS gateway on `API_URL` (default `http://127.0.0.1:4000`); browser code never connects to localhost directly. The gateway uses PostgreSQL and the Prisma client. For local full-stack development:

```bash
npm run dev:db                         # separate terminal: embedded PostgreSQL
set -a; source .env.development; set +a
npm run db:migrate
npm run prisma:generate --workspace @nearbuy/database   # requires Prisma engines or an engine-free local setup
npm run db:seed
npm run dev:gateway                    # separate terminal
NEARBUY_DEMO_AUTH=0 npm run dev       # separate terminal
```

The database scripts require `DATABASE_URL` exported in the shell. If your environment cannot download Prisma engines, the **preview still works** without this full-stack setup. Production should serve `/api/v1` from the gateway on the same origin (and should not use the in-memory preview middleware). The Vite production build does not include the preview API. The customer marketplace still uses seeded catalog IDs; before connecting it to a production catalog and payments, replace those IDs with live store/product/inventory records. Do not treat a static build alone as an order-taking deployment.

## What works today

- **Customer:** product search and discovery, nearby stores, comparisons, account-scoped cart/wishlist, and customer-owned API orders, reservations and stock-check requests in preview. Browsing uses a seeded local catalog; older sample orders remain illustrative. New purchase statuses refresh from the API, not from another account’s browser storage.
- **Seller:** store-specific overview, orders/reservation progression, shelf-check responses, inventory updates, insights, onboarding and an account page with store availability and mobile sign-out. ABC Sports inventory/prices match its seeded storefront listings.
- **Rider:** available/active jobs, accept and advance through pickup and drop-off with role-specific handoff codes, online/offline availability, earnings and profile. A rider cannot collect an order before its seller marks it ready.
- **Security:** server-side role checks for public registration and every portal, seller ownership checks (including private stock requests), atomic job claiming, rider ownership, hidden customer addresses until assignment, and separate pickup/customer handoff secrets. Access and refresh credentials use first-party cookies rather than localStorage in the unified site.

The repository also contains older standalone Next.js apps (`apps/web`, `apps/seller`, `apps/admin`) and the modular NestJS gateway in `backend` / `packages/server-core`. The **root Vite app** (`npm run dev` / `npm run build`) is the unified three-portal website. See `docs/ARCHITECTURE.md` for the wider platform roadmap.

# NEARBUY

### **What You Need, Already Nearby.**

**Search Online • Find Nearby • Reserve • Pickup • Deliver**

NearBuy is a **Local Commerce Operating System** — a search-and-fulfillment layer connecting
digital demand with physical inventory at neighbourhood shops, local makers and online sellers.

> **Every product should have a “Where can I get this fastest, cheapest, or nearest?” answer.**

---

## What's in this repo

A full working prototype of the NearBuy product described in the roadmap, implementing the
NearBuy Design System end-to-end:

| Surface | Routes | Highlights |
| --- | --- | --- |
| **Customer app** | `/` `/search` `/explore` `/nearby` `/nearby-now` `/stores` `/product/:id` `/store/:id` `/cart` `/checkout` `/orders` `/reservations` `/wishlist` `/deals` `/local-market` `/nearai` `/account` | NL search → structured filters, Found Nearby, Compare Your Options (cheapest / fastest / nearest / pickup), fulfillment selector, Reserve & Pickup with QR codes + pickup windows, Walk-In Ready, Hold For Me, multi-store cart, Basket Optimizer, One Trip mode, smart wishlist, Nearby Now, NearAI |
| **Seller app** | `/seller` `/seller/orders` `/seller/inventory` `/seller/growth` | Dashboard, inventory with availability confidence & reorder suggestions, reservations & pickup queue, store QR / mini-storefront, seller AI assistant, marketing, CRM, demand radar preview, store health metrics |
| **Admin console** | `/admin` `/admin/radar` `/admin/directory` `/admin/ops` | City Command Center, map layers, Demand Radar, “What's Missing Near Me?”, people & stores, orders/reservations/payments ops |

Design system tokens (NearBlue `#2563EB`, Plus Jakarta Sans, 16px cards, 48px buttons, the
signature 📍 Nearby / ✓ Available / ⚡ Fast / 🏪 Local Store / 📦 Reserve badges, etc.) live in
`tailwind.config.ts` and `src/components/ui.tsx` — see `docs/DESIGN-SYSTEM.md`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

## Try these flows

1. **Search** — type *"school bag under ₹1500 within 3 km, available today"* and watch it become
   structured filter chips with grounded results.
2. **Product page** — pick a fulfillment card (🚚 standard → 📦 reserve), compare online vs store
   options under **Compare Your Options**, check availability confidence and **Ask Store to Confirm**.
3. **Reserve & Pickup** — reserve an item, choose a pickup window, get a real QR + pickup code in
   **Reservations**; the seller can confirm / mark ready in `/seller/orders`.
4. **NearAI** (`/nearai`) — “Where can I get football shoes tonight?”, “birthday gift under ₹1,000”.
   Answers never invent availability — they're computed from the catalog + store inventory.
5. **Cart** — add items from two stores, try the **Basket Optimizer** and **One Trip** route.
6. **Seller AI** (`/seller`) — “Add 12 footballs”, “Which products are almost out of stock?”.

## Architecture

```
src/
├── data/          # domain types + seeded catalog (stores, products, listings, offers, demand)
├── lib/           # geo/search/nearai engines (NL parsing, comparison, grounded AI replies)
├── store/         # app state: cart, wishlist, orders, reservations, toasts (localStorage-backed)
├── components/    # ui primitives, layout shells (customer / seller / admin), commerce widgets, map
└── pages/         # customer · seller · admin screens
```

- **Stack**: Vite + React 18 + TypeScript + Tailwind CSS + React Router + Lucide + qrcode.react
- **Inventory model**: every listing carries `updatedMinsAgo` → availability confidence
  (🟢 confirmed recently / 🟡 updated earlier / ⚪ needs confirmation) and supports live stock checks.
- **Distances & map**: haversine from the demo location (Dwarka Sector 22, Delhi) with a quiet
  SVG map layer (stores, selection, one-trip routes).

## Docs

- `docs/PRODUCT-ROADMAP.md` — product vision, feature catalog and phased roadmap (Phase 0–6)
- `docs/DESIGN-SYSTEM.md` — brand, color, type, component and motion rules

---

**NearBuy should not compete only on “fast delivery.”** The proposition is:

> **“We find the best way for you to get what you need — whether it is online, at a nearby store,
> available for pickup, ready for reservation, or deliverable from a local business.”**

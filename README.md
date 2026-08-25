# TTFL Store — Frontend

Design system + full customer/vendor/admin frontend for TTFL Store, wired
to the real backend API (see the companion `ttfl-store-backend` repo).

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, tokens in `tailwind.config.ts`
- Plus Jakarta Sans (display/body) + JetBrains Mono (prices/data)
- `lucide-react` icons
- Auth via httpOnly cookies (no client-side token handling)
- Cart persisted to `localStorage` (this is a real deployed app, not a
  Claude artifact, so that's the right call for a guest-friendly cart)

## Run it
```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```
Open http://localhost:3000. Needs the backend running (see its README) for
anything beyond the homepage's mock-data fallback.

Fonts load from Google Fonts at build time — this sandbox had no internet
access to fonts.googleapis.com, so the build was verified here with fonts
stubbed out; it'll pull the real fonts automatically the moment you run it
locally or on Vercel.

## Deploy (Vercel)
1. Push to GitHub, import into Vercel (Next.js preset auto-detected).
2. Set `NEXT_PUBLIC_API_URL` to your deployed backend's URL (Render).
3. Make sure the backend's `CORS_ORIGIN` and `APP_URL` point back at this
   Vercel URL, and `COOKIE_CROSS_SITE=true` on the backend (different
   domains = cross-site cookies).

## Pages built

| Route | What it does |
|---|---|
| `/` | Homepage — live products from the API, falls back to mock data if the backend's unreachable |
| `/products/[slug]` | Product detail — gallery, selling-method-aware buy actions (checkout / external link / WhatsApp), SEO + JSON-LD |
| `/store/[slug]` | Vendor storefront |
| `/search` | Search results with filters (price, condition, sort) |
| `/cart` | Multi-vendor grouped cart |
| `/checkout` | Delivery form → Paystack redirect |
| `/orders/[orderNumber]/confirm` | Post-payment confirmation (Paystack callback lands here) |
| `/login`, `/register` | Auth |
| `/sell` | Vendor application (registers a VENDOR account + pending store) |
| `/account` | Customer order history |
| `/vendor/dashboard` | Vendor home — status banner if not yet approved |
| `/vendor/dashboard/products` | Vendor's product list, edit/delete |
| `/vendor/dashboard/products/new`, `/products/[id]/edit` | Product form (selling method, images-by-URL, pricing) |
| `/vendor/dashboard/orders` | Fulfillment — advance order status |
| `/admin` | Admin home |
| `/admin/vendors` | Approve/reject/suspend vendor applications |
| `/admin/products` | Suspend/reinstate listings |

## Known gaps in what's built
- **No image upload pipeline** — the product form takes hosted image URLs
  (one per line), not file uploads. Spec §45 wants real upload + compression;
  that's backend work (storage bucket + processing) not done yet.
- **No wishlist, reviews, coupons pages** — backend doesn't have these
  endpoints yet either.
- **Ratings show as hidden, not zero** — `ProductCard` hides the star row
  entirely when there's no review data, rather than showing a fake "0 (0)".
- **The `ttflstore.png` logo still isn't wired in** — `components/logo.tsx`
  has a placeholder wordmark in the exact slot; two-line swap once you have
  the file (see the component's own comment).
- **Vendor storefront page's category/location filter chips aren't built**
  — the search page has full filters, the store page just lists everything.

## About the logo
See `components/logo.tsx` — same placeholder situation as before, unchanged
since the last handoff.

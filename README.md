# Nuxt E-Commerce Starter Kit

A storefront starter built with Nuxt 4 and Nuxt UI 4. The demo store, **Etalase**, runs on [DummyJSON](https://dummyjson.com) data so everything works without a backend.

## Features

- **Catalog**: search, category filter, sorting and pagination, all kept in the URL
- **Product page**: gallery, stock status, reviews, related products, Product schema.org markup
- **Cart**: slide-over drawer plus a cart page, saved in the browser
- **Wishlist**: saved in the browser
- **Checkout**: address form, shipping and payment method, order confirmation (no real payment)
- **Account**: sign in/out, profile, order history
- **Bahasa Indonesia** (default) and English, light and dark mode

Demo account: `emilys` / `emilyspass`. Sign-up is simulated by DummyJSON, so new accounts can't sign in.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm test           # unit tests
npx nuxt typecheck
```

Set `NUXT_APP_SECRET` in production (`openssl rand -base64 32`).

| Variable | Default | Purpose |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | `https://example.com` | Canonical URL, sitemap |
| `NUXT_PUBLIC_SITE_NAME` | `Etalase` | Store name in header and titles |
| `NUXT_PUBLIC_CURRENCY` | `USD` | Currency used to format prices |
| `NUXT_DUMMYJSON_URL` | `https://dummyjson.com` | Upstream API base URL |

## How it fits together

```
browser ──► /api/* (server/api, validated with zod) ──► server/utils/dummyjson.ts ──► DummyJSON
```

- `shared/types` and `shared/utils` hold the data shapes, pricing rules and validation schemas used by both the app and the server.
- **To connect your own backend**, rewrite `server/utils/dummyjson.ts`. API handlers and pages only depend on `shared/types`.
- Order totals are calculated on the server from upstream prices. Client-supplied prices are ignored.
- The session token lives in an httpOnly cookie that only the server reads.
- Cart, wishlist, account and checkout render client-side (`ssr: false` route rules). Catalog pages are cached with SWR, so cached HTML never contains one visitor's data.

## Customising the look

- Brand colour: the `cobalt` scale in `app/assets/css/main.css`, assigned in `app/app.config.ts`
- Font: `--font-sans` in `main.css`, loaded automatically by `@nuxt/fonts`
- Copy: `i18n/locales/id.json` and `en.json`

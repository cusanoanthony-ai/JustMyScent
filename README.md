# Just My Scent — Unofficial Headless Shopify Redesign Concept

A complete custom headless Shopify storefront concept built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4. The project supports **demo mode** for local portfolio browsing and **live Shopify mode** when Storefront API credentials are configured.

## Disclaimer

This is an **unofficial redesign concept** created for educational and portfolio purposes. It is **not affiliated with or commissioned by Just My Scent**.

## Architecture

```
src/
  app/                     # App Router pages, actions, metadata
  components/              # UI, cart, product, layout, forms
  lib/
    commerce/
      demo/                # Local demo catalog + cart adapter
      shopify/             # Storefront API client, queries, mappers
    cart/                  # HttpOnly Shopify cart cookie helpers
    scent-finder/          # Recommendation scoring engine
    env.ts                 # Central live/demo mode detection
```

All pages consume data through `getCommerceProvider()` from `src/lib/commerce/index.ts`. Pages never import Shopify or demo data directly.

## Demo Mode

When Shopify live-data variables are absent or disabled, the app uses:

- 18 original demonstration fragrance products
- Local collection definitions
- CSS/SVG-style demo product visuals
- Browser `localStorage` demo cart persistence
- Disabled checkout with clear messaging

No API keys are required for demo mode.

## Live Shopify Mode

Live mode activates only when **all** are true:

- `SHOPIFY_USE_LIVE_DATA=true`
- `SHOPIFY_STORE_DOMAIN` is set
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is set

When active, the app uses Shopify Storefront GraphQL API `2026-04` for products, collections, search, cart, and checkout.

## Required Environment Variables

Copy `.env.example` to `.env.local` locally:

```bash
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_STOREFRONT_API_VERSION=2026-04
SHOPIFY_USE_LIVE_DATA=false
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

Never commit `.env.local`. Never expose the Storefront access token in client code or `NEXT_PUBLIC_*` variables.

## Shopify Headless Channel Setup

See [`docs/SHOPIFY_SETUP.md`](docs/SHOPIFY_SETUP.md) for step-by-step owner/developer instructions.

## Product Publication Requirements

For live mode, products must be:

1. Published to the Headless / custom storefront sales channel
2. Assigned to collections matching expected handles when possible
3. Enriched with recommended metafields or fallback tags

## Recommended Collections

- `women`
- `men`
- `unisex`
- `sweet-gourmand`
- `fresh-clean`
- `floral`
- `warm-sensual`
- `woody-earthy`
- `bold-refined`

## Recommended Product Metafields

Namespace: `custom`

- `audience`
- `scent_family`
- `top_notes`
- `heart_notes`
- `base_notes`
- `mood`
- `occasion`
- `fragrance_strength`
- `featured_message`

## Supported Fallback Tags

- `audience:women`, `audience:men`, `audience:unisex`
- `scent:floral`, `scent:fresh`, `scent:woody`, `scent:gourmand`, `scent:warm`
- `note:vanilla`, `note:rose`
- `mood:romantic`
- `occasion:evening`

## Local Development

```bash
npm install
npm run dev -- -p 3001
```

Other commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Vercel Environment Variables

Add the same variables from `.env.example` in the Vercel project settings for Production and Preview environments. Redeploy after adding credentials for the first time.

## Cart Security

- Live Shopify cart IDs are stored in an **HttpOnly**, `SameSite=Lax`, `Path=/` cookie
- Cart mutations run server-side through Next.js server actions
- The Storefront access token never reaches the browser
- Demo carts stay in `localStorage` and are isolated from Shopify checkout

## Checkout Behavior

- **Live mode:** checkout redirects to Shopify-hosted `checkoutUrl`
- **Demo mode:** checkout is disabled with explicit messaging

## Testing

```bash
npm run test
```

Current automated coverage includes:

- Environment mode detection
- Shopify product mapper normalization
- Scent Finder scoring
- Currency formatting
- Demo cart calculations

## Current Limitations

- Newsletter and contact forms are demonstration-only
- Policy pages use placeholder copy pending business approval
- Demo checkout cannot process payment
- Shopify inventory quantity depends on token permissions
- No customer account / order history integration yet

## Real Launch Checklist

- [ ] Replace placeholder policy pages
- [ ] Connect contact and newsletter services
- [ ] Add approved product photography and copy
- [ ] Configure Shopify Headless channel and publish products
- [ ] Create collections and metafields
- [ ] Add environment variables locally and on Vercel
- [ ] Test add-to-cart and hosted checkout on a Shopify test store
- [ ] Review SEO metadata and legal disclaimer with the business owner

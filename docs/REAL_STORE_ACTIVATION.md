# Real Store Activation Guide

This guide explains how to connect the existing Just My Scent headless storefront to the live Shopify store after collaborator access is approved. No frontend redesign is required.

## 1. Grant collaborator access

The store owner opens **Shopify Admin → Settings → Users and permissions → Collaborators** and approves the collaborator request sent to the developer email.

See [MINIMUM_COLLABORATOR_PERMISSIONS.md](./MINIMUM_COLLABORATOR_PERMISSIONS.md) for the minimum permission set.

## 2. Add or approve the Headless sales channel

1. In Shopify Admin, open **Sales channels**.
2. Add **Headless** if it is not already installed.
3. Approve the channel for the store.

## 3. Create a custom storefront

1. Open the **Headless** sales channel.
2. Create a new storefront for this Next.js site.
3. Copy the private **Storefront API access token**.

## 4. Obtain the store domain

Use the store’s `.myshopify.com` domain, for example:

`just-my-scent.myshopify.com`

Do not use the custom domain for the Storefront API client.

## 5. Publish products to Headless

1. Open each product or use bulk editing.
2. Under **Product availability / Sales channels**, publish products to the Headless channel.
3. Confirm collections used by the site are populated:
   - `womens-fragrance`
   - `mens-fragrance`
   - `frontpage`
   - `best-sellers`

## 6. Add environment variables locally

Create `.env.local`:

```env
SHOPIFY_USE_LIVE_DATA=true
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
SHOPIFY_STOREFRONT_API_VERSION=2026-04
SHOPIFY_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

Optional later:

```env
SHOPIFY_ADMIN_ACCESS_TOKEN=
SHOPIFY_ADMIN_API_VERSION=2026-04
```

## 7. Run the Shopify connection verifier

```bash
npm run verify:shopify
```

This validates configuration without printing secrets, confirms Storefront API access, samples products/collections/prices/images, and performs a non-destructive cart creation test.

## 8. Run the catalog parity audit

```bash
npm run audit:shopify-parity
```

Compares the local public snapshot with live Shopify handles, titles, prices, variants, availability, collections, and scent metafields. Review `docs/SHOPIFY_PARITY_REPORT.md`.

## 9. Review scent-metadata gaps

1. Open `exports/scent-metadata-owner-review.csv`.
2. Review products marked `needs-owner-review`.
3. Approve verified rows by setting **Review status** to `approved`.
4. Optionally run:

```bash
npm run sync:scent-metafields
npm run sync:scent-metafields -- --write
```

The live storefront does not depend on this script; local metadata already powers snapshot mode and live fallback.

## 10. Add environment variables to Vercel

In the Vercel project settings, add the same variables used locally:

- `SHOPIFY_USE_LIVE_DATA=true`
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_STOREFRONT_API_VERSION`
- `SHOPIFY_WEBHOOK_SECRET` (optional until webhooks are configured)
- `NEXT_PUBLIC_SITE_URL`

Redeploy after saving variables.

## 11. Test cart and Shopify-hosted checkout

1. Start the site locally or open the Vercel preview URL.
2. Add a product to cart.
3. Proceed to checkout and confirm Shopify-hosted checkout loads.
4. Do not complete a real payment unless the owner approves a live checkout test.

## 12. Test on a preview subdomain

Use the Vercel preview deployment first. Confirm:

- `/shop` lists live products once
- collection routes work
- product pages show live prices and availability
- search and Scent Finder behave correctly
- cart and checkout work

## 13. Switch the existing domain only after approval

Point the production domain to Vercel only after:

- collaborator access is active
- Headless channel is approved
- products are published
- checkout test is approved
- owner approves launch

## 14. Roll back to the current Shopify theme

If needed, keep the existing Online Store theme active and revert DNS or domain routing to the theme storefront. The headless site can remain on preview without affecting the live theme.

## Webhook setup (optional)

When ready:

1. Set `SHOPIFY_WEBHOOK_SECRET`.
2. Create Shopify webhooks pointing to `/api/shopify/webhooks`.
3. Subscribe to product, collection, and inventory update topics supported by the store plan.

The endpoint remains inactive until the secret is configured.

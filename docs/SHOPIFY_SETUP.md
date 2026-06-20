# Shopify Setup Guide

This guide explains how to connect the Just My Scent headless storefront concept to a Shopify test store.

## 1. Install or Open Shopify’s Headless Sales Channel

1. Log in to your Shopify admin.
2. Open **Sales channels**.
3. Install or open **Headless** (or your custom headless storefront channel).

## 2. Create a Storefront

1. In the Headless channel, create a new storefront for this project.
2. Name it something identifiable, such as `Just My Scent Headless Dev`.

## 3. Enable Required Storefront API Permissions

Ensure the storefront token can access:

- Products and collections
- Product variants and pricing
- Cart creation and updates
- Checkout URL retrieval
- Search
- Metafields used by the catalog, if available

## 4. Copy the Store Domain

Use the store’s `myshopify.com` domain, for example:

```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
```

## 5. Copy the Private Storefront API Token

From the Headless storefront settings, copy the **Storefront API access token**.

```bash
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-private-storefront-token
```

Do not put this token in any `NEXT_PUBLIC_*` variable.

## 6. Add Values to `.env.local`

Create a local file named `.env.local` in the repository root:

```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-private-storefront-token
SHOPIFY_STOREFRONT_API_VERSION=2026-04
SHOPIFY_USE_LIVE_DATA=true
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

Restart the dev server after saving.

## 7. Publish Products to the Headless Sales Channel

In Shopify Admin:

1. Open each product.
2. Under **Product availability** / sales channels, publish it to the Headless storefront channel.

Unpublished products will not appear in live mode.

## 8. Create Expected Collections

Create collections with handles aligned to the storefront where possible:

- `women`
- `men`
- `unisex`
- `sweet-gourmand`
- `fresh-clean`
- `floral`
- `warm-sensual`
- `woody-earthy`
- `bold-refined`

Handles must match exactly for the best experience.

## 9. Create Recommended Custom Metafields

In **Settings → Custom data → Products**, create metafields in namespace `custom`:

| Key | Type suggestion |
|---|---|
| `audience` | Single line text or list |
| `scent_family` | Single line text |
| `top_notes` | List or multi-line text |
| `heart_notes` | List or multi-line text |
| `base_notes` | List or multi-line text |
| `mood` | Single line text |
| `occasion` | Single line text |
| `fragrance_strength` | Single line text |
| `featured_message` | Single line text |

If metafields are missing, the app falls back to structured tags such as `audience:women` and `note:vanilla`.

## 10. Add Variables to Vercel

In the Vercel project:

1. Open **Settings → Environment Variables**
2. Add the same variables from `.env.local`
3. Set `SHOPIFY_USE_LIVE_DATA=true`
4. Set `NEXT_PUBLIC_SITE_URL` to your deployed site URL

## 11. Redeploy After First Credential Setup

Environment variables are injected at build/runtime. Redeploy after adding Shopify credentials for the first time.

## 12. Test Cart and Hosted Checkout

1. Start the site in live mode.
2. Add a product to cart.
3. Open the cart drawer and click **Checkout**.
4. Confirm redirect to Shopify-hosted checkout.
5. Complete a test order on your Shopify development store.

## Security Reminders

- Keep the Storefront access token server-side only
- Do not commit `.env.local`
- Do not expose tokens in logs, error messages, or client bundles
- Use a development store while testing

## Troubleshooting

### Products do not appear

- Confirm `SHOPIFY_USE_LIVE_DATA=true`
- Confirm products are published to the Headless channel
- Confirm collection handles and product availability

### Cart or checkout fails

- Confirm the token has cart permissions
- Clear site cookies and retry
- Verify the store domain is correct

### Missing scent metadata

- Add the recommended metafields
- Or use supported fallback tags on products

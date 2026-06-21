# Shopify App Compatibility Checklist

Theme app blocks and embedded Shopify apps do not automatically appear in a custom Next.js storefront. Review each installed app and decide whether it needs an API integration, SDK, embed, or replacement.

## Reviews

- Check whether the app exposes Storefront API, JavaScript embed, or external widget URL.
- Theme review blocks will not render in headless pages without a custom component.

## Loyalty

- Confirm whether points, tiers, or rewards require Customer Account API or a third-party SDK.
- Cart and checkout may need app-specific line-item attributes or post-checkout hooks.

## Subscriptions

- Selling plans and subscription widgets usually require Storefront API selling plan support or Shopify Subscriptions APIs.
- Verify subscription products are exposed to the Headless channel.

## Bundles

- Fixed bundles and mix-and-match apps often rely on theme scripts or Admin-only configuration.
- Confirm bundle SKUs/variants are visible through Storefront API.

## Email marketing

- Newsletter forms in this build are demonstration-only until an ESP or Shopify form integration is connected.
- Klaviyo, Omnisend, and similar apps may provide embeddable forms or API endpoints.

## SMS marketing

- SMS capture widgets typically require app embeds or external endpoints.
- Do not assume theme popups carry over to headless pages.

## Upsells

- Cart upsell apps often inject into theme cart drawers.
- Rebuild upsells using Storefront API cart attributes, custom components, or app-provided endpoints.

## Search

- Shopify Search & Discovery theme features do not automatically power custom search.
- This site uses local/live catalog search until a search app API is integrated.

## Analytics

- Add Vercel Analytics, Google Analytics, or app-provided pixel scripts in the Next.js layout.
- Shopify theme pixels do not run automatically in headless pages.

## Pixels

- Meta, TikTok, Pinterest, and Google tags must be installed explicitly in Next.js.
- Use Shopify Customer Events or app docs for checkout/event parity if required.

## Cookie consent

- Re-implement consent banners in the headless frontend if required by installed compliance apps.

## Shipping

- Shipping rates and delivery promises must come from Shopify checkout or a shipping app API.
- Do not copy theme shipping claims into headless pages without verification.

## Returns

- Return portals and policy widgets from apps require separate integration.
- Final policy copy must be owner-approved before launch.

## Summary

For each installed app, document:

1. What it does in the current theme
2. Whether Headless/Storefront API support exists
3. Whether a replacement integration is required
4. Whether launch can proceed without it

# Activation Checklist

## A. Completed before access

- [x] Next.js App Router storefront with Tailwind CSS
- [x] Demo/snapshot and live Shopify commerce providers
- [x] Public catalog snapshot from justmyscent.online (197 products)
- [x] Local product image matching (197/197)
- [x] Scent metadata extraction and owner-review CSV
- [x] Scent Finder with weighted scoring and quiz eligibility rules
- [x] Shop, collections, search, product pages, cart, and Scent Finder routes
- [x] Shopify connection verifier script
- [x] Catalog parity audit script (placeholder without credentials)
- [x] Optional scent metafield sync script (dry-run default)
- [x] Webhook endpoint prepared with HMAC verification
- [x] Route revalidation configured for catalog pages
- [x] Activation and compatibility documentation
- [x] Automated tests for catalog, scoring, metadata precedence, and webhooks

## B. Requires collaborator access

- [ ] Owner approves collaborator request
- [ ] Developer confirms Headless sales channel access
- [ ] Store domain and Storefront API token added locally
- [ ] Products published to Headless sales channel
- [ ] Run `npm run verify:shopify`
- [ ] Run `npm run audit:shopify-parity`
- [ ] Test cart and Shopify-hosted checkout on preview

## C. Requires owner approval

- [ ] Owner reviews `exports/scent-metadata-owner-review.csv`
- [ ] Owner approves scent metadata rows for optional metafield sync
- [ ] Owner approves final shipping/returns/contact copy
- [ ] Owner approves removal or update of portfolio disclaimer
- [ ] Owner approves checkout test

## D. Requires production launch approval

- [ ] Environment variables added to Vercel
- [ ] Preview deployment verified on mobile and desktop
- [ ] Domain switch approved
- [ ] Optional Shopify webhooks configured
- [ ] Rollback plan to current Shopify theme confirmed

## Remaining manual actions

1. Owner approves collaborator request
2. Owner approves or installs the Headless sales channel
3. Store domain and Storefront token are added securely
4. Products are published to Headless
5. Final checkout test is approved
6. Domain switch is approved

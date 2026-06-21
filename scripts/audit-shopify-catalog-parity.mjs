#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const catalogPath = join(root, "src/data/just-my-scent-catalog.json");
const reportPath = join(root, "docs/SHOPIFY_PARITY_REPORT.md");

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || "2026-04";
const useLive = ["true", "1", "yes"].includes(
  (process.env.SHOPIFY_USE_LIVE_DATA ?? "").trim().toLowerCase(),
);

function hasCredentials() {
  return useLive && storeDomain && accessToken;
}

async function fetchAllProducts(client) {
  const products = [];
  let after = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = `#graphql
      query ParityProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            handle
            title
            availableForSale
            featuredImage { url }
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            variants(first: 20) {
              nodes {
                id
                title
                availableForSale
                price { amount currencyCode }
              }
            }
            collections(first: 20) {
              nodes { handle title }
            }
            metafields(identifiers: [
              { namespace: "custom", key: "scent_family" },
              { namespace: "custom", key: "top_notes" },
              { namespace: "custom", key: "heart_notes" },
              { namespace: "custom", key: "base_notes" },
              { namespace: "custom", key: "audience" },
              { namespace: "custom", key: "quiz_eligible" }
            ]) {
              namespace
              key
              value
            }
          }
        }
      }
    `;

    const response = await client.request(query, { variables: { first: 100, after } });
    if (response.errors) {
      throw new Error(response.errors.graphQLErrors?.[0]?.message ?? "GraphQL failed");
    }

    const page = response.data.products;
    products.push(...page.nodes);
    hasNextPage = page.pageInfo.hasNextPage;
    after = page.pageInfo.endCursor;
  }

  return products;
}

function compareRecords(local, live) {
  const mismatches = [];
  if (local.sourceTitle !== live.title) mismatches.push("title");
  const localPrice = local.price?.amount;
  const livePrice = live.priceRange?.minVariantPrice?.amount;
  if (localPrice && livePrice && localPrice !== livePrice) mismatches.push("price");
  if (local.availableForSale !== live.availableForSale) mismatches.push("availability");
  if ((local.variants?.length ?? 0) !== (live.variants?.nodes?.length ?? 0)) {
    mismatches.push("variants");
  }
  return mismatches;
}

async function main() {
  if (!hasCredentials()) {
    const message = `# Shopify Parity Report

Generated: ${new Date().toISOString().slice(0, 10)}

Live audit not run — Shopify credentials are not configured.

Run this script after collaborator access with:

\`\`\`bash
SHOPIFY_USE_LIVE_DATA=true \\
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com \\
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token \\
node scripts/audit-shopify-catalog-parity.mjs
\`\`\`
`;
    writeFileSync(reportPath, message);
    console.log("Credentials absent. Wrote placeholder docs/SHOPIFY_PARITY_REPORT.md");
    return;
  }

  const localCatalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const localByHandle = new Map(localCatalog.products.map((product) => [product.handle, product]));

  const client = createStorefrontApiClient({
    storeDomain,
    apiVersion,
    publicAccessToken: accessToken,
  });

  const liveProducts = await fetchAllProducts(client);
  const liveByHandle = new Map(liveProducts.map((product) => [product.handle, product]));

  const onlyLocal = [];
  const onlyLive = [];
  const mismatches = [];

  for (const [handle, local] of localByHandle) {
    const live = liveByHandle.get(handle);
    if (!live) {
      onlyLocal.push(handle);
      continue;
    }
    const diff = compareRecords(local, live);
    if (diff.length) mismatches.push({ handle, diff });
  }

  for (const handle of liveByHandle.keys()) {
    if (!localByHandle.has(handle)) onlyLive.push(handle);
  }

  const report = `# Shopify Parity Report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Count |
| --- | ---: |
| Local snapshot products | ${localByHandle.size} |
| Live Shopify products | ${liveByHandle.size} |
| Only in local snapshot | ${onlyLocal.length} |
| Only in live Shopify | ${onlyLive.length} |
| Field mismatches | ${mismatches.length} |

## Only in local snapshot

${onlyLocal.length ? onlyLocal.map((handle) => `- ${handle}`).join("\n") : "None"}

## Only in live Shopify

${onlyLive.length ? onlyLive.map((handle) => `- ${handle}`).join("\n") : "None"}

## Field mismatches

${mismatches.length ? mismatches.map(({ handle, diff }) => `- ${handle}: ${diff.join(", ")}`).join("\n") : "None"}

## Notes

- Compare titles using live Shopify as authority after activation.
- Scent metafields are reported when present on live products.
- Re-run after publishing products to the Headless sales channel.
`;

  writeFileSync(reportPath, report);
  console.log(`Parity report written to ${reportPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

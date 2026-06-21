#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const csvPath = join(root, "exports/scent-metadata-owner-review.csv");
const reportPath = join(root, "docs/SCENT_METAFIELD_SYNC_REPORT.md");

const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION?.trim() || "2026-04";
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
const writeEnabled = process.argv.includes("--write");

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

async function adminGraphql(query, variables) {
  const response = await fetch(
    `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  const payload = await response.json();
  if (!response.ok || payload.errors) {
    throw new Error(payload.errors?.[0]?.message ?? `Admin API error (${response.status})`);
  }
  return payload.data;
}

async function findProductId(handle) {
  const data = await adminGraphql(
    `#graphql
      query ProductByHandle($handle: String!) {
        productByHandle(handle: $handle) { id handle }
      }
    `,
    { handle },
  );
  return data.productByHandle?.id ?? null;
}

async function setMetafields(productId, fields) {
  const metafields = Object.entries(fields).map(([key, value]) => ({
    ownerId: productId,
    namespace: "custom",
    key,
    type: "single_line_text_field",
    value,
  }));

  const data = await adminGraphql(
    `#graphql
      mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { key namespace value }
          userErrors { field message }
        }
      }
    `,
    { metafields },
  );

  const errors = data.metafieldsSet?.userErrors ?? [];
  if (errors.length) {
    throw new Error(errors[0]?.message ?? "Metafield update failed");
  }
}

function buildFieldMap(row) {
  const approved = row["Review status"]?.toLowerCase() === "approved";
  if (!approved) return null;

  const fields = {};
  if (row["Scent family"]) fields.scent_family = row["Scent family"];
  if (row["Top notes"]) fields.top_notes = row["Top notes"];
  if (row["Heart or middle notes"]) fields.heart_notes = row["Heart or middle notes"];
  if (row["Base notes"]) fields.base_notes = row["Base notes"];
  if (row["Audience"]) fields.audience = row["Audience"];
  if (row["Mood"]) fields.mood = row["Mood"];
  if (row["Occasion"]) fields.occasion = row["Occasion"];
  if (row["Strength"]) fields.fragrance_strength = row["Strength"];
  if (row["Quiz eligible"]) fields.quiz_eligible = row["Quiz eligible"];
  return Object.keys(fields).length ? fields : null;
}

async function main() {
  const rows = parseCsv(readFileSync(csvPath, "utf8"));
  const approvedRows = rows.filter((row) => buildFieldMap(row));

  if (!adminToken || !storeDomain) {
    const report = `# Scent Metafield Sync Report

Generated: ${new Date().toISOString()}

Dry-run only. Admin credentials are not configured.

Approved rows in CSV: ${approvedRows.length}

Run with credentials:

\`\`\`bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com \\
SHOPIFY_ADMIN_ACCESS_TOKEN=your-admin-token \\
SHOPIFY_ADMIN_API_VERSION=2026-04 \\
node scripts/sync-scent-metafields.mjs
\`\`\`

Add \`--write\` to apply approved metafields.
`;
    writeFileSync(reportPath, report);
    console.log("Admin credentials absent. Dry-run report written.");
    return;
  }

  const changes = [];
  for (const row of approvedRows) {
    const handle = row["Product handle"];
    const fields = buildFieldMap(row);
    if (!fields) continue;

    const productId = await findProductId(handle);
    if (!productId) {
      changes.push({ handle, status: "missing-product" });
      continue;
    }

    if (writeEnabled) {
      await setMetafields(productId, fields);
      changes.push({ handle, status: "updated", fields: Object.keys(fields) });
    } else {
      changes.push({ handle, status: "would-update", fields: Object.keys(fields) });
    }
  }

  const report = `# Scent Metafield Sync Report

Generated: ${new Date().toISOString()}
Mode: ${writeEnabled ? "write" : "dry-run"}

## Summary

| Metric | Count |
| --- | ---: |
| Approved CSV rows | ${approvedRows.length} |
| Processed changes | ${changes.length} |

## Changes

${changes.map((change) => `- ${change.handle}: ${change.status}${change.fields ? ` (${change.fields.join(", ")})` : ""}`).join("\n") || "None"}
`;

  writeFileSync(reportPath, report);
  console.log(`Sync report written (${writeEnabled ? "write" : "dry-run"}).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

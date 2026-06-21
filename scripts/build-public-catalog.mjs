#!/usr/bin/env node
/**
 * Builds public catalog snapshot, scent metadata, image match report, and owner CSV.
 * Uses only public Shopify JSON endpoints — no credentials required.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = "https://justmyscent.online";
const SNAPSHOT_DATE = new Date().toISOString().slice(0, 10);

const OUT_CATALOG = path.join(ROOT, "src/data/just-my-scent-catalog.json");
const OUT_METADATA = path.join(ROOT, "src/data/scent-metadata.json");
const OUT_IMAGE_MAP = path.join(ROOT, "src/data/product-image-map.json");
const OUT_CSV = path.join(ROOT, "exports/scent-metadata-owner-review.csv");
const OUT_CATALOG_REPORT = path.join(ROOT, "docs/CATALOG_COMPLETENESS_REPORT.md");
const OUT_IMAGE_REPORT = path.join(ROOT, "docs/PRODUCT_IMAGE_MATCH_REPORT.md");
const OUT_SCENT_AUDIT = path.join(ROOT, "docs/SCENT_METADATA_AUDIT.md");

const IMAGE_ALIASES = {
  "amatiage-givenchy-type": "Amarige (Givenchy) Type",
  "212-c-herrera-type": "212 (C. Herrera) Men",
  "212-c-herrera-type-1": "212 (C.Herrera) Type",
  "aventus-creed-type": "Aventus for Her (Creed) Type",
  "angel-thierry-muglar": "Angel (Thierry Muglar) Women Type",
};

const NOTE_SYNONYMS = {
  "madagascar vanilla": "vanilla",
  "vanilla bean": "vanilla",
  "turkish rose": "rose",
  "damask rose": "rose",
  "cedarwood": "cedar",
  "cashmere wood": "cashmere wood",
  "white musk": "white musk",
  "orange blossom": "orange blossom",
  "pink pepper": "pink pepper",
  "bitter almond": "bitter almond",
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function stripHtml(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDisplayTitle(title) {
  return title
    .replace(/\s+type\s*$/i, " Type")
    .replace(/\s+-type\s*$/i, " Type")
    .replace(/\s+-\s*type\s*$/i, " Type")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeNote(raw) {
  const cleaned = raw.trim().replace(/\.$/, "");
  const lower = cleaned.toLowerCase();
  return NOTE_SYNONYMS[lower] ?? lower;
}

function parseNotesFromHtml(html = "") {
  const text = stripHtml(html);
  const extract = (label) => {
    const regex = new RegExp(`${label}\\s*notes?:\\s*([^]+?)(?=\\s*(?:Middle|Heart|Base)\\s*notes?:|$)`, "i");
    const match = text.match(regex);
    if (!match?.[1]) return [];
    return match[1]
      .split(/,|\band\b/gi)
      .map((note) => note.trim())
      .filter(Boolean);
  };

  const top = extract("Top");
  const heart = extract("Middle").length ? extract("Middle") : extract("Heart");
  const base = extract("Base");

  return { top, heart, base, text };
}

function parseReference(text) {
  const match = text.match(
    /([A-Za-z0-9][A-Za-z0-9\s'&.-]+?)\s+by\s+([A-Za-z0-9][A-Za-z0-9\s'.-]+?)\s+is an?\s+([A-Za-z\s]+?)\s+fragrance for (women|men|unisex)/i,
  );
  if (!match) return {};
  return {
    referenceFragrance: match[1].trim(),
    referenceBrand: match[2].trim(),
    scentFamilyRaw: match[3].trim(),
    audienceRaw: match[4].trim().toLowerCase(),
  };
}

function audienceFromProduct(product, reference) {
  if (reference.audienceRaw) {
    if (reference.audienceRaw.includes("women")) return "women";
    if (reference.audienceRaw.includes("men")) return "men";
    return "unisex";
  }
  const type = (product.product_type || "").toLowerCase();
  if (type.includes("women") || type === "woman") return "women";
  if (type.includes("men") || type === "man") return "men";
  if (type.includes("unisex")) return "unisex";
  return "unisex";
}

function buildNoteField(rawNotes, sourceUrl) {
  const normalized = rawNotes.map((note) => ({
    source: note,
    normalized: normalizeNote(note),
    confidence: "verified",
    sourceUrl,
  }));
  return {
    source: rawNotes,
    normalized: [...new Set(normalized.map((n) => n.normalized))],
    entries: normalized,
    confidence: rawNotes.length ? "verified" : "missing",
  };
}

function resolveImage(handle, sourceTitle, imageMap) {
  const attempts = [];
  if (IMAGE_ALIASES[handle]) {
    attempts.push(IMAGE_ALIASES[handle]);
  }
  attempts.push(sourceTitle, cleanDisplayTitle(sourceTitle));

  const handleSlug = handle.replace(/-/g, " ");
  const mapEntries = Object.entries(imageMap);

  for (const candidate of attempts) {
    if (imageMap[candidate]) {
      return { path: imageMap[candidate], method: "exact-title", candidate };
    }
  }

  for (const candidate of attempts) {
    const key = mapEntries.find(([title]) => normalizeKey(title) === normalizeKey(candidate));
    if (key) return { path: key[1], method: "case-insensitive-title", candidate: key[0] };
  }

  const handleMatch = mapEntries.find(([title]) => normalizeKey(title).includes(normalizeKey(handleSlug)) || normalizeKey(handleSlug).includes(normalizeKey(title)));
  if (handleMatch) {
    return { path: handleMatch[1], method: "handle-normalized", candidate: handleMatch[0] };
  }

  const kebab = `/brand-reference/products/${handle}.webp`;
  const altExtensions = [".jpg", ".png", ".webp"];
  for (const ext of altExtensions) {
    const filePath = path.join(ROOT, "public/brand-reference/products", `${handle}${ext}`);
    if (fs.existsSync(filePath)) {
      return { path: `/brand-reference/products/${handle}${ext}`, method: "handle-file-exists", candidate: handle };
    }
  }

  return { path: null, method: "unmatched", candidate: sourceTitle };
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Failed ${url}: ${response.status}`);
  return response.json();
}

async function fetchAllProducts() {
  const data = await fetchJson(`${SOURCE}/products.json?limit=250&page=1`);
  return data.products ?? [];
}

async function fetchCollections() {
  const data = await fetchJson(`${SOURCE}/collections.json`);
  return (data.collections ?? []).filter((c) => (c.products_count ?? 0) > 0 || c.handle === "all");
}

async function fetchCollectionProducts(handle) {
  const data = await fetchJson(`${SOURCE}/collections/${handle}/products.json?limit=250&page=1`);
  return (data.products ?? []).map((p) => p.handle);
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function main() {
  ensureDir(OUT_CATALOG);
  ensureDir(OUT_CSV);

  const imageMap = JSON.parse(fs.readFileSync(OUT_IMAGE_MAP, "utf8"));
  const rawProducts = await fetchAllProducts();
  const collectionsMeta = await fetchCollections();

  const collectionMembership = new Map();
  for (const collection of collectionsMeta) {
    if (collection.handle === "all") continue;
    const handles = await fetchCollectionProducts(collection.handle);
    for (const handle of handles) {
      if (!collectionMembership.has(handle)) collectionMembership.set(handle, []);
      collectionMembership.get(handle).push({ handle: collection.handle, title: collection.title });
    }
  }

  const products = [];
  const scentMetadata = {};
  const imageReport = [];
  const duplicateTitles = new Map();

  for (const product of rawProducts) {
    const handle = product.handle;
    const sourceTitle = product.title;
    const displayTitle = cleanDisplayTitle(sourceTitle);
    const sourceUrl = `${SOURCE}/products/${handle}`;
    const descriptionHtml = product.body_html ?? "";
    const description = stripHtml(descriptionHtml);
    const parsedNotes = parseNotesFromHtml(descriptionHtml);
    const reference = parseReference(parsedNotes.text);
    const imageResult = resolveImage(handle, sourceTitle, imageMap);

    const variant = (product.variants ?? []).map((v) => ({
      id: String(v.id),
      title: v.title,
      price: { amount: Number.parseFloat(v.price).toFixed(2), currencyCode: "USD" },
      compareAtPrice: v.compare_at_price
        ? { amount: Number.parseFloat(v.compare_at_price).toFixed(2), currencyCode: "USD" }
        : undefined,
      availableForSale: v.available ?? true,
      sku: v.sku ?? undefined,
    }));

    const primaryVariant = variant[0];
    const images = (product.images ?? []).map((img) => ({
      url: img.src,
      altText: img.alt ?? sourceTitle,
      width: img.width,
      height: img.height,
    }));

    const record = {
      handle,
      sourceTitle,
      displayTitle,
      publicUrl: sourceUrl,
      sourceUrl,
      snapshotDate: SNAPSHOT_DATE,
      price: primaryVariant?.price,
      compareAtPrice: primaryVariant?.compareAtPrice,
      currency: "USD",
      availableForSale: variant.some((v) => v.availableForSale),
      description,
      descriptionHtml,
      productType: product.product_type ?? undefined,
      vendor: product.vendor ?? undefined,
      tags: Array.isArray(product.tags)
        ? product.tags
        : product.tags
          ? String(product.tags).split(",").map((t) => t.trim())
          : [],
      collections: collectionMembership.get(handle) ?? [],
      audience: audienceFromProduct(product, reference),
      variants: variant,
      images,
      primaryImage: images[0],
      localImage: imageResult.path,
      localImageMatchMethod: imageResult.method,
      seoTitle: product.title,
      seoDescription: description.slice(0, 160),
    };

    products.push(record);

    const titleKey = normalizeKey(sourceTitle);
    duplicateTitles.set(titleKey, [...(duplicateTitles.get(titleKey) ?? []), handle]);

    imageReport.push({
      handle,
      sourceTitle,
      localImage: imageResult.path,
      method: imageResult.method,
      matchedKey: imageResult.candidate,
    });

    const topNotes = buildNoteField(parsedNotes.top, sourceUrl);
    const heartNotes = buildNoteField(parsedNotes.heart, sourceUrl);
    const baseNotes = buildNoteField(parsedNotes.base, sourceUrl);
    const verifiedNoteCount =
      topNotes.normalized.length + heartNotes.normalized.length + baseNotes.normalized.length;

    const scentFamily = reference.scentFamilyRaw
      ? { source: reference.scentFamilyRaw, normalized: reference.scentFamilyRaw, confidence: "verified", sourceUrl }
      : { source: null, normalized: null, confidence: "missing", sourceUrl };

    const quizEligible =
      Boolean(scentFamily.normalized) &&
      verifiedNoteCount >= 2 &&
      Boolean(record.audience);

    const missingFields = [];
    if (!topNotes.normalized.length) missingFields.push("topNotes");
    if (!heartNotes.normalized.length) missingFields.push("heartNotes");
    if (!baseNotes.normalized.length) missingFields.push("baseNotes");
    if (!scentFamily.normalized) missingFields.push("scentFamily");

    scentMetadata[handle] = {
      handle,
      sourceTitle,
      displayTitle,
      sourceUrl,
      referenceFragrance: reference.referenceFragrance
        ? { source: reference.referenceFragrance, confidence: "verified", sourceUrl }
        : { source: null, confidence: "missing", sourceUrl },
      referenceBrand: reference.referenceBrand
        ? { source: reference.referenceBrand, confidence: "verified", sourceUrl }
        : { source: null, confidence: "missing", sourceUrl },
      scentFamily,
      topNotes,
      heartNotes,
      middleNotes: heartNotes,
      baseNotes,
      audience: {
        source: record.audience,
        normalized: record.audience,
        confidence: "verified",
        sourceUrl,
      },
      mood: { source: null, normalized: null, confidence: "missing", sourceUrl },
      occasion: { source: null, normalized: null, confidence: "missing", sourceUrl },
      fragranceStrength: { source: null, normalized: null, confidence: "missing", sourceUrl },
      season: { source: null, normalized: null, confidence: "missing", sourceUrl },
      applicationGuidance: {
        source: description.includes("Roll on") ? "Roll-on application" : null,
        confidence: description.includes("Roll on") ? "normalized" : "missing",
        sourceUrl,
      },
      quizEligible,
      missingFields,
      reviewStatus: quizEligible ? "quiz-ready" : "needs-owner-review",
    };
  }

  const catalog = {
    snapshotDate: SNAPSHOT_DATE,
    source: SOURCE,
    collectionRecords: collectionsMeta.map((c) => ({
      handle: c.handle,
      title: c.title,
      description: stripHtml(c.description ?? ""),
      productCount: c.products_count ?? 0,
      publicUrl: `${SOURCE}/collections/${c.handle}`,
    })),
    products,
  };

  fs.writeFileSync(OUT_CATALOG, `${JSON.stringify(catalog, null, 2)}\n`);
  fs.writeFileSync(OUT_METADATA, `${JSON.stringify(scentMetadata, null, 2)}\n`);

  const csvHeader = [
    "Product handle",
    "Source title",
    "Display title",
    "Top notes",
    "Heart or middle notes",
    "Base notes",
    "Scent family",
    "Audience",
    "Mood",
    "Occasion",
    "Strength",
    "Quiz eligible",
    "Missing information",
    "Source URL",
    "Review status",
    "Owner notes",
  ];
  const csvRows = Object.values(scentMetadata).map((row) =>
    [
      row.handle,
      row.sourceTitle,
      row.displayTitle,
      row.topNotes.source.join("; "),
      row.heartNotes.source.join("; "),
      row.baseNotes.source.join("; "),
      row.scentFamily.source ?? "",
      row.audience.normalized ?? "",
      row.mood.source ?? "",
      row.occasion.source ?? "",
      row.fragranceStrength.source ?? "",
      row.quizEligible ? "yes" : "no",
      row.missingFields.join("; "),
      row.sourceUrl,
      row.reviewStatus,
      "",
    ]
      .map(csvEscape)
      .join(","),
  );
  fs.writeFileSync(OUT_CSV, `${csvHeader.join(",")}\n${csvRows.join("\n")}\n`);

  const dupTitles = [...duplicateTitles.entries()].filter(([, handles]) => handles.length > 1);
  const multiCollection = products.filter((p) => p.collections.length > 1);
  const missingPrices = products.filter((p) => !p.price?.amount);
  const missingDescriptions = products.filter((p) => !p.description);
  const missingImages = products.filter((p) => !p.localImage && !p.primaryImage?.url);
  const unclearVariants = products.filter((p) => !p.variants.length);

  const collectionCounts = {};
  for (const product of products) {
    for (const collection of product.collections) {
      collectionCounts[collection.handle] = (collectionCounts[collection.handle] ?? 0) + 1;
    }
  }

  fs.writeFileSync(
    OUT_CATALOG_REPORT,
    `# Catalog Completeness Report\n\nSnapshot date: ${SNAPSHOT_DATE}\n\n## Summary\n\n| Metric | Count |\n| --- | ---: |\n| Collection records | ${catalog.collectionRecords.length} |\n| Unique products | ${products.length} |\n| Products in multiple collections | ${multiCollection.length} |\n| Products missing prices | ${missingPrices.length} |\n| Products missing descriptions | ${missingDescriptions.length} |\n| Products missing images | ${missingImages.length} |\n| Products with unclear variants | ${unclearVariants.length} |\n| Duplicate titles with different handles | ${dupTitles.length} |\n\n## Count by collection\n\n${Object.entries(collectionCounts)
      .map(([handle, count]) => `- ${handle}: ${count}`)
      .join("\n")}\n\n## Source pages\n\n- ${SOURCE}/products.json\n- ${SOURCE}/collections.json\n- ${SOURCE}/collections/{handle}/products.json\n\n## Duplicate titles\n\n${dupTitles
      .slice(0, 20)
      .map(([title, handles]) => `- ${title}: ${handles.join(", ")}`)
      .join("\n") || "None"}\n`,
  );

  const matched = imageReport.filter((r) => r.localImage);
  const unmatched = imageReport.filter((r) => !r.localImage);

  fs.writeFileSync(
    OUT_IMAGE_REPORT,
    `# Product Image Match Report\n\nSnapshot date: ${SNAPSHOT_DATE}\n\n| Metric | Count |\n| --- | ---: |\n| Products | ${products.length} |\n| Local image matched | ${matched.length} |\n| Unmatched | ${unmatched.length} |\n\n## Unmatched products\n\n${unmatched
      .map((r) => `- ${r.handle} (${r.sourceTitle})`)
      .join("\n") || "None"}\n`,
  );

  const quizEligible = Object.values(scentMetadata).filter((m) => m.quizEligible);
  const needsReview = Object.values(scentMetadata).filter((m) => !m.quizEligible);

  fs.writeFileSync(
    OUT_SCENT_AUDIT,
    `# Scent Metadata Audit\n\nSnapshot date: ${SNAPSHOT_DATE}\n\n| Metric | Count |\n| --- | ---: |\n| Total products reviewed | ${products.length} |\n| Verified top notes | ${Object.values(scentMetadata).filter((m) => m.topNotes.confidence === "verified").length} |\n| Verified heart/middle notes | ${Object.values(scentMetadata).filter((m) => m.heartNotes.confidence === "verified").length} |\n| Verified base notes | ${Object.values(scentMetadata).filter((m) => m.baseNotes.confidence === "verified").length} |\n| Verified scent family | ${Object.values(scentMetadata).filter((m) => m.scentFamily.confidence === "verified").length} |\n| Quiz eligible | ${quizEligible.length} |\n| Excluded pending review | ${needsReview.length} |\n\nProducts with no usable scent information are excluded from high-confidence quiz recommendations.\n`,
  );

  console.log(
    JSON.stringify(
      {
        products: products.length,
        imageMatched: matched.length,
        quizEligible: quizEligible.length,
        needsReview: needsReview.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

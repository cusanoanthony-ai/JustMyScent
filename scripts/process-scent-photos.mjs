#!/usr/bin/env node
import AdmZip from "adm-zip";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PRIMARY_ZIP = path.join(ROOT, "imports", "scent-photos.zip");
const FALLBACK_ZIP = path.join(
  ROOT,
  "public",
  "brand-reference",
  "product-by-name",
  "1_Million_Elixer_(Paco_Rabanne)_type.zip",
);
const TEMP_DIR = path.join(ROOT, "temp-image-extraction");
const RAW_DIR = path.join(TEMP_DIR, "raw");
const OUTPUT_DIR = path.join(ROOT, "public", "brand-reference", "products");
const MAP_FILE = path.join(ROOT, "src", "data", "product-image-map.json");
const REPORT_FILE = path.join(ROOT, "docs", "IMAGE_CLEANUP_REPORT.md");

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

const DUPLICATE_NAME_PATTERN = /\s*\(\d+\)(?=\.[^.]+$)/i;
const DUPLICATE_TEXT_PATTERN = /(\s|-)?(copy|duplicate)(?=\.[^.]+$)/i;

const stats = {
  zipSource: "",
  primaryZipFound: false,
  originalCount: 0,
  numberedDuplicatesRemoved: 0,
  textDuplicatesRemoved: 0,
  hashDuplicatesRemoved: 0,
  convertedFromHeic: 0,
  pngConvertedToWebp: 0,
  keptNativeFormats: 0,
  finalCount: 0,
  sharedImageGroups: [],
  unclearMatches: [],
  failedFiles: [],
  productMap: {},
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  ensureDir(dir);
}

function isImageFile(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function toDisplayName(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s-\s*type$/i, " Type")
    .replace(/-type$/i, " Type")
    .replace(/\s_type$/i, " Type")
    .replace(/\s+type$/i, " Type")
    .trim();
}

function toKebabCase(displayName) {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function chooseZipSource() {
  stats.primaryZipFound = fs.existsSync(PRIMARY_ZIP);
  if (stats.primaryZipFound) {
    return PRIMARY_ZIP;
  }
  if (fs.existsSync(FALLBACK_ZIP)) {
    return FALLBACK_ZIP;
  }
  throw new Error(
    "No product photo ZIP found. Expected imports/scent-photos.zip or fallback archive.",
  );
}

function extractZip(zipPath) {
  cleanDir(TEMP_DIR);
  ensureDir(RAW_DIR);

  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
  stats.originalCount = entries.length;

  for (const entry of entries) {
    const baseName = path.basename(entry.entryName);
    if (!isImageFile(baseName)) {
      stats.unclearMatches.push(`Skipped non-image entry: ${entry.entryName}`);
      continue;
    }

    fs.writeFileSync(path.join(RAW_DIR, baseName), entry.getData());
  }
}

function collectCandidates() {
  return fs
    .readdirSync(RAW_DIR)
    .filter((name) => isImageFile(name))
    .reduce((kept, name) => {
        if (DUPLICATE_NAME_PATTERN.test(name)) {
          stats.numberedDuplicatesRemoved += 1;
          return kept;
        }
        if (DUPLICATE_TEXT_PATTERN.test(name)) {
          stats.textDuplicatesRemoved += 1;
          return kept;
        }

        const displayName = toDisplayName(name);
        const kebab = toKebabCase(displayName);
        if (!kebab) {
          stats.unclearMatches.push(`Could not derive filename for: ${name}`);
          return kept;
        }

        kept.push({
          filePath: path.join(RAW_DIR, name),
          baseName: name,
          displayName,
          kebab,
        });
        return kept;
      }, []);
}

async function optimizeToPath(inputPath, outputPath, sourceExt) {
  const image = sharp(inputPath, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  let pipeline = image;

  if ((metadata.width ?? 0) > 1600) {
    pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
  }

  if (sourceExt === ".heic" || sourceExt === ".heif") {
    await pipeline.webp({ quality: 82 }).toFile(outputPath);
    stats.convertedFromHeic += 1;
    return;
  }

  if (sourceExt === ".jpg" || sourceExt === ".jpeg") {
    await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(outputPath);
    stats.keptNativeFormats += 1;
    return;
  }

  if (sourceExt === ".png") {
    if (metadata.hasAlpha) {
      await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
      stats.keptNativeFormats += 1;
      return;
    }
    await pipeline.webp({ quality: 82 }).toFile(outputPath);
    stats.pngConvertedToWebp += 1;
    return;
  }

  if (sourceExt === ".webp") {
    await pipeline.webp({ quality: 82 }).toFile(outputPath);
    stats.keptNativeFormats += 1;
    return;
  }

  await pipeline.webp({ quality: 82 }).toFile(outputPath);
}

function targetExtension(sourceExt, hasAlpha) {
  if (sourceExt === ".heic" || sourceExt === ".heif") return ".webp";
  if (sourceExt === ".jpeg") return ".jpg";
  if (sourceExt === ".png") return hasAlpha ? ".png" : ".webp";
  return sourceExt;
}

async function processImages(candidates) {
  cleanDir(OUTPUT_DIR);
  ensureDir(path.dirname(MAP_FILE));
  ensureDir(path.dirname(REPORT_FILE));

  const hashGroups = new Map();
  for (const item of candidates) {
    let hash;
    try {
      hash = hashFile(item.filePath);
    } catch (error) {
      stats.failedFiles.push(`${item.baseName}: hash failed (${error.message})`);
      continue;
    }

    if (!hashGroups.has(hash)) {
      hashGroups.set(hash, []);
    }
    hashGroups.get(hash).push(item);
  }

  const optimizedByHash = new Map();

  for (const [hash, group] of hashGroups.entries()) {
    const uniqueItems = new Map();
    for (const item of group) {
      if (!uniqueItems.has(item.kebab)) {
        uniqueItems.set(item.kebab, item);
      } else {
        stats.hashDuplicatesRemoved += 1;
      }
    }

    const items = [...uniqueItems.values()];
    if (items.length > 1) {
      stats.sharedImageGroups.push({
        products: items.map((item) => item.displayName),
      });
    }

    let masterOutputPath = optimizedByHash.get(hash);

    for (const item of items) {
      const sourceExt = path.extname(item.filePath).toLowerCase();
      let metadata = { hasAlpha: false };
      try {
        metadata = await sharp(item.filePath, { failOn: "none" }).metadata();
      } catch (error) {
        stats.failedFiles.push(`${item.baseName}: metadata failed (${error.message})`);
        continue;
      }

      const ext = targetExtension(sourceExt, Boolean(metadata.hasAlpha));
      const outputPath = path.join(OUTPUT_DIR, `${item.kebab}${ext}`);

      try {
        if (!masterOutputPath) {
          await optimizeToPath(item.filePath, outputPath, sourceExt);
          masterOutputPath = outputPath;
          optimizedByHash.set(hash, outputPath);
        } else {
          fs.copyFileSync(masterOutputPath, outputPath);
        }

        stats.productMap[item.displayName] =
          `/brand-reference/products/${path.basename(outputPath)}`;
        stats.finalCount += 1;
      } catch (error) {
        stats.failedFiles.push(`${item.baseName}: ${error.message}`);
      }
    }
  }
}

function writeMap() {
  const sorted = Object.fromEntries(
    Object.entries(stats.productMap).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.writeFileSync(MAP_FILE, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
}

function writeReport() {
  const lines = [
    "# Image Cleanup Report",
    "",
    "## Source Archive",
    "",
    `- Expected path: \`imports/scent-photos.zip\` (${stats.primaryZipFound ? "found" : "not found"})`,
    `- Processed from: \`${stats.zipSource}\``,
    "- Original ZIP was not modified or deleted.",
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| Original images in ZIP | ${stats.originalCount} |`,
    `| Numbered filename duplicates removed e.g. (1), (2) | ${stats.numberedDuplicatesRemoved} |`,
    `| Copy/duplicate filename duplicates removed | ${stats.textDuplicatesRemoved} |`,
    `| Exact hash duplicates removed | ${stats.hashDuplicatesRemoved} |`,
    `| HEIC/HEIF converted to WebP | ${stats.convertedFromHeic} |`,
    `| Opaque PNG converted to WebP | ${stats.pngConvertedToWebp} |`,
    `| Suitable JPG/PNG/WebP retained or recompressed | ${stats.keptNativeFormats} |`,
    `| Final optimized images | ${stats.finalCount} |`,
    "",
    "## Output Locations",
    "",
    "- Cleaned images: `public/brand-reference/products/`",
    "- Product map: `src/data/product-image-map.json`",
    "",
    "## Products Sharing the Same Image",
    "",
  ];

  if (stats.sharedImageGroups.length === 0) {
    lines.push("No shared-image groups detected among distinct product names.");
  } else {
    for (const group of stats.sharedImageGroups) {
      lines.push(`- ${group.products.join(" | ")}`);
    }
  }

  lines.push("", "## Unclear or Missing Product Matches", "");
  if (stats.unclearMatches.length === 0) {
    lines.push("None.");
  } else {
    for (const item of stats.unclearMatches) {
      lines.push(`- ${item}`);
    }
  }

  lines.push("", "## Files That Could Not Be Processed", "");
  if (stats.failedFiles.length === 0) {
    lines.push("None.");
  } else {
    for (const item of stats.failedFiles) {
      lines.push(`- ${item}`);
    }
  }

  fs.writeFileSync(REPORT_FILE, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const zipPath = chooseZipSource();
  stats.zipSource = path.relative(ROOT, zipPath).replace(/\\/g, "/");

  extractZip(zipPath);
  const candidates = collectCandidates();
  await processImages(candidates);
  writeMap();
  writeReport();

  console.log(
    JSON.stringify(
      {
        zipSource: stats.zipSource,
        originalCount: stats.originalCount,
        finalCount: stats.finalCount,
        mapEntries: Object.keys(stats.productMap).length,
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

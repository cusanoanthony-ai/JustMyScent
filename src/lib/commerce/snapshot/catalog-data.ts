import catalogJson from "@/data/just-my-scent-catalog.json";
import scentMetadataJson from "@/data/scent-metadata.json";
import type { Audience, Money, Product, ProductImage, ScentFamily } from "@/lib/commerce/types";

export interface CatalogRecord {
  handle: string;
  sourceTitle: string;
  displayTitle: string;
  publicUrl: string;
  sourceUrl: string;
  snapshotDate: string;
  price?: Money;
  compareAtPrice?: Money;
  currency: string;
  availableForSale: boolean;
  description: string;
  descriptionHtml?: string;
  productType?: string;
  vendor?: string;
  tags: string[];
  collections: Array<{ handle: string; title: string }>;
  audience: Audience;
  variants: Array<{
    id: string;
    title: string;
    price: Money;
    compareAtPrice?: Money;
    availableForSale: boolean;
  }>;
  images: ProductImage[];
  primaryImage?: ProductImage;
  localImage?: string | null;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ScentMetadataRecord {
  handle: string;
  sourceTitle: string;
  displayTitle: string;
  sourceUrl: string;
  referenceFragrance?: { source: string | null; confidence: string; sourceUrl: string };
  referenceBrand?: { source: string | null; confidence: string; sourceUrl: string };
  scentFamily: { source: string | null; normalized: string | null; confidence: string; sourceUrl: string };
  topNotes: { source: string[]; normalized: string[]; confidence: string };
  heartNotes: { source: string[]; normalized: string[]; confidence: string };
  middleNotes: { source: string[]; normalized: string[]; confidence: string };
  baseNotes: { source: string[]; normalized: string[]; confidence: string };
  audience: { source: string; normalized: string; confidence: string; sourceUrl: string };
  mood: { source: string | null; normalized: string | null; confidence: string; sourceUrl: string };
  occasion: { source: string | null; normalized: string | null; confidence: string; sourceUrl: string };
  fragranceStrength: { source: string | null; normalized: string | null; confidence: string; sourceUrl: string };
  season: { source: string | null; normalized: string | null; confidence: string; sourceUrl: string };
  applicationGuidance?: { source: string | null; confidence: string; sourceUrl: string };
  quizEligible: boolean;
  missingFields: string[];
  reviewStatus: string;
}

export const catalogData = catalogJson as {
  snapshotDate: string;
  source: string;
  collectionRecords: Array<{
    handle: string;
    title: string;
    description: string;
    productCount: number;
    publicUrl: string;
  }>;
  products: CatalogRecord[];
};

export const scentMetadataByHandle = scentMetadataJson as Record<string, ScentMetadataRecord>;

export function mapCatalogProduct(record: CatalogRecord): Product {
  const metadata = scentMetadataByHandle[record.handle];
  const prices = record.variants.map((variant) => Number.parseFloat(variant.price.amount));
  const comparePrices = record.variants
    .map((variant) => variant.compareAtPrice?.amount)
    .filter(Boolean)
    .map((amount) => Number.parseFloat(amount as string));

  const localImage: ProductImage | undefined = record.localImage
    ? { url: record.localImage, altText: record.displayTitle }
    : undefined;

  const remoteImages = record.images ?? [];
  const featuredImage = localImage ?? record.primaryImage ?? remoteImages[0];

  const scentFamily =
    metadata?.scentFamily.normalized ??
    metadata?.scentFamily.source ??
    "Uncategorized";

  return {
    id: `snapshot-${record.handle}`,
    handle: record.handle,
    title: record.displayTitle,
    sourceTitle: record.sourceTitle,
    description: record.description,
    descriptionHtml: record.descriptionHtml,
    shortDescription: record.description.slice(0, 180),
    productType: record.productType,
    vendor: record.vendor,
    tags: record.tags,
    featuredImage,
    images: localImage ? [localImage, ...remoteImages] : remoteImages,
    localImagePath: record.localImage ?? undefined,
    priceRange: {
      min: record.price ?? { amount: Math.min(...prices).toFixed(2), currencyCode: "USD" },
      max: record.price ?? { amount: Math.max(...prices).toFixed(2), currencyCode: "USD" },
    },
    compareAtPriceRange:
      comparePrices.length > 0
        ? {
            min: { amount: Math.min(...comparePrices).toFixed(2), currencyCode: "USD" },
            max: { amount: Math.max(...comparePrices).toFixed(2), currencyCode: "USD" },
          }
        : undefined,
    availableForSale: record.availableForSale,
    options: [{ name: "Size", values: record.variants.map((variant) => variant.title) }],
    variants: record.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      availableForSale: variant.availableForSale,
      selectedOptions: [{ name: "Size", value: variant.title }],
    })),
    collections: record.collections,
    seo: { title: record.seoTitle, description: record.seoDescription },
    audience: record.audience,
    scentFamily: scentFamily as ScentFamily,
    scentFamilyRaw: metadata?.scentFamily.source ?? undefined,
    topNotes: metadata?.topNotes.normalized ?? [],
    heartNotes: metadata?.heartNotes.normalized ?? metadata?.middleNotes.normalized ?? [],
    baseNotes: metadata?.baseNotes.normalized ?? [],
    mood: metadata?.mood.normalized ?? metadata?.mood.source ?? "",
    occasion: metadata?.occasion.normalized ?? metadata?.occasion.source ?? "",
    fragranceStrength:
      metadata?.fragranceStrength.normalized ?? metadata?.fragranceStrength.source ?? "",
    referenceFragrance: metadata?.referenceFragrance?.source ?? undefined,
    referenceBrand: metadata?.referenceBrand?.source ?? undefined,
    quizEligible: metadata?.quizEligible ?? false,
    metadataCoverage: metadata?.quizEligible ? "complete" : metadata ? "limited" : "missing",
    publicUrl: record.publicUrl,
    sourceUrl: record.sourceUrl,
    featured: record.collections.some((collection) => collection.handle === "best-sellers"),
    isNew: false,
    createdAt: record.snapshotDate,
  };
}

export const snapshotProducts: Product[] = catalogData.products.map(mapCatalogProduct);

export const snapshotProductMap = new Map(snapshotProducts.map((product) => [product.handle, product]));

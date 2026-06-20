import type {
  Audience,
  Cart,
  CartLine,
  Collection,
  Money,
  Product,
  ProductImage,
  ProductListOptions,
  ProductVariant,
  ScentFamily,
  SortOption,
} from "@/lib/commerce/types";

interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyImage {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

interface ShopifyMetafield {
  namespace: string;
  key: string;
  value: string;
  type?: string;
}

interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney | null;
  selectedOptions: Array<{ name: string; value: string }>;
  image?: ShopifyImage | null;
  product?: { handle: string; title: string };
}

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  productType?: string;
  vendor?: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage?: ShopifyImage | null;
  images?: { nodes: ShopifyImage[] };
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  options: Array<{ name: string; values: string[] }>;
  variants: { nodes: ShopifyVariant[] };
  collections?: { nodes: Array<{ handle: string; title: string }> };
  seo?: { title?: string | null; description?: string | null };
  metafields?: Array<ShopifyMetafield | null>;
}

interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  image?: ShopifyImage | null;
  seo?: { title?: string | null; description?: string | null };
  products?: {
    nodes: ShopifyProduct[];
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };
}

interface ShopifyCart {
  id: string;
  checkoutUrl?: string | null;
  totalQuantity: number;
  cost: { subtotalAmount: ShopifyMoney };
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      merchandise: ShopifyVariant;
    }>;
  };
}

const SCENT_FAMILY_MAP: Record<string, ScentFamily> = {
  "sweet-gourmand": "Sweet & Gourmand",
  gourmand: "Sweet & Gourmand",
  sweet: "Sweet & Gourmand",
  "fresh-clean": "Fresh & Clean",
  fresh: "Fresh & Clean",
  clean: "Fresh & Clean",
  floral: "Floral",
  "warm-sensual": "Warm & Sensual",
  warm: "Warm & Sensual",
  sensual: "Warm & Sensual",
  "woody-earthy": "Woody & Earthy",
  woody: "Woody & Earthy",
  earthy: "Woody & Earthy",
  "bold-refined": "Bold & Refined",
  bold: "Bold & Refined",
  refined: "Bold & Refined",
};

function mapMoney(money: ShopifyMoney): Money {
  return { amount: money.amount, currencyCode: money.currencyCode };
}

function mapImage(image?: ShopifyImage | null): ProductImage | undefined {
  if (!image?.url) {
    return undefined;
  }

  return {
    url: image.url,
    altText: image.altText ?? undefined,
    width: image.width ?? undefined,
    height: image.height ?? undefined,
  };
}

function parseList(value?: string): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
  } catch {
    // fall through
  }

  return value
    .split(/[,|/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getMetafieldValue(
  metafields: Array<ShopifyMetafield | null> | undefined,
  key: string,
): string | undefined {
  const metafield = metafields?.find(
    (item) => item?.namespace === "custom" && item.key === key,
  );
  return metafield?.value ?? undefined;
}

function getTagValue(tags: string[], prefix: string): string | undefined {
  const tag = tags.find((item) => item.toLowerCase().startsWith(`${prefix}:`));
  return tag?.split(":").slice(1).join(":").trim();
}

function normalizeAudience(value?: string, tags: string[] = []): Audience {
  const raw = (value ?? getTagValue(tags, "audience") ?? "unisex").toLowerCase();
  if (raw.includes("women") || raw.includes("woman")) return "women";
  if (raw.includes("men") || raw.includes("man")) return "men";
  return "unisex";
}

function normalizeScentFamily(value?: string, tags: string[] = []): ScentFamily {
  const raw = (value ?? getTagValue(tags, "scent") ?? "fresh-clean")
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/\s+/g, "-");

  return SCENT_FAMILY_MAP[raw] ?? "Fresh & Clean";
}

function normalizeNotes(metafieldValue?: string, tags: string[] = []): string[] {
  const fromMetafield = parseList(metafieldValue);
  if (fromMetafield.length) {
    return fromMetafield;
  }

  return tags
    .filter((tag) => tag.toLowerCase().startsWith("note:"))
    .map((tag) => tag.split(":").slice(1).join(":").trim())
    .filter(Boolean);
}

export function mapShopifyVariant(variant: ShopifyVariant): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    price: mapMoney(variant.price),
    compareAtPrice: variant.compareAtPrice ? mapMoney(variant.compareAtPrice) : undefined,
    availableForSale: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable ?? undefined,
    selectedOptions: variant.selectedOptions,
  };
}

export function mapShopifyProduct(product: ShopifyProduct): Product {
  const metafields = product.metafields ?? [];
  const tags = product.tags ?? [];
  const images = product.images?.nodes?.map(mapImage).filter(Boolean) as ProductImage[];

  const topNotes = normalizeNotes(getMetafieldValue(metafields, "top_notes"), tags);
  const heartNotes = normalizeNotes(getMetafieldValue(metafields, "heart_notes"), tags);
  const baseNotes = normalizeNotes(getMetafieldValue(metafields, "base_notes"), tags);

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    shortDescription: product.description.split(".")[0],
    productType: product.productType,
    vendor: product.vendor,
    tags,
    featuredImage: mapImage(product.featuredImage) ?? images[0],
    images,
    priceRange: {
      min: mapMoney(product.priceRange.minVariantPrice),
      max: mapMoney(product.priceRange.maxVariantPrice),
    },
    compareAtPriceRange: product.compareAtPriceRange
      ? {
          min: mapMoney(product.compareAtPriceRange.minVariantPrice),
          max: mapMoney(product.compareAtPriceRange.maxVariantPrice),
        }
      : undefined,
    availableForSale: product.availableForSale,
    options: product.options,
    variants: product.variants.nodes.map(mapShopifyVariant),
    collections: product.collections?.nodes ?? [],
    seo: {
      title: product.seo?.title ?? undefined,
      description: product.seo?.description ?? undefined,
    },
    audience: normalizeAudience(getMetafieldValue(metafields, "audience"), tags),
    scentFamily: normalizeScentFamily(getMetafieldValue(metafields, "scent_family"), tags),
    topNotes,
    heartNotes,
    baseNotes,
    mood: getMetafieldValue(metafields, "mood") ?? getTagValue(tags, "mood") ?? "Balanced",
    occasion:
      getMetafieldValue(metafields, "occasion") ??
      getTagValue(tags, "occasion") ??
      "Everyday",
    fragranceStrength:
      getMetafieldValue(metafields, "fragrance_strength") ?? "Moderate",
    featuredMessage: getMetafieldValue(metafields, "featured_message"),
    featured: tags.some((tag) => tag.toLowerCase().includes("featured")),
    isNew: tags.some((tag) => tag.toLowerCase().includes("new")),
  };
}

export function mapShopifyCollection(
  collection: ShopifyCollection,
  productCount = 0,
): Collection {
  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    description: collection.description,
    descriptionHtml: collection.descriptionHtml,
    image: mapImage(collection.image),
    seo: {
      title: collection.seo?.title ?? undefined,
      description: collection.seo?.description ?? undefined,
    },
    productCount,
  };
}

export function mapShopifyCart(cart: ShopifyCart): Cart {
  const lines: CartLine[] = cart.lines.nodes.map((line) => ({
    id: line.id,
    quantity: line.quantity,
    merchandiseId: line.merchandise.id,
    productHandle: line.merchandise.product?.handle ?? "",
    productTitle: line.merchandise.product?.title ?? "",
    variantTitle: line.merchandise.title,
    image: mapImage(line.merchandise.image),
    price: mapMoney(line.merchandise.price),
    compareAtPrice: line.merchandise.compareAtPrice
      ? mapMoney(line.merchandise.compareAtPrice)
      : undefined,
    availableForSale: line.merchandise.availableForSale,
  }));

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl ?? undefined,
    lines,
    subtotal: mapMoney(cart.cost.subtotalAmount),
    totalQuantity: cart.totalQuantity,
  };
}

export function buildShopifyProductQuery(options?: ProductListOptions): string | undefined {
  const filters = options?.filters;
  const parts: string[] = [];

  if (filters?.query) {
    parts.push(filters.query);
  }

  if (filters?.availableOnly) {
    parts.push("available_for_sale:true");
  }

  if (filters?.collectionHandle) {
    parts.push(`collection:${filters.collectionHandle}`);
  }

  if (filters?.audience?.length) {
    parts.push(
      filters.audience.map((audience) => `tag:audience:${audience}`).join(" OR "),
    );
  }

  if (filters?.scentFamily?.length) {
    parts.push(
      filters.scentFamily
        .map((family) => `tag:scent:${family.toLowerCase().replace(/[^a-z]+/g, "-")}`)
        .join(" OR "),
    );
  }

  return parts.length ? parts.join(" ") : undefined;
}

export function mapSortToShopify(sort: SortOption = "featured"): {
  sortKey: string;
  reverse: boolean;
} {
  switch (sort) {
    case "title-asc":
      return { sortKey: "TITLE", reverse: false };
    case "title-desc":
      return { sortKey: "TITLE", reverse: true };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "newest":
      return { sortKey: "CREATED_AT", reverse: true };
    case "featured":
    default:
      return { sortKey: "BEST_SELLING", reverse: false };
  }
}

export function mapShopifyCollectionWithProducts(collection: ShopifyCollection | null) {
  if (!collection) {
    return null;
  }

  const products = collection.products?.nodes.map(mapShopifyProduct) ?? [];
  return {
    collection: mapShopifyCollection(collection, products.length),
    products,
    pageInfo: {
      hasNextPage: collection.products?.pageInfo.hasNextPage ?? false,
      endCursor: collection.products?.pageInfo.endCursor ?? undefined,
    },
  };
}

export type { ShopifyProduct, ShopifyCollection, ShopifyCart };

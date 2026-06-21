import type {
  Product,
  ProductFilters,
  ProductListOptions,
  ProductListResult,
  SortOption,
} from "@/lib/commerce/types";
import { snapshotProducts } from "@/lib/commerce/snapshot/catalog-data";

function getMinPrice(product: Product): number {
  return Number.parseFloat(product.priceRange.min.amount);
}

function sortProducts(products: Product[], sort: SortOption = "featured"): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "price-asc":
      return sorted.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    case "price-desc":
      return sorted.sort((a, b) => getMinPrice(b) - getMinPrice(a));
    case "newest":
      return sorted.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    case "featured":
    default:
      return sorted.sort((a, b) => {
        if (Boolean(a.featured) !== Boolean(b.featured)) {
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        }
        return a.title.localeCompare(b.title);
      });
  }
}

function matchesFilters(product: Product, filters?: ProductFilters): boolean {
  if (!filters) return true;

  if (filters.query) {
    const query = filters.query.toLowerCase();
    const haystack = [
      product.title,
      product.sourceTitle ?? "",
      product.description,
      product.scentFamily,
      product.scentFamilyRaw ?? "",
      product.referenceFragrance ?? "",
      product.referenceBrand ?? "",
      product.audience,
      ...product.topNotes,
      ...product.heartNotes,
      ...product.baseNotes,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  if (filters.audience?.length && !filters.audience.includes(product.audience)) {
    return false;
  }

  if (filters.scentFamily?.length) {
    const family = `${product.scentFamily} ${product.scentFamilyRaw ?? ""}`.toLowerCase();
    const match = filters.scentFamily.some((value) => family.includes(value.toLowerCase()));
    if (!match) return false;
  }

  if (filters.notes?.length) {
    const notes = [...product.topNotes, ...product.heartNotes, ...product.baseNotes].map((note) =>
      note.toLowerCase(),
    );
    const hasNote = filters.notes.some((note) =>
      notes.some((productNote) => productNote.includes(note.toLowerCase())),
    );
    if (!hasNote) return false;
  }

  if (filters.availableOnly && !product.availableForSale) return false;

  const minPrice = getMinPrice(product);
  if (filters.minPrice !== undefined && minPrice < filters.minPrice) return false;
  if (filters.maxPrice !== undefined && minPrice > filters.maxPrice) return false;

  if (filters.collectionHandle) {
    const inCollection = product.collections.some(
      (collection) => collection.handle === filters.collectionHandle,
    );
    if (!inCollection) return false;
  }

  return true;
}

export function filterSnapshotProducts(
  products: Product[],
  options?: ProductListOptions,
): ProductListResult {
  const filtered = sortProducts(
    products.filter((product) => matchesFilters(product, options?.filters)),
    options?.sort,
  );

  const first = options?.first ?? filtered.length;
  const startIndex = options?.after ? Number.parseInt(options.after, 10) : 0;
  const pageProducts = filtered.slice(startIndex, startIndex + first);
  const nextIndex = startIndex + first;

  return {
    products: pageProducts,
    totalCount: filtered.length,
    pageInfo: {
      hasNextPage: nextIndex < filtered.length,
      endCursor: nextIndex < filtered.length ? String(nextIndex) : undefined,
    },
  };
}

export function getSnapshotNotes(): string[] {
  const notes = new Set<string>();
  for (const product of snapshotProducts) {
    for (const note of [...product.topNotes, ...product.heartNotes, ...product.baseNotes]) {
      notes.add(note);
    }
  }
  return [...notes].sort((a, b) => a.localeCompare(b));
}

export function getSnapshotScentFamilies(): string[] {
  const families = new Set<string>();
  for (const product of snapshotProducts) {
    if (product.scentFamilyRaw) families.add(product.scentFamilyRaw);
    if (product.scentFamily) families.add(product.scentFamily);
  }
  return [...families].sort((a, b) => a.localeCompare(b));
}

export function getRelatedSnapshotProducts(product: Product, limit = 4): Product[] {
  return snapshotProducts
    .filter(
      (item) =>
        item.handle !== product.handle &&
        (item.scentFamily === product.scentFamily ||
          item.audience === product.audience ||
          item.topNotes.some((note) => product.topNotes.includes(note))),
    )
    .slice(0, limit);
}

import type {
  Audience,
  ProductFilters,
  ScentFamily,
  SortOption,
} from "@/lib/commerce/types";

export interface ShopSearchParams {
  q?: string;
  sort?: SortOption;
  audience?: string;
  scent?: string;
  notes?: string;
  available?: string;
  min?: string;
  max?: string;
  after?: string;
}

export function parseShopSearchParams(
  searchParams: ShopSearchParams,
): ProductFilters & { sort: SortOption; after?: string; query?: string } {
  const audience = searchParams.audience
    ?.split(",")
    .filter(Boolean) as Audience[] | undefined;

  const scentFamily = searchParams.scent
    ?.split(",")
    .map((value) => decodeURIComponent(value)) as ScentFamily[] | undefined;

  const notes = searchParams.notes?.split(",").filter(Boolean);

  return {
    query: searchParams.q,
    sort: (searchParams.sort as SortOption) ?? "featured",
    after: searchParams.after,
    audience,
    scentFamily,
    notes,
    availableOnly: searchParams.available === "1",
    minPrice: searchParams.min ? Number.parseFloat(searchParams.min) : undefined,
    maxPrice: searchParams.max ? Number.parseFloat(searchParams.max) : undefined,
  };
}

export function buildShopQueryString(
  current: ShopSearchParams,
  updates: Partial<ShopSearchParams>,
): string {
  const merged = { ...current, ...updates, after: updates.after ?? undefined };
  const params = new URLSearchParams();

  Object.entries(merged).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
}

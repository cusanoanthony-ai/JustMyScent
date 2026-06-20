"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  getAllDemoNotes,
  getDemoAudiences,
  getDemoScentFamilies,
} from "@/lib/commerce/demo/filters";
import type { SortOption } from "@/lib/commerce/types";
import { buildShopQueryString, type ShopSearchParams } from "@/lib/shop/filters";

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "title-asc", label: "Name A–Z" },
  { value: "title-desc", label: "Name Z–A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function FilterPanel({
  searchParams,
  onNavigate,
}: {
  searchParams: ShopSearchParams;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const audiences = getDemoAudiences();
  const scentFamilies = getDemoScentFamilies();
  const notes = getAllDemoNotes().slice(0, 8);

  const update = (updates: Partial<ShopSearchParams>) => {
    router.push(`/shop?${buildShopQueryString(searchParams, updates)}`);
    onNavigate?.();
  };

  const selectedAudience = searchParams.audience?.split(",") ?? [];
  const selectedScent = searchParams.scent?.split(",").map(decodeURIComponent) ?? [];
  const selectedNotes = searchParams.notes?.split(",") ?? [];

  const toggleListValue = (current: string[], value: string) =>
    current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold tracking-[0.16em] text-espresso uppercase">
          Sort
        </h2>
        <select
          value={searchParams.sort ?? "featured"}
          onChange={(event) =>
            update({ sort: event.target.value as SortOption })
          }
          className="mt-3 w-full border border-espresso/15 bg-transparent px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          aria-label="Sort products"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-sm font-semibold tracking-[0.16em] text-espresso uppercase">
          Audience
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {audiences.map((audience) => (
            <button
              key={audience}
              type="button"
              onClick={() =>
                update({
                  audience: toggleListValue(selectedAudience, audience).join(",") || undefined,
                })
              }
              className={`border px-3 py-2 text-xs tracking-[0.12em] uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne ${
                selectedAudience.includes(audience)
                  ? "border-espresso bg-espresso text-ivory"
                  : "border-espresso/15 text-espresso"
              }`}
            >
              {audience}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold tracking-[0.16em] text-espresso uppercase">
          Scent Family
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {scentFamilies.map((family) => (
            <button
              key={family}
              type="button"
              onClick={() =>
                update({
                  scent:
                    toggleListValue(selectedScent, family)
                      .map(encodeURIComponent)
                      .join(",") || undefined,
                })
              }
              className={`border px-3 py-2 text-xs tracking-[0.12em] uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne ${
                selectedScent.includes(family)
                  ? "border-espresso bg-espresso text-ivory"
                  : "border-espresso/15 text-espresso"
              }`}
            >
              {family}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold tracking-[0.16em] text-espresso uppercase">
          Notes
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {notes.map((note) => (
            <button
              key={note}
              type="button"
              onClick={() =>
                update({
                  notes: toggleListValue(selectedNotes, note).join(",") || undefined,
                })
              }
              className={`border px-3 py-2 text-xs tracking-[0.12em] uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne ${
                selectedNotes.includes(note)
                  ? "border-espresso bg-espresso text-ivory"
                  : "border-espresso/15 text-espresso"
              }`}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-espresso">
        <input
          type="checkbox"
          checked={searchParams.available === "1"}
          onChange={(event) =>
            update({ available: event.target.checked ? "1" : undefined })
          }
          className="h-4 w-4 border-espresso/30"
        />
        Available items only
      </label>

      <button
        type="button"
        onClick={() => router.push("/shop")}
        className="text-xs font-semibold tracking-[0.14em] text-espresso uppercase underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
      >
        Clear all filters
      </button>
    </div>
  );
}

export function ShopFilters({ searchParams }: { searchParams: ShopSearchParams }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeChips = useMemo(() => {
    const chips: Array<{ label: string; key: keyof ShopSearchParams; value?: string }> = [];
    if (searchParams.audience) chips.push({ label: searchParams.audience, key: "audience" });
    if (searchParams.scent) chips.push({ label: searchParams.scent, key: "scent" });
    if (searchParams.notes) chips.push({ label: searchParams.notes, key: "notes" });
    if (searchParams.available === "1") chips.push({ label: "Available", key: "available", value: "1" });
    return chips;
  }, [searchParams]);

  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="border border-espresso/15 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-espresso uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
        >
          Filters
        </button>
      </div>

      <aside className="hidden lg:block">
        <FilterPanel searchParams={searchParams} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[55] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-espresso/20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 h-full w-full max-w-sm overflow-y-auto bg-ivory p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl text-espresso">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-espresso/70"
              >
                Close
              </button>
            </div>
            <FilterPanel searchParams={searchParams} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      {activeChips.length ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <button
              key={`${chip.key}-${chip.label}`}
              type="button"
              onClick={() => {
                router.push(
                  `${pathname}?${buildShopQueryString(searchParams, { [chip.key]: undefined })}`,
                );
              }}
              className="border border-espresso/15 px-3 py-1 text-xs text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
            >
              {chip.label} ×
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

export function ShopSearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      className="mb-8"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      }}
    >
      <label htmlFor="shop-search" className="sr-only">
        Search shop
      </label>
      <input
        id="shop-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search the shop"
        className="w-full border border-espresso/15 bg-transparent px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
      />
    </form>
  );
}

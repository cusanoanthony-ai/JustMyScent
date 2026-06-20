"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close search overlay"
        className="absolute inset-0 bg-espresso/25"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className="relative mx-auto mt-20 w-full max-w-2xl border border-espresso/10 bg-ivory px-4 py-5 shadow-xl sm:px-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-espresso">Search</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-sm p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!query.trim()) return;
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            onClose();
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            Search products
          </label>
          <div className="flex items-center gap-3 border border-espresso/15 px-3 py-2">
            <SearchIcon className="h-5 w-5 text-espresso/60" />
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by scent, note, or product name"
              className="w-full bg-transparent text-base text-espresso outline-none placeholder:text-espresso/45"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Vanilla", "Rose", "Fresh", "Amber", "Unisex"].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                onClick={onClose}
                className="border border-espresso/10 px-3 py-2 text-xs tracking-[0.12em] text-espresso uppercase hover:border-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
              >
                {term}
              </Link>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}

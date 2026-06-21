"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart } from "@/components/cart/CartProvider";
import { SearchDialog } from "@/components/search/SearchDialog";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/icons";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Women", href: "/collections/womens-fragrance" },
  { label: "Men", href: "/collections/mens-fragrance" },
  { label: "Unisex", href: "/collections/frontpage" },
  { label: "Scent Finder", href: "/scent-finder" },
  { label: "About", href: "/about" },
];

export function Header() {
  const { openCart, cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuId = useId();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      firstLinkRef.current?.focus();
    }
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-espresso/10 bg-ivory/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-tight text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
          >
            Just My Scent
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-espresso/80 transition-colors hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne motion-reduce:transition-none"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="rounded-sm p-2 text-espresso/80 transition-colors hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne motion-reduce:transition-none"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={`Cart, ${cart.totalQuantity} items`}
              onClick={openCart}
              className="relative rounded-sm p-2 text-espresso/80 transition-colors hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne motion-reduce:transition-none"
            >
              <CartIcon className="h-5 w-5" />
              {cart.totalQuantity > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center bg-espresso px-1 text-[0.65rem] text-ivory">
                  {cart.totalQuantity}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="rounded-sm p-2 text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne lg:hidden"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="fixed inset-0 top-[4.25rem] z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close menu overlay"
              className="absolute inset-0 bg-espresso/20"
              onClick={closeMenu}
            />
            <nav
              id={menuId}
              aria-label="Mobile navigation"
              className="relative max-h-[calc(100vh-4.25rem)] overflow-y-auto border-t border-espresso/10 bg-ivory px-4 py-6 shadow-sm"
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <li key={link.label}>
                    <Link
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={link.href}
                      onClick={closeMenu}
                      className="block rounded-sm px-2 py-3 text-base font-medium text-espresso/90 hover:bg-rose-muted/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ) : null}
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}

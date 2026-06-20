import Link from "next/link";
import { Container } from "@/components/ui/Container";

const shopLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Unisex", href: "/collections/unisex" },
  { label: "Scent Finder", href: "/scent-finder" },
];

const supportLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "About", href: "/about" },
];

const policyLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-espresso/10 bg-[#f3eee6]">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl font-semibold text-espresso">Just My Scent</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-espresso/65">
              An editorial fragrance-oil concept focused on personal discovery, concentrated
              formulas, and accessible luxury presentation.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-[0.16em] text-espresso uppercase">
              Shop
            </h2>
            <ul className="mt-4 space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-espresso/70 hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-[0.16em] text-espresso uppercase">
              Support
            </h2>
            <ul className="mt-4 space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-espresso/70 hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-[0.16em] text-espresso uppercase">
              Policies
            </h2>
            <ul className="mt-4 space-y-2">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-espresso/70 hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-espresso/10 pt-6">
          <p className="text-center text-sm leading-relaxed text-espresso/60">
            Unofficial redesign concept created for educational and portfolio purposes. This
            project is not affiliated with or commissioned by Just My Scent.
          </p>
        </div>
      </Container>
    </footer>
  );
}

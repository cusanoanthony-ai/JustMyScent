import type { Money } from "@/lib/commerce/types";

export function formatMoney(money: Money, locale = "en-US"): string {
  const amount = Number.parseFloat(money.amount);
  if (Number.isNaN(amount)) {
    return money.amount;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceRange(
  min: Money,
  max: Money,
  locale = "en-US",
): string {
  const minAmount = Number.parseFloat(min.amount);
  const maxAmount = Number.parseFloat(max.amount);

  if (minAmount === maxAmount) {
    return formatMoney(min, locale);
  }

  return `${formatMoney(min, locale)} – ${formatMoney(max, locale)}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function capitalizeWords(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

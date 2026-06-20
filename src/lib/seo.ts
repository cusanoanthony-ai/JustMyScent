import type { Metadata } from "next";
import type { Collection, Product } from "@/lib/commerce/types";
import { getSiteUrl } from "@/lib/env";

const SITE_NAME = "Just My Scent — Unofficial Redesign Concept";

export const baseMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "An unofficial headless Shopify redesign concept for concentrated fragrance oils, editorial discovery, and accessible luxury.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function buildProductMetadata(product: Product): Metadata {
  const title = product.seo?.title ?? product.title;
  const description =
    product.seo?.description ?? product.shortDescription ?? product.description.slice(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.handle}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/products/${product.handle}`,
      images: product.featuredImage?.url
        ? [{ url: product.featuredImage.url, alt: product.featuredImage.altText ?? product.title }]
        : undefined,
    },
  };
}

export function buildCollectionMetadata(collection: Collection): Metadata {
  const title = collection.seo?.title ?? collection.title;
  const description =
    collection.seo?.description ?? collection.description.slice(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `/collections/${collection.handle}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/collections/${collection.handle}`,
      images: collection.image?.url
        ? [{ url: collection.image.url, alt: collection.image.altText ?? collection.title }]
        : undefined,
    },
  };
}

export function buildProductJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((image) => image.url),
    sku: product.variants[0]?.id,
    brand: {
      "@type": "Brand",
      name: product.vendor ?? "Just My Scent",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.priceRange.min.currencyCode,
      lowPrice: product.priceRange.min.amount,
      highPrice: product.priceRange.max.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; item?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item ? `${getSiteUrl()}${entry.item}` : undefined,
    })),
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description:
      "Unofficial portfolio concept for a headless Shopify fragrance oil storefront.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

import type { MetadataRoute } from "next";
import { getCommerceProvider } from "@/lib/commerce";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const provider = getCommerceProvider();
  const products = await provider.getProducts({ first: 100 });
  const collections = await provider.getCollections();

  const staticRoutes = [
    "",
    "/shop",
    "/collections",
    "/search",
    "/scent-finder",
    "/about",
    "/contact",
    "/faq",
    "/shipping-returns",
    "/privacy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    })),
    ...collections.map((collection) => ({
      url: `${baseUrl}/collections/${collection.handle}`,
      lastModified: new Date(),
    })),
    ...products.products.map((product) => ({
      url: `${baseUrl}/products/${product.handle}`,
      lastModified: new Date(),
    })),
  ];
}

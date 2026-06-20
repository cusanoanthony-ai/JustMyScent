import {
  demoCollectionMap,
  demoCollections,
} from "@/lib/commerce/demo/collections";
import {
  addDemoCartLines,
  createDemoCart,
  getDemoCart,
  removeDemoCartLines,
  updateDemoCartLines,
} from "@/lib/commerce/demo/cart";
import {
  filterDemoProducts,
  getRelatedDemoProducts,
} from "@/lib/commerce/demo/filters";
import { demoProductMap, demoProducts } from "@/lib/commerce/demo/products";
import type {
  CartLineInput,
  CartLineUpdateInput,
  CommerceProvider,
  CommerceResult,
  Product,
  ProductListOptions,
  ProductListResult,
} from "@/lib/commerce/types";

const demoCartStore = new Map<string, ReturnType<typeof createDemoCart>>();

function getOrCreateDemoCart(cartId?: string) {
  const id = cartId ?? "demo-cart";
  if (!demoCartStore.has(id)) {
    demoCartStore.set(id, createDemoCart([], id));
  }
  return demoCartStore.get(id)!;
}

export const demoProvider: CommerceProvider = {
  async getShop() {
    return {
      name: "Just My Scent",
      description:
        "Concentrated fragrance oils for personal, long-lasting scent discovery.",
      primaryDomain: { url: "https://just-my-scent.example", host: "just-my-scent.example" },
      moneyFormat: "${{amount}}",
    };
  },

  async getProducts(options?: ProductListOptions): Promise<ProductListResult> {
    return filterDemoProducts(demoProducts, options);
  },

  async getProductByHandle(handle: string) {
    return demoProductMap.get(handle) ?? null;
  },

  async getFeaturedProducts(limit = 8) {
    return filterDemoProducts(demoProducts, {
      first: 100,
      sort: "featured",
    }).products
      .filter((product) => product.featured)
      .slice(0, limit);
  },

  async getProductsByCollection(handle: string, options?: ProductListOptions) {
    return filterDemoProducts(demoProducts, {
      ...options,
      filters: {
        ...options?.filters,
        collectionHandle: handle,
      },
    });
  },

  async getCollectionByHandle(handle: string) {
    return demoCollectionMap.get(handle) ?? null;
  },

  async getCollections() {
    return demoCollections;
  },

  async searchProducts(query: string, options?: ProductListOptions) {
    return filterDemoProducts(demoProducts, {
      ...options,
      filters: {
        ...options?.filters,
        query,
      },
    });
  },

  async getRelatedProducts(product: Product, limit = 4) {
    return getRelatedDemoProducts(product, limit);
  },

  async createCart(lines: CartLineInput[] = []) {
    const cart = createDemoCart(lines);
    demoCartStore.set(cart.id, cart);
    return { data: cart };
  },

  async getCart(cartId: string): Promise<CommerceResult<import("@/lib/commerce/types").Cart>> {
    const cart = demoCartStore.get(cartId);
    if (!cart) {
      return { error: "Demo cart not found." };
    }
    return getDemoCart(cart);
  },

  async addCartLines(cartId: string, lines: CartLineInput[]) {
    const cart = getOrCreateDemoCart(cartId);
    const result = addDemoCartLines(cart, lines);
    if (result.data) {
      demoCartStore.set(cartId, result.data);
    }
    return result;
  },

  async updateCartLines(cartId: string, lines: CartLineUpdateInput[]) {
    const cart = getOrCreateDemoCart(cartId);
    const result = updateDemoCartLines(cart, lines);
    if (result.data) {
      demoCartStore.set(cartId, result.data);
    }
    return result;
  },

  async removeCartLines(cartId: string, lineIds: string[]) {
    const cart = getOrCreateDemoCart(cartId);
    const result = removeDemoCartLines(cart, lineIds);
    if (result.data) {
      demoCartStore.set(cartId, result.data);
    }
    return result;
  },

  async getCheckoutUrl() {
    return {
      error:
        "Demo checkout is disabled. Connect Shopify credentials to enable hosted checkout.",
    };
  },
};

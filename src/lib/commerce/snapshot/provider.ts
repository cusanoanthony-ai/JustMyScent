import {
  addDemoCartLines,
  createDemoCart,
  getDemoCart,
  removeDemoCartLines,
  updateDemoCartLines,
} from "@/lib/commerce/demo/cart";
import {
  catalogData,
  mapCatalogProduct,
  snapshotProductMap,
  snapshotProducts,
} from "@/lib/commerce/snapshot/catalog-data";
import {
  filterSnapshotProducts,
  getRelatedSnapshotProducts,
  getSnapshotNotes,
  getSnapshotScentFamilies,
} from "@/lib/commerce/snapshot/filters";
import type {
  Collection,
  CommerceProvider,
} from "@/lib/commerce/types";

const snapshotCartStore = new Map<string, ReturnType<typeof createDemoCart>>();

function getOrCreateCart(cartId?: string) {
  const id = cartId ?? "snapshot-cart";
  if (!snapshotCartStore.has(id)) {
    snapshotCartStore.set(id, createDemoCart([], id));
  }
  return snapshotCartStore.get(id)!;
}

export const snapshotProvider: CommerceProvider = {
  async getShop() {
    return {
      name: "Just My Scent",
      description: catalogData.source,
      primaryDomain: { url: catalogData.source, host: "justmyscent.online" },
      moneyFormat: "${{amount}}",
    };
  },

  async getProducts(options) {
    return filterSnapshotProducts(snapshotProducts, options);
  },

  async getProductByHandle(handle) {
    return snapshotProductMap.get(handle) ?? null;
  },

  async getFeaturedProducts(limit = 8) {
    return filterSnapshotProducts(snapshotProducts, {
      first: limit,
      sort: "featured",
      filters: {},
    }).products.filter((product) => product.featured);
  },

  async getProductsByCollection(handle, options) {
    return filterSnapshotProducts(snapshotProducts, {
      ...options,
      filters: { ...options?.filters, collectionHandle: handle },
    });
  },

  async getCollectionByHandle(handle) {
    const record = catalogData.collectionRecords.find((collection) => collection.handle === handle);
    if (!record) return null;
    const count = snapshotProducts.filter((product) =>
      product.collections.some((collection) => collection.handle === handle),
    ).length;
    return {
      id: `snapshot-collection-${handle}`,
      handle: record.handle,
      title: record.title,
      description: record.description,
      productCount: count,
    } satisfies Collection;
  },

  async getCollections() {
    return catalogData.collectionRecords
      .filter((record) => record.handle !== "all")
      .map((record) => ({
        id: `snapshot-collection-${record.handle}`,
        handle: record.handle,
        title: record.title,
        description: record.description,
        productCount: snapshotProducts.filter((product) =>
          product.collections.some((collection) => collection.handle === record.handle),
        ).length,
      }));
  },

  async searchProducts(query, options) {
    return filterSnapshotProducts(snapshotProducts, {
      ...options,
      filters: { ...options?.filters, query },
    });
  },

  async getRelatedProducts(product, limit = 4) {
    return getRelatedSnapshotProducts(product, limit);
  },

  async createCart(lines = []) {
    const cart = createDemoCart(lines, "snapshot-cart");
    snapshotCartStore.set(cart.id, cart);
    return { data: cart };
  },

  async getCart(cartId) {
    const cart = snapshotCartStore.get(cartId);
    if (!cart) return { error: "Cart not found." };
    return getDemoCart(cart);
  },

  async addCartLines(cartId, lines) {
    const cart = getOrCreateCart(cartId);
    const result = addDemoCartLines(cart, lines);
    if (result.data) snapshotCartStore.set(cartId, result.data);
    return result;
  },

  async updateCartLines(cartId, lines) {
    const cart = getOrCreateCart(cartId);
    const result = updateDemoCartLines(cart, lines);
    if (result.data) snapshotCartStore.set(cartId, result.data);
    return result;
  },

  async removeCartLines(cartId, lineIds) {
    const cart = getOrCreateCart(cartId);
    const result = removeDemoCartLines(cart, lineIds);
    if (result.data) snapshotCartStore.set(cartId, result.data);
    return result;
  },

  async getCheckoutUrl() {
    return {
      error:
        "Snapshot checkout is disabled. Connect Shopify credentials to enable hosted checkout.",
    };
  },
};

export { getSnapshotNotes, getSnapshotScentFamilies, mapCatalogProduct };

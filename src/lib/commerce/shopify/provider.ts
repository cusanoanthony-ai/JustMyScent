import type {
  CartLineInput,
  CommerceProvider,
  CommerceResult,
  ProductListOptions,
  ProductListResult,
} from "@/lib/commerce/types";
import { shopifyFetch } from "@/lib/commerce/shopify/client";
import {
  buildShopifyProductQuery,
  mapShopifyCart,
  mapShopifyCollection,
  mapShopifyCollectionWithProducts,
  mapShopifyProduct,
  mapSortToShopify,
  type ShopifyCart,
  type ShopifyCollection,
  type ShopifyProduct,
} from "@/lib/commerce/shopify/mappers";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
} from "@/lib/commerce/shopify/mutations";
import {
  CART_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
  SHOP_QUERY,
} from "@/lib/commerce/shopify/queries";

const REVALIDATE_SECONDS = 60;

function mapUserErrors(
  userErrors?: Array<{ field?: string[] | null; message: string }>,
): CommerceResult<never> | undefined {
  if (!userErrors?.length) {
    return undefined;
  }

  return {
    error: userErrors[0]?.message ?? "Shopify cart update failed.",
    userErrors: userErrors.map((error) => ({
      field: error.field ?? undefined,
      message: error.message,
    })),
  };
}

async function fetchProducts(options?: ProductListOptions): Promise<ProductListResult> {
  const first = options?.first ?? 24;
  const sort = mapSortToShopify(options?.sort);
  const query = buildShopifyProductQuery(options);

  const data = await shopifyFetch<{
    products: {
      nodes: ShopifyProduct[];
      pageInfo: { hasNextPage: boolean; endCursor?: string | null };
    };
  }>(PRODUCTS_QUERY, {
    first,
    after: options?.after,
    sortKey: sort.sortKey,
    reverse: sort.reverse,
    query,
  });

  const products = data.products.nodes.map(mapShopifyProduct);

  return {
    products,
    totalCount: products.length,
    pageInfo: {
      hasNextPage: data.products.pageInfo.hasNextPage,
      endCursor: data.products.pageInfo.endCursor ?? undefined,
    },
  };
}

export const shopifyProvider: CommerceProvider = {
  async getShop() {
    const data = await shopifyFetch<{
      shop: {
        name: string;
        description?: string | null;
        primaryDomain?: { url: string; host: string };
      };
    }>(SHOP_QUERY);

    return {
      name: data.shop.name,
      description: data.shop.description ?? undefined,
      primaryDomain: data.shop.primaryDomain,
    };
  },

  async getProducts(options) {
    return fetchProducts(options);
  },

  async getProductByHandle(handle) {
    const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
      PRODUCT_BY_HANDLE_QUERY,
      { handle },
    );
    return data.product ? mapShopifyProduct(data.product) : null;
  },

  async getFeaturedProducts(limit = 8) {
    const result = await fetchProducts({ first: limit, sort: "featured" });
    return result.products.slice(0, limit);
  },

  async getProductsByCollection(handle, options) {
    const sort = mapSortToShopify(options?.sort);
    const data = await shopifyFetch<{ collection: ShopifyCollection | null }>(
      COLLECTION_BY_HANDLE_QUERY,
      {
        handle,
        first: options?.first ?? 24,
        after: options?.after,
        sortKey: sort.sortKey,
        reverse: sort.reverse,
      },
    );

    const mapped = mapShopifyCollectionWithProducts(data.collection);
    if (!mapped) {
      return { products: [], totalCount: 0, pageInfo: { hasNextPage: false } };
    }

    return {
      products: mapped.products,
      totalCount: mapped.products.length,
      pageInfo: mapped.pageInfo,
    };
  },

  async getCollectionByHandle(handle) {
    const data = await shopifyFetch<{ collection: ShopifyCollection | null }>(
      COLLECTION_BY_HANDLE_QUERY,
      { handle, first: 1 },
    );

    if (!data.collection) {
      return null;
    }

    return mapShopifyCollection(
      data.collection,
      data.collection.products?.nodes.length ?? 0,
    );
  },

  async getCollections() {
    const data = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>(
      COLLECTIONS_QUERY,
      { first: 20 },
    );

    return data.collections.nodes.map((collection) =>
      mapShopifyCollection(collection, collection.products?.nodes.length ?? 0),
    );
  },

  async searchProducts(query, options) {
    const data = await shopifyFetch<{
      search: {
        nodes: ShopifyProduct[];
        pageInfo: { hasNextPage: boolean; endCursor?: string | null };
      };
    }>(SEARCH_PRODUCTS_QUERY, {
      query,
      first: options?.first ?? 24,
      after: options?.after,
    });

    const products = data.search.nodes.map(mapShopifyProduct);

    return {
      products,
      totalCount: products.length,
      pageInfo: {
        hasNextPage: data.search.pageInfo.hasNextPage,
        endCursor: data.search.pageInfo.endCursor ?? undefined,
      },
    };
  },

  async getRelatedProducts(product, limit = 4) {
    const collectionHandle = product.collections[0]?.handle;
    if (!collectionHandle) {
      return [];
    }

    const result = await this.getProductsByCollection(collectionHandle, { first: limit + 1 });
    return result.products.filter((item) => item.handle !== product.handle).slice(0, limit);
  },

  async createCart(lines: CartLineInput[] = []) {
    const data = await shopifyFetch<{
      cartCreate: {
        cart?: ShopifyCart | null;
        userErrors: Array<{ field?: string[] | null; message: string }>;
      };
    }>(CART_CREATE_MUTATION, {
      input: {
        lines: lines.map((line) => ({
          merchandiseId: line.merchandiseId,
          quantity: line.quantity,
        })),
      },
    });

    const userError = mapUserErrors(data.cartCreate.userErrors);
    if (userError) {
      return userError;
    }

    if (!data.cartCreate.cart) {
      return { error: "Unable to create Shopify cart." };
    }

    return { data: mapShopifyCart(data.cartCreate.cart) };
  },

  async getCart(cartId) {
    const data = await shopifyFetch<{ cart: ShopifyCart | null }>(CART_QUERY, { cartId });
    if (!data.cart) {
      return { error: "Cart not found or expired." };
    }
    return { data: mapShopifyCart(data.cart) };
  },

  async addCartLines(cartId, lines) {
    const data = await shopifyFetch<{
      cartLinesAdd: {
        cart?: ShopifyCart | null;
        userErrors: Array<{ field?: string[] | null; message: string }>;
      };
    }>(CART_LINES_ADD_MUTATION, {
      cartId,
      lines,
    });

    const userError = mapUserErrors(data.cartLinesAdd.userErrors);
    if (userError) {
      return userError;
    }

    if (!data.cartLinesAdd.cart) {
      return { error: "Unable to update cart." };
    }

    return { data: mapShopifyCart(data.cartLinesAdd.cart) };
  },

  async updateCartLines(cartId, lines) {
    const data = await shopifyFetch<{
      cartLinesUpdate: {
        cart?: ShopifyCart | null;
        userErrors: Array<{ field?: string[] | null; message: string }>;
      };
    }>(CART_LINES_UPDATE_MUTATION, {
      cartId,
      lines,
    });

    const userError = mapUserErrors(data.cartLinesUpdate.userErrors);
    if (userError) {
      return userError;
    }

    if (!data.cartLinesUpdate.cart) {
      return { error: "Unable to update cart lines." };
    }

    return { data: mapShopifyCart(data.cartLinesUpdate.cart) };
  },

  async removeCartLines(cartId, lineIds) {
    const data = await shopifyFetch<{
      cartLinesRemove: {
        cart?: ShopifyCart | null;
        userErrors: Array<{ field?: string[] | null; message: string }>;
      };
    }>(CART_LINES_REMOVE_MUTATION, {
      cartId,
      lineIds,
    });

    const userError = mapUserErrors(data.cartLinesRemove.userErrors);
    if (userError) {
      return userError;
    }

    if (!data.cartLinesRemove.cart) {
      return { error: "Unable to remove cart lines." };
    }

    return { data: mapShopifyCart(data.cartLinesRemove.cart) };
  },

  async getCheckoutUrl(cartId) {
    const result = await this.getCart(cartId);
    if (result.error || !result.data?.checkoutUrl) {
      return { error: result.error ?? "Checkout URL unavailable." };
    }
    return { data: result.data.checkoutUrl };
  },
};

export { REVALIDATE_SECONDS as SHOPIFY_REVALIDATE_SECONDS };

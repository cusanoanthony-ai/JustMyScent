import { SHOPIFY_FRAGMENTS } from "@/lib/commerce/shopify/fragments";

export const SHOP_QUERY = `
  ${SHOPIFY_FRAGMENTS}
  query Shop {
    shop {
      name
      description
      primaryDomain {
        url
        host
      }
    }
  }
`;

export const PRODUCTS_QUERY = `
  ${SHOPIFY_FRAGMENTS}
  query Products($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  ${SHOPIFY_FRAGMENTS}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const COLLECTIONS_QUERY = `
  ${SHOPIFY_FRAGMENTS}
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
        ...CollectionFields
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  ${SHOPIFY_FRAGMENTS}
  query CollectionByHandle($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      ...CollectionFields
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        nodes {
          ...ProductFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = `
  ${SHOPIFY_FRAGMENTS}
  query SearchProducts($query: String!, $first: Int!, $after: String) {
    search(query: $query, first: $first, after: $after, types: PRODUCT) {
      nodes {
        ... on Product {
          ...ProductFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const CART_QUERY = `
  ${SHOPIFY_FRAGMENTS}
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

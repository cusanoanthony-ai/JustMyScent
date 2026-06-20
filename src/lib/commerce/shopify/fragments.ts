export const MONEY_FRAGMENT = `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

export const IMAGE_FRAGMENT = `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const VARIANT_FRAGMENT = `
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    price {
      ...MoneyFields
    }
    compareAtPrice {
      ...MoneyFields
    }
    selectedOptions {
      name
      value
    }
  }
`;

export const METAFIELD_FRAGMENT = `
  fragment MetafieldFields on Metafield {
    namespace
    key
    value
    type
  }
`;

export const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    availableForSale
    featuredImage {
      ...ImageFields
    }
    images(first: 8) {
      nodes {
        ...ImageFields
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyFields
      }
      maxVariantPrice {
        ...MoneyFields
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyFields
      }
      maxVariantPrice {
        ...MoneyFields
      }
    }
    options {
      name
      values
    }
    variants(first: 20) {
      nodes {
        ...VariantFields
      }
    }
    collections(first: 10) {
      nodes {
        handle
        title
      }
    }
    seo {
      title
      description
    }
    metafields(identifiers: [
      { namespace: "custom", key: "audience" },
      { namespace: "custom", key: "scent_family" },
      { namespace: "custom", key: "top_notes" },
      { namespace: "custom", key: "heart_notes" },
      { namespace: "custom", key: "base_notes" },
      { namespace: "custom", key: "mood" },
      { namespace: "custom", key: "occasion" },
      { namespace: "custom", key: "fragrance_strength" },
      { namespace: "custom", key: "featured_message" }
    ]) {
      ...MetafieldFields
    }
  }
`;

export const COLLECTION_FRAGMENT = `
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    descriptionHtml
    image {
      ...ImageFields
    }
    seo {
      title
      description
    }
  }
`;

export const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...MoneyFields
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            price {
              ...MoneyFields
            }
            compareAtPrice {
              ...MoneyFields
            }
            image {
              ...ImageFields
            }
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
`;

export const SHOPIFY_FRAGMENTS = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  ${METAFIELD_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  ${COLLECTION_FRAGMENT}
  ${CART_FRAGMENT}
`;

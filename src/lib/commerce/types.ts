export type Audience = "women" | "men" | "unisex";

export type ScentFamily =
  | "Sweet & Gourmand"
  | "Fresh & Clean"
  | "Floral"
  | "Warm & Sensual"
  | "Woody & Earthy"
  | "Bold & Refined";

export type SortOption =
  | "featured"
  | "title-asc"
  | "title-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions: SelectedOption[];
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductCollectionRef {
  handle: string;
  title: string;
}

export interface ProductSeo {
  title?: string;
  description?: string;
}

export interface DemoVisualConfig {
  palette: "rose" | "gold" | "green" | "amber" | "slate" | "cream" | "fig" | "smoke";
  shape: "bottle" | "vial" | "roller" | "dropper";
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  sourceTitle?: string;
  description: string;
  descriptionHtml?: string;
  shortDescription?: string;
  productType?: string;
  vendor?: string;
  tags: string[];
  featuredImage?: ProductImage;
  images: ProductImage[];
  localImagePath?: string;
  priceRange: { min: Money; max: Money };
  compareAtPriceRange?: { min: Money; max: Money };
  availableForSale: boolean;
  options: ProductOption[];
  variants: ProductVariant[];
  collections: ProductCollectionRef[];
  seo?: ProductSeo;
  audience: Audience;
  scentFamily: string;
  scentFamilyRaw?: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  mood: string;
  occasion: string;
  fragranceStrength: string;
  referenceFragrance?: string;
  referenceBrand?: string;
  quizEligible?: boolean;
  metadataCoverage?: "complete" | "limited" | "missing";
  publicUrl?: string;
  sourceUrl?: string;
  featuredMessage?: string;
  featured?: boolean;
  isNew?: boolean;
  demoVisual?: DemoVisualConfig;
  createdAt?: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  image?: ProductImage;
  seo?: ProductSeo;
  productCount: number;
}

export interface Shop {
  name: string;
  description?: string;
  primaryDomain?: { url: string; host: string };
  moneyFormat?: string;
}

export interface ProductFilters {
  query?: string;
  audience?: Audience[];
  scentFamily?: string[];
  notes?: string[];
  availableOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  collectionHandle?: string;
}

export interface ProductListOptions {
  first?: number;
  after?: string;
  sort?: SortOption;
  filters?: ProductFilters;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface ProductListResult {
  products: Product[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandiseId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  image?: ProductImage;
  price: Money;
  compareAtPrice?: Money;
  availableForSale: boolean;
}

export interface Cart {
  id: string;
  checkoutUrl?: string;
  lines: CartLine[];
  subtotal: Money;
  totalQuantity: number;
  isDemo?: boolean;
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
}

export interface CommerceResult<T> {
  data?: T;
  error?: string;
  userErrors?: Array<{ field?: string[]; message: string }>;
}

export interface CommerceProvider {
  getShop(): Promise<Shop>;
  getProducts(options?: ProductListOptions): Promise<ProductListResult>;
  getProductByHandle(handle: string): Promise<Product | null>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProductsByCollection(
    handle: string,
    options?: ProductListOptions,
  ): Promise<ProductListResult>;
  getCollectionByHandle(handle: string): Promise<Collection | null>;
  getCollections(): Promise<Collection[]>;
  searchProducts(
    query: string,
    options?: ProductListOptions,
  ): Promise<ProductListResult>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
  createCart(lines?: CartLineInput[]): Promise<CommerceResult<Cart>>;
  getCart(cartId: string): Promise<CommerceResult<Cart>>;
  addCartLines(
    cartId: string,
    lines: CartLineInput[],
  ): Promise<CommerceResult<Cart>>;
  updateCartLines(
    cartId: string,
    lines: CartLineUpdateInput[],
  ): Promise<CommerceResult<Cart>>;
  removeCartLines(
    cartId: string,
    lineIds: string[],
  ): Promise<CommerceResult<Cart>>;
  getCheckoutUrl(cartId: string): Promise<CommerceResult<string>>;
}

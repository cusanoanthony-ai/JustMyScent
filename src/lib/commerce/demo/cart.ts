import type {
  Cart,
  CartLine,
  CartLineInput,
  CartLineUpdateInput,
  CommerceResult,
  Money,
  Product,
} from "@/lib/commerce/types";
import { demoProductMap, demoProducts } from "@/lib/commerce/demo/products";

const CURRENCY = "USD";

function money(amount: number): Money {
  return { amount: amount.toFixed(2), currencyCode: CURRENCY };
}

function buildLine(product: Product, merchandiseId: string, quantity: number): CartLine | null {
  const variant = product.variants.find((item) => item.id === merchandiseId);
  if (!variant) {
    return null;
  }

  return {
    id: `demo-line-${merchandiseId}`,
    quantity,
    merchandiseId,
    productHandle: product.handle,
    productTitle: product.title,
    variantTitle: variant.title,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    availableForSale: variant.availableForSale,
  };
}

function calculateSubtotal(lines: CartLine[]): Money {
  const total = lines.reduce(
    (sum, line) => sum + Number.parseFloat(line.price.amount) * line.quantity,
    0,
  );
  return money(total);
}

function createEmptyCart(id = "demo-cart"): Cart {
  return {
    id,
    lines: [],
    subtotal: money(0),
    totalQuantity: 0,
    isDemo: true,
  };
}

function normalizeCart(cart: Cart): Cart {
  const subtotal = calculateSubtotal(cart.lines);
  const totalQuantity = cart.lines.reduce((sum, line) => sum + line.quantity, 0);
  return { ...cart, subtotal, totalQuantity, isDemo: true };
}

export function createDemoCart(lines: CartLineInput[] = [], cartId = "demo-cart"): Cart {
  const cart = createEmptyCart(cartId);
  for (const line of lines) {
    const product = demoProducts.find((item) =>
      item.variants.some((variant) => variant.id === line.merchandiseId),
    );
    if (!product) {
      continue;
    }
    const cartLine = buildLine(product, line.merchandiseId, line.quantity);
    if (cartLine) {
      cart.lines.push(cartLine);
    }
  }
  return normalizeCart(cart);
}

export function getDemoCart(cart: Cart): CommerceResult<Cart> {
  return { data: normalizeCart(cart) };
}

export function addDemoCartLines(
  cart: Cart,
  lines: CartLineInput[],
): CommerceResult<Cart> {
  const nextLines = [...cart.lines];

  for (const input of lines) {
    const product = demoProducts.find((item) =>
      item.variants.some((variant) => variant.id === input.merchandiseId),
    );
    if (!product) {
      return { error: "Selected variant is unavailable in demo mode." };
    }

    const variant = product.variants.find((item) => item.id === input.merchandiseId);
    if (!variant?.availableForSale) {
      return { error: "This variant is currently sold out." };
    }

    const existing = nextLines.find((line) => line.merchandiseId === input.merchandiseId);
    if (existing) {
      existing.quantity += input.quantity;
    } else {
      const line = buildLine(product, input.merchandiseId, input.quantity);
      if (line) {
        nextLines.push(line);
      }
    }
  }

  return { data: normalizeCart({ ...cart, lines: nextLines }) };
}

export function updateDemoCartLines(
  cart: Cart,
  lines: CartLineUpdateInput[],
): CommerceResult<Cart> {
  const nextLines = cart.lines
    .map((line) => {
      const update = lines.find((item) => item.id === line.id);
      if (!update) {
        return line;
      }
      return { ...line, quantity: update.quantity };
    })
    .filter((line) => line.quantity > 0);

  return { data: normalizeCart({ ...cart, lines: nextLines }) };
}

export function removeDemoCartLines(cart: Cart, lineIds: string[]): CommerceResult<Cart> {
  const nextLines = cart.lines.filter((line) => !lineIds.includes(line.id));
  return { data: normalizeCart({ ...cart, lines: nextLines }) };
}

export function resolveDemoProduct(handle: string): Product | undefined {
  return demoProductMap.get(handle);
}

export function resolveDemoVariant(merchandiseId: string) {
  for (const product of demoProducts) {
    const variant = product.variants.find((item) => item.id === merchandiseId);
    if (variant) {
      return { product, variant };
    }
  }
  return null;
}

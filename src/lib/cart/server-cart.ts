import { cookies } from "next/headers";
import { getCommerceProvider } from "@/lib/commerce";
import type { Cart, CartLineInput, CartLineUpdateInput, CommerceResult } from "@/lib/commerce/types";
import { isShopifyModeEnabled } from "@/lib/env";

export const SHOPIFY_CART_COOKIE = "jms_shopify_cart_id";
const CART_MAX_AGE = 60 * 60 * 24 * 14;

export async function getCartCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_MAX_AGE,
    path: "/",
  };
}

export async function readShopifyCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SHOPIFY_CART_COOKIE)?.value;
}

export async function writeShopifyCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SHOPIFY_CART_COOKIE, cartId, await getCartCookieOptions());
}

export async function clearShopifyCartId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SHOPIFY_CART_COOKIE);
}

async function ensureShopifyCart(cartId?: string): Promise<CommerceResult<Cart>> {
  const provider = getCommerceProvider();

  if (cartId) {
    const existing = await provider.getCart(cartId);
    if (existing.data) {
      return existing;
    }
    await clearShopifyCartId();
  }

  const created = await provider.createCart();
  if (created.data) {
    await writeShopifyCartId(created.data.id);
  }
  return created;
}

export async function getServerCart(): Promise<CommerceResult<Cart>> {
  if (!isShopifyModeEnabled()) {
    return { error: "Server cart is only available in Shopify live mode." };
  }

  const cartId = await readShopifyCartId();
  return ensureShopifyCart(cartId);
}

export async function addServerCartLine(input: CartLineInput): Promise<CommerceResult<Cart>> {
  if (!isShopifyModeEnabled()) {
    return { error: "Server cart is only available in Shopify live mode." };
  }

  const provider = getCommerceProvider();
  const cartResult = await ensureShopifyCart(await readShopifyCartId());

  if (!cartResult.data) {
    return cartResult;
  }

  const result = await provider.addCartLines(cartResult.data.id, [input]);
  if (result.error?.includes("not found") || result.error?.includes("expired")) {
    await clearShopifyCartId();
    const recreated = await ensureShopifyCart();
    if (!recreated.data) {
      return recreated;
    }
    return provider.addCartLines(recreated.data.id, [input]);
  }

  return result;
}

export async function updateServerCartLine(
  input: CartLineUpdateInput,
): Promise<CommerceResult<Cart>> {
  if (!isShopifyModeEnabled()) {
    return { error: "Server cart is only available in Shopify live mode." };
  }

  const provider = getCommerceProvider();
  const cartResult = await ensureShopifyCart(await readShopifyCartId());
  if (!cartResult.data) {
    return cartResult;
  }

  return provider.updateCartLines(cartResult.data.id, [input]);
}

export async function removeServerCartLine(lineId: string): Promise<CommerceResult<Cart>> {
  if (!isShopifyModeEnabled()) {
    return { error: "Server cart is only available in Shopify live mode." };
  }

  const provider = getCommerceProvider();
  const cartResult = await ensureShopifyCart(await readShopifyCartId());
  if (!cartResult.data) {
    return cartResult;
  }

  return provider.removeCartLines(cartResult.data.id, [lineId]);
}

export async function getServerCheckoutUrl(): Promise<CommerceResult<string>> {
  if (!isShopifyModeEnabled()) {
    return { error: "Checkout is unavailable in demo mode." };
  }

  const provider = getCommerceProvider();
  const cartResult = await ensureShopifyCart(await readShopifyCartId());
  if (!cartResult.data) {
    return { error: cartResult.error ?? "Unable to load cart." };
  }

  if (!cartResult.data.totalQuantity) {
    return { error: "Your cart is empty." };
  }

  return provider.getCheckoutUrl(cartResult.data.id);
}

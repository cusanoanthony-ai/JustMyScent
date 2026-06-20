"use server";

import {
  addServerCartLine,
  getServerCart,
  getServerCheckoutUrl,
  removeServerCartLine,
  updateServerCartLine,
} from "@/lib/cart/server-cart";
import type { Cart, CartLineInput, CartLineUpdateInput, CommerceResult } from "@/lib/commerce/types";
import { getCommerceMode } from "@/lib/env";

export async function getCommerceModeAction() {
  return getCommerceMode();
}

export async function fetchServerCartAction(): Promise<CommerceResult<Cart>> {
  return getServerCart();
}

export async function addToServerCartAction(
  input: CartLineInput,
): Promise<CommerceResult<Cart>> {
  return addServerCartLine(input);
}

export async function updateServerCartLineAction(
  input: CartLineUpdateInput,
): Promise<CommerceResult<Cart>> {
  return updateServerCartLine(input);
}

export async function removeServerCartLineAction(lineId: string): Promise<CommerceResult<Cart>> {
  return removeServerCartLine(lineId);
}

export async function getCheckoutUrlAction(): Promise<CommerceResult<string>> {
  return getServerCheckoutUrl();
}

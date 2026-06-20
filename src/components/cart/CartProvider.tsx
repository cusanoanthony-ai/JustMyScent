"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  addToServerCartAction,
  fetchServerCartAction,
  getCheckoutUrlAction,
  getCommerceModeAction,
  removeServerCartLineAction,
  updateServerCartLineAction,
} from "@/app/actions/cart-actions";
import {
  addDemoCartLines,
  createDemoCart,
  removeDemoCartLines,
  updateDemoCartLines,
} from "@/lib/commerce/demo/cart";
import type { Cart, CartLineInput, CartLineUpdateInput, CommerceResult } from "@/lib/commerce/types";

const DEMO_CART_KEY = "jms_demo_cart";

interface CartContextValue {
  cart: Cart;
  isOpen: boolean;
  isLoading: boolean;
  mode: "demo" | "shopify";
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: CartLineInput) => Promise<CommerceResult<Cart>>;
  updateLine: (input: CartLineUpdateInput) => Promise<CommerceResult<Cart>>;
  removeLine: (lineId: string) => Promise<CommerceResult<Cart>>;
  checkout: () => Promise<CommerceResult<string>>;
}

const emptyCart = createDemoCart();

const CartContext = createContext<CartContextValue | null>(null);

function readDemoCart(): Cart {
  if (typeof window === "undefined") {
    return emptyCart;
  }

  try {
    const stored = window.localStorage.getItem(DEMO_CART_KEY);
    if (!stored) {
      return emptyCart;
    }
    return JSON.parse(stored) as Cart;
  } catch {
    return emptyCart;
  }
}

function writeDemoCart(cart: Cart) {
  window.localStorage.setItem(DEMO_CART_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"demo" | "shopify">("demo");
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const commerceMode = await getCommerceModeAction();
      setMode(commerceMode);

      if (commerceMode === "shopify") {
        const result = await fetchServerCartAction();
        if (result.data) {
          setCart(result.data);
        }
      } else {
        setCart(readDemoCart());
      }

      setIsLoading(false);
    });
  }, []);

  const persistDemo = useCallback((nextCart: Cart) => {
    writeDemoCart(nextCart);
    setCart(nextCart);
  }, []);

  const addItem = useCallback(
    async (input: CartLineInput): Promise<CommerceResult<Cart>> => {
      if (mode === "shopify") {
        const result = await addToServerCartAction(input);
        if (result.data) {
          setCart(result.data);
          setIsOpen(true);
        }
        return result;
      }

      const current = readDemoCart();
      const result = addDemoCartLines(current, [input]);
      if (result.data) {
        persistDemo(result.data);
        setIsOpen(true);
      }
      return result;
    },
    [mode, persistDemo],
  );

  const updateLine = useCallback(
    async (input: CartLineUpdateInput): Promise<CommerceResult<Cart>> => {
      if (mode === "shopify") {
        const result = await updateServerCartLineAction(input);
        if (result.data) {
          setCart(result.data);
        }
        return result;
      }

      const current = readDemoCart();
      const result = updateDemoCartLines(current, [input]);
      if (result.data) {
        persistDemo(result.data);
      }
      return result;
    },
    [mode, persistDemo],
  );

  const removeLine = useCallback(
    async (lineId: string): Promise<CommerceResult<Cart>> => {
      if (mode === "shopify") {
        const result = await removeServerCartLineAction(lineId);
        if (result.data) {
          setCart(result.data);
        }
        return result;
      }

      const current = readDemoCart();
      const result = removeDemoCartLines(current, [lineId]);
      if (result.data) {
        persistDemo(result.data);
      }
      return result;
    },
    [mode, persistDemo],
  );

  const checkout = useCallback(async (): Promise<CommerceResult<string>> => {
    if (mode === "shopify") {
      const result = await getCheckoutUrlAction();
      if (result.data) {
        window.location.href = result.data;
      }
      return result;
    }

    return {
      error:
        "Demo checkout is disabled. Connect Shopify credentials to enable hosted checkout.",
    };
  }, [mode]);

  const value = useMemo(
    () => ({
      cart,
      isOpen,
      isLoading,
      mode,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateLine,
      removeLine,
      checkout,
    }),
    [addItem, cart, checkout, isLoading, isOpen, mode, removeLine, updateLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

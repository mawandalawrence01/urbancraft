"use client";

import {
  createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode,
} from "react";

export type CartLine = {
  productId: string;
  variantId?: string | null;
  slug: string;
  name: string;
  variantName?: string | null;
  unitPrice: number;
  imageUrl?: string | null;
  quantity: number;
};

type State = { lines: CartLine[] };
type Action =
  | { type: "add"; line: CartLine }
  | { type: "setQty"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

const STORAGE_KEY = "uc.cart.v1";

export const lineKey = (l: Pick<CartLine, "productId" | "variantId">) =>
  `${l.productId}:${l.variantId ?? ""}`;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines };
    case "add": {
      const key = lineKey(action.line);
      const existing = state.lines.find((l) => lineKey(l) === key);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            lineKey(l) === key
              ? { ...l, quantity: Math.min(99, l.quantity + action.line.quantity) }
              : l,
          ),
        };
      }
      return { lines: [...state.lines, action.line] };
    }
    case "setQty":
      return {
        lines: state.lines.flatMap((l) =>
          lineKey(l) !== action.key
            ? [l]
            : action.quantity <= 0
              ? []
              : [{ ...l, quantity: Math.min(99, action.quantity) }],
        ),
      };
    case "remove":
      return { lines: state.lines.filter((l) => lineKey(l) !== action.key) };
    case "clear":
      return { lines: [] };
  }
}

type CartContext = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  justAdded: CartLine | null;
  dismissToast: () => void;
};

const Ctx = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const [ready, setReady] = useState(false);
  const [justAdded, setJustAdded] = useState<CartLine | null>(null);

  // Hydrate after mount — localStorage is not available during SSR, and
  // rendering from it directly would cause a hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.lines)) dispatch({ type: "hydrate", lines: parsed.lines });
      }
    } catch {
      // corrupt or blocked storage — start with an empty cart
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: state.lines }));
    } catch {
      // private mode / quota — the cart still works for this page session
    }
  }, [state.lines, ready]);

  // Keep tabs in sync so the badge never lies
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed?.lines)) dispatch({ type: "hydrate", lines: parsed.lines });
      } catch { /* ignore */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<CartContext>(() => {
    const count = state.lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = state.lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
    return {
      lines: state.lines,
      count, subtotal, ready, justAdded,
      add: (line) => {
        const full = { ...line, quantity: line.quantity ?? 1 } as CartLine;
        dispatch({ type: "add", line: full });
        setJustAdded(full);
      },
      setQuantity: (key, quantity) => dispatch({ type: "setQty", key, quantity }),
      remove: (key) => dispatch({ type: "remove", key }),
      clear: () => dispatch({ type: "clear" }),
      dismissToast: () => setJustAdded(null),
    };
  }, [state.lines, ready, justAdded]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

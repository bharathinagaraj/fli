import React, { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import cartService from "../services/cartService";

const CartContext = createContext(null);

const initialState = {
  items: [], // { id, productId, cartItemId, name, image, price, quantity, variant }
  loaded: false,
};

function normalizeBackendItem(item) {
  const product = item.Product || {};
  return {
    id: item.cartItemId || item.id,
    productId: item.productId,
    cartItemId: item.cartItemId || item.id,
    name: product.name || item.name || "",
    image: (product.images && product.images[0]) || item.image || "",
    price: Number(item.priceAtAdd ?? item.price ?? product.price ?? 0),
    quantity: item.quantity,
    variant: item.variant || null,
  };
}

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload, loaded: true };

    case "ADD_ITEM": {
      const { product, quantity = 1, variant = null } = action.payload;
      const existingIndex = state.items.findIndex(
        (i) => i.productId === product.id && (i.variant || null) === (variant || null)
      );

      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return { ...state, items: updated };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            id: product.id,
            productId: product.id,
            cartItemId: null,
            name: product.name,
            image: product.image || product.images?.[0] || "",
            price: Number(product.price),
            quantity,
            variant: variant || null,
          },
        ],
      };
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity < 1) return state;
      return {
        ...state,
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      };
    }

    case "REMOVE_ITEM": {
      const { id } = action.payload;
      return { ...state, items: state.items.filter((i) => i.id !== id) };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const refreshFromServer = useCallback(async () => {
    try {
      const data = await cartService.getCart();
      dispatch({ type: "SET_ITEMS", payload: (data.items || []).map(normalizeBackendItem) });
    } catch {
      // guest / offline — keep local state
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshFromServer();
    }
  }, [isAuthenticated, refreshFromServer]);

  const addToCart = (product, quantity = 1, variant = null) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity, variant } });
  };

  const updateQuantity = (id, quantity, _variant = null) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const removeFromCart = (id, _variant = null) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const { subtotal, itemCount } = useMemo(() => {
    return state.items.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.price * item.quantity,
        itemCount: acc.itemCount + item.quantity,
      }),
      { subtotal: 0, itemCount: 0 }
    );
  }, [state.items]);

  const value = {
    items: state.items,
    loaded: state.loaded,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshFromServer,
    subtotal,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}

export default CartContext;

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart as useCartContext } from "../context/CartContext";
import cartService from "../services/cartService";

/**
 * Wraps CartContext with async, service-backed actions (loading/error state,
 * promo codes). When logged in, mutations are persisted to the backend and the
 * cart is refreshed from the server afterwards so ids stay in sync.
 */
export default function useCart() {
  const { isAuthenticated } = useAuth();
  const {
    items,
    addToCart: addToContext,
    updateQuantity: updateContextQuantity,
    removeFromCart: removeFromContext,
    clearCart: clearContextCart,
    refreshFromServer,
    subtotal,
    itemCount,
  } = useCartContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promo, setPromo] = useState(null);

  const addToCart = useCallback(
    async (product, quantity = 1, variant = null) => {
      setLoading(true);
      setError(null);
      addToContext(product, quantity, variant);
      if (isAuthenticated) {
        try {
          await cartService.addItem(product.id, quantity, variant);
          await refreshFromServer();
        } catch (err) {
          setError(err.message || "Could not add item to cart.");
        }
      }
      setLoading(false);
    },
    [addToContext, isAuthenticated, refreshFromServer]
  );

  const updateQuantity = useCallback(
    async (id, quantity, _variant = null) => {
      if (quantity < 1) return;
      const item = items.find((i) => i.id === id);
      updateContextQuantity(id, quantity);
      if (isAuthenticated && item?.cartItemId) {
        try {
          await cartService.updateItemQuantity(item.cartItemId, quantity);
          await refreshFromServer();
        } catch (err) {
          setError(err.message || "Could not update quantity.");
        }
      }
    },
    [items, updateContextQuantity, isAuthenticated, refreshFromServer]
  );

  const removeFromCart = useCallback(
    async (id) => {
      const item = items.find((i) => i.id === id);
      removeFromContext(id);
      if (isAuthenticated && item?.cartItemId) {
        try {
          await cartService.removeItem(item.cartItemId);
          await refreshFromServer();
        } catch (err) {
          setError(err.message || "Could not remove item.");
        }
      }
    },
    [items, removeFromContext, isAuthenticated, refreshFromServer]
  );

  const clearCart = useCallback(async () => {
    clearContextCart();
    setPromo(null);
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (err) {
        setError(err.message || "Could not clear cart.");
      }
    }
  }, [clearContextCart, isAuthenticated]);

  const applyPromoCode = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cartService.applyPromoCode(code);
      setPromo(result);
      return { success: true, discount: result.discount };
    } catch (err) {
      setError(err.message || "Invalid promo code.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const discountAmount = useMemo(
    () => (promo ? subtotal * promo.discount : 0),
    [promo, subtotal]
  );

  const total = useMemo(
    () => Math.max(subtotal - discountAmount, 0),
    [subtotal, discountAmount]
  );

  return {
    items,
    itemCount,
    subtotal,
    discountAmount,
    total,
    promo,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
  };
}

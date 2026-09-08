import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "./AuthContext";
import wishlistService from "../services/wishlistService";

const WishlistContext = createContext(null);

function normalizeBackendItem(item) {
  const product = item.Product || {};
  return {
    id: product.id || item.productId,
    productId: product.id || item.productId,
    name: product.name || "",
    image: (product.images && product.images[0]) || "",
    price: Number(product.price || 0),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    inStock: product.stockQuantity > 0,
  };
}

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]); // full product objects

  const refreshFromServer = useCallback(async () => {
    try {
      const data = await wishlistService.getWishlist();
      setItems((data || []).map(normalizeBackendItem));
    } catch {
      // guest / offline — keep local state
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshFromServer();
    }
  }, [isAuthenticated, refreshFromServer]);

  const isInWishlist = useCallback(
    (id) => items.some((i) => i.productId === id),
    [items]
  );

  const addToWishlist = (product) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) return prev;
      return [...prev, { productId: product.id, ...product }];
    });
    if (isAuthenticated) wishlistService.addItem(product.id).catch(() => {});
  };

  const removeFromWishlist = (id) => {
    setItems((prev) => prev.filter((i) => i.productId !== id));
    if (isAuthenticated) wishlistService.removeItem(id).catch(() => {});
  };

  const toggleWishlist = (product) => {
    const exists = items.some((i) => i.productId === product.id);
    if (exists) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const clearWishlist = () => {
    setItems([]);
    if (isAuthenticated) wishlistService.clearWishlist().catch(() => {});
  };

  const count = useMemo(() => items.length, [items]);

  const value = {
    items,
    count,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    refreshFromServer,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}

export default WishlistContext;

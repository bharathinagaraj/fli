import { useCallback } from "react";
import { useWishlist as useWishlistContext } from "../context/WishlistContext";

/**
 * Thin wrapper around WishlistContext exposing a couple of
 * convenience helpers (toggle-with-feedback, isInWishlist shorthand).
 * Kept separate from context so components only ever import from /hooks.
 */
export default function useWishlist() {
  const {
    items,
    count,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  } = useWishlistContext();

  const toggle = useCallback(
    (product) => {
      const wasInWishlist = isInWishlist(product.id);
      toggleWishlist(product);
      return { added: !wasInWishlist };
    },
    [isInWishlist, toggleWishlist]
  );

  return {
    items,
    count,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist: toggle,
    clearWishlist,
  };
}
import React from "react";
import ProductCard from "./ProductCard";
import Loading from "./Loading";

export default function ProductGrid({
  products = [],
  loading = false,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}) {
  if (loading) return <Loading type="grid" count={8} />;

  if (!products.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={isInWishlist}
        />
      ))}
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Truck } from "lucide-react";
import Rating from "./Rating";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product, deliveryDate, onAddToCart, onToggleWishlist, isInWishlist }) {
  const { id, name, images, price, originalPrice, rating, reviewCount, inStock } = product;
  const image = product.image || (Array.isArray(images) ? images[0] : undefined);
  const discount = originalPrice && price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;
  const wishlisted = isInWishlist ? isInWishlist(id) : false;

  return (
    <div className="group flex h-full flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {discount > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
          -{discount}%
        </span>
      )}

      <button
        onClick={() => onToggleWishlist?.(product)}
        className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-1.5 hover:bg-white"
      >
        <Heart
          size={16}
          className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}
        />
      </button>

      <Link to={`/product/${id}`} className="block">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={name}
            onError={(e) => { e.currentTarget.src = "https://placehold.co/600x600/EEE/999?text=Image"; }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link to={`/product/${id}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 hover:text-blue-700">
            {name}
          </h3>
        </Link>

        <Rating value={rating} count={reviewCount} size={13} />

        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        <div className="flex-1" />

        {inStock ? (
          <div className="mt-2 flex items-center gap-1.5">
            <Truck size={13} className="text-emerald-600 shrink-0" />
            <span className="text-[11px] text-emerald-700 font-medium">
              Successfully shipped · Delivery by {deliveryDate}
            </span>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-1.5">
            <Truck size={13} className="text-gray-400 shrink-0" />
            <span className="text-[11px] text-gray-400">Currently unavailable</span>
          </div>
        )}

        <button
          disabled={!inStock}
          onClick={() => onAddToCart?.(product)}
          className={`mt-3 w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-colors ${
            inStock
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ShoppingCart size={16} />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}

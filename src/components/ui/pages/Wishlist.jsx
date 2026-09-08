import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Rating from "../head/Rating";
import { formatPrice } from "@/lib/format";
import { useWishlist } from "../context/WishlistContext";
import useCart from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    addToCart(product, 1);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save items you love for later.</p>
        <Link
          to="/products"
          className="inline-block bg-[#2874f0] text-white px-6 py-2.5 rounded-sm font-medium hover:bg-[#1a5fd0]"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const images = item.images?.length ? item.images : ["https://placehold.co/300x300"];
          const inStock = item.stockQuantity > 0;
          const discount = item.originalPrice
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
            : null;
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden relative group">
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-1.5 hover:bg-white"
                aria-label="Remove from wishlist"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>

              <Link to={`/product/${item.id}`}>
                <div className="aspect-square bg-gray-100">
                  <img src={images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
              </Link>

              <div className="p-3">
                <Link to={`/product/${item.id}`}>
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 hover:text-[#2874f0]">
                    {item.name}
                  </h3>
                </Link>
                <Rating value={item.rating} count={item.reviewCount} size={13} />
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-base font-bold text-gray-900">{formatPrice(Number(item.price))}</p>
                  {discount != null && (
                    <span className="text-xs text-green-600">{discount}% off</span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={!inStock}
                  className={`mt-3 w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md ${
                    inStock
                      ? "bg-[#2874f0] text-white hover:bg-[#1a5fd0]"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={16} />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Minus, Plus, Truck, ShieldCheck, Star } from "lucide-react";
import Rating from "../head/Rating";
import Loading from "../head/Loading";
import { useProduct } from "../hooks/useProducts";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import productService from "../services/productService";
import { formatPrice } from "@/lib/utils";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading } = useProduct(id);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setActiveImage(0);
    setVariant(product?.variants?.[0] || null);
    if (product) {
      productService
        .getProductReviews(product.id)
        .then((data) => setReviews(data || []))
        .catch(() => setReviews([]));
    }
  }, [product]);

  if (loading || !product) return <Loading />;

  const images = Array.isArray(product.images) && product.images.length ? product.images : [""];
  const inStock = product.inStock || product.stockQuantity > 0;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = async () => {
    await addToCart(product, qty, variant);
    setToast(`Added "${product.name}" to cart`);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 border border-gray-200">
            <img
              src={images[activeImage]}
              alt={product.name}
              onError={(e) => { e.currentTarget.src = "https://placehold.co/600x600/EEE/999?text=Image"; }}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 bg-white ${
                  activeImage === i ? "border-blue-600" : "border-transparent"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-500 mb-1">
            {product.brand} •{" "}
            <button onClick={() => navigate(`/products?category=${product.Category?.slug || ""}`)} className="text-blue-600 hover:underline">
              {product.Category?.name}
            </button>
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <Rating value={product.rating} count={product.reviewCount} />

          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">Color</p>
              <div className="flex gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVariant(v)}
                    className={`px-4 py-1.5 rounded-sm text-sm border ${
                      variant === v
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-gray-300 rounded-sm">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2">
                <Plus size={14} />
              </button>
            </div>

            <button
              disabled={!inStock}
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm font-semibold text-sm ${
                inStock
                  ? "bg-[#ff9f00] text-white hover:bg-[#fb641b]"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={18} />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className="p-3 border border-gray-300 rounded-sm text-gray-600 hover:text-red-500"
            >
              <Heart size={20} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
            </button>
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
            <div className="flex items-center gap-2">
              <Truck size={16} /> Free delivery on orders over ₹499
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} /> 1-year manufacturer warranty included
            </div>
            <div className="flex items-center gap-2">
              <Star size={16} /> {product.reviewCount} ratings & reviews
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Ratings & Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {review.User?.name || "Customer"}
                  </span>
                  <span className="text-xs font-medium bg-green-600 text-white px-2 py-0.5 rounded">
                    {review.rating} ★
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                {review.isVerifiedPurchase && (
                  <p className="text-xs text-green-600 mt-2">✓ Verified Purchase</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

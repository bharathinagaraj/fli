import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductGrid from "../head/ProductGrid";
import Loading from "../head/Loading";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import productService from "../services/productService";
import { containerClass } from "@/lib/utils";

const BANNERS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
    title: "Big Billion Days",
    subtitle: "Up to 80% off on top brands",
    color: "from-blue-700/90 via-blue-900/50 to-transparent",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80",
    title: "Electronics Sale",
    subtitle: "Smartphones & gadgets starting ₹499",
    color: "from-slate-900/90 via-slate-800/50 to-transparent",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=80",
    title: "Fashion Fest",
    subtitle: "Buy 1 Get 1 Free on top styles",
    color: "from-rose-700/90 via-rose-900/50 to-transparent",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80",
    title: "Luxury Watches",
    subtitle: "Premium timepieces at great prices",
    color: "from-slate-900/90 via-slate-800/50 to-transparent",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80",
    title: "Home Makeover",
    subtitle: "Furniture & decor from ₹2,999",
    color: "from-emerald-800/90 via-emerald-900/50 to-transparent",
  },
];

const SLIDE_DURATION = 3500;

const CATEGORY_SHORTCUTS = [
  {
    name: "Electronics",
    slug: "electronics",
    emoji: "📱",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    desc: "Phones, laptops, audio & smart gadgets",
  },
  {
    name: "Fashion",
    slug: "fashion",
    emoji: "👕",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
    desc: "Trendy clothing, shoes & accessories",
  },
  {
    name: "Home & Furniture",
    slug: "home-furniture",
    emoji: "🛋️",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    desc: "Sofas, decor, kitchen & essentials",
  },
  {
    name: "Beauty",
    slug: "beauty-personal-care",
    emoji: "💄",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
    desc: "Skincare, makeup & personal care",
  },
  {
    name: "Sports",
    slug: "sports-fitness",
    emoji: "⚽",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    desc: "Shoes, fitness & outdoor gear",
  },
  {
    name: "Toys",
    slug: "toys-baby",
    emoji: "🧸",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80",
    desc: "Toys & baby essentials for little ones",
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef(null);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const nextBanner = useCallback(() => {
    setBannerIndex((i) => (i + 1) % BANNERS.length);
  }, []);

  const prevBanner = useCallback(() => {
    setBannerIndex((i) => (i - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(nextBanner, SLIDE_DURATION);
    return () => clearInterval(timer.current);
  }, [paused, nextBanner]);

  const advanceAndPause = useCallback(() => {
    nextBanner();
    setPaused(true);
  }, [nextBanner]);

  const resume = () => setPaused(false);

  useEffect(() => {
    setLoading(true);
    productService
      .getFeaturedProducts()
      .then((data) => setProducts(data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (product) => {
    await addToCart(product);
    setToast(`Added "${product.name}" to cart`);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className={`${containerClass} py-6`}>
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      {/* Hero banner */}
      <div
        className="relative h-56 sm:h-72 lg:h-80 mb-8 overflow-hidden rounded-xl shadow-lg group select-none bg-black"
        onMouseEnter={advanceAndPause}
        onMouseLeave={resume}
      >
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
        >
          {BANNERS.map((banner) => (
            <div key={banner.id} className="relative h-full w-full shrink-0 overflow-hidden">
              <img
                src={banner.image}
                alt={banner.title}
                className="h-full w-full object-cover"
              />
              <div className={`absolute inset-0 bg-linear-to-r ${banner.color}`} />
              <div className="absolute inset-y-0 left-0 flex w-2/3 sm:w-1/2 flex-col justify-center px-6 sm:px-12 text-white">
                <h1 className="text-2xl sm:text-4xl font-bold mb-2 drop-shadow-lg">
                  {banner.title}
                </h1>
                <p className="text-sm sm:text-lg mb-4 text-white/90 drop-shadow">
                  {banner.subtitle}
                </p>
                <Link
                  to="/products"
                  className="inline-block w-fit rounded-sm bg-white text-gray-900 text-sm font-semibold px-5 py-2 shadow-lg hover:bg-gray-100"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevBanner}
          aria-label="Previous banner"
          className="absolute left-2 sm:left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/40 p-1.5 sm:p-2 text-white shadow backdrop-blur-sm transition hover:bg-white hover:text-gray-900 opacity-0 group-hover:opacity-100 sm:opacity-100"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={nextBanner}
          aria-label="Next banner"
          className="absolute right-2 sm:right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/40 p-1.5 sm:p-2 text-white shadow backdrop-blur-sm transition hover:bg-white hover:text-gray-900 opacity-0 group-hover:opacity-100 sm:opacity-100"
        >
          <ChevronRight size={22} />
        </button>

        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
          {BANNERS.map((banner, i) => (
            <button
              key={banner.id}
              onClick={() => setBannerIndex(i)}
              aria-label={`Go to banner ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === bannerIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Category shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {CATEGORY_SHORTCUTS.map((cat) => (
          <Link
            key={cat.slug}
            to={`/products?category=${cat.slug}`}
            className="group relative h-40 overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-shadow"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/30 to-transparent" />

            <div className="relative flex h-full flex-col justify-between p-3 text-white">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow transition-transform duration-300 group-hover:scale-110 group-hover:bg-white">
                  {cat.emoji}
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide backdrop-blur-sm opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  Shop now
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold drop-shadow">{cat.name}</h3>
                <p className="mt-1 text-[11px] leading-snug text-white/90 opacity-0 max-h-0 overflow-hidden transition-all duration-500 group-hover:opacity-100 group-hover:max-h-12">
                  {cat.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured products */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Trending Products</h2>
        <Link to="/products" className="text-sm text-blue-600 hover:underline">
          View All
        </Link>
      </div>

      {loading ? (
        <Loading type="grid" count={8} />
      ) : (
        <ProductGrid
          products={products}
          onAddToCart={handleAddToCart}
          onToggleWishlist={toggleWishlist}
          isInWishlist={isInWishlist}
        />
      )}
    </div>
  );
}

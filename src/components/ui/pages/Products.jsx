import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductGrid from "../head/ProductGrid";
import ProductFilters from "../head/ProductFilters";
import CategoryMenu from "../head/CategoryMenu";
import Loading from "../head/Loading";
import useProducts from "../hooks/useProducts";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import productService from "../services/productService";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";

  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("rating");
  const [filters, setFilters] = useState({
    priceRange: [0, 250000],
    selectedBrands: [],
    minRating: 0,
  });

  const [toast, setToast] = useState("");

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const { products, total, loading, updateFilters } = useProducts({
    category: activeCategory || undefined,
    search: searchQuery || undefined,
    limit: 24,
    sort: sortBy === "price_low" ? "price" : sortBy === "price_high" ? "price" : sortBy === "rating" ? "rating" : "createdAt",
    order: sortBy === "price_low" ? "ASC" : "DESC",
  });

  useEffect(() => {
    updateFilters({
      category: activeCategory || undefined,
      search: searchQuery || undefined,
    });
  }, [activeCategory, searchQuery, updateFilters]);

  useEffect(() => {
    productService
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleFilterChange = (next) => {
    setFilters(next);
    updateFilters({
      minPrice: next.priceRange[0] > 0 ? next.priceRange[0] : undefined,
      maxPrice: next.priceRange[1] < 250000 ? next.priceRange[1] : undefined,
      brands: next.selectedBrands.length ? next.selectedBrands.join(",") : undefined,
      minRating: next.minRating || undefined,
    });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    updateFilters({
      sort: value === "price_low" ? "price" : value === "price_high" ? "price" : value === "rating" ? "rating" : "createdAt",
      order: value === "price_low" ? "ASC" : "DESC",
    });
  };

  const handleAddToCart = async (product) => {
    await addToCart(product);
    setToast(`Added "${product.name}" to cart`);
    setTimeout(() => setToast(""), 2500);
  };

  const brands = useMemo(
    () => products.map((p) => p.brand).filter((b, i, arr) => b && arr.indexOf(b) === i),
    [products]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex gap-6">
        <aside className="hidden md:block w-64 shrink-0 space-y-4">
          <CategoryMenu
            categories={categories}
            activeCategory={activeCategory}
            onSelect={(id) =>
              setSearchParams(
                id ? { category: id } : searchQuery ? { search: searchQuery } : {}
              )
            }
          />
          <ProductFilters
            filters={filters}
            onChange={handleFilterChange}
            brands={brands}
            maxPrice={250000}
          />
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{total}</span> results
              {searchQuery && <> for "{searchQuery}"</>}
            </p>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5"
            >
              <option value="rating">Sort: Customer Rating</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <Loading type="grid" count={8} />
          ) : (
            <ProductGrid
              products={products}
              loading={false}
              onAddToCart={handleAddToCart}
              onToggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
            />
          )}
        </main>
      </div>
    </div>
  );
}

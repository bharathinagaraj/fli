import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import Loading from "./Loading";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products?limit=12`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setProducts(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loading type="grid" count={8} />;

  if (error) {
    return (
      <div className="text-center py-16 text-red-600">
        <p className="text-lg font-medium">Something went wrong</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 text-sm font-medium text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No products found</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        <span className="font-semibold text-gray-900">{total}</span> results
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

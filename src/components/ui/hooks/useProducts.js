import { useState, useEffect, useCallback, useRef } from "react";
import productService from "../services/productService";

/**
 * Fetches products with filters, handling loading/error state and
 * ignoring stale responses if filters change quickly.
 *
 * @param {object} initialFilters - { category, search, minPrice, maxPrice, brands, minRating }
 */
export default function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const requestId = useRef(0);

  const fetchProducts = useCallback(async (activeFilters) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts(activeFilters);
      if (currentRequest === requestId.current) {
        setProducts(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(err.message || "Failed to load products.");
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const refetch = useCallback(() => fetchProducts(filters), [fetchProducts, filters]);

  return {
    products,
    total,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  };
}

/**
 * Fetches a single product by id.
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    productService
      .getProductById(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Product not found.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, loading, error };
}
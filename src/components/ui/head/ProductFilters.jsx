import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-sm font-semibold text-gray-900"
      >
        {title}
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

export default function ProductFilters({
  filters,
  onChange,
  brands = [],
  maxPrice = 1000,
}) {
  const { priceRange = [0, maxPrice], selectedBrands = [], minRating = 0 } =
    filters || {};

  const updatePrice = (index, value) => {
    const updated = [...priceRange];
    updated[index] = Number(value);
    onChange?.({ ...filters, priceRange: updated });
  };

  const toggleBrand = (brand) => {
    const updated = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    onChange?.({ ...filters, selectedBrands: updated });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() =>
            onChange?.({ priceRange: [0, maxPrice], selectedBrands: [], minRating: 0 })
          }
          className="text-xs text-indigo-600 hover:underline"
        >
          Clear all
        </button>
      </div>

      <FilterSection title="Price Range">
        <div className="flex items-center gap-2 text-sm">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => updatePrice(0, e.target.value)}
            className="w-20 border border-gray-300 rounded px-2 py-1"
          />
          <span>-</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => updatePrice(1, e.target.value)}
            className="w-20 border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </FilterSection>

      <FilterSection title="Brands">
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="rounded text-indigo-600"
              />
              {brand}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => onChange?.({ ...filters, minRating: r })}
                className="text-indigo-600"
              />
              {r}★ & up
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
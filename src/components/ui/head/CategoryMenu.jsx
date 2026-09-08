import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function CategoryMenu({ categories = [], activeCategory, onSelect }) {
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <nav className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelect?.(null)}
            className={`w-full text-left px-2 py-1.5 rounded text-sm ${
              !activeCategory
                ? "bg-indigo-50 text-indigo-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Products
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <div className="flex items-center">
              <button
                onClick={() => onSelect?.(cat.id)}
                className={`flex-1 text-left px-2 py-1.5 rounded text-sm ${
                  activeCategory === cat.id
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
              {cat.subcategories?.length > 0 && (
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="p-1 text-gray-400"
                >
                  {expanded === cat.id ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              )}
            </div>

            {expanded === cat.id && cat.subcategories?.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
                {cat.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <button
                      onClick={() => onSelect?.(sub.id)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        activeCategory === sub.id
                          ? "text-indigo-600 font-medium"
                          : "text-gray-600 hover:text-indigo-600"
                      }`}
                    >
                      {sub.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
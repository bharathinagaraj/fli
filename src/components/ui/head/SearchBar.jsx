import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({ onSearch, suggestions = [] }) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
    setShowSuggestions(false);
  };

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search products..."
          className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          <Search size={18} />
        </button>
      </form>

      {showSuggestions && query && filtered.length > 0 && (
        <ul className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
          {filtered.map((item) => (
            <li
              key={item}
              onClick={() => {
                setQuery(item);
                onSearch?.(item);
                setShowSuggestions(false);
              }}
              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
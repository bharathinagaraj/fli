import React from "react";
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-extrabold text-indigo-600 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        Sorry, the page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-indigo-700"
        >
          <Home size={16} /> Back to Home
        </Link>
        <Link
          to="/products"
          className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-full font-medium hover:bg-gray-50"
        >
          <Search size={16} /> Browse Products
        </Link>
      </div>
    </div>
  );
}
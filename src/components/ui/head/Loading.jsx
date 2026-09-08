import React from "react";

export function Spinner({ size = 32 }) {
  return (
    <div className="flex justify-center items-center py-10">
      <div
        className="animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-sm p-3">
      <div className="bg-gray-200 aspect-square rounded-md mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
    </div>
  );
}

export default function Loading({ type = "spinner", count = 8 }) {
  if (type === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return <Spinner />;
}
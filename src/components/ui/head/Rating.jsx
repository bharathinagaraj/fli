import React from "react";
import { Star } from "lucide-react";

export default function Rating({ value = 0, count, size = 16 }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(value)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
      {typeof count === "number" && (
        <span className="text-xs text-gray-500 ml-1">({count})</span>
      )}
    </div>
  );
}
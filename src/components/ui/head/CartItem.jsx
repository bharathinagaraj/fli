import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const { id, name, image, price, quantity, variant } = item;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      <img
        src={image}
        alt={name}
        onError={(e) => { e.currentTarget.src = "https://placehold.co/200x200/EEE/999?text=Image"; }}
        className="w-20 h-20 object-cover rounded-md bg-gray-100"
      />

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{name}</h4>
        {variant && <p className="text-xs text-gray-500">{variant}</p>}
        <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(price)}</p>
      </div>

      <div className="flex items-center border border-gray-300 rounded-full">
        <button
          onClick={() => onUpdateQty?.(id, Math.max(1, quantity - 1))}
          className="p-1.5 text-gray-600 hover:text-blue-600"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm">{quantity}</span>
        <button
          onClick={() => onUpdateQty?.(id, quantity + 1)}
          className="p-1.5 text-gray-600 hover:text-blue-600"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="text-sm font-semibold text-gray-900 w-20 text-right">
        {formatPrice(price * quantity)}
      </div>

      <button
        onClick={() => onRemove?.(id)}
        className="text-gray-400 hover:text-red-500"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

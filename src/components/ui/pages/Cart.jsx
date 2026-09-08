import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import CartItem from "../head/CartItem";
import useCart from "../hooks/useCart";
import { formatPrice } from "@/lib/utils";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, subtotal, applyPromoCode, discountAmount, total } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState("");

  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    const result = await applyPromoCode(promoInput);
    if (result.success) {
      setPromoMsg(`Promo applied: ${result.discount * 100}% off`);
    } else {
      setPromoMsg(result.error || "Invalid promo code.");
    }
    setTimeout(() => setPromoMsg(""), 3000);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link
          to="/products"
          className="inline-block bg-[#2874f0] text-white px-6 py-2.5 rounded-sm font-medium hover:bg-[#1d5fd6]"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const grandTotal = total + shipping;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        My Cart <span className="text-sm font-normal text-gray-500">({items.length} items)</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-sm shadow-sm">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQty={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
          <div className="p-4 border-t border-gray-200">
            <Link to="/products" className="text-sm text-blue-600 font-medium">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm p-5 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Price Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Price ({items.length} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span>- {formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}</span>
            </div>
          </div>

          <div className="flex gap-2 my-4">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Promo code (SAVE10 / WELCOME)"
              className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm"
            />
            <button
              onClick={handleApplyPromo}
              className="text-sm font-medium text-[#2874f0] border border-[#2874f0] rounded-sm px-3"
            >
              Apply
            </button>
          </div>
          {promoMsg && <p className="text-xs text-gray-600 mb-2">{promoMsg}</p>}

          <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-3 mb-4">
            <span>Total Amount</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="block w-full text-center bg-[#fb641b] text-white py-3 rounded-sm font-semibold hover:bg-[#e85a13]"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

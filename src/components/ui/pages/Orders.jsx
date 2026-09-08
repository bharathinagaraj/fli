import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight, RotateCcw } from "lucide-react";
import Loading from "../head/Loading";
import { formatPrice } from "@/lib/format";
import orderService from "../services/orderService";

const STATUS_STYLES = {
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function Orders() {
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const statuses = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    orderService
      .getOrders(filter)
      .then((rows) => {
        if (!cancelled) setOrders(rows || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border ${
              filter === s
                ? "bg-[#2874f0] text-white border-[#2874f0]"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <p>No orders found for "{filter}".</p>
          <Link to="/products" className="inline-block mt-4 text-sm text-[#2874f0] hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const itemCount = (order.OrderItems || []).reduce((n, i) => n + i.quantity, 0);
            const placed = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#2874f0]/10 text-[#2874f0] rounded-full p-2.5">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      {placed} • {itemCount} item{itemCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm w-24 text-right">
                    {formatPrice(Number(order.total))}
                  </span>
                  {order.status === "Delivered" && (
                    <span className="text-[10px] font-medium text-[#2874f0] bg-blue-50 rounded-full px-2 py-1 whitespace-nowrap">
                      <RotateCcw size={10} className="inline mr-0.5 -mt-0.5" />
                      Return eligible
                    </span>
                  )}
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  PackageX,
  Box,
  Scale,
  HelpCircle,
  RotateCcw,
  Wallet,
  Repeat,
  X,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Loading from "../head/Loading";
import { formatPrice } from "@/lib/format";
import orderService from "../services/orderService";

const STEPS = [
  { key: "placed", label: "Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_INDEX = {
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
};

const RETURN_REASONS = [
  { key: "damaged", label: "Product is damaged / defective", icon: PackageX },
  { key: "wrong_item", label: "Wrong item delivered", icon: Box },
  { key: "size_fit", label: "Size or fit not right", icon: Scale },
  { key: "quality", label: "Quality not as expected", icon: HelpCircle },
  { key: "missing_parts", label: "Missing parts or accessories", icon: Package },
  { key: "other", label: "Other reason", icon: RotateCcw },
];

const RETURN_STATUS_STYLES = {
  Requested: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  "Picked Up": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Return wizard state
  const [returnItem, setReturnItem] = useState(null);
  const [step, setStep] = useState("reason");
  const [issueType, setIssueType] = useState("");
  const [reason, setReason] = useState("");
  const [returnType, setReturnType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  const loadOrder = () => {
    setLoading(true);
    setError("");
    orderService
      .getOrderById(id)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || "Order not found."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loading />;

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-medium text-gray-600">{error || "Order not found."}</p>
        <Link to="/orders" className="inline-block mt-4 text-sm text-[#2874f0] hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const items = order.OrderItems || [];
  const returns = order.Returns || [];
  const returnByItem = {};
  returns.forEach((r) => {
    if (!returnByItem[r.itemId] || r.status !== "Rejected") returnByItem[r.itemId] = r;
  });

  const shippingAddress = order.shippingAddress || {};
  const currentStep = order.status === "Cancelled" ? 0 : STATUS_INDEX[order.status] ?? 1;
  const placedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const openReturn = (item) => {
    setReturnItem(item);
    setStep("reason");
    setIssueType("");
    setReason("");
    setReturnType("");
    setSubmitError("");
    setResult(null);
  };

  const closeReturn = () => {
    setReturnItem(null);
    setResult(null);
    loadOrder();
  };

  const handleReasonSelect = (key, label) => {
    setIssueType(key);
    setReason(label);
    setStep("resolution");
  };

  const handleSubmit = async () => {
    if (!returnItem || !issueType || !reason || !returnType) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await orderService.returnItem({
        orderId: order.id,
        itemId: returnItem.id,
        reason,
        issueType,
        returnType,
      });
      setResult(res);
      setStep("done");
    } catch (err) {
      setSubmitError(err.message || "Could not submit return request.");
    } finally {
      setSubmitting(false);
    }
  };

  const isAutoApproved = ["damaged", "wrong_item"].includes(issueType);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Placed on {placedDate}</p>
        </div>
        <Link to="/orders" className="text-sm text-[#2874f0] hover:underline">
          Back to Orders
        </Link>
      </div>

      {order.status === "Cancelled" ? (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md mb-6">This order was cancelled.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Truck size={18} /> Order Status
          </h3>
          <div className="flex items-center justify-between">
            {STEPS.map((stepItem, i) => {
              const done = order.status === "Delivered" ? i < 4 : i <= currentStep;
              return (
                <React.Fragment key={stepItem.key}>
                  <div className="flex flex-col items-center text-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        done ? "bg-[#2874f0] text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {done ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <p className="text-xs mt-2 font-medium text-gray-700">{stepItem.label}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mb-6 ${
                        order.status === "Delivered" || i < currentStep ? "bg-[#2874f0]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {(order.shippedAt || order.deliveredAt) && (
            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              {order.shippedAt && (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-3 py-1.5">
                  <Truck size={13} />
                  Shipped on{" "}
                  {new Date(order.shippedAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {order.deliveredAt && (
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 rounded-full px-3 py-1.5">
                  <CheckCircle size={13} />
                  Delivered on{" "}
                  {new Date(order.deliveredAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} /> Items
          </h3>
          {items.length === 0 && <p className="text-sm text-gray-500">No items in this order.</p>}
          {items.map((item) => {
            const activeReturn = returnByItem[item.id];
            return (
              <div key={item.id} className="py-3 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <Link to={`/product/${item.productId}`}>
                    <img
                      src={item.image || "https://placehold.co/100x100"}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover bg-gray-100"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.productId}`} className="hover:text-[#2874f0]">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    </Link>
                    <p className="text-xs text-gray-500">
                      {item.variant ? `${item.variant} • ` : ""}Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatPrice(Number(item.price))}</p>
                </div>

                {order.status === "Delivered" && (
                  <div className="mt-3">
                    {activeReturn ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-medium ${RETURN_STATUS_STYLES[activeReturn.status] || "bg-gray-100 text-gray-600"}`}>
                          Return {activeReturn.status}
                        </span>
                        <span className="text-gray-500 capitalize">
                          {activeReturn.returnType === "refund"
                            ? `Refund of ${formatPrice(Number(activeReturn.refundAmount || item.price * item.quantity))}`
                            : "Exchange to be shipped"}
                        </span>
                        <span className="text-gray-400">• {activeReturn.reason}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => openReturn(item)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#2874f0] text-[#2874f0] text-xs font-semibold px-3 py-1.5 hover:bg-blue-50 transition-colors"
                      >
                        <RotateCcw size={13} /> Return / Exchange
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
              <MapPin size={16} /> Shipping Address
            </h3>
            <p className="text-sm text-gray-600">
              {shippingAddress.fullName}
              {shippingAddress.phone ? ` · ${shippingAddress.phone}` : ""}
              <br />
              {shippingAddress.addressLine1}
              {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}
              <br />
              {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
              <CreditCard size={16} /> Payment
            </h3>
            <p className="text-sm text-gray-600">
              {String(order.paymentMethod || "").toLowerCase().includes("cash")
                ? "Cash on Delivery"
                : order.paymentMethod || "Card"}
              <span
                className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                  order.paymentStatus === "paid"
                    ? "bg-green-50 text-green-700"
                    : order.paymentStatus === "refunded"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {order.paymentStatus}
              </span>
            </p>
            {order.paymentDetails?.type === "upi" && (
              <div className="mt-2 space-y-1 border-t border-gray-100 pt-2 text-xs text-gray-500">
                <p>
                  <span className="inline-block w-16 text-gray-400">App</span>
                  <span className="font-medium text-gray-700">{order.paymentDetails.app}</span>
                </p>
                <p>
                  <span className="inline-block w-16 text-gray-400">UPI ID</span>
                  <span className="font-medium text-gray-700">{order.paymentDetails.upiId}</span>
                </p>
                <p>
                  <span className="inline-block w-16 text-gray-400">Txn ID</span>
                  <span className="font-mono font-medium text-[#2874f0]">{order.paymentDetails.upiTxnId}</span>
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Discount</span>
              <span className="text-green-600">− {formatPrice(Number(order.discount))}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Shipping</span>
              <span>{Number(order.shippingCost) === 0 ? "Free" : formatPrice(Number(order.shippingCost))}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return / Exchange wizard */}
      {returnItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeReturn} />

          <div className="animate-pop-in relative w-full max-w-lg rounded-2xl bg-white p-6 text-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeReturn}
              className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {step === "done" && result ? (
              <div className="text-center py-4">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  {result.status === "Approved" ? (
                    <CheckCircle size={32} className="text-green-600" />
                  ) : (
                    <Clock size={32} className="text-amber-500" />
                  )}
                </span>
                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  {result.status === "Approved" ? "Return Accepted!" : "Return Request Submitted"}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {result.status === "Approved"
                    ? result.returnType === "refund"
                      ? `Our courier will pick up the item within 24–48 hours. Refund of ${formatPrice(Number(result.refundAmount))} will be credited to your original payment method.`
                      : "Our courier will pick up the damaged item and deliver a fresh replacement of the same product."
                    : "Our team will review your request and approve it within 24 hours. Pickup details will be shared via email."}
                </p>
                <button
                  onClick={closeReturn}
                  className="mt-6 w-full rounded-lg bg-[#2874f0] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#2874f0]">
                    <RotateCcw size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{returnItem.name}</h3>
                    <p className="text-xs text-gray-500">
                      Return or exchange within 7 days of delivery · Qty {returnItem.quantity}
                    </p>
                  </div>
                </div>

                {step === "reason" && (
                  <>
                    <p className="text-sm font-semibold text-gray-800 mb-3">
                      What went wrong with this product?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {RETURN_REASONS.map((r) => (
                        <button
                          key={r.key}
                          onClick={() => handleReasonSelect(r.key, r.label)}
                          className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 text-left text-sm text-gray-700 hover:border-[#2874f0] hover:bg-blue-50 transition-colors"
                        >
                          <r.icon size={17} className="text-[#2874f0] shrink-0" />
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === "resolution" && (
                  <>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">Issue:</span> {reason}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-4 mb-3">
                      How would you like us to resolve it?
                    </p>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => setReturnType("refund")}
                        className={`w-full flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                          returnType === "refund"
                            ? "border-[#2874f0] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                          <Wallet size={18} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-gray-900">
                            Refund to payment
                          </span>
                          <span className="block text-xs text-gray-500">
                            Get {formatPrice(Number(returnItem.price) * returnItem.quantity)} back — cash refund to your original payment method
                          </span>
                        </span>
                      </button>

                      <button
                        onClick={() => setReturnType("exchange")}
                        className={`w-full flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                          returnType === "exchange"
                            ? "border-[#2874f0] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-[#2874f0]">
                          <Repeat size={18} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-gray-900">
                            Exchange for same product
                          </span>
                          <span className="block text-xs text-gray-500">
                            We pick up the item and ship you a fresh replacement — no extra cost
                          </span>
                        </span>
                      </button>
                    </div>

                    {returnType && (
                      <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                        {isAutoApproved ? (
                          <span>
                            <span className="font-semibold">Instant approval:</span> this issue is eligible
                            for automatic acceptance. Pickup will be scheduled within 24–48 hours.
                          </span>
                        ) : (
                          <span>
                            This issue is reviewed by our team. Most requests are approved within 24 hours.
                          </span>
                        )}
                      </div>
                    )}

                    {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => setStep("reason")}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!returnType || submitting}
                        className="flex-1 rounded-lg bg-[#2874f0] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={15} className="animate-spin" /> Submitting...
                          </span>
                        ) : (
                          "Submit Return Request"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

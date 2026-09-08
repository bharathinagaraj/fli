import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  Truck,
  CheckCircle,
  Loader2,
  Wallet,
  Gift,
  Banknote,
  X,
  ShieldCheck,
  Lock,
} from "lucide-react";
import useCart from "../hooks/useCart";
import addressService from "../services/addressService";
import orderService from "../services/orderService";
import { formatPrice } from "@/lib/utils";

const STEPS = ["Shipping", "Payment", "Review"];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Wallet, hint: "GPay, PhonePe, Paytm" },
  { id: "card", label: "Card", icon: CreditCard, hint: "Debit / Credit" },
  { id: "giftcard", label: "Gift Card", icon: Gift, hint: "Instant credit" },
  { id: "cod", label: "COD", icon: Banknote, hint: "Cash on Delivery" },
];

const UPI_APPS = [
  { id: "GPay", name: "GPay", color: "bg-blue-500" },
  { id: "PhonePe", name: "PhonePe", color: "bg-purple-500" },
  { id: "Paytm", name: "Paytm", color: "bg-sky-400" },
  { id: "BHIM", name: "BHIM", color: "bg-green-600" },
];

const UPI_ID_REGEX = /^[\w.-]{2,}@[a-zA-Z]{2,}$/;

function validateUpiId(value) {
  return typeof value === "string" && UPI_ID_REGEX.test(value.trim());
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, total, clearCart } = useCart();

  const [step, setStep] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [shipping, setShipping] = useState({ fullName: "", phone: "", street: "", city: "", state: "", zip: "" });
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [upiId, setUpiId] = useState("");
  const [upiApp, setUpiApp] = useState(UPI_APPS[0].id);
  const [upiModal, setUpiModal] = useState(null); // "request" | "pin" | "processing" | "success"
  const [upiPin, setUpiPin] = useState("");
  const [upiTxnId, setUpiTxnId] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCards, setGiftCards] = useState([]);
  const [giftError, setGiftError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    addressService
      .getAddresses()
      .then((list) => {
        setSavedAddresses(list || []);
        if (list?.length) setAddressId(list.find((a) => a.isDefault)?.id || list[0].id);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0 && step === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
        <Link to="/products" className="inline-block bg-[#2874f0] text-white px-6 py-2.5 rounded-sm font-medium">
          Start Shopping
        </Link>
      </div>
    );
  }

  const shippingCost = subtotal > 499 ? 0 : 49;
  const giftDiscount = Math.min(
    giftCards.reduce((acc, g) => acc + g.value, 0),
    total
  );
  const grandTotal = Math.max(total + shippingCost - giftDiscount, 0);

  const paymentLabel = () => {
    switch (paymentMethod) {
      case "upi":
        return `UPI ${upiId || "Payment"}`;
      case "card":
        return payment.cardNumber ? `Card ending in ${payment.cardNumber.slice(-4)}` : "Card";
      case "giftcard":
        return giftCards.length
          ? `Gift Card ${giftCards.map((g) => g.code).join(", ")}`
          : "Gift Card";
      default:
        return "Cash on Delivery";
    }
  };

  const applyGiftCard = () => {
    const code = giftCardCode.trim().toUpperCase();
    if (!code) {
      setGiftError("Enter a gift card code.");
      return;
    }
    if (giftCards.some((g) => g.code === code)) {
      setGiftError("This gift card is already applied.");
      return;
    }
    setGiftCards((prev) => [...prev, { code, value: 500 }]);
    setGiftCardCode("");
    setGiftError("");
  };

  const createAddressAndOrder = async (upiPayload = null) => {
    let finalAddressId = addressId;

    if (!finalAddressId) {
      const address = await addressService.createAddress({
        label: "Home",
        fullName: shipping.fullName,
        phone: shipping.phone,
        street: shipping.street,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: "India",
        isDefault: true,
      });
      finalAddressId = address.id;
    }

    const method = upiPayload
      ? `UPI (${upiPayload.upiId}) via ${upiPayload.app}`
      : paymentLabel();

    const paymentDetails = upiPayload
      ? { type: "upi", app: upiPayload.app, upiId: upiPayload.upiId, upiTxnId: upiPayload.txnId }
      : null;

    await orderService.placeOrder({
      addressId: finalAddressId,
      paymentMethod: method,
      paymentDetails,
    });

    clearCart();
  };

  const handlePlaceOrder = async () => {
    setError("");
    setPlacing(true);
    try {
      if (paymentMethod === "upi") {
        if (!validateUpiId(upiId)) {
          setError("Enter a valid UPI ID (e.g. name@bank).");
          return;
        }
        setUpiPin("");
        setUpiTxnId("");
        setUpiModal("request");
        return;
      }
      await createAddressAndOrder();
      navigate("/orders", { replace: true });
    } catch (err) {
      setError(err.message || "Could not place order.");
    } finally {
      setPlacing(false);
    }
  };

  const handleUpiPay = async () => {
    if (upiPin.length !== 4) {
      setError("Enter your 4-digit UPI PIN to approve the payment.");
      return;
    }
    setError("");
    setUpiModal("processing");
    setPlacing(true);
    try {
      // Simulate the UPI network round-trip (collect → approve → success)
      await new Promise((r) => setTimeout(r, 1800));
      const txnId = `UPI${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${String(Math.floor(Math.random() * 9000 + 1000))}`;
      setUpiTxnId(txnId);
      await createAddressAndOrder({ app: upiApp, upiId: upiId.trim(), txnId });
      setUpiModal("success");
    } catch (err) {
      setUpiModal("pin");
      setError(err.message || "Payment could not be completed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const closeUpiModal = () => {
    if (upiModal === "processing" || upiModal === "success") return;
    setUpiModal(null);
  };

  const upiAppMeta = UPI_APPS.find((a) => a.id === upiApp) || UPI_APPS[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-sm">
          {error}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i <= step ? "bg-[#2874f0] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm ${i <= step ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-3" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-sm shadow-sm p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Truck size={18} /> Shipping Address</h3>

              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  {savedAddresses.map((a) => (
                    <label key={a.id} className={`flex items-start gap-2 border rounded-sm p-3 cursor-pointer ${addressId === a.id ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}>
                      <input
                        type="radio"
                        name="address"
                        checked={addressId === a.id}
                        onChange={() => setAddressId(a.id)}
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-700">
                        <strong>{a.fullName}</strong> — {a.street}, {a.city}, {a.state} {a.zip}, {a.country}
                        <span className="block text-xs text-gray-500">{a.phone}</span>
                      </span>
                    </label>
                  ))}
                  <p className="text-xs text-gray-500">— or add a new address —</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Full Name"
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                />
                <input
                  placeholder="Phone"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                />
              </div>
              <input
                placeholder="Address (House No, Street, Area)"
                value={shipping.street}
                onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  placeholder="City"
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                />
                <input
                  placeholder="State"
                  value={shipping.state}
                  onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                  className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                />
                <input
                  placeholder="PIN Code"
                  value={shipping.zip}
                  onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                  className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h3 className="font-semibold flex items-center gap-2"><Wallet size={18} /> Payment Method</h3>

              {/* Method selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition ${
                        active
                          ? "border-[#2874f0] bg-blue-50 text-[#2874f0]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={22} />
                      <span className="text-sm font-medium">{m.label}</span>
                      <span className={`text-[10px] ${active ? "text-blue-600" : "text-gray-400"}`}>{m.hint}</span>
                    </button>
                  );
                })}
              </div>

              {/* UPI */}
              {paymentMethod === "upi" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-4">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Wallet size={16} className="text-[#2874f0]" /> Pay instantly using UPI
                  </p>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Choose your UPI app</p>
                    <div className="grid grid-cols-4 gap-2">
                      {UPI_APPS.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setUpiApp(app.id)}
                          className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 transition ${
                            upiApp === app.id
                              ? "border-[#2874f0] bg-white shadow-sm"
                              : "border-gray-200 bg-white/60 hover:border-gray-300"
                          }`}
                        >
                          <span className={`${app.color} h-8 w-8 rounded-full flex items-center justify-center text-white text-[9px] font-bold`}>
                            {app.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-medium ${upiApp === app.id ? "text-[#2874f0]" : "text-gray-500"}`}>
                            {app.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      placeholder="Enter your UPI ID (e.g. name@upi)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className={`w-full border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0] ${
                        upiId && !validateUpiId(upiId) ? "border-red-400 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {upiId && !validateUpiId(upiId) && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid UPI ID, e.g. yourname@okhdfcbank</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck size={14} className="text-green-600 shrink-0" />
                    <span>
                      A collect request for <strong className="text-gray-700">{formatPrice(grandTotal)}</strong> will be
                      sent to your {upiApp} app. You approve it with your UPI PIN.
                    </span>
                  </div>
                </div>
              )}

              {/* Card */}
              {paymentMethod === "card" && (
                <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CreditCard size={16} className="text-[#2874f0]" /> Debit / Credit Card
                  </p>
                  <input
                    placeholder="Card Number"
                    value={payment.cardNumber}
                    onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="MM/YY"
                      value={payment.expiry}
                      onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                      className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                    />
                    <input
                      placeholder="CVV"
                      value={payment.cvv}
                      onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
                      className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                    />
                  </div>
                </div>
              )}

              {/* Gift card */}
              {paymentMethod === "giftcard" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-4">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Gift size={16} className="text-amber-600" /> Redeem a Gift Card
                  </p>
                  <div className="flex gap-2">
                    <input
                      placeholder="Enter gift card code"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyGiftCard())}
                      className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={applyGiftCard}
                      className="bg-amber-600 text-white text-sm font-semibold rounded-sm px-4 hover:bg-amber-700"
                    >
                      Apply
                    </button>
                  </div>
                  {giftError && <p className="text-xs text-red-500">{giftError}</p>}

                  {giftCards.length > 0 && (
                    <div className="space-y-2">
                      {giftCards.map((g) => (
                        <div key={g.code} className="flex items-center justify-between bg-white border border-amber-200 rounded-md px-3 py-2 text-sm">
                          <span className="flex items-center gap-2 text-gray-700">
                            <Gift size={14} className="text-amber-600" />
                            <span className="font-mono font-semibold">{g.code}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="text-green-600 font-semibold">-{formatPrice(g.value)}</span>
                            <button
                              type="button"
                              onClick={() => setGiftCards((prev) => prev.filter((x) => x.code !== g.code))}
                              className="text-gray-400 hover:text-red-500"
                              aria-label={`Remove ${g.code}`}
                            >
                              <X size={15} />
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COD */}
              {paymentMethod === "cod" && (
                <div className="rounded-lg border border-gray-200 p-4 flex items-center gap-3">
                  <Banknote size={20} className="text-green-600" />
                  <p className="text-sm text-gray-700">
                    Pay <strong>{formatPrice(grandTotal)}</strong> in cash when your order arrives.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-sm text-gray-700">
              <h3 className="font-semibold flex items-center gap-2"><CheckCircle size={18} /> Review Order</h3>
              <p><strong>Items:</strong> {items.length}</p>
              <p><strong>Ship to:</strong>{" "}
                {savedAddresses.find((a) => a.id === addressId)
                  ? `${savedAddresses.find((a) => a.id === addressId).fullName}, ${savedAddresses.find((a) => a.id === addressId).street}, ${savedAddresses.find((a) => a.id === addressId).city}`
                  : `${shipping.fullName || "—"}, ${shipping.street || "—"}, ${shipping.city || "—"}`}
              </p>
              <p><strong>Payment:</strong> {paymentLabel()}</p>
              {giftCards.length > 0 && (
                <p><strong>Gift Cards:</strong> {giftCards.map((g) => `-${formatPrice(g.value)}`).join(", ")}</p>
              )}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm rounded-sm border border-gray-300 disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && !addressId && !shipping.street}
                className="px-5 py-2 text-sm rounded-sm bg-[#2874f0] text-white font-medium hover:bg-[#1d5fd6] disabled:opacity-40"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="px-5 py-2 text-sm rounded-sm bg-[#fb641b] text-white font-medium hover:bg-[#e85a13] flex items-center gap-2"
              >
                {placing && <Loader2 size={14} className="animate-spin" />}
                {paymentMethod === "upi" ? "Pay with UPI" : "Place Order"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm p-5 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Price Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Price</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{shippingCost === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shippingCost)}</span></div>
            {giftDiscount > 0 && (
              <div className="flex justify-between text-green-600"><span>Gift Cards</span><span>-{formatPrice(giftDiscount)}</span></div>
            )}
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t pt-3 mt-3">
            <span>Total</span><span>{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* UPI payment flow modal */}
      {upiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeUpiModal} />

          <div className="animate-pop-in relative w-full max-w-sm rounded-2xl bg-white p-6 text-gray-900 shadow-2xl">
            {upiModal === "request" && (
              <div className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <Wallet size={28} className="text-[#2874f0]" />
                </span>
                <h3 className="mt-4 text-lg font-bold">Collect Request</h3>
                <p className="mt-1 text-sm text-gray-500">
                  We're requesting <strong className="text-gray-800">{formatPrice(grandTotal)}</strong> from your UPI ID.
                </p>

                <div className="mt-5 space-y-2 rounded-xl bg-gray-50 p-4 text-left text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Merchant</span>
                    <span className="font-semibold">ShopLogo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold">{formatPrice(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">UPI App</span>
                    <span className="font-semibold">{upiApp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">UPI ID</span>
                    <span className="font-mono font-semibold">{upiId.trim()}</span>
                  </div>
                </div>

                {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

                <button
                  onClick={() => { setError(""); setUpiModal("pin"); }}
                  className="mt-5 w-full rounded-lg bg-[#2874f0] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Send Payment Request
                </button>
                <button
                  onClick={closeUpiModal}
                  className="mt-2 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {upiModal === "pin" && (
              <div className="text-center">
                <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${upiAppMeta.color}`}>
                  <Lock size={26} className="text-white" />
                </span>
                <h3 className="mt-4 text-lg font-bold">Enter UPI PIN</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Pay <strong className="text-gray-800">{formatPrice(grandTotal)}</strong> to ShopLogo via {upiApp}
                </p>

                <div className="mt-5">
                  <input
                    autoFocus
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="• • • •"
                    value={upiPin}
                    onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, ""))}
                    className="mx-auto block w-32 rounded-lg border border-gray-300 px-3 py-3 text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                  />
                </div>

                {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

                <button
                  onClick={handleUpiPay}
                  disabled={upiPin.length !== 4}
                  className="mt-5 w-full rounded-lg bg-[#2874f0] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Pay {formatPrice(grandTotal)}
                </button>
                <p className="mt-3 text-[10px] text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-green-600" /> Demo payment — any 4-digit PIN works
                </p>
              </div>
            )}

            {upiModal === "processing" && (
              <div className="text-center py-6">
                <Loader2 size={40} className="mx-auto animate-spin text-[#2874f0]" />
                <h3 className="mt-5 text-lg font-bold">Processing Payment</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Approving {formatPrice(grandTotal)} via {upiApp}…
                </p>
              </div>
            )}

            {upiModal === "success" && (
              <div className="text-center py-4">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle size={34} className="text-green-600" />
                </span>
                <h3 className="mt-4 text-xl font-bold">Payment Successful</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your order has been placed. A confirmation has been sent to your email.
                </p>
                <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-left text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount paid</span>
                    <span className="font-semibold">{formatPrice(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Via</span>
                    <span className="font-semibold">{upiApp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">UPI Txn ID</span>
                    <span className="font-mono text-xs font-semibold text-[#2874f0]">{upiTxnId}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/orders", { replace: true })}
                  className="mt-6 w-full rounded-lg bg-[#2874f0] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  View My Orders
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

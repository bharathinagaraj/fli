import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Coins,
  Ticket,
  Gift,
  Bell,
  Copy,
  Check,
  Plus,
  Wallet,
  Flame,
  Sparkles,
  ShoppingBag,
  Package,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "@/lib/format";

const NOTIFICATIONS = [
  { id: 1, text: "Your order has been delivered", time: "2h ago", icon: Package, color: "text-green-600" },
  { id: 2, text: "Big Billion Days sale is live!", time: "1d ago", icon: ShoppingBag, color: "text-[#2874f0]" },
  { id: 3, text: "You earned 250 SuperCoins", time: "2d ago", icon: Coins, color: "text-amber-500" },
  { id: 4, text: "New coupon EXTRA10 on electronics", time: "3d ago", icon: Ticket, color: "text-purple-600" },
];

const COUPONS = [
  { id: 1, code: "EXTRA10", title: "10% off Electronics", desc: "Min order ₹999. Max discount ₹500.", expires: "Valid till 31 Dec 2026", bg: "from-purple-500 to-indigo-600" },
  { id: 2, code: "FASHION20", title: "20% off Fashion", desc: "Min order ₹499. Max discount ₹300.", expires: "Valid till 15 Sep 2026", bg: "from-pink-500 to-rose-600" },
  { id: 3, code: "WELCOME500", title: "₹500 off on first order", desc: "On orders above ₹2,999.", expires: "Valid till 30 Aug 2026", bg: "from-emerald-500 to-teal-600" },
  { id: 4, code: "FREESHIP", title: "Free shipping", desc: "No minimum order value.", expires: "Valid till 31 Aug 2026", bg: "from-amber-500 to-orange-600" },
];

const TABS = [
  { id: "coins", label: "SuperCoins", icon: Coins },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "giftcards", label: "Gift Cards", icon: Gift },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function AccountBenefits() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "coins");
  const [coins, setCoins] = useState(() => Number(localStorage.getItem("flipkart_coins")) || ((user?.id || 0) % 900 + 100) * 10);
  const [copied, setCopied] = useState("");
  const [redeemed, setRedeemed] = useState([]);
  const [cards, setCards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("flipkart_giftcards") || "[]");
    } catch {
      return [];
    }
  });
  const [cardCode, setCardCode] = useState("");
  const [cardError, setCardError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("flipkart_coins", String(coins));
  }, [coins]);

  useEffect(() => {
    localStorage.setItem("flipkart_giftcards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    setTab(searchParams.get("tab") || "coins");
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const switchTab = (id) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  const copyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {
      // clipboard may be blocked — still show the toast
    }
    setCopied(code);
    setToast(`Coupon ${code} copied to clipboard`);
    setTimeout(() => setCopied(""), 1600);
  };

  const redeemCoins = (amount) => {
    if (coins < amount) {
      setToast("Not enough SuperCoins");
      return;
    }
    setCoins((c) => c - amount);
    setRedeemed((r) => [...r, { amount, at: new Date().toLocaleString("en-IN") }]);
    setToast(`Redeemed ${amount.toLocaleString()} coins`);
  };

  const addCard = () => {
    const code = cardCode.trim().toUpperCase();
    if (!/^SLGC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
      setCardError("Use format SLGC-XXXX-XXXX");
      return;
    }
    setCardError("");
    setCardCode("");
    setCards((c) => [...c, { code, balance: 500, at: new Date().toLocaleDateString("en-IN") }]);
    setToast("Gift card added — ₹500");
  };

  const removeCard = (code) => {
    setCards((c) => c.filter((x) => x.code !== code));
  };

  const Icon = TABS.find((t) => t.id === tab)?.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero balance card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#2874f0] via-[#1b5fd9] to-[#0f3f9e] text-white p-6 mb-6">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-yellow-400/20 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-[#2874f0] shadow-lg">
            <Coins size={28} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/80">SuperCoin Balance</p>
            <p className="text-3xl font-bold">{coins.toLocaleString()} <span className="text-base font-medium text-yellow-300">coins</span></p>
            <p className="text-xs text-white/70 mt-1">≈ {formatPrice(Math.round(coins / 1000) * 10)} in shopping credit</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => redeemCoins(500)}
              className="rounded-lg bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur hover:bg-white/25 transition-colors"
            >
              Redeem 500
            </button>
            <button
              onClick={() => redeemCoins(1000)}
              className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-[#2874f0] hover:bg-yellow-300 transition-colors"
            >
              Redeem 1,000
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
              tab === t.id
                ? "bg-[#2874f0] text-white border-[#2874f0]"
                : "border-gray-300 text-gray-600 hover:border-[#2874f0] hover:text-[#2874f0]"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 text-gray-900">
        {Icon && <Icon size={18} className="text-[#2874f0]" />}
        <h2 className="text-lg font-bold">
          {TABS.find((t) => t.id === tab)?.label}
        </h2>
      </div>

      {/* SuperCoins */}
      {tab === "coins" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Sparkles, label: "Earn", value: "10% of order value", color: "bg-amber-100 text-amber-600" },
              { icon: Flame, label: "Daily streak", value: "6 days • +50 bonus", color: "bg-orange-100 text-orange-600" },
              { icon: Wallet, label: "1,000 coins =", value: "₹10 shopping credit", color: "bg-emerald-100 text-emerald-600" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl bg-white shadow-sm p-4 flex items-start gap-3">
                <span className={`rounded-lg p-2 ${c.color}`}>
                  <c.icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Transaction history</h3>
            <div className="divide-y divide-gray-50 text-sm">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-gray-600">Order #ORD-882134 — Big Billion Days purchase</span>
                <span className="font-semibold text-green-600">+1,850</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-gray-600">Product review on "Wireless Headphones"</span>
                <span className="font-semibold text-green-600">+50</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-gray-600">Daily login streak bonus</span>
                <span className="font-semibold text-green-600">+50</span>
              </div>
              {redeemed.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <span className="text-gray-600">Redeemed for shopping credit — {r.at}</span>
                  <span className="font-semibold text-red-500">−{r.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coupons */}
      {tab === "coupons" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COUPONS.map((c) => (
            <div key={c.id} className="relative overflow-hidden rounded-xl bg-white shadow-sm flex">
              <div className={`w-24 shrink-0 ${c.bg} flex items-center justify-center text-white`}>
                <Ticket size={26} />
              </div>
              <div className="flex-1 p-4">
                <p className="text-sm font-bold text-gray-900">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                <p className="text-[10px] text-gray-400 mt-1">{c.expires}</p>
                <button
                  onClick={() => copyCode(c.code)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[#2874f0] text-[#2874f0] text-xs font-semibold px-3 py-1.5 hover:bg-blue-50 transition-colors"
                >
                  {copied === c.code ? <Check size={13} /> : <Copy size={13} />}
                  {copied === c.code ? "Copied" : c.code}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gift Cards */}
      {tab === "giftcards" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Gift size={16} className="text-[#2874f0]" /> Add a gift card
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={cardCode}
                onChange={(e) => setCardCode(e.target.value)}
                placeholder="SLGC-XXXX-XXXX"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
              />
              <button
                onClick={addCard}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#2874f0] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Plus size={15} /> Add
              </button>
            </div>
            {cardError && <p className="mt-2 text-xs text-red-600">{cardError}</p>}
          </div>

          {cards.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center text-gray-400">
              <Gift size={36} className="mx-auto mb-3" />
              <p className="text-sm">No gift cards yet. Add one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div key={card.code} className="relative overflow-hidden rounded-xl bg-linear-to-br from-fuchsia-500 to-purple-700 text-white p-5 shadow-sm">
                  <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <Gift size={20} className="text-yellow-300" />
                      <button onClick={() => removeCard(card.code)} className="rounded-full p-1 hover:bg-white/15 transition-colors" aria-label="Remove">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="mt-4 text-xs text-white/75">Balance</p>
                    <p className="text-2xl font-bold">{formatPrice(card.balance)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] tracking-wider text-white/60">{card.code}</span>
                      <span className="text-[10px] text-white/60">Added {card.at}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      {tab === "notifications" && (
        <div className="rounded-xl bg-white shadow-sm divide-y divide-gray-50 overflow-hidden">
          {NOTIFICATIONS.map((n) => {
            const Icon = n.icon;
            return (
              <Link to="/orders" key={n.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                <span className={`mt-0.5 shrink-0 ${n.color}`}>
                  <Icon size={18} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-gray-800 leading-snug">{n.text}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{n.time}</span>
                </span>
                <ChevronRight size={16} className="text-gray-300 mt-1" />
              </Link>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="animate-fade-up fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

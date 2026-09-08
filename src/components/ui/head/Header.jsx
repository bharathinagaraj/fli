import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  UserCircle2,
  Coins,
  Ticket,
  Gift,
  Bell,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import { formatPrice } from "@/lib/utils";

const NOTIFICATIONS = [
  { id: 1, text: "Your order has been delivered", time: "2h ago", icon: Package, color: "text-green-600" },
  { id: 2, text: "Big Billion Days sale is live!", time: "1d ago", icon: ShoppingBag, color: "text-[#2874f0]" },
  { id: 3, text: "You earned 250 SuperCoins", time: "2d ago", icon: Coins, color: "text-amber-500" },
  { id: 4, text: "New coupon EXTRA10 on electronics", time: "3d ago", icon: Ticket, color: "text-purple-600" },
];

export default function Header({ cartCount = 0, onSearch, onCartClick }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const accountRef = useRef(null);
  const searchRef = useRef(null);
  const notifyRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      productService
        .getProducts({ search: term, limit: 6 })
        .then((data) => {
          setSuggestions(data.items || []);
          setSuggestionsOpen(true);
        })
        .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    onSearch?.(searchTerm.trim());
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    setMenuOpen(false);
    setSuggestionsOpen(false);
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm("");
    setSuggestions([]);
    setSuggestionsOpen(false);
    navigate(`/product/${product.id}`);
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    navigate("/");
  };

  const superCoins = ((user?.id || 0) % 900 + 100) * 10;

  return (
    <header className="sticky top-0 z-50 bg-[#2874f0] shadow-sm">
      <div className="w-[50%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="md:hidden p-1 text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="flex items-center gap-2 text-white leading-none group">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-yellow-300 to-yellow-500 text-[#2874f0] shadow group-hover:scale-105 transition-transform">
                <ShoppingBag size={20} />
              </span>
              <span className="text-xl font-bold group-hover:opacity-90 transition-opacity">
                Shop<span className="text-yellow-400">Logo</span>
                <span className="block text-[10px] font-normal italic text-white/80">
                  Explore Plus
                </span>
              </span>
            </Link>
          </div>

          {/* Search bar - desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative"
            ref={searchRef}
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => suggestions.length && setSuggestionsOpen(true)}
                placeholder="Search for products, brands and more"
                className="w-full border border-gray-300 rounded-l-md py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2874f0]"
              >
                <Search size={18} />
              </button>
            </div>

            {suggestionsOpen && searchTerm.trim() && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-100 z-50 overflow-hidden">
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {suggestions.map((p) => {
                    const img = p.image || (Array.isArray(p.images) ? p.images[0] : "");
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSuggestionClick(p)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left"
                      >
                        <img src={img} alt={p.name} className="w-11 h-11 rounded object-cover bg-gray-100 shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm text-gray-800 truncate">{p.name}</span>
                          <span className="block text-xs text-gray-400 truncate">{p.brand}</span>
                        </span>
                        <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(p.price)}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full text-center text-sm font-medium text-[#2874f0] bg-blue-50 hover:bg-blue-100 px-3 py-2"
                >
                  See all results for "{searchTerm.trim()}"
                </button>
              </div>
            )}
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Account */}
            <div
              className="relative"
              ref={accountRef}
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              {isAuthenticated ? (
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-white text-sm font-medium hover:bg-white/10 rounded"
                >
                  <UserCircle2 size={18} />
                  <span className="hidden sm:inline max-w-22.5 truncate">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown size={14} />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="hidden sm:inline-block bg-white text-[#2874f0] text-sm font-semibold px-6 py-1.5 rounded-sm"
                >
                  Login
                </button>
              )}

              {accountOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 bg-blue-50/60 flex items-center gap-3">
                    <img
                      src={user?.avatar || "https://placehold.co/100x100"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover bg-gray-100"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setAccountOpen(false); navigate("/benefits?tab=coins"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
                  >
                    <Coins size={17} className="text-amber-500" />
                    SuperCoin Zone
                    <span className="ml-auto rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">
                      {superCoins.toLocaleString()} coins
                    </span>
                  </button>

                  <div className="border-t border-gray-100 py-1">
                    <Link to="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User size={15} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Package size={15} /> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Heart size={15} /> My Wishlist
                    </Link>
                    <Link to="/benefits?tab=coupons" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Ticket size={15} /> My Coupons
                    </Link>
                    <Link to="/benefits?tab=giftcards" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Gift size={15} /> Gift Cards
                    </Link>
                    <Link to="/benefits?tab=notifications" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Bell size={15} /> Notifications
                    </Link>
                    <Link to="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <RotateCcw size={15} /> Returns & Exchanges
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isAuthenticated && (
              <button
                onClick={() => navigate("/login")}
                className="md:hidden p-2 text-white"
                aria-label="Login"
              >
                <User size={20} />
              </button>
            )}

            {/* Notifications */}
            <div className="relative" ref={notifyRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-white hover:bg-white/10 rounded"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    <span className="text-[10px] font-semibold text-[#2874f0] bg-blue-50 px-2 py-0.5 rounded-full">4 new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {NOTIFICATIONS.map((n) => {
                      const Icon = n.icon;
                      return (
                        <button
                          key={n.id}
                          onClick={() => setNotificationsOpen(false)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                        >
                          <span className={`mt-0.5 shrink-0 ${n.color}`}>
                            <Icon size={16} />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm text-gray-800 leading-snug">{n.text}</span>
                            <span className="block text-xs text-gray-400 mt-0.5">{n.time}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link to="/wishlist" className="p-2 text-white hover:bg-white/10 rounded">
              <Heart size={20} />
            </Link>

            <button
              onClick={onCartClick}
              className="relative p-2 text-white hover:bg-white/10 rounded"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search + menu */}
        {menuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2874f0]">
                <Search size={18} />
              </button>
            </form>
            <nav className="flex flex-col gap-1 text-white text-sm">
              {!isAuthenticated && (
                <button onClick={() => { setMenuOpen(false); navigate("/login"); }} className="py-1.5 px-1 text-left hover:bg-white/10">Login</button>
              )}
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-1.5 px-1 hover:bg-white/10">My Account</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="py-1.5 px-1 hover:bg-white/10">My Orders</Link>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="py-1.5 px-1 hover:bg-white/10">Wishlist</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

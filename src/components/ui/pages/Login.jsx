import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShoppingBag, User, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { id: "customer", label: "Customer", icon: User },
  { id: "admin", label: "Admin", icon: ShieldCheck },
];

const DEMO = {
  customer: { email: "customer@flipkart.store", password: "Customer@1234" },
  admin: { email: "admin@flipkart.store", password: "Admin@1234" },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from;
  const redirectTo =
    typeof from === "string" ? from : from?.pathname || "/profile";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const switchRole = (r) => {
    setRole(r);
    setError("");
    setForm({ email: "", password: "" });
  };

  const fillDemo = () => {
    setForm({ email: DEMO[role].email, password: DEMO[role].password });
    setError("");
  };

  const inputCls =
    "w-full border border-gray-300 rounded-md py-2.5 text-sm pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-[#2874f0]";

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-10 overflow-hidden bg-linear-to-br from-indigo-800 via-purple-800 to-pink-700">
      {/* Animated colour blobs */}
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-pink-500/50 blur-3xl animate-blob" />
      <div className="absolute top-1/4 -right-28 h-96 w-96 rounded-full bg-cyan-400/40 blur-3xl animate-blob-delay" />
      <div className="absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-yellow-400/30 blur-3xl animate-blob" />
      <div className="absolute top-10 left-1/3 h-48 w-48 rounded-full bg-white/20 blur-2xl animate-blob-slow" />
      <div className="absolute bottom-1/4 right-1/3 h-56 w-56 rounded-full bg-fuchsia-400/40 blur-2xl animate-blob-delay" />
      <div className="absolute top-1/2 left-6 h-32 w-32 rounded-full bg-teal-300/30 blur-xl animate-blob-slow" />

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Brand / image panel */}
        <div className="relative hidden md:block bg-linear-to-br from-[#2874f0] via-[#1b5fd9] to-[#0f3f9e] text-white p-10">
          <img
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&q=80"
            alt="Shopping"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-2 text-lg font-bold">
              <ShoppingBag size={24} />
              Shop<span className="text-yellow-400">Logo</span>
            </div>
            <div className="mt-auto">
              <h2 className="text-3xl font-bold leading-tight">
                Millions of products.
                <br />
                One store.
              </h2>
              <p className="mt-3 text-white/80">
                Shop the latest electronics, fashion, home and more with
                exclusive deals every day.
              </p>
              <div className="mt-6 flex gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white/20 px-3 py-1">Free delivery</span>
                <span className="rounded-full bg-white/20 px-3 py-1">Easy returns</span>
                <span className="rounded-full bg-white/20 px-3 py-1">Secure pay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Welcome Back</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Log in to your account</p>

          {/* Role tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 rounded-lg p-1">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => switchRole(r.id)}
                  className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition ${
                    active
                      ? "bg-white text-[#2874f0] shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon size={15} />
                  {r.label}
                </button>
              );
            })}
          </div>

          {role === "admin" && (
            <p className="mb-4 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
              <ShieldCheck size={13} className="inline mr-1" />
              Use an admin account to manage products, categories and orders.
            </p>
          )}

          {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

          {/* Demo credentials */}
          <div className="mb-5 rounded-lg border border-dashed border-[#2874f0]/40 bg-blue-50/60 p-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#2874f0]">
                <Sparkles size={13} />
                Demo {role === "admin" ? "admin" : "customer"} account
              </p>
              <button
                type="button"
                onClick={fillDemo}
                className="flex items-center gap-1 rounded-md bg-[#2874f0] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#1b5fd9]"
              >
                <Wand2 size={11} />
                Autofill
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded bg-white px-2 py-1.5 shadow-sm">
                <p className="text-gray-400">Email</p>
                <p className="truncate font-mono font-medium text-gray-800">{DEMO[role].email}</p>
              </div>
              <div className="rounded bg-white px-2 py-1.5 shadow-sm">
                <p className="text-gray-400">Password</p>
                <p className="truncate font-mono font-medium text-gray-800">{DEMO[role].password}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#fb641b] text-white py-2.5 rounded-md font-semibold text-sm hover:bg-[#e4551a] disabled:opacity-60"
            >
              {submitting ? "Logging in…" : `Log In as ${role === "admin" ? "Admin" : "Customer"}`}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#2874f0] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

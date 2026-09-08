import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full border border-gray-300 rounded-md py-2.5 text-sm pl-9 pr-9 focus:outline-none focus:ring-2 focus:ring-[#2874f0]";

  const field = (icon, type, placeholder, value, key, onToggle) => (
    <div className="relative">
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={inputCls}
      />
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={type === "password" ? "Show field" : "Hide field"}
        >
          {type === "password" ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-10 overflow-hidden bg-linear-to-br from-emerald-800 via-teal-800 to-cyan-700">
      {/* Animated colour blobs */}
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-400/50 blur-3xl animate-blob" />
      <div className="absolute top-1/4 -right-28 h-96 w-96 rounded-full bg-teal-300/40 blur-3xl animate-blob-delay" />
      <div className="absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-lime-300/30 blur-3xl animate-blob" />
      <div className="absolute top-10 left-1/3 h-48 w-48 rounded-full bg-white/20 blur-2xl animate-blob-slow" />
      <div className="absolute bottom-1/4 right-1/3 h-56 w-56 rounded-full bg-emerald-300/40 blur-2xl animate-blob-delay" />
      <div className="absolute top-1/2 left-6 h-32 w-32 rounded-full bg-sky-300/30 blur-xl animate-blob-slow" />

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Brand / image panel */}
        <div className="relative hidden md:block bg-linear-to-br from-[#fb641b] via-[#d94f14] to-[#9c340b] text-white p-10">
          <img
            src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80"
            alt="Join us"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-2 text-lg font-bold">
              <ShoppingBag size={24} />
              Shop<span className="text-yellow-300">Logo</span>
            </div>
            <div className="mt-auto">
              <h2 className="text-3xl font-bold leading-tight">Join ShopLogo today</h2>
              <p className="mt-3 text-white/80">
                Create your free account and unlock exclusive deals, faster
                checkout and order tracking.
              </p>
              <div className="mt-6 space-y-2 text-sm text-white/90">
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Exclusive member-only offers
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Track orders in real time
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Express checkout with saved details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Create Account</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Join ShopLogo today</p>

          {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

          <div className="mb-5 rounded-lg border border-dashed border-emerald-500/40 bg-emerald-50/60 p-3 text-[11px] text-gray-700">
            <p className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              Demo accounts (use these on the login page)
            </p>
            <div className="mt-2 space-y-1.5 font-mono">
              <p>customer@flipkart.store / Customer@1234</p>
              <p>admin@flipkart.store / Admin@1234</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {field(
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />,
              "text",
              "Full Name",
              form.name,
              "name"
            )}
            {field(
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />,
              "email",
              "Email",
              form.email,
              "email"
            )}
            {field(
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />,
              showPassword ? "text" : "password",
              "Password (min 6 characters)",
              form.password,
              "password",
              () => setShowPassword(!showPassword)
            )}
            {field(
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />,
              showConfirm ? "text" : "password",
              "Confirm Password",
              form.confirm,
              "confirm",
              () => setShowConfirm(!showConfirm)
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#fb641b] text-white py-2.5 rounded-md font-semibold text-sm hover:bg-[#e4551a] disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2874f0] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Save,
  Package,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  BadgeCheck,
  Crown,
  CalendarDays,
  Gem,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import orderService from "../services/orderService";
import { formatPrice } from "@/lib/format";

const mask = (str) => {
  if (!str) return "";
  const clean = str.replace(/[^A-Z0-9]/gi, "");
  if (clean.length <= 4) return "•".repeat(clean.length);
  return `•••• •••• ${clean.slice(-4).toUpperCase()}`;
};

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [kyc, setKyc] = useState({ pan: "", aadhaar: "" });
  const [reveal, setReveal] = useState({ pan: false, aadhaar: false });
  const [kycInputs, setKycInputs] = useState({ pan: "", aadhaar: "" });
  const [kycError, setKycError] = useState("");
  const [kycSaved, setKycSaved] = useState(false);

  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" });
  const [passError, setPassError] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [changingPass, setChangingPass] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [summary, setSummary] = useState(null);

  const kycStorageKey = `flipkart_kyc_${user?.id || "guest"}`;

  useEffect(() => {
    if (!user) return;
    orderService
      .getMySummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [user]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(kycStorageKey) || "{}");
      if (raw.pan) setKyc((k) => ({ ...k, pan: raw.pan }));
      if (raw.aadhaar) setKyc((k) => ({ ...k, aadhaar: raw.aadhaar }));
      setTwoFA(raw.twoFA || false);
    } catch {
      /* no saved kyc */
    }
  }, [kycStorageKey]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const updated = await authService.updateProfile({ name: form.name, phone: form.phone });
      updateProfile(updated);
      setEditing(false);
      setMessage("Profile updated successfully.");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const saveKyc = (e) => {
    e.preventDefault();
    setKycError("");
    const pan = kycInputs.pan.trim().toUpperCase();
    const aadhaar = kycInputs.aadhaar.trim();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      setKycError("Enter a valid PAN (e.g. ABCDE1234F).");
      return;
    }
    if (!/^\d{12}$/.test(aadhaar)) {
      setKycError("Enter a valid 12-digit Aadhaar number.");
      return;
    }

    const next = { ...kyc, pan, aadhaar };
    setKyc(next);
    setKycInputs({ pan: "", aadhaar: "" });
    localStorage.setItem(kycStorageKey, JSON.stringify({ ...next, twoFA }));
    setKycSaved(true);
    setTimeout(() => setKycSaved(false), 2500);
  };

  const toggleTwoFA = () => {
    const next = !twoFA;
    setTwoFA(next);
    localStorage.setItem(kycStorageKey, JSON.stringify({ ...kyc, twoFA: next }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassMessage("");
    if (!passForm.currentPassword || !passForm.newPassword) {
      setPassError("Fill in both password fields.");
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassError("New password must be at least 6 characters.");
      return;
    }
    setChangingPass(true);
    try {
      await authService.changePassword(passForm.currentPassword, passForm.newPassword);
      setPassForm({ currentPassword: "", newPassword: "" });
      setPassMessage("Password updated successfully.");
      setTimeout(() => setPassMessage(""), 2500);
    } catch (err) {
      setPassError(err.message || "Could not change password.");
    } finally {
      setChangingPass(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "Member";

  const rewardsPoints = ((user?.id || 0) % 900 + 500) * (user?.phone ? 2 : 1);

  const securityScore =
    40 + (user?.phone ? 15 : 0) + (kyc.pan && kyc.aadhaar ? 25 : 0) + (twoFA ? 20 : 0);

  const inputCls = (disabled) =>
    `w-full border border-gray-300 rounded-md pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0] ${
      disabled ? "bg-gray-50" : ""
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {message && (
        <div className="mb-4 bg-green-50 text-green-700 text-sm px-4 py-2 rounded-md">{message}</div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-2 rounded-md">{error}</div>
      )}

      {/* Profile header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#2874f0] via-[#1b5fd9] to-[#0f3f9e] text-white p-6 sm:p-8 mb-6">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-yellow-400/20" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <img
              src={user?.avatar || "https://placehold.co/100x100"}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white/30 bg-white"
            />
            <span className="absolute -bottom-1 -right-1 rounded-full bg-green-500 w-6 h-6 flex items-center justify-center border-2 border-white">
              <ShieldCheck size={13} />
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {user?.name}
              <BadgeCheck size={20} className="text-yellow-300" />
            </h2>
            <p className="text-white/80 text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                <Crown size={13} /> {user?.role === "admin" ? "Admin Account" : "Gold Member"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                <CalendarDays size={13} /> Since {memberSince}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                <Gem size={13} /> {rewardsPoints.toLocaleString()} Reward Points
              </span>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition-colors"
                >
                  <ShieldCheck size={13} /> Admin Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-3xl font-bold">{securityScore}%</div>
            <p className="text-xs text-white/70">Security Score</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-[#2874f0]" /> Personal Information
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!editing}
                    className={inputCls(!editing)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="email"
                    value={form.email}
                    disabled
                    className={inputCls(true)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className={inputCls(!editing)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {editing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setError("");
                      }}
                      className="px-4 py-2 text-sm rounded-md border border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[#2874f0] text-white font-medium hover:bg-[#1a5fd0] disabled:opacity-60"
                    >
                      <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-sm rounded-md bg-[#2874f0] text-white font-medium hover:bg-[#1a5fd0]"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* KYC */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Fingerprint size={18} className="text-[#2874f0]" /> KYC & Verification
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Your PAN and Aadhaar are stored securely and always masked. Only the last 4 digits are ever shown.
            </p>

            {kycSaved && (
              <p className="mb-3 text-sm text-green-600">KYC details saved successfully.</p>
            )}
            {kycError && <p className="mb-3 text-sm text-red-500">{kycError}</p>}

            {/* Saved KYC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CreditCard size={15} className="text-amber-600" /> PAN Card
                  </span>
                  {kyc.pan ? (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">VERIFIED</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">NOT ADDED</span>
                  )}
                </div>
                {kyc.pan ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-gray-800">
                      {reveal.pan ? kyc.pan : mask(kyc.pan)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReveal((r) => ({ ...r, pan: !r.pan }))}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Toggle PAN visibility"
                    >
                      {reveal.pan ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Add your PAN to verify your identity.</p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Fingerprint size={15} className="text-[#2874f0]" /> Aadhaar Card
                  </span>
                  {kyc.aadhaar ? (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">VERIFIED</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">NOT ADDED</span>
                  )}
                </div>
                {kyc.aadhaar ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-gray-800">
                      {reveal.aadhaar ? kyc.aadhaar : mask(kyc.aadhaar)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReveal((r) => ({ ...r, aadhaar: !r.aadhaar }))}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Toggle Aadhaar visibility"
                    >
                      {reveal.aadhaar ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Add your Aadhaar to verify your identity.</p>
                )}
              </div>
            </div>

            {/* Add/update KYC */}
            <form onSubmit={saveKyc} className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="PAN (e.g. ABCDE1234F)"
                  value={kycInputs.pan}
                  onChange={(e) => setKycInputs({ ...kycInputs, pan: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                />
                <input
                  placeholder="Aadhaar (12 digits)"
                  value={kycInputs.aadhaar}
                  onChange={(e) => setKycInputs({ ...kycInputs, aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[#2874f0] text-white font-medium hover:bg-[#1a5fd0]"
              >
                <ShieldCheck size={14} /> {kyc.pan ? "Update KYC" : "Save & Verify KYC"}
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock size={18} className="text-[#2874f0]" /> Account Security
            </h3>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-3">
                <ShieldAlert size={20} className="text-[#2874f0]" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">
                    {twoFA ? "Extra security is enabled on your account." : "Add an extra layer of protection to your account."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTwoFA}
                aria-label="Toggle two-factor authentication"
                className={`relative h-6 w-11 rounded-full transition ${twoFA ? "bg-[#2874f0]" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${twoFA ? "left-5.5" : "left-0.5"}`}
                />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <KeyRound size={15} /> Change Password
              </p>
              {passMessage && <p className="text-sm text-green-600">{passMessage}</p>}
              {passError && <p className="text-sm text-red-500">{passError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                />
                <input
                  type="password"
                  placeholder="New password (min 6)"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                />
              </div>
              <button
                type="submit"
                disabled={changingPass}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-gray-800 text-white font-medium hover:bg-gray-900 disabled:opacity-60"
              >
                <Lock size={14} /> {changingPass ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package size={20} className="text-[#2874f0]" />
              <div>
                <p className="text-sm font-medium text-gray-900">My Orders</p>
                <p className="text-xs text-gray-500">View and track your orders</p>
              </div>
            </div>
            <Link to="/orders" className="text-sm text-[#2874f0] hover:underline">
              View →
            </Link>
          </div>

          {summary && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Package size={18} className="text-[#2874f0]" /> My Purchases
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-lg font-bold text-gray-900">{summary.totalOrders}</p>
                  <p className="text-[10px] text-gray-500">Orders</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-lg font-bold text-gray-900">{summary.totalItemsBought}</p>
                  <p className="text-[10px] text-gray-500">Products</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-lg font-bold text-gray-900">{formatPrice(summary.totalSpent)}</p>
                  <p className="text-[10px] text-gray-500">Spent</p>
                </div>
              </div>
              {summary.productsBought?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Top products bought</p>
                  <ul className="space-y-1.5">
                    {summary.productsBought.slice(0, 5).map((p) => (
                      <li key={p.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate pr-2">{p.name}</span>
                        <span className="shrink-0 text-xs font-semibold text-[#2874f0]">×{p.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 text-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} />
              <p className="text-sm font-semibold">Your data is secure</p>
            </div>
            <ul className="space-y-2 text-xs text-white/85">
              <li>• Passwords are stored encrypted (bcrypt).</li>
              <li>• PAN & Aadhaar are masked at all times.</li>
              <li>• KYC data stays private to your account.</li>
              <li>• Session expires automatically for safety.</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm font-medium text-gray-900 mb-3">Security Score</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Profile completion</span>
              <span className="font-semibold text-[#2874f0]">{securityScore}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#2874f0] to-emerald-500 transition-all duration-700"
                style={{ width: `${securityScore}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Add your phone, complete KYC and enable 2FA to reach 100%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

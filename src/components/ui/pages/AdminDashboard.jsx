import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Users,
  LogIn,
  Package,
  ShoppingCart,
  LayoutGrid,
  IndianRupee,
  BarChart3,
  Truck,
  TrendingUp,
  CalendarRange,
  RefreshCw,
  AlertTriangle,
  Plus,
  Sparkles,
} from "lucide-react";
import Loading from "../head/Loading";
import api from "../services/api";
import productService from "../services/productService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../dialog";
import { formatPrice } from "@/lib/format";

const EMPTY_PRODUCT_FORM = {
  name: "",
  brand: "",
  categoryId: "",
  price: "",
  originalPrice: "",
  stockQuantity: "10",
  description: "",
  variants: "",
};

const STATUS_STYLES = {
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const PRODUCT_STATUS_STYLES = {
  Active: "bg-green-100 text-green-700",
  "Out of Stock": "bg-red-100 text-red-700",
  Inactive: "bg-gray-100 text-gray-600",
  "Missing Images": "bg-amber-100 text-amber-700",
};

const PRODUCT_STATUS_REASONS = {
  "Out of Stock": "Stock quantity is zero or negative.",
  Inactive: "Marked inactive in the catalog.",
  "Missing Images": "No valid product images.",
};

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="bg-[#2874f0]/10 text-[#2874f0] rounded-full p-2.5">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [daily, setDaily] = useState([]);
  const [signups, setSignups] = useState([]);
  const [logins, setLogins] = useState([]);
  const [guests, setGuests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({ items: [], total: 0 });
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusReport, setStatusReport] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_PRODUCT_FORM);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const fetchAll = async () => {
      try {
        const [ov, dl, su, lg, gv, cats, prods, ords, sls, custs] = await Promise.all([
          api.get("/analytics/overview"),
          api.get("/analytics/daily", { days: 14 }),
          api.get("/analytics/signups", { limit: 100 }),
          api.get("/analytics/logins", { limit: 100 }),
          api.get("/analytics/guests", { limit: 100 }),
          api.get("/categories"),
          api.get("/products", { limit: 200 }),
          api.get("/orders/admin/all"),
          api.get("/analytics/sales"),
          api.get("/analytics/customers"),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setDaily(dl || []);
        setSignups(su || []);
        setLogins(lg || []);
        setGuests(gv || []);
        setCategories(cats || []);
        setProducts(prods || { items: [], total: 0 });
        setOrders(ords || []);
        setSales(sls);
        setCustomers(custs || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusLoadingRef = useRef(false);
  const runStatusCheck = useCallback(async () => {
    if (statusLoadingRef.current) return;
    statusLoadingRef.current = true;
    setStatusLoading(true);
    setStatusError("");
    try {
      const report = await api.get("/products/status");
      setStatusReport(report);
    } catch (err) {
      setStatusError(err.message || "Could not run the product status check.");
    } finally {
      statusLoadingRef.current = false;
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "status") runStatusCheck();
  }, [tab, runStatusCheck]);

  const categoryTotal = useMemo(() => {
    let n = categories.length;
    categories.forEach((c) => (n += (c.subcategories || []).length));
    return n;
  }, [categories]);

  // Flat list of leaf categories for the product form (products attach to subs).
  const leafCategories = useMemo(
    () =>
      categories.flatMap((c) =>
        (c.subcategories || []).length
          ? c.subcategories.map((s) => ({
              id: s.id,
              label: `${c.name} › ${s.name}`,
            }))
          : [{ id: c.id, label: c.name }]
      ),
    [categories]
  );

  const refreshProducts = useCallback(async () => {
    try {
      const prods = await api.get("/products", { limit: 200 });
      setProducts(prods || { items: [], total: 0 });
    } catch {
      // keep the previous list if a refresh fails
    }
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateLoading(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        brand: createForm.brand.trim(),
        categoryId: createForm.categoryId,
        price: Number(createForm.price),
        originalPrice: createForm.originalPrice
          ? Number(createForm.originalPrice)
          : null,
        stockQuantity: Number(createForm.stockQuantity) || 0,
        description: createForm.description.trim(),
        variants: createForm.variants
          ? createForm.variants.split(",").map((v) => v.trim()).filter(Boolean)
          : [],
      };
      // No `images` sent → backend auto-generates a category-matched photo set.
      const product = await productService.createProduct(payload);
      setCreatedProduct(product);
      await refreshProducts();
    } catch (err) {
      setCreateError(err.message || "Could not create product.");
    } finally {
      setCreateLoading(false);
    }
  };

  const closeCreate = () => {
    setShowCreate(false);
    setCreateForm(EMPTY_PRODUCT_FORM);
    setCreatedProduct(null);
    setCreateError("");
  };

  if (loading) return <Loading />;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "signups", label: "Signups" },
    { id: "logins", label: "Customer Logins" },
    { id: "guests", label: "Guest Visits" },
    { id: "customers", label: "Customers" },
    { id: "categories", label: "Categories" },
    { id: "products", label: "Products" },
    { id: "status", label: "Product Status" },
    { id: "orders", label: "Order Status" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customers logins, guest visits, catalog and order tracking.
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border ${
              tab === t.id
                ? "bg-[#2874f0] text-white border-[#2874f0]"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Signups"
              value={overview?.signups?.total ?? 0}
              sub={`${overview?.signups?.today ?? 0} today`}
            />
            <StatCard
              icon={LogIn}
              label="Customer Logins"
              value={overview?.logins?.total ?? 0}
              sub={`${overview?.logins?.today ?? 0} today · ${overview?.logins?.uniqueUsers ?? 0} unique users`}
            />
            <StatCard
              icon={Users}
              label="Guest Visits"
              value={overview?.guests?.total ?? 0}
              sub={`${overview?.guests?.today ?? 0} today · ${overview?.guests?.uniqueSessions ?? 0} sessions`}
            />
            <StatCard
              icon={ShoppingCart}
              label="Total Orders"
              value={overview?.store?.totalOrders ?? 0}
              sub={`${overview?.store?.totalCustomers ?? 0} registered customers`}
            />
            <StatCard
              icon={Package}
              label="Products Sold"
              value={sales?.totalItemsSold ?? 0}
              sub={`${sales?.totalOrders ?? 0} orders · ${formatPrice(sales?.totalRevenue ?? 0)}`}
            />
            <StatCard
              icon={IndianRupee}
              label="Revenue"
              value={formatPrice(overview?.store?.revenue ?? 0)}
              sub="excludes cancelled orders"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
              <CalendarRange size={16} className="text-[#2874f0]" /> Products bought by year
            </h2>
            {!sales?.byYear || sales.byYear.length === 0 ? (
              <p className="text-sm text-gray-400">No sales recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="py-2 pr-4">Year</th>
                      <th className="py-2 pr-4">Orders</th>
                      <th className="py-2 pr-4">Products Sold</th>
                      <th className="py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.byYear.map((y) => (
                      <tr key={y.year} className="border-b border-gray-50">
                        <td className="py-2 pr-4 font-semibold text-gray-900">{y.year}</td>
                        <td className="py-2 pr-4 text-gray-600">{y.orders}</td>
                        <td className="py-2 pr-4 text-gray-600">{y.itemsSold}</td>
                        <td className="py-2 font-semibold text-gray-900">
                          {formatPrice(y.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sales?.topProducts && sales.topProducts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Top selling products</h3>
                <div className="space-y-2">
                  {sales.topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="w-5 text-xs text-gray-400 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700 truncate">{p.name}</span>
                          <span className="text-gray-500 ml-3 whitespace-nowrap">
                            {p.quantity} sold · {formatPrice(p.revenue)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                          <div
                            className="h-1.5 bg-[#2874f0] rounded-full"
                            style={{
                              width: `${Math.round(
                                (p.quantity / Math.max(1, sales.topProducts[0].quantity)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
              <BarChart3 size={16} className="text-[#2874f0]" /> Last 14 days
            </h2>
            {daily.length === 0 ? (
              <p className="text-sm text-gray-400">No activity recorded yet.</p>
            ) : (
              <div className="flex items-end gap-1.5 h-40">
                {daily.map((d) => {
                  const max = Math.max(
                    1,
                    ...daily.map((x) => Math.max(x.signups || 0, x.logins, x.guests, x.orders))
                  );
                  const h = (v) => `${Math.max(4, Math.round((v / max) * 160))}px`;
                  return (
                    <div key={d.date} className="flex-1 flex items-end gap-0.5" title={`${d.date}`}>
                      <div
                        className="w-full bg-purple-400 rounded-t"
                        style={{ height: h(d.signups) }}
                      />
                      <div
                        className="w-full bg-blue-400 rounded-t"
                        style={{ height: h(d.guests) }}
                      />
                      <div
                        className="w-full bg-[#2874f0] rounded-t"
                        style={{ height: h(d.logins) }}
                      />
                      <div
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: h(d.orders) }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" /> Signups
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" /> Guests
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2874f0]" /> Logins
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Orders
              </span>
            </div>
          </div>
        </>
      )}

      {tab === "signups" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
            <Users size={16} className="text-[#2874f0]" /> Customer signups
          </h2>
          {signups.length === 0 ? (
            <p className="text-sm text-gray-400">No signups recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">IP</th>
                    <th className="py-2">Signed up at</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        {s.User?.name || "—"}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{s.email || s.User?.email || "—"}</td>
                      <td className="py-2 pr-4 text-gray-500">{s.ip || "—"}</td>
                      <td className="py-2 text-gray-600">{fmtDate(s.signedUpAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "logins" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
            <LogIn size={16} className="text-[#2874f0]" /> Customer login history
          </h2>
          {logins.length === 0 ? (
            <p className="text-sm text-gray-400">No logins recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">IP</th>
                    <th className="py-2 pr-4">Device</th>
                    <th className="py-2">Logged in at</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        {l.User?.name || "—"}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{l.email || l.User?.email}</td>
                      <td className="py-2 pr-4 text-gray-500">{l.ip || "—"}</td>
                      <td className="py-2 pr-4 text-gray-500 truncate max-w-50">
                        {l.userAgent?.slice(0, 40) || "—"}
                      </td>
                      <td className="py-2 text-gray-600">{fmtDate(l.loginAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "guests" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
            <Users size={16} className="text-[#2874f0]" /> Guest visits (visitors who did not log in)
          </h2>
          {guests.length === 0 ? (
            <p className="text-sm text-gray-400">No guest visits recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-4">Session</th>
                    <th className="py-2 pr-4">Page</th>
                    <th className="py-2 pr-4">IP</th>
                    <th className="py-2">Visited at</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g) => (
                    <tr key={g.id} className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-500 truncate max-w-40">
                        {g.sessionId || "—"}
                      </td>
                      <td className="py-2 pr-4 font-medium text-gray-900">{g.page}</td>
                      <td className="py-2 pr-4 text-gray-500">{g.ip || "—"}</td>
                      <td className="py-2 text-gray-600">{fmtDate(g.visitedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "customers" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
            <Users size={16} className="text-[#2874f0]" /> Customers ({customers.length})
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            How many products each customer bought, total spend and latest order status.
          </p>
          {customers.length === 0 ? (
            <p className="text-sm text-gray-400">No customers registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Signed up</th>
                    <th className="py-2 pr-4">Orders</th>
                    <th className="py-2 pr-4">Products bought</th>
                    <th className="py-2 pr-4">Total spent</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Last purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <React.Fragment key={c.id}>
                      <tr
                        className="border-b border-gray-50 cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          setSelectedCustomer(selectedCustomer === c.id ? null : c.id)
                        }
                      >
                        <td className="py-2 pr-4 font-medium text-gray-900">
                          {c.name}
                          <span className="block text-xs text-gray-400 font-normal">
                            {c.email}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-gray-600">{fmtDate(c.signedUpAt)}</td>
                        <td className="py-2 pr-4 text-gray-600">{c.totalOrders}</td>
                        <td className="py-2 pr-4 text-gray-600">{c.totalItemsBought}</td>
                        <td className="py-2 pr-4 font-semibold text-gray-900">
                          {formatPrice(c.totalSpent)}
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              c.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500">
                          {c.lastPurchaseAt ? fmtDate(c.lastPurchaseAt) : "Never bought"}
                        </td>
                      </tr>
                      {selectedCustomer === c.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="py-4 px-4">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-2">
                                  Products bought ({c.productsBought?.length || 0})
                                </p>
                                {c.productsBought?.length ? (
                                  <ul className="space-y-1.5">
                                    {c.productsBought.map((p) => (
                                      <li
                                        key={p.name}
                                        className="flex justify-between text-sm text-gray-700"
                                      >
                                        <span className="truncate pr-4">{p.name}</span>
                                        <span className="text-gray-500 whitespace-nowrap">
                                          {p.quantity} × {formatPrice(p.revenue)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-400">
                                    Customer has not bought any products yet.
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-2">
                                  Order status ({c.orders?.length || 0})
                                </p>
                                {c.orders?.length ? (
                                  <ul className="space-y-1.5">
                                    {c.orders.map((o) => (
                                      <li
                                        key={o.orderNumber}
                                        className="flex items-center justify-between text-sm text-gray-700"
                                      >
                                        <span className="font-medium">{o.orderNumber}</span>
                                        <span
                                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            STATUS_STYLES[o.status] || "bg-gray-100 text-gray-600"
                                          }`}
                                        >
                                          {o.status}
                                        </span>
                                        <span className="text-gray-500">{formatPrice(o.total)}</span>
                                        <span className="text-xs text-gray-400">
                                          {fmtDate(o.createdAt)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-400">No orders yet.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "categories" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
            <LayoutGrid size={16} className="text-[#2874f0]" /> Categories ({categoryTotal})
          </h2>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div key={c.id} className="border border-gray-100 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.slug}</p>
                  {(c.subcategories || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.subcategories.map((s) => (
                        <span
                          key={s.id}
                          className="text-[11px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "products" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Package size={16} className="text-[#2874f0]" /> Products ({products.total})
            </h2>
            <button
              onClick={() => {
                setCreateForm(EMPTY_PRODUCT_FORM);
                setCreatedProduct(null);
                setCreateError("");
                setShowCreate(true);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#2874f0] hover:bg-blue-700 px-3 py-1.5 rounded-md"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>
          {products.items.length === 0 ? (
            <p className="text-sm text-gray-400">No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Brand</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2">Stock / Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.items.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-md bg-gray-100 overflow-hidden">
                            <img
                              src={Array.isArray(p.images) ? p.images[0] : p.image}
                              alt={p.name}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://placehold.co/80x80/EEE/999?text=Image";
                              }}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <span className="font-medium text-gray-900 max-w-55 truncate">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{p.brand || "—"}</td>
                      <td className="py-2 pr-4 text-gray-500">
                        {p.Category?.name || "—"}
                      </td>
                      <td className="py-2 pr-4 font-semibold text-gray-900">
                        {formatPrice(p.price)}
                      </td>
                      <td className="py-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            PRODUCT_STATUS_STYLES[p.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {p.status || (p.stockQuantity > 0 ? "Active" : "Out of Stock")}
                        </span>
                        <span className="block text-xs text-gray-400 mt-1">
                          {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "0 in stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "status" && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Package size={16} className="text-[#2874f0]" /> Product status checker
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Scans every product and auto-advances its persistent status
                  (Active / Out of Stock / Inactive / Missing Images). A background
                  job does this every 15 minutes automatically.
                </p>
              </div>
              <button
                onClick={runStatusCheck}
                disabled={statusLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#2874f0] text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw size={15} className={statusLoading ? "animate-spin" : ""} />
                {statusLoading ? "Checking..." : "Run check now"}
              </button>
            </div>

            {statusError && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {statusError}
              </p>
            )}

            {statusLoading && !statusReport ? (
              <p className="text-sm text-gray-400 py-6 text-center">Scanning products…</p>
            ) : statusReport ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  {Object.entries(statusReport.counts || {}).map(([status, count]) => (
                    <div key={status} className="border border-gray-100 rounded-lg p-4 text-center">
                      <p
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${
                          PRODUCT_STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {status}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 mb-4">
                  <span>
                    Checked at:{" "}
                    <span className="font-medium text-gray-700">
                      {fmtDate(statusReport.checkedAt)}
                    </span>
                  </span>
                  <span>Total: <span className="font-medium text-gray-700">{statusReport.total}</span></span>
                  <span>
                    Status advanced:{" "}
                    <span className="font-medium text-gray-700">{statusReport.statusUpdated}</span>
                  </span>
                  <span>
                    Auto-fixed:{" "}
                    <span className="font-medium text-gray-700">{statusReport.autoFixed}</span>
                  </span>
                </div>
              </>
            ) : null}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
              <AlertTriangle size={16} className="text-amber-500" /> Products needing attention
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Products whose status is not "Active", with the reason computed by the checker.
            </p>
            {statusReport ? (
              statusReport.problems.length === 0 ? (
                <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                  All products are Active — no problems found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                        <th className="py-2 pr-4">Product</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Stock</th>
                        <th className="py-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statusReport.problems.map((p) => (
                        <tr key={p.id} className="border-b border-gray-50">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-md bg-gray-100 overflow-hidden">
                                <img
                                  src={Array.isArray(p.images) ? p.images[0] : p.image}
                                  alt={p.name}
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://placehold.co/80x80/EEE/999?text=Image";
                                  }}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <span className="font-medium text-gray-900 max-w-55 truncate">
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                PRODUCT_STATUS_STYLES[p.status] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-gray-600">{p.stockQuantity}</td>
                          <td className="py-2 text-gray-500">
                            {p.reason || PRODUCT_STATUS_REASONS[p.status] || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <p className="text-sm text-gray-400">Run a check to see the report.</p>
            )}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
            <Truck size={16} className="text-[#2874f0]" /> Order & shipping status
          </h2>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-4">Order #</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Items</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Placed</th>
                    <th className="py-2">Shipped</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const itemCount = (o.OrderItems || []).reduce((n, i) => n + i.quantity, 0);
                    return (
                      <tr key={o.id} className="border-b border-gray-50">
                        <td className="py-2 pr-4 font-medium text-gray-900">{o.orderNumber}</td>
                        <td className="py-2 pr-4 text-gray-600">{o.User?.name || "—"}</td>
                        <td className="py-2 pr-4 text-gray-500">{itemCount}</td>
                        <td className="py-2 pr-4 font-semibold text-gray-900">
                          {formatPrice(o.total)}
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              STATUS_STYLES[o.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-gray-500">{fmtDate(o.createdAt)}</td>
                        <td className="py-2 text-gray-500">
                          {o.shippedAt ? (
                            <span className="flex items-center gap-1 text-blue-600">
                              <TrendingUp size={12} /> {fmtDate(o.shippedAt)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Add Product dialog ───────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={(o) => !o && closeCreate()}>
        <DialogContent className="sm:max-w-lg">
          {createdProduct ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600" />
                  Product created — image generated
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-start gap-4">
                <div className="grid grid-cols-3 gap-2 w-40 shrink-0">
                  {(Array.isArray(createdProduct.images) ? createdProduct.images : [])
                    .slice(0, 3)
                    .map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${createdProduct.name} ${i + 1}`}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/120x120/EEE/999?text=Image";
                        }}
                        className="w-full aspect-square rounded-md object-cover"
                      />
                    ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{createdProduct.name}</p>
                  <p className="text-gray-500 mt-0.5">
                    {createdProduct.brand || "—"} · {formatPrice(createdProduct.price)}
                  </p>
                  <p className="text-emerald-600 text-xs mt-2 flex items-center gap-1">
                    <Sparkles size={12} /> Auto-generated {createdProduct.images?.length || 3} category images
                  </p>
                </div>
              </div>
              <DialogFooter>
                <button
                  onClick={closeCreate}
                  className="text-sm font-medium text-white bg-[#2874f0] hover:bg-blue-700 px-4 py-2 rounded-md"
                >
                  Done
                </button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={handleCreateProduct}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#2874f0]" />
                  Add Product
                </DialogTitle>
                <p className="text-xs text-gray-400">
                  Images are generated automatically from the selected category.
                </p>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-gray-600">Product name</span>
                  <input
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="mt-1 w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="e.g. Samsung Galaxy S25 256GB"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Brand</span>
                  <input
                    required
                    value={createForm.brand}
                    onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })}
                    className="mt-1 w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="e.g. Samsung"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Category</span>
                  <select
                    required
                    value={createForm.categoryId}
                    onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })}
                    className="mt-1 w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="">Select category</option>
                    {leafCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Price (₹)</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                    className="mt-1 w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="e.g. 79999"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Original price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={createForm.originalPrice}
                    onChange={(e) => setCreateForm({ ...createForm, originalPrice: e.target.value })}
                    className="mt-1 w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="e.g. 99999"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Stock</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={createForm.stockQuantity}
                    onChange={(e) => setCreateForm({ ...createForm, stockQuantity: e.target.value })}
                    className="mt-1 w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-gray-600">
                    Variants <span className="text-gray-400">(comma separated, optional)</span>
                  </span>
                  <input
                    value={createForm.variants}
                    onChange={(e) => setCreateForm({ ...createForm, variants: e.target.value })}
                    className="mt-1 w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="e.g. Midnight Black, Ocean Blue"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-gray-600">Description</span>
                  <textarea
                    rows={2}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="mt-1 w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Short product description"
                  />
                </label>
              </div>

              {createError && (
                <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {createError}
                </p>
              )}

              <DialogFooter className="mt-4">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="text-sm font-medium text-white bg-[#2874f0] hover:bg-blue-700 disabled:opacity-60 px-4 py-2 rounded-md flex items-center gap-1.5"
                >
                  {createLoading ? "Creating…" : (
                    <>
                      <Sparkles size={14} /> Create with auto image
                    </>
                  )}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

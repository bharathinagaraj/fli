import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import CustomerLayout from "../layouts/CustomerLayout";
import useAuth from "../hooks/useAuth";

// Pages
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Profile from "../pages/Profile";
import Orders from "../pages/Orders";
import OrderDetails from "../pages/OrderDetails";
import Wishlist from "../pages/Wishlist";
import AccountBenefits from "../pages/AccountBenefits";
import AdminDashboard from "../pages/AdminDashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from;
    const to = typeof from === "string" ? from : from?.pathname || "/";
    return <Navigate to={to} replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/benefits"
          element={
            <ProtectedRoute>
              <AccountBenefits />
            </ProtectedRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
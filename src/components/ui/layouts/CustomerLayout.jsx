import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../head/Header";
import Footer from "../head/Footer";
import useCart from "../hooks/useCart";

export default function CustomerLayout() {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const handleSearch = (term) => {
    if (!term?.trim()) return;
    navigate(`/products?search=${encodeURIComponent(term.trim())}`);
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        cartCount={itemCount}
        onSearch={handleSearch}
        onCartClick={handleCartClick}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

import React from "react";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./components/ui/context/AuthContext";
import { CartProvider } from "./components/ui/context/CartContext";
import { WishlistProvider } from "./components/ui/context/WishlistContext";

import AppRoutes from "./components/ui/routes/AppRoutes";
import GuestTracker from "./components/ui/routes/GuestTracker";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GuestTracker />
        <CartProvider>
          <WishlistProvider>
            <AppRoutes />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

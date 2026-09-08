import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const stored = readStoredUser();
      if (stored && localStorage.getItem(TOKEN_KEY)) {
        setUser(stored);
      }
      setLoading(false);

      if (!localStorage.getItem(TOKEN_KEY)) return;

      try {
        const fresh = await authService.getCurrentUser();
        if (!cancelled && fresh) {
          setUser(fresh);
          localStorage.setItem(USER_KEY, JSON.stringify(fresh));
        }
      } catch {
        if (!cancelled) handleLogout();
      }
    };

    restore();
    window.addEventListener("auth:logout", handleLogout);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [handleLogout]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (form) => {
    const data = await authService.register(form);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      handleLogout();
    }
  };

  const updateProfile = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;

import { useState, useCallback } from "react";
import { useAuth as useAuthContext } from "../context/AuthContext";
import authService from "../services/authService";

/**
 * Extends the AuthContext with loading/error state and service-backed actions.
 * Use this in components instead of calling authService directly.
 */
export default function useAuth() {
  const { user, isAuthenticated, updateProfile: updateContextProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Login failed.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (form) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(form);
      return { success: true, data };
    } catch (err) {
      setError(err.message || "Registration failed.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await authService.updateProfile(updates);
        updateContextProfile(updated);
        return { success: true, data: updated };
      } catch (err) {
        setError(err.message || "Update failed.");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [updateContextProfile]
  );

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };
}
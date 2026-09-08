import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

const SESSION_KEY = "guest_session_id";

function getOrCreateSessionId() {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `gs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

// Fires a lightweight request to the backend on every page view so the
// analytics tables know "how many guests visited the website". Logged-in
// customers are skipped on the server, so only real guests are counted.
export default function GuestTracker() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const lastFired = useRef("");

  useEffect(() => {
    if (isAuthenticated) return;

    const path = location.pathname;
    if (lastFired.current === path) return;
    lastFired.current = path;

    const id = setTimeout(() => {
      api
        .post("/track/visit", {
          page: path,
          sessionId: getOrCreateSessionId(),
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(id);
  }, [location.pathname, isAuthenticated]);

  return null;
}

// Central API client — wraps fetch with base URL, auth headers, and error handling.

const PROXY_BASE = import.meta.env.VITE_API_URL || "/api";
// Absolute backend URL used as an automatic fallback when the page is served
// without the Vite dev-server proxy (e.g. vite preview / static hosting).
const DIRECT_BASE =
  import.meta.env.VITE_API_URL_DIRECT || "http://127.0.0.1:5000/api";

function getToken() {
  return localStorage.getItem("auth_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("auth_token", token);
  else localStorage.removeItem("auth_token");
}

function buildUrl(base, endpoint, params) {
  let url = `${base}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (query) url += `?${query}`;
  }
  return url;
}

async function request(endpoint, options = {}) {
  const { method = "GET", body, headers = {}, params } = options;

  const token = getToken();
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const origins = [PROXY_BASE];
  // If we're on the relative proxy and the dev server isn't proxying, also try
  // the backend directly so the app still works without restarting anything.
  if (PROXY_BASE === "/api") origins.push(DIRECT_BASE);

  // Retry the whole request a couple of times so a momentarily restarting
  // backend (or a dropped connection) doesn't surface as a hard failure.
  let response = null;
  for (let attempt = 0; attempt < 3 && !response; attempt++) {
    for (const base of origins) {
      const url = buildUrl(base, endpoint, params);
      try {
        response = await fetch(url, config);
        break; // fetch itself succeeded (any HTTP status is fine) — stop here
      } catch {
        response = null; // network error on this origin — try the next one
      }
    }
    if (!response && attempt < 2) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }

  if (!response) {
    throw new ApiError("Network error. Is the backend running?", 0, null);
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    if (response.status === 401 && getToken()) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.dispatchEvent(new Event("auth:logout"));
    }
    const message = data?.message || response.statusText || "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const api = {
  get: (endpoint, params) => request(endpoint, { method: "GET", params }),
  post: (endpoint, body) => request(endpoint, { method: "POST", body }),
  put: (endpoint, body) => request(endpoint, { method: "PUT", body }),
  patch: (endpoint, body) => request(endpoint, { method: "PATCH", body }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export default api;

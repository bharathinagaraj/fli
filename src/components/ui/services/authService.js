import api from "./api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const authService = {
  // POST /auth/login
  async login(email, password) {
    email = (email || "").trim().toLowerCase();
    password = (password || "").trim();
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const data = await api.post("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  // POST /auth/register
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new Error("All fields are required.");
    }
    const data = await api.post("/auth/register", { name, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  // POST /auth/logout
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // fail silently — clear local state regardless
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // GET /auth/me
  async getCurrentUser() {
    if (!localStorage.getItem(TOKEN_KEY)) return null;
    const user = await api.get("/auth/me");
    return user;
  },

  // PATCH /auth/me
  async updateProfile(updates) {
    const user = await api.patch("/auth/me", updates);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  // PATCH /auth/password
  async changePassword(currentPassword, newPassword) {
    return api.patch("/auth/password", { currentPassword, newPassword });
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;

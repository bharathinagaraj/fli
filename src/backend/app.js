const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ─── Security & parsing middleware ─────────────────────
app.use(helmet());
// In development allow any origin (localhost ports, LAN IPs, vite preview)
// so the fallback DIRECT_BASE requests are never CORS-blocked. In production
// restrict to the configured client URL(s).
app.use(cors({
  origin: (origin, cb) => {
    if (process.env.NODE_ENV !== "production") return cb(null, true);
    const allowed = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Rate limiting (protects auth & general API abuse) ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts, please try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ─── Static files (uploaded images) ─────────────────────
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ─── Health check ────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API routes ──────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── Serve the frontend (single page app) ───────────────
// API routes above always win. For browser requests that are not API calls,
// serve the built app if available; otherwise redirect to the active Vite
// dev server so / and SPA routes like /admin do not trigger a 404.
const distPath = path.join(__dirname, "..", "..", "dist");
const frontendOrigin = process.env.FRONTEND_URL || "http://127.0.0.1:5173";

if (fs.existsSync(path.join(distPath, "index.html"))) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) return next();
    if (req.path === "/health" || req.path === "/api/health") return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) return next();
    if (req.path === "/health" || req.path === "/api/health") return next();
    return res.redirect(`${frontendOrigin}${req.originalUrl}`);
  });
}

// ─── 404 + centralized error handling (must be last) ────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
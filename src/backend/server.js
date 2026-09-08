require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const app = require("./app");
const { sequelize, connectDB } = require("./config/database");
const { startProductStatusJob } = require("./jobs/productStatusJob");
const { startOrderStatusJob } = require("./jobs/orderStatusJob");
require("./models"); // registers all model associations

const PORT = process.env.PORT || 5000;

let server;
let stopStatusJob;
let stopOrderJob;

async function startServer() {
  try {
    await connectDB();

    // Auto-create tables if missing; do NOT use `alter` — it has proven able
    // to crash startup on the self-referencing Category FK and to accumulate
    // duplicate unique indexes over repeated runs. Use migrations in production.
    await sequelize.sync();
    console.log("✅ Models synced with database.");

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
      stopStatusJob = startProductStatusJob();
      console.log("🔄 Product status checker started.");
      stopOrderJob = startOrderStatusJob();
      console.log("🔄 Order status checker started.");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

// ─── Graceful shutdown ────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (stopStatusJob) {
    stopStatusJob();
    console.log("Product status checker stopped.");
  }
  if (stopOrderJob) {
    stopOrderJob();
    console.log("Order status checker stopped.");
  }
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await sequelize.close();
      console.log("Database connection closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Catch unhandled errors so the process doesn't die silently ──
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
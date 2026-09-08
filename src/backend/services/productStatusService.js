const { Product } = require("../models");

const STATUS = {
  ACTIVE: "Active",
  OUT_OF_STOCK: "Out of Stock",
  INACTIVE: "Inactive",
  MISSING_IMAGES: "Missing Images",
};

const REASONS = {
  [STATUS.OUT_OF_STOCK]: "Stock quantity is zero or negative.",
  [STATUS.INACTIVE]: "Marked inactive in the catalog.",
  [STATUS.MISSING_IMAGES]: "No valid product images.",
};

const isRealUrl = (u) =>
  typeof u === "string" && u.startsWith("http") && !u.includes("undefined");

const state = {
  status: "idle",
  lastCheckedAt: null,
  lastReport: null,
};

function computeStatus(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  if (product.isActive === false) return STATUS.INACTIVE;
  if (Number(product.stockQuantity) <= 0) return STATUS.OUT_OF_STOCK;
  if (images.length === 0 || !images.some(isRealUrl)) return STATUS.MISSING_IMAGES;
  return STATUS.ACTIVE;
}

// Data-integrity fixes the job applies automatically:
//   * negative stock -> clamp to 0
//   * non-boolean isActive -> coerce to a real boolean
//   * invalid image entries (non-http / "undefined") -> dropped
function buildFixes(product) {
  const changes = {};

  if (typeof product.isActive !== "boolean") {
    changes.isActive = product.isActive !== false;
  }

  const stock = Number(product.stockQuantity);
  if (!Number.isFinite(stock) || stock < 0) {
    changes.stockQuantity = 0;
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const clean = images.filter(isRealUrl);
  if (images.length !== clean.length) {
    changes.images = clean;
  }

  return changes;
}

let runningPromise = null;

async function scan({ persistFixes }) {
  const startedAt = new Date();
  const products = await Product.findAll();
  const counts = {
    [STATUS.ACTIVE]: 0,
    [STATUS.OUT_OF_STOCK]: 0,
    [STATUS.INACTIVE]: 0,
    [STATUS.MISSING_IMAGES]: 0,
  };
  const problems = [];
  const fixes = [];
  let statusUpdated = 0;

  for (const product of products) {
    const status = computeStatus(product);
    counts[status] += 1;

    const changes = buildFixes(product);
    // Auto-advance the persistent status column whenever it is out of date.
    if (product.status !== status) {
      changes.status = status;
      statusUpdated += 1;
    }

    if (Object.keys(changes).length > 0) {
      fixes.push({
        id: product.id,
        name: product.name,
        changes,
      });
      if (persistFixes) {
        await product.update(changes, { silent: true, hooks: false });
      }
    }

    if (status !== STATUS.ACTIVE) {
      problems.push({
        id: product.id,
        name: product.name,
        status,
        reason: REASONS[status] || "Unknown issue.",
        stockQuantity: Number(product.stockQuantity),
        isActive: product.isActive,
        images: Array.isArray(product.images) ? product.images : [],
      });
    }
  }

  const report = {
    checkedAt: startedAt.toISOString(),
    total: products.length,
    autoFixed: fixes.length,
    statusUpdated,
    counts,
    problems,
    fixes,
  };

  state.lastCheckedAt = report.checkedAt;
  state.lastReport = report;
  return report;
}

async function runProductStatusCheck(options = {}) {
  const { persistFixes = true } = options;
  if (runningPromise) return runningPromise;
  runningPromise = scan({ persistFixes }).finally(() => {
    runningPromise = null;
  });
  return runningPromise;
}

module.exports = {
  STATUS,
  computeStatus,
  runProductStatusCheck,
  getLastStatusReport: () => state.lastReport,
};

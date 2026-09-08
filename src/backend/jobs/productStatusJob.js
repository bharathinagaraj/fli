const { runProductStatusCheck } = require("../services/productStatusService");

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

let timer = null;
let running = false;

async function checkNow(why = "manual") {
  if (running) return null;
  running = true;
  try {
    const report = await runProductStatusCheck({ persistFixes: true });
    const { counts, autoFixed, statusUpdated, total, checkedAt } = report;
    console.log(
      `[product-status] ${why} @ ${checkedAt}: ${total} products → ` +
        `${counts.Active} active, ${counts["Out of Stock"]} out of stock, ` +
        `${counts.Inactive} inactive, ${counts["Missing Images"]} missing images, ` +
        `${statusUpdated} advanced, ${autoFixed} auto-fixed`
    );
    return report;
  } catch (err) {
    console.error("[product-status] check failed:", err.message);
    return null;
  } finally {
    running = false;
  }
}

function startProductStatusJob() {
  const intervalMs =
    Number(process.env.PRODUCT_STATUS_CHECK_INTERVAL_MS) || DEFAULT_INTERVAL_MS;
  if (timer) clearInterval(timer);

  // Correct old data immediately on boot, then keep advancing on the interval.
  checkNow("initial check");
  timer = setInterval(() => checkNow("scheduled check"), intervalMs);
  if (timer.unref) timer.unref();

  return () => {
    clearInterval(timer);
    timer = null;
  };
}

module.exports = { startProductStatusJob, checkNow };

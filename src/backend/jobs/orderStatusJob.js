const { Op } = require("sequelize");
const { Order } = require("../models");

const DEFAULTS = {
  INTERVAL_MS: 60 * 1000, // scan every minute
  PROCESSING_TO_SHIPPED_MS: 60 * 1000, // 1 minute in "Processing"
  SHIPPED_TO_DELIVERED_MS: 2 * 60 * 1000, // 2 minutes total to "Delivered"
  AUTO_CANCEL_AFTER_MS: 30 * 60 * 1000, // unpaid (non-COD) orders auto-cancel after 30 min
};

function ms(name, fallback) {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const isCod = (order) =>
  String(order.paymentMethod || "").toLowerCase().includes("cash");

// Automatically advances orders through Processing -> Shipped -> Delivered,
// and cancels unpaid non-COD orders that have been pending too long.
async function runOrderStatusCheck() {
  const now = Date.now();
  const shippedAfter = ms(
    "ORDER_PROCESSING_TO_SHIPPED_MS",
    DEFAULTS.PROCESSING_TO_SHIPPED_MS
  );
  const deliveredAfter = ms(
    "ORDER_SHIPPED_TO_DELIVERED_MS",
    DEFAULTS.SHIPPED_TO_DELIVERED_MS
  );
  const cancelAfter = ms("ORDER_AUTO_CANCEL_AFTER_MS", DEFAULTS.AUTO_CANCEL_AFTER_MS);

  const orders = await Order.findAll({
    where: { status: { [Op.in]: ["Processing", "Shipped"] } },
  });

  let shipped = 0;
  let delivered = 0;
  let cancelled = 0;

  for (const order of orders) {
    const age = now - new Date(order.createdAt).getTime();

    if (order.status === "Processing") {
      if (
        order.paymentStatus === "pending" &&
        !isCod(order) &&
        age >= cancelAfter
      ) {
        await order.update({ status: "Cancelled", cancelledAt: new Date() });
        cancelled += 1;
        continue;
      }
      if (age >= shippedAfter) {
        await order.update({ status: "Shipped", shippedAt: new Date() });
        shipped += 1;
      }
    } else if (order.status === "Shipped" && age >= deliveredAfter) {
      const updates = { status: "Delivered", deliveredAt: new Date() };
      if (isCod(order)) updates.paymentStatus = "paid"; // cash collected at delivery
      await order.update(updates);
      delivered += 1;
    }
  }

  if (shipped || delivered || cancelled) {
    console.log(
      `[order-status] advanced: ${shipped} shipped, ${delivered} delivered, ${cancelled} cancelled`
    );
  }
  return { shipped, delivered, cancelled };
}

let timer = null;
let running = false;

async function checkNow(why = "scheduled check") {
  if (running) return;
  running = true;
  try {
    await runOrderStatusCheck();
  } catch (err) {
    console.error("[order-status] check failed:", err.message);
  } finally {
    running = false;
  }
}

function startOrderStatusJob() {
  const intervalMs = ms("ORDER_STATUS_CHECK_INTERVAL_MS", DEFAULTS.INTERVAL_MS);
  if (timer) clearInterval(timer);

  // Advance any already-eligible orders as soon as the server starts,
  // then keep scanning on the interval.
  checkNow("initial check");
  timer = setInterval(() => checkNow(), intervalMs);
  if (timer.unref) timer.unref();

  return () => {
    clearInterval(timer);
    timer = null;
  };
}

module.exports = { startOrderStatusJob, runOrderStatusCheck };

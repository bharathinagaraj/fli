const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, adminOnly, customerOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", customerOnly, orderController.getOrders);
router.get("/my/summary", customerOnly, orderController.getMySummary);
router.get("/admin/all", adminOnly, orderController.getAdminOrders);
router.get("/:id", customerOnly, orderController.getOrderById);
router.post("/", customerOnly, orderController.placeOrder);
router.post("/:id/cancel", customerOnly, orderController.cancelOrder);
router.post("/:id/return", customerOnly, orderController.requestReturn);

// Admin only
router.patch("/:id/status", adminOnly, orderController.updateOrderStatus);

module.exports = router;
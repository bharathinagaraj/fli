const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect, customerOnly } = require("../middleware/authMiddleware");

// All cart routes require a logged-in customer
router.use(protect, customerOnly);

router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.patch("/items/:id", cartController.updateItemQuantity);
router.delete("/items/:id", cartController.removeItem);
router.delete("/", cartController.clearCart);
router.post("/promo", cartController.applyPromoCode);

module.exports = router;
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const reviewController = require("../controllers/reviewController");
const { protect, adminOnly, customerOnly } = require("../middleware/authMiddleware");

// Public
router.get("/", productController.getProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/status", protect, adminOnly, productController.getProductStatus);
router.get("/:id", productController.getProductById);
router.get("/:productId/reviews", reviewController.getProductReviews);

// Protected (any logged-in customer)
router.post("/:productId/reviews", protect, customerOnly, reviewController.createReview);

// Admin only
router.post("/", protect, adminOnly, productController.createProduct);
router.put("/:id", protect, adminOnly, productController.updateProduct);
router.delete("/:id", protect, adminOnly, productController.deleteProduct);

module.exports = router;
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect, customerOnly } = require("../middleware/authMiddleware");

// Standalone review routes (also exposed under /products/:productId/reviews)
router.get("/", reviewController.getProductReviews);
router.put("/:id", protect, customerOnly, reviewController.updateReview);
router.delete("/:id", protect, customerOnly, reviewController.deleteReview);

module.exports = router;

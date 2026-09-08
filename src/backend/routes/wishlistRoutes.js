const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { protect, customerOnly } = require("../middleware/authMiddleware");

router.use(protect, customerOnly);

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addToWishlist);
router.delete("/:productId", wishlistController.removeFromWishlist);
router.delete("/", wishlistController.clearWishlist);

module.exports = router;
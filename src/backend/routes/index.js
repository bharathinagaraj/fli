const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/cart", require("./cartRoutes"));
router.use("/wishlist", require("./wishlistRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/addresses", require("./addressRoutes"));
router.use("/reviews", require("./reviewRoutes"));
router.use("/analytics", require("./analyticsRoutes"));
router.use("/track", require("./trackRoutes"));

module.exports = router;
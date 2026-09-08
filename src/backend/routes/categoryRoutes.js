const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/:id/products", categoryController.getCategoryProducts);

// Admin only
router.post("/", protect, adminOnly, categoryController.createCategory);
router.put("/:id", protect, adminOnly, categoryController.updateCategory);
router.delete("/:id", protect, adminOnly, categoryController.deleteCategory);

module.exports = router;
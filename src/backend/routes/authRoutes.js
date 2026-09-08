const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getCurrentUser);
router.patch("/me", protect, authController.updateProfile);
router.patch("/password", protect, authController.changePassword);

module.exports = router;
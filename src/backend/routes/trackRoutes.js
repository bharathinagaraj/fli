const express = require("express");
const router = express.Router();
const visitTracker = require("../middleware/visitTracker");
const { optionalAuth } = require("../middleware/authMiddleware");

// Public endpoint the frontend fires on each page view for guests.
// Logged-in customers are skipped so "guest visits" only counts visitors.
router.post("/visit", optionalAuth, visitTracker.trackGuestVisit);

module.exports = router;

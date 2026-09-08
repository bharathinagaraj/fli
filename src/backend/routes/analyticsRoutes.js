const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);

router.get("/overview", analyticsController.getOverview);
router.get("/signups", analyticsController.getSignupLogs);
router.get("/logins", analyticsController.getLoginLogs);
router.get("/logins/count", analyticsController.getLoginCount);
router.get("/guests", analyticsController.getGuestVisits);
router.get("/guests/count", analyticsController.getGuestCount);
router.get("/daily", analyticsController.getDaily);
router.get("/sales", analyticsController.getSales);
router.get("/customers", analyticsController.getCustomers);
router.get("/customers/:id/summary", analyticsController.getCustomerPurchaseSummary);
router.get("/guests/summary", analyticsController.getGuestActivity);
router.get("/catalog/summary", analyticsController.getCatalogSummary);

module.exports = router;

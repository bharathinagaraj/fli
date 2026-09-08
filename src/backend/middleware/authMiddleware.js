const jwt = require("jsonwebtoken");
const { User, Customer } = require("../models");

// Token payload carries `type`: "customer" (Customer table) or "staff" (User
// table for admin/backend login). Resolve the matching model so customer
// routes hit customers and staff routes hit users.
function modelForType(type) {
  return type === "staff" ? User : Customer;
}

// Verifies the JWT and attaches the authenticated principal to req.user.
// Loads fresh from the DB (not just the token payload) so role changes /
// deactivation take effect immediately.
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      }
      return res.status(401).json({ message: "Invalid token." });
    }

    const Model = modelForType(decoded.type);
    const user = await Model.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Account no longer exists." });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    req.user = user; // full model instance, not just token payload
    req.authType = decoded.type === "staff" ? "staff" : "customer";
    next();
  } catch (err) {
    res.status(500).json({ message: "Authentication error.", error: err.message });
  }
};

// Same as protect, but doesn't fail if there's no token —
// useful for routes that behave differently for guests vs logged-in users.
exports.optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = modelForType(decoded.type);
    const user = await Model.findByPk(decoded.id);

    if (user && user.isActive !== false) {
      req.user = user;
      req.authType = decoded.type === "staff" ? "staff" : "customer";
    }
    next();
  } catch {
    next(); // ignore invalid/expired token, just proceed as guest
  }
};

// Restricts access to storefront customer accounts only. Must run after
// `protect`. Prevents staff/admin tokens (whose id lives in the `users` table,
// not `customers`) from being written into customer-owned tables (addresses,
// cart, wishlist, orders, reviews) where `customer_id` is a foreign key to
// `customers.id` — otherwise the insert fails with a raw MySQL FK error.
exports.customerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }
  if (req.authType !== "customer") {
    return res.status(403).json({ message: "A customer account is required." });
  }
  next();
};

// Restricts access to admins only. Must run after `protect`.
// Customers have no `role` field, so a customer token can never pass here.
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};

// Generic role-based guard, e.g. restrictTo("admin", "staff")
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action." });
    }
    next();
  };
};

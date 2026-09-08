const jwt = require("jsonwebtoken");
const { User, Customer, Cart, LoginLog, SignupLog } = require("../models");

function generateToken(principal, type) {
  return jwt.sign(
    { id: principal.id, email: principal.email, role: principal.role, type },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register  (customer signup only — staff are provisioned by admins)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await Customer.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const customer = await Customer.create({ name, email, password });
    await Cart.create({ customerId: customer.id }); // give every new customer an empty cart

    await SignupLog.create({
      customerId: customer.id,
      email: customer.email,
      ip: req.ip || req.headers["x-forwarded-for"] || null,
      userAgent: req.headers["user-agent"] || null,
    });

    const token = generateToken(customer, "customer");
    res.status(201).json({ user: customer, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
// One login endpoint, two tables: customers (storefront) and users (staff/admin).
exports.login = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password.trim() : "";
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Try customer first (storefront logins are the common case).
    const customer = await Customer.scope("withPassword").findOne({ where: { email } });
    if (customer) {
      if (!(await customer.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      if (customer.isActive === false) {
        return res.status(403).json({ message: "This account has been deactivated." });
      }

      const token = generateToken(customer, "customer");
      const { password: _pw, ...safeCustomer } = customer.toJSON();

      // Track the customer login for analytics (how many logins, who, when)
      await LoginLog.create({
        customerId: customer.id,
        email: customer.email,
        ip: req.ip || req.headers["x-forwarded-for"] || null,
        userAgent: req.headers["user-agent"] || null,
      });

      return res.json({ user: safeCustomer, token });
    }

    // Fall through to staff (admin/backend) accounts.
    const staff = await User.scope("withPassword").findOne({ where: { email } });
    if (!staff || !(await staff.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (staff.isActive === false) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    const token = generateToken(staff, "staff");
    const { password: _pw2, ...safeStaff } = staff.toJSON();

    res.json({ user: safeStaff, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/logout
exports.logout = async (_req, res) => {
  // Stateless JWT — client just discards the token.
  // If using refresh tokens/sessions, invalidate them here.
  res.json({ message: "Logged out successfully." });
};

// GET /api/auth/me
exports.getCurrentUser = async (req, res) => {
  res.json(req.user);
};

// PATCH /api/auth/me
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    await req.user.update({ name, phone, avatar });
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const Model = req.authType === "staff" ? User : Customer;
    const user = await Model.scope("withPassword").findByPk(req.user.id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword; // beforeUpdate hook re-hashes it
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

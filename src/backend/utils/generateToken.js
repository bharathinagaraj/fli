const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT for a given principal.
 * `type` distinguishes storefront customers ("customer") from staff/admin
 * users ("staff") so auth middleware can resolve the right table.
 * Keeps the payload minimal — just enough for auth checks,
 * since the full user is re-fetched from the DB in authMiddleware anyway.
 */
function generateToken(user, type = "customer") {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

/**
 * Generates a longer-lived refresh token, for apps that need
 * silent re-authentication instead of forcing re-login on expiry.
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" }
  );
}

/**
 * Verifies a refresh token and returns its decoded payload.
 * Throws if invalid/expired — let the caller handle the error.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
}

module.exports = { generateToken, generateRefreshToken, verifyRefreshToken };
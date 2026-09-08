const crypto = require("crypto");
const { GuestVisit } = require("../models");

const getIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.socket?.remoteAddress ||
  req.ip ||
  null;

const getUserAgent = (req) => req.headers["user-agent"] || null;

// A guest = a visitor who is NOT logged in (no valid JWT).
// Called from the frontend on each page view so we can answer
// "how many guests visited my website".
exports.trackGuestVisit = async (req, res) => {
  try {
    const { page, sessionId } = req.body || {};

    // If the caller already has a valid session, they are a customer, not a guest.
    if (req.user) {
      return res.json({ tracked: false, reason: "logged-in customer" });
    }

    const sid =
      (sessionId && String(sessionId).slice(0, 100)) ||
      crypto.createHash("sha1").update(getIp(req) + getUserAgent(req)).digest("hex");

    await GuestVisit.create({
      sessionId: sid,
      ip: getIp(req),
      userAgent: getUserAgent(req),
      page: (page && String(page).slice(0, 500)) || "/",
    });

    res.status(201).json({ tracked: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

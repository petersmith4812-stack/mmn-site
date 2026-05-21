require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mmn-jwt-secret-please-change";

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token" });
  }
};

const makeTokens = (user) => {
  const payload = { userId: user.id, schoolId: user.schoolId, role: user.role, email: user.email };
  return {
    accessToken:  jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" }),
    refreshToken: jwt.sign({ userId: user.id, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" }),
  };
};

module.exports = { requireAuth, makeTokens, JWT_SECRET };

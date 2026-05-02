import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import SecurityLog from "../models/SecurityLog.js";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fraud@2026";
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const COOKIE_NAME = "admin_token";

const createToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const getClientIp = (req) => req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";

const recordLoginAttempt = async ({ username, success, ipAddress }) => {
  try {
    await SecurityLog.create({ usernameAttempted: username || "unknown", success, ipAddress });
  } catch (error) {
    console.error("Failed to write security log:", error);
  }
};

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body ?? {};
  const ipAddress = getClientIp(req);

  if (!username || !password) {
    await recordLoginAttempt({ username, success: false, ipAddress });
    return res.status(400).json({ message: "Username and password are required." });
  }

  const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  await recordLoginAttempt({ username, success: isValid, ipAddress });

  if (!isValid) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const token = createToken({ username: ADMIN_USERNAME });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ token, user: { username: ADMIN_USERNAME } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none"
  });
  res.json({ message: "Logged out" });
});

export const getSession = asyncHandler(async (req, res) => {
  const token = req.cookies[COOKIE_NAME] || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);

  if (!token) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: { username: decoded.username } });
  } catch (error) {
    return res.status(401).json({ message: "Not authenticated." });
  }
});

export const verifyToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

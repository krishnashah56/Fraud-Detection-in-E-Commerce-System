import { verifyToken } from "../controllers/authController.js";

const COOKIE_NAME = "admin_token";

const verifyAdminAuth = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token = req.cookies[COOKIE_NAME] || (authorization.startsWith("Bearer ") ? authorization.slice(7) : null);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized: admin login required." });
  }

  req.user = decoded;
  next();
};

export default verifyAdminAuth;

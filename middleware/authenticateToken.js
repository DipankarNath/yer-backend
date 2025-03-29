import jwt from "jsonwebtoken";
import { getUserById } from "../database/authSql.js";

// Middleware to authenticate user and validate permissions
const authenticateToken = async (req, res, next) => {
  if (req.path.startsWith("/api/login")) {
    return next(); // Skip authentication for login routes
  }

  const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" }); // Unauthorized
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach token data to request

    // Validate if User Exists and is Active
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User is inactive or does not exist" });
    }

    req.user.permissions = user.role_id; 
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authenticateToken;

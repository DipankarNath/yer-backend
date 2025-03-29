import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// import cookieParser from 'cookie-parser'; 
import { body, validationResult } from "express-validator";
import {
  getUserByEmail,
  verifyPassword,
  getUserById
} from "../database/authSql.js";

dotenv.config();
const router = express.Router();
// router.use(cookieParser());

router.get('/test', async (req, res) => {
  try {
    const password = "Test@123"; // Default password
    const hashedPassword = await bcrypt.hash(password, 10);
    res.json({ message: 'Test route is working!', hashedPassword });
  } catch (error) {
    res.status(500).json({ error: "Error hashing password" });
  }
});

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role_id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role_id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};

// Login Route with Validation
router.post(
  "/login",
  [
    // Validate email
    body("userName")
      .isEmail().withMessage("Enter a valid email address")
      .notEmpty().withMessage("Email should not be empty")
      .normalizeEmail(),

    // Validate password
    body("password")
      .notEmpty().withMessage("Password should not be empty")
  ],
  async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { userName, password } = req.body;

    try {
      const user = await getUserByEmail(userName);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const userDetails = {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.roleId,
      };
console.log(userDetails)
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 hour
        // maxAge: 30 * 1000, // 30 seconds (30,000 milliseconds)
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 604800000, // 7 days
        // maxAge: 60 * 1000
      });

      res.status(200).json({
        message: "Login successful",
        user: userDetails,
        token,
        refreshToken
        // token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Logout Route
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("access_token", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.clearCookie("refresh_token", { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
});

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refresh_token; // Get refresh token from cookies

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const newAccessToken = generateToken(user); // Generate a new access token

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
      // maxAge: 30 * 1000
    });

    const userDetails = {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.roleId,
    };

    res.status(200).json({
      message: "Access token refreshed",
      user: userDetails,
    });

  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});


export default router;

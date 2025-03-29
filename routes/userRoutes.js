import express from "express";
import pool from "../config/db.js";
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    // Destructure the required fields from the request body
    const { name, email, phone, password, gender, dob } = req.body;

    // Basic check – you may also use a validation library
    if (!name || !email || !phone || !password || !gender || !dob) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Map gender string to an integer
    let genderValue;
    switch (gender.toUpperCase()) {
      case "MALE":
        genderValue = 1;
        break;
      case "FEMALE":
        genderValue = 2;
        break;
      case "OTHER":
        genderValue = 3;
        break;
      default:
        return res.status(400).json({ error: "Invalid gender value" });
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Set default values for roleId and activeStatus
    const roleId = 3; // For example, 3 represents a patient
    const activeStatus = 1;

    // SQL query to insert a new user (patient)
    const query = `
      INSERT INTO users (
        name,
        phone,
        email,
        password_hash,
        gender,
        dob,
        activeStatus,
        roleId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [roleId, name, phone, email, password_hash, genderValue, dob, activeStatus, 3];

    // Execute the query
    const [result] = await pool.query(query, values);

    // Return success response with the inserted user id
    return res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Database error: " + error.message });
  }
});

export default router;

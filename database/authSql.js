import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// Get user by email, ensuring the user is active
export const getUserByEmail = async (email) => {
    try {
        const query = `SELECT * FROM users WHERE email = '${email}' AND activeStatus = 1;`;
        const [rows] = await pool.query(query, [email]);
        return rows.length ? rows[0] : null;
    } catch (error) {
        throw new Error("Database error: " + error.message);
    }
};

export const verifyPassword = async (password, userpassword) => {
    try {
        const query = `SELECT * FROM users WHERE password = '${password}' AND activeStatus = 1;`;
        const [rows] = await pool.query(query, [password]);
        return rows.length ? rows[0] : null;
    } catch (error) {
        throw new Error("Database error: " + error.message);
    }
};

// Verify password
// export const verifyPassword = async (inputPassword, storedHash) => {
//     return await bcrypt.compare(inputPassword, storedHash);
// };

// Check if User Exists and is Active
export const getUserById = async (userId) => {
    try {
        const query = `SELECT * FROM users WHERE id = ? AND activeStatus = 1;`;
        const [rows] = await pool.query(query, [userId]);
        return rows.length ? rows[0] : null;
    } catch (error) {
        throw new Error("Database error while fetching user: " + error.message);
    }
};

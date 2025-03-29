import pool from "../config/db.js";

// Fetch all Users
export const getAllUsers = async () => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.salutation, u.first_name, u.middle_name, u.last_name, 
        TRIM(CONCAT_WS(' ', u.salutation, u.first_name, u.middle_name, u.last_name)) AS full_name, 
        u.email, 
        u.phone_no, 
        u.role_id, 
        r.role_name, 
        u.user_status,
        u.is_deleted,
        u.department_id,
        d.department_name,
        u.branch_id,
        b.branch_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN branches b ON u.branch_id = b.branch_id
      WHERE u.is_deleted = 0  
      ORDER BY u.id ASC;
    `;
    
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw new Error("Database error while fetching Users: " + error.message);
  }
};

// New function to fetch departments lookup data
export const getDepartments = async () => {
  try {
    const query = `
      SELECT department_id AS value, department_name AS label
      FROM departments where department_status = 1
    `;
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw new Error("Database error while fetching departments: " + error.message);
  }
};

// New function to fetch branches lookup data
export const getBranches = async () => {
  try {
    const query = `
      SELECT branch_id AS value, branch_name AS label
      FROM branches where branch_status = 1 
    `;
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw new Error("Database error while fetching branches: " + error.message);
  }
};

// New function to fetch roles lookup data
export const getRoles = async () => {
  try {
    const query = `
      SELECT id AS value, role_name AS label
      FROM roles where role_status = 1 
    `;
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw new Error("Database error while fetching roles: " + error.message);
  }
};

// Insert a new user into the database
export const addUser = async (userData) => {
  const { salutation, first_name, middle_name, last_name, email, password, phone_no, department_id, branch_id, role, created_by, updated_by } = userData;
  try {
    const query = `
      INSERT INTO users (salutation, first_name, middle_name, last_name, email, password_hash, phone_no, department_id, branch_id, role_id, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      salutation,
      first_name,
      middle_name,
      last_name,
      email,
      password,      // Hashed password
      phone_no,
      department_id,
      branch_id,
      role,
      created_by,
      updated_by,
    ]);
    return { id: result.insertId, ...userData };
  } catch (error) {
    throw new Error("Database error while adding user: " + error.message);
  }
};

export const updateUserById = async (id, userData) => {
  const { salutation, first_name, middle_name, last_name, email, phone_no, department_id, branch_id, role, user_status, updated_by, password } = userData;
  try {
    let query;
    let params;
    if (password && password.trim() !== "") {
      // If a new password is provided, update password_hash as well.
      query = `
        UPDATE users 
        SET salutation = ?, first_name = ?, middle_name = ?, last_name = ?, email = ?, phone_no = ?, department_id = ?, branch_id = ?, role_id = ?, user_status = ?, updated_by = ?, password_hash = ?
        WHERE id = ?
      `;
      params = [
        salutation,
        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        department_id,
        branch_id,
        role,
        user_status,
        updated_by,
        password, // hashed password
        id,
      ];
    } else {
      // Update without modifying the password_hash column.
      query = `
        UPDATE users 
        SET salutation = ?, first_name = ?, middle_name = ?, last_name = ?, email = ?, phone_no = ?, department_id = ?, branch_id = ?, role_id = ?, user_status = ?, updated_by = ?
        WHERE id = ?
      `;
      params = [
        salutation,
        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        department_id,
        branch_id,
        role,
        user_status,
        updated_by,
        id,
      ];
    }
    const [result] = await pool.query(query, params);
    return { id, ...userData };
  } catch (error) {
    throw new Error("Database error while updating user: " + error.message);
  }
};

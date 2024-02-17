const express = require("express");
const jwt = require('jsonwebtoken');
const pool = require('../db');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

// Function to get user by email
async function getUserByEmail(email) {
  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const { rows } = await pool.query(query, [email]);
    return rows[0]; // Assuming email is unique, so returning the first row
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

// Function to create a new user
async function createUser(user) {
    const { email, profileURL, fullName, phoneNumber, pincode, flat, area, landmark, city, state } =
      user;
    try {
      const query =
        "INSERT INTO users (email, profile_url, full_name, phone_number, pincode, flat, area, landmark, city, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
      await pool.query(query, [
        email,
        profileURL,
        fullName,
        phoneNumber,
        pincode,
        flat,
        area,
        landmark,
        city,
        state,
      ]);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

// Endpoint to handle user authentication
router.post('/auth', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Check if the user exists in the database
      const user = await getUserByEmail(email);
  
      if (user) {
        // User exists, generate JWT token and send user details
        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY,{expiresIn: "14h"});
        res.status(200).json({ user, access_token:  token, });
      } else {
        // User does not exist, send status code 404
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      // Handle server errors
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// Endpoint to handle user registration
router.post('/register', async (req, res) => {
    const { email, fullName, profileURL, phoneNumber, pincode, flat, area, landmark, city, state } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await getUserByEmail(email);
  
      if (existingUser) {
        // User already exists, send status code 409 (conflict)
        res.status(409).json({ error: 'User already exists' });
      } else {
        // Create a new user
        await createUser({ email, fullName, profileURL, phoneNumber, pincode, flat, area, landmark, city, state });
  
        // Generate JWT token
        const token = jwt.sign({ email, fullName }, process.env.SECRET_KEY);
  
        // Send response with token and success message
        res.status(201).json({access_token:  token, message: 'User created successfully' });
      }
    } catch (error) {
      // Handle server errors
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;

const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const dotenv = require("dotenv");
const verifyToken = require("../Services/jwtverfication");
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
  const { email, profileURL, fullName, phoneNumber } = user;
  try {
    const query =
      "INSERT INTO users (email, profile_url, full_name, phone_number) VALUES ($1, $2, $3, $4 ) RETURNING *";
    const { rows } = await pool.query(query, [
      email,
      profileURL,
      fullName,
      phoneNumber,
    ]);
    return rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Endpoint to handle user authentication
router.post("/auth", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists in the database
    const user = await getUserByEmail(email);

    if (user) {
      // User exists, generate JWT token and send user details
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: "14h",
      });
      const { rows } = await pool.query(
        "SELECT unique_id FROM shop WHERE owner_id = $1",
        [user.id]
      );

      let unique_id = null;
      if (rows[0]) {
        unique_id = rows[0].unique_id;
      }

      res
        .status(200)
        .json({ user, shop: { shopId: unique_id }, access_token: token });
    } else {
      // User does not exist, send status code 404
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    // Handle server errors
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to handle user registration
router.post("/register", async (req, res) => {
  const { email, fullName, profileURL, phoneNumber } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      // User already exists, send status code 409 (conflict)
      res.status(409).json({ error: "User already exists" });
    } else {
      // Create a new user
      const user = await createUser({
        email,
        fullName,
        profileURL,
        phoneNumber,
      });

      // Generate JWT token
      const token = jwt.sign({ email, fullName }, process.env.SECRET_KEY);

      // Send response with token and success message
      res
        .status(201)
        .json({
          user,
          shop: { shopId: null },
          access_token: token,
          message: "User created successfully",
        });
    }
  } catch (error) {
    // Handle server errors
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to add an address
router.post("/addresses", verifyToken, async (req, res) => {
  try {
    const { user_id, flat, area, city, state, pincode, landmark } = req.body;

    // Insert the address into the database
    const query =
      "INSERT INTO addresses (user_id, flat, area, city, state, pincode, landmark) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
    const values = [user_id, flat, area, city, state, pincode, landmark];
    const result = await pool.query(query, values);

    res
      .status(201)
      .json({ message: "Address added successfully", address: result.rows[0] });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Endpoint for test username and password
router.post("/test", async (req, res) => {
  const { username, password } = req.body;
  if ( (username == "testusername" || username == "testadmin") && (password == "testpassword") ) {
    try {
      // Check if the user exists in the database
      const user = await getUserByEmail("testme2405@gmail.com");

      if (user) {
        // User exists, generate JWT token and send user details
        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
          expiresIn: "14h",
        });
        const { rows } = await pool.query(
          "SELECT unique_id FROM shop WHERE owner_id = $1",
          [user.id]
        );

        let unique_id = null;
        if (rows[0]) {
          unique_id = rows[0].unique_id;
        }

        res
          .status(200)
          .json({ user, shop: { shopId: unique_id }, access_token: token });
      } else {
        // User does not exist, send status code 404
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      // Handle server errors
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(401).json({
      message : "Incorrect username and password"
    })
  }
});

// Endpoint to retrieve all addresses of a user
router.get("/:user_id/addresses", verifyToken, async (req, res) => {
  try {
    const { user_id } = req.params;

    // Retrieve addresses of the user from the database
    const query =
      "SELECT id, flat, area, city, state, pincode, landmark FROM addresses WHERE user_id = $1";
    const result = await pool.query(query, [user_id]);

    res.status(200).json({ addresses: result.rows });
  } catch (error) {
    console.error("Error retrieving addresses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const pool = require("../db");
const dotenv = require("dotenv");
const verifyToken = require("../Services/jwtverfication");

const router = express.Router();

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { description, date, rating, user_id, product_id } = req.body;

    // Check if required fields are provided
    if (!description || !date || !rating || !user_id || !product_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert the new review into the database
    const query = `
        INSERT INTO product_review (description, date, rating, user_id, product_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING review_id
      `;
    const values = [description, date, rating, user_id, product_id];
    const result = await pool.query(query, values);

    // Return the newly created review
    res.status(201).json({ msg: "Review added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

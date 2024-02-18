const express = require("express");
const pool = require("../db");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

// Endpoint to store product details
router.post("/create", async (req, res) => {
    const {
      product_name,
      product_description,
      product_tags,
      product_image_urls,
      variants,
      shop_id,
    } = req.body;
  
    try {
      // Insert product details into the database
      const query = `
          INSERT INTO product (
            product_name,
            product_description,
            product_tags,
            product_image_urls,
            variants,
            shop_id
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;
  
      const values = [
        product_name,
        product_description,
        product_tags,
        product_image_urls,
        variants,
        shop_id,
      ];
  
      await pool.query(query, values);
  
      res.status(201).json({ message: "Product created successfully" });
    } catch (error) {
      console.error("Error inserting product:", error);
  
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

module.exports = router;

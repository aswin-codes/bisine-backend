const express = require("express");
const pool = require("../db");
const dotenv = require("dotenv");
const verifyToken = require("../Services/jwtverfication");
dotenv.config();

const router = express.Router();

//Endpoint to fetch the product details with all reviews it had.
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const productId = req.params.id;

    // Fetch product details
    const productQuery = `
      SELECT p.*, s.name AS shop_name, s.unique_id AS shop_id, s.shop_logo_url
      FROM product p
      JOIN shop s ON p.shop_id = s.unique_id
      WHERE p.product_id = $1
    `;
    const productResult = await pool.query(productQuery, [productId]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Fetch reviews with user details
    const reviewsQuery = `
      SELECT r.*, u.profile_url, u.full_name
      FROM product_review r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
    `;
    const reviewsResult = await pool.query(reviewsQuery, [productId]);

    product.reviews = reviewsResult.rows;

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

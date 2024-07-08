const express = require("express");
const pool = require("../db");
const dotenv = require("dotenv");
const verifyToken = require("../Services/jwtverfication");
dotenv.config();

const router = express.Router();

// Endpoint to fetch all products with shop details
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT p.product_id, p.product_name, p.variants, s.name AS shop_name, s.unique_id AS shop_id, s.shop_logo_url, p.product_image_urls
      FROM product p
      JOIN shop s ON p.shop_id = s.unique_id
    `;
    const { rows } = await pool.query(query);

    const products = rows.map(row => ({
      product: {
        product_id: row.product_id,
        product_name: row.product_name,
        variants: row.variants,
        product_image_urls: row.product_image_urls
      },
      shop_name: row.shop_name,
      shop_id: row.shop_id,
      shop_logo_url: row.shop_logo_url
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Endpoint to fetch the product details with all reviews it had.
router.get("/:id", async (req, res) => {
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
      return res.status(404).json({ error: "Product not found" });
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

    // Calculate the average rating
    let totalRating = 0;
    reviewsResult.rows.forEach((review) => {
      totalRating += review.rating;
    });
    const averageRating = reviewsResult.rows.length > 0 ? totalRating / reviewsResult.rows.length : 0;

    product.reviews = reviewsResult.rows;
    product.average_rating = averageRating;

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
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

router.delete('/delete/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // Begin transaction
    await pool.query('BEGIN');
    
    // Delete product reviews associated with the product
    await pool.query('DELETE FROM product_review WHERE product_id = $1', [productId]);
    
    // Delete product from the product table
    const result = await pool.query('DELETE FROM product WHERE product_id = $1 RETURNING *', [productId]);
    
    // Commit transaction
    await pool.query('COMMIT');

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', product: result.rows[0] });
  } catch (err) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

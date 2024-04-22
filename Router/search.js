const express = require('express');
const pool = require('../db'); // Assuming you have a database pool set up
const router = express.Router();

// Endpoint for searching shops and products
router.get("/term", async (req, res) => {
    const { query } = req.query;
  
    try {
      // Search for shops matching the query
      const shopQuery = `
        SELECT *
        FROM shop
        WHERE name ILIKE $1
      `;
      const shopResult = await pool.query(shopQuery, [`%${query}%`]);
  
      // Search for products matching the query
      const productQuery = `
        SELECT *
        FROM product
        WHERE product_name ILIKE $1
      `;
      const productResult = await pool.query(productQuery, [`%${query}%`]);
  
      // Extract search terms from shop and product names
      const searchTerms = [
        ...new Set([
          ...shopResult.rows.map((shop) => shop.name.split(" ")).flat(),
          ...productResult.rows.map((product) => product.product_name.split(" ")).flat(),
        ]),
      ];
  
      // Construct the response object
      const searchResults = [
        ...shopResult.rows.map((shop) => ({ type: "shop", ...shop })),
        ...productResult.rows.map((product) => ({ type: "product", ...product })),
      ];
  
      res.json({ searchResults, searchTerms });
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

module.exports = router;

const express = require("express");
const pool = require("../db");
const verifyToken = require("../Services/jwtverfication");

const router = express.Router();
// Endpoint to get shop logo URL and shop banner URL by shop ID
router.get("/shop/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;

    // Query to fetch shop logo URL and shop banner URL by shop ID
    const query = `
        SELECT shop_logo_url, shop_banner_url
        FROM shop
        WHERE unique_id = $1
      `;

    // Execute the query
    const result = await pool.query(query, [shopId]);

    // Check if a shop with the given ID exists
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Extract the shop logo URL and shop banner URL from the result
    const { shop_logo_url, shop_banner_url } = result.rows[0];

    // Send the shop logo URL and shop banner URL in the response
    res.json({ shop_logo_url, shop_banner_url });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to update the details of a product by ID
router.put("/product/edit/:productId",  async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      product_name,
      product_description,
      product_image_urls,
      product_tags,
      variants,
    } = req.body;

    // Check if the product exists
    const checkProductQuery = "SELECT * FROM product WHERE product_id = $1";
    const productExists = await pool.query(checkProductQuery, [productId]);

    if (productExists.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product details
    const updateProductQuery = `
        UPDATE product
        SET 
          product_name = $1,
          product_description = $2,
          product_image_urls = $3,
          product_tags = $4,
          variants = $5
        WHERE 
          product_id = $6
      `;
    await pool.query(updateProductQuery, [
      product_name,
      product_description,
      product_image_urls,
      product_tags,
      variants,
      productId,
    ]);

    res.status(200).json({ message: "Product details updated successfully" });
  } catch (error) {
    console.error("Error updating product details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to get all reviews on products of a shop
router.get("/reviews/:uniqueShopId", async (req, res) => {
  try {
    const { uniqueShopId } = req.params;

    // Fetch all reviews on products of the shop
    const reviewsQuery = `
        SELECT pr.description AS review_description, pr.rating AS review_rating,
               u.full_name AS reviewer_name,
               p.product_name, p.product_image_urls[1] AS product_image_url
        FROM product_review pr
        INNER JOIN users u ON pr.user_id = u.id
        INNER JOIN product p ON pr.product_id = p.product_id
        INNER JOIN shop s ON p.shop_id = s.unique_id
        WHERE s.unique_id = $1
      `;
    const { rows } = await pool.query(reviewsQuery, [uniqueShopId]);

    // Send the response
    res.json(rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to fetch the list of ordered items for a shop
router.get("/orders/:shopId", async (req, res) => {
  try {
    const shopId = req.params.shopId;

    // Query to fetch ordered items for the shop
    const query = `
        SELECT
          oi.order_item_id,
          oi.order_id,
          p.product_name,
          p.product_image_urls,
          oi.variant_name,
          oi.quantity,
          u.full_name AS customer_name,
          u.phone_number AS customer_phone_number,
          a.flat,
          a.area,
          a.city,
          a.state,
          a.pincode,
          a.landmark,
          oi.status
        FROM
          order_items oi
          JOIN orders o ON oi.order_id = o.order_id
          JOIN product p ON oi.product_id = p.product_id
          JOIN users u ON o.customer_id = u.id
          JOIN addresses a ON o.delivery_address_id = a.id
        WHERE
          p.shop_id = $1
        ORDER BY
          o.order_date DESC;
      `;

    const result = await pool.query(query, [shopId]);
    const orderedItems = result.rows;

    res.json(orderedItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to update order item status
router.put('/order-items/:id', async (req, res) => {
    const orderItemId = req.params.id;
    const newStatus = req.body.status;
  
    try {
      // Update the order item status in the database
      const result = await pool.query(
        'UPDATE order_items SET status = $1 WHERE order_item_id = $2',
        [newStatus, orderItemId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Order item not found' });
      }
  
      res.status(200).json({ message: 'Order item status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

module.exports = router;

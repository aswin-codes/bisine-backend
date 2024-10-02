const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const moment = require('moment')
const dotenv = require("dotenv");
const verifyToken = require("../Services/jwtverfication");
dotenv.config();

const router = express.Router();

//Get shop id from the unique id 
router.get('/getShopId/:uniqueId', async (req, res) => {
    try {
      const { uniqueId } = req.params;
  
      // Query the database to get the shop ID based on the unique ID
      const result = await pool.query('SELECT shop_id FROM shops WHERE unique_id = $1', [uniqueId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Shop not found for the given unique ID.' });
      }
  
      const shopId = result.rows[0].shop_id;
      return res.status(200).json({ shopId });
    } catch (error) {
      console.error('Error getting shop ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

//End point to check whether unique id is already used
router.post('/checkUniqueId',async (req, res) => {
    try {
      const { unique_id } = req.body;
  
      // Check if the unique_id is already used
      const result = await pool.query('SELECT COUNT(*) FROM shop WHERE unique_id = $1', [unique_id]);
  
      if (result.rows[0].count > 0) {
        return res.status(409).json({ error: 'The unique ID is already used.' });
      } else {
        return res.status(200).json({ message: 'The unique ID is available.' });
      }
    } catch (error) {
      console.error('Error checking unique ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

// Endpoint to insert a new shop
router.post('/create',verifyToken, async (req, res) => {
    const {
      name,
      description,
      unique_id,
      shop_tags,
      pincode,
      flat,
      area,
      landmark,
      city,
      shop_logo_url,
      shop_banner_url,
      contact_number,
      business_email,
      social_media_link,
      owner_email,
      owner_id
    } = req.body;
  
    if (!unique_id) {
      return res.status(400).json({ error: 'Unique ID is required' });
    }
  
    if (!owner_email) {
      return res.status(400).json({ error: 'Owner email is required' });
    }
  
    try {
      const query = `
        INSERT INTO shop (
          name,
          description,
          unique_id,
          shop_tags,
          pincode,
          flat,
          area,
          landmark,
          city,
          shop_logo_url,
          shop_banner_url,
          contact_number,
          business_email,
          social_media_link,
          owner_email,
          owner_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,$16) RETURNING unique_id
      `;
  
      const values = [
        name,
        description,
        unique_id,
        shop_tags,
        pincode,
        flat,
        area,
        landmark,
        city,
        shop_logo_url,
        shop_banner_url,
        contact_number,
        business_email,
        social_media_link,
        owner_email,
        owner_id
      ];
  await pool.query(query, values);

      res.status(201).json({ message: 'Shop created successfully', shop_id : unique_id });
    } catch (error) {
      console.error('Error inserting shop:', error);
  
      // Check if error is related to unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Shop with this unique ID already exists' });
      }
  
      // Check if error is related to foreign key constraint violation
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Owner email does not exist in user table' });
      }
  
      // For all other errors, send a generic error message
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Endpoint to get sales data for a specific shop
router.get('/get-sales-data', async (req, res) => {
  const { shopId } = req.query; // Get shop ID from query parameters
  console.log(shopId)
  if (!shopId) {
      return res.status(400).json({ success: false, message: 'Shop ID is required' });
  }

  const periods = [
      { label: 'last_3_months', duration: '3 months' },
      { label: 'last_6_months', duration: '6 months' },
      { label: 'last_12_months', duration: '12 months' },
  ];

  try {
      const results = {};

      for (const period of periods) {
          const startDate = moment().subtract(period.duration).startOf('month').toISOString();
          const endDate = moment().endOf('month').toISOString();

          // Query to get sales data with product details for a specific shop
          const query = `
              SELECT 
                  o.order_date,
                  oi.product_id,
                  p.product_name,
                  p.product_description,
                  oi.quantity,
                  oi.unit_price,
                  oi.total_price
              FROM 
                  orders o
              JOIN 
                  order_items oi ON o.order_id = oi.order_id
              JOIN 
                  product p ON oi.product_id = p.product_id
              JOIN 
                  shop s ON p.shop_id = s.unique_id  -- Ensure to join with shop
              WHERE 
                  o.order_date >= $1 
                  AND o.order_date <= $2
                  AND s.unique_id = $3  -- Filter by shop ID
              ORDER BY 
                  o.order_date;
          `;

          const { rows } = await pool.query(query, [startDate, endDate, shopId]);
          results[period.label] = rows;
      }

      res.json({
          success: true,
          data: results,
      });
  } catch (error) {
      console.error('Error retrieving sales data:', error);
      res.status(500).json({ success: false, message: 'Error retrieving sales data' });
  }
});

//Endpoint to get the shop details along with the list of products from the unique_id
router.get('/:unique_id',async (req, res) => {
  const { unique_id } = req.params;

  try {
    // Get shop details
    const shopQuery = {
      text: 'SELECT * FROM shop WHERE unique_id = $1',
      values: [unique_id],
    };
    const shopResult = await pool.query(shopQuery);

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const shop = shopResult.rows[0];

    // Get products of the shop
    const productsQuery = {
      text: 'SELECT * FROM product WHERE shop_id = $1',
      values: [shop.unique_id],
    };
    const productsResult = await pool.query(productsQuery);
    const products = productsResult.rows;

    // Combine shop details with products
    const shopWithProducts = { ...shop, products };

    res.status(200).json(shopWithProducts);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





module.exports = router;
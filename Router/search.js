const express = require('express');
const pool = require('../db'); // Assuming you have a database pool set up
const router = express.Router();

// Endpoint for searching shops and products
router.get('/term', async (req, res) => {
    const { query } = req.query;
    try {
        // Search for shops
        const shopResults = await pool.query(`
            SELECT shop_id, name AS shop_name, description AS shop_description, shop_logo_url
            FROM shop
            WHERE name ILIKE $1 OR description ILIKE $1;
        `, [`%${query}%`]);

        // Add type field to shop results
        const shopObjects = shopResults.rows.map(shop => ({
            ...shop,
            type: 'shop'
        }));

        // Search for products
        const productResults = await pool.query(`
            SELECT product_id, product_name, product_description, product_image_urls
            FROM product
            WHERE product_name ILIKE $1 OR product_description ILIKE $1;
        `, [`%${query}%`]);

        // Add type field to product results
        const productObjects = productResults.rows.map(product => ({
            ...product,
            type: 'product'
        }));

        // Combine and shuffle the results
        const combinedResults = shuffle([...shopObjects, ...productObjects]);

        res.json(combinedResults);
    } catch (err) {
        console.error('Error searching:', err);
        res.status(500).json({ error: 'An error occurred while searching.' });
    }
});

// Function to shuffle an array (Fisher-Yates shuffle algorithm)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = router;

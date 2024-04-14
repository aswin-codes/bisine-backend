const express = require("express")
const pool = require("../db")

const router = express.Router()

router.post('/add', async (req, res) => {
    try {
      const { user_id, product_id, shop_id, variant_name } = req.body;
  
      // Check if the item already exists in the user's cart
      const checkCartItemQuery = `
        SELECT * FROM user_cart
        WHERE user_id = $1 AND product_id = $2 AND shop_id = $3 AND variant_name = $4
      `;
      const { rows } = await pool.query(checkCartItemQuery, [user_id, product_id, shop_id, variant_name]);
      
      if (rows.length > 0) {
        return res.status(400).json({ message: 'Item already exists in the cart' });
      }
  
      // Insert the cart item into the database
      const insertCartItemQuery = `
        INSERT INTO user_cart (user_id, product_id, shop_id, variant_name)
        VALUES ($1, $2, $3, $4)
        RETURNING cart_item_id
      `;
      const insertionResult = await pool.query(insertCartItemQuery, [user_id, product_id, shop_id, variant_name]);
      const cartItemId = insertionResult.rows[0].cart_item_id;
  
      res.status(201).json({ message: 'Item added to cart successfully', cart_item_id: cartItemId });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });



// Endpoint to fetch product details for a given user
router.get('/product/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch product details for the given user
    const productQuery = `
    SELECT p.product_id, p.product_name, s.name AS shop_name, p.variants, s.shop_logo_url, p.product_image_urls[1] AS image, c.variant_name, c.cart_item_id
    FROM product p
    INNER JOIN shop s ON p.shop_id = s.unique_id
    INNER JOIN user_cart c ON c.product_id = p.product_id
    WHERE c.user_id = $1;
    
    `;
    const { rows } = await pool.query(productQuery, [userId]);
  
    let temp = rows;
    for(let item of temp) {
        let price = 0;
        for(let variant of item.variants){
            if (variant.name == item.variant_name){
                price = variant.price
                break;
            }
        }
        item.price = price;
    }

    //Format the product details
    const products = temp.map((product) => ({
    cart_item_id:product.cart_item_id,
      product_id: product.product_id,
      product_name: product.product_name,
      shop_name: product.shop_name,
      variant_name: product.variant_name,
      price: product.price,
      shop_logo_url: product.shop_logo_url,
      image: product.image,
    }));


    // res.json(products);
    res.status(201).json(products)
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:cartItemId', async (req, res) => {
    try {
      const { cartItemId } = req.params;
  
      // Check if the cart item exists
      const cartItemQuery = 'SELECT * FROM user_cart WHERE cart_item_id = $1';
      const { rows } = await pool.query(cartItemQuery, [cartItemId]);
      const cartItem = rows[0];
  
      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
  
      // Delete the cart item from the database
      const deleteCartItemQuery = 'DELETE FROM user_cart WHERE cart_item_id = $1';
      await pool.query(deleteCartItemQuery, [cartItemId]);
  
      res.status(200).json({ message: 'Cart item deleted successfully' });
    } catch (error) {
      console.error('Error deleting cart item:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


module.exports = router
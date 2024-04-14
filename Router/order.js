const express = require("express");
const pool = require("../db");
const dotenv = require("dotenv");
const verifyToken = require("../Services/jwtverfication");
dotenv.config();

const router = express.Router();

// router.post("/placeorder", async (req, res) => {
//   try {
//     const {
//       customer_id,
//       shop_id,
//       product_id,
//       variant_name,
//       quantity,
//       total_cost,
//       status,
//       delivery_address_id,
//       delivery_method,
//     } = req.body;

//     // Checking if the quantity is enough
//     const inventoryQuery = "SELECT variants FROM product WHERE product_id = $1";
//     const { rows } = await pool.query(inventoryQuery, [product_id]);
//     if (rows.length === 0) {
//       return res
//         .status(400)
//         .json({ message: `Product with ID ${product_id} not found` });
//     }
//     let variants = rows[0].variants;

//     let isFound = false,
//       isEnough = false;
//     for (let variant of variants) {
//       if (variant.name === variant_name) {
//         isFound = true;
//         if (variant.quantityInStock >= quantity) {
//           isEnough = true;
//           variant.quantityInStock -= quantity
//           break;
//         }
//       }
//     }

//     if (!isFound) {
//       return res
//         .status(500)
//         .json({ msg: "Variant not found in the inventory" });
//     }

//     if (!isEnough) {
//       return res
//         .status(500)
//         .json({ msg: "Quantity in inventory is not enough" });
//     }

//     // If everything is okay, send the success response
//     //Update the quantity in the inventory
//     const updateQuery = 'UPDATE product SET variants = $1 WHERE product_id = $2';
//     await pool.query(updateQuery,[variants,product_id]);

//     //Adding the product in the orders table
//     const insertOrderQuery = "INSERT INTO orders (customer_id,shop_id,product_id,variant_name,quantity,total_cost,status,delivery_address_id,delivery_method) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING order_id";

//     const resp = await pool.query(insertOrderQuery,[customer_id,shop_id,product_id,variant_name,quantity,total_cost,status,delivery_address_id,delivery_method])

//     console.log(resp.rows)

//     res.status(200).json({ msg: "Order placed successfully" });
//   } catch (error) {
//     console.error("Error placing order:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

router.post("/placeorder", async (req, res) => {
  const {
    product_list,
    customer_id,
    total_cost,
    delivery_address_id,
    delivery_method,
  } = req.body;

  //Checking if the product's requested quantity is enough
  let product;
  for (product of product_list) {
    let { product_id, variant_name, quantity } = product;
    const inventoryQuery = "SELECT variants FROM product WHERE product_id = $1";
    const { rows } = await pool.query(inventoryQuery, [product_id]);
    if (rows.length === 0) {
      return res
        .status(400)
        .json({ msg: `Product with ID ${product_id} not found` });
    }
    let variants = rows[0].variants;

    let isFound = false,
      isEnough = false;
    for (let variant of variants) {
      if (variant.name === variant_name) {
        isFound = true;
        if (variant.quantityInStock >= quantity) {
          isEnough = true;
          variant.quantityInStock -= quantity;
          break;
        }
      }
    }

    if (!isFound) {
      return res
        .status(500)
        .json({ msg: "Variant not found in the inventory" });
    }

    if (!isEnough) {
      return res
        .status(500)
        .json({ msg: "Quantity in inventory is not enough" });
    }
  }

  //Decrementing the quantities in the database
  for (product of product_list) {
    const { variant_name, product_id, quantity } = product;
    const inventoryQuery = "SELECT variants FROM product WHERE product_id = $1";
    const { rows } = await pool.query(inventoryQuery, [product_id]);
    if (rows.length === 0) {
      return res
        .status(400)
        .json({ msg: `Product with ID ${product_id} not found` });
    }
    let variants = rows[0].variants;

    for (let variant of variants) {
      if (variant.name === variant_name) {
        if (variant.quantityInStock >= quantity) {
          variant.quantityInStock -= quantity;
          break;
        }
      }
    }
    const updateQuery =
      "UPDATE product SET variants = $1 WHERE product_id = $2";
    await pool.query(updateQuery, [variants, product_id]);
  }

  //Updating the order table
  const orderQuery =
    "INSERT INTO orders (customer_id,total_cost,delivery_address_id,delivery_method) VALUES ($1,$2,$3,$4) RETURNING order_id";
  let { rows } = await pool.query(orderQuery, [
    customer_id,
    total_cost,
    delivery_address_id,
    delivery_method,
  ]);

  let { order_id } = rows[0];

  for (let product of product_list) {
    const { product_id, variant_name, quantity, delivery_price } = product;

    const productQuery = "SELECT variants FROM product WHERE product_id = $1";
    const { rows } = await pool.query(productQuery, [product_id]);
    const { variants } = rows[0];
    const variant = variants.find((v) => v.name == variant_name);
    const unit_price = variant.price;
    const total_price = unit_price * quantity + delivery_price;

    const orderItemQuery =
      "INSERT INTO order_items (order_id,product_id,variant_name,quantity,unit_price,delivery_price,total_price,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)";
    await pool.query(orderItemQuery, [
      order_id,
      product_id,
      variant_name,
      quantity,
      unit_price,
      delivery_price,
      total_price,
      "Order Received",
    ]);
  }

  res.status(201).json({
    msg: "Placed order successfully",
  });
});

router.get("/orders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Query to fetch ordered items for the user with shop contact number
    const query = `
        SELECT
          oi.order_item_id,
          oi.order_id,
          p.product_name,
          p.product_image_urls,
          s.name AS shop_name,
          s.contact_number AS shop_contact_number,
          o.order_date,
          oi.total_price,
          oi.status
        FROM
          order_items oi
          JOIN orders o ON oi.order_id = o.order_id
          JOIN product p ON oi.product_id = p.product_id
          JOIN shop s ON p.shop_id = s.unique_id
        WHERE
          o.customer_id = $1
        ORDER BY
          o.order_date DESC;
      `;

    const result = await pool.query(query, [userId]);
    const orderedItems = result.rows;

    res.json(orderedItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Endpoint for cancelling an order item
router.delete('/cancel-order-item/:orderItemId', async (req, res) => {
    try {
      const { orderItemId } = req.params;
  
      // Retrieve the order item details
      const getOrderItemQuery = 'SELECT * FROM order_items WHERE order_item_id = $1';
      const { rows: orderItemRows } = await pool.query(getOrderItemQuery, [orderItemId]);
      const orderItem = orderItemRows[0];
  
      if (!orderItem) {
        return res.status(404).json({ message: 'Order item not found' });
      }
  
      // Check if the order item was created within the last 6 hours
      const creationTime = new Date(orderItem.created_at).getTime();
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - creationTime) / (1000 * 60 * 60); // Difference in hours
  
      if (timeDifference > 6) {
        return res.status(400).json({ message: 'Order cannot be cancelled after 6 hours' });
      }
  
      // Retrieve the order details to get the customer id
      const getOrderQuery = 'SELECT customer_id FROM orders WHERE order_id = $1';
      const orderResult = await pool.query(getOrderQuery, [orderItem.order_id]);
      const { customer_id } = orderResult.rows[0];
    
      // Insert the cancelled order item details into the cancelled_orders table
      const insertCancelledOrderQuery = `
        INSERT INTO cancelled_orders (order_id, customer_id, product_id, variant_name, quantity, unit_price, delivery_price, total_price, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      const cancelledOrderValues = [
        orderItem.order_id,
        customer_id,
        orderItem.product_id,
        orderItem.variant_name,
        orderItem.quantity,
        orderItem.unit_price,
        orderItem.delivery_price,
        orderItem.total_price,
        'Cancelled'
      ];
      await pool.query(insertCancelledOrderQuery, cancelledOrderValues);
  
      // Delete the order item from the order_items table
      const deleteOrderItemQuery = 'DELETE FROM order_items WHERE order_item_id = $1';
      await pool.query(deleteOrderItemQuery, [orderItemId]);
  
      // Update the total cost of the corresponding order in the orders table
      const updateOrderTotalCostQuery = `
        UPDATE orders
        SET total_cost = total_cost - $1
        WHERE order_id = $2
      `;
      await pool.query(updateOrderTotalCostQuery, [orderItem.total_price, orderItem.order_id]);
  
      res.status(200).json({ message: 'Order item cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling order item:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });



module.exports = router;

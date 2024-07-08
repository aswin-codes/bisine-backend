--User table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_url VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15)
);

--Shop Table
CREATE TABLE shop (
    shop_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unique_id VARCHAR(255) UNIQUE,
    shop_tags TEXT[],
    pincode VARCHAR(10),
    flat VARCHAR(255),
    area VARCHAR(255),
    landmark VARCHAR(255),
    city VARCHAR(255),
    shop_logo_url VARCHAR(255),
    shop_banner_url VARCHAR(255),
    contact_number VARCHAR(15),
    business_email VARCHAR(255),
    social_media_link VARCHAR(255),
    owner_email VARCHAR(255),
    owner_id INT REFERENCES users(id)
);

--Product table (Inventory)
CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    product_tags TEXT[],
    product_image_urls TEXT[],
    variants JSONB[],
    shop_id VARCHAR(255) REFERENCES shop(unique_id) ON DELETE CASCADE
);

--Review Table 
CREATE TABLE product_review (
    review_id SERIAL PRIMARY KEY,
    description TEXT,
    date VARCHAR(255),
    rating FLOAT,
    user_id INT REFERENCES users(id),
    product_id INT REFERENCES product(product_id)
);


--Table for storing customer address
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    flat TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode INT NOT NULL,
    landmark TEXT
);

--For Storing the orders
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id),  -- Foreign key referencing the users table
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_cost DECIMAL(10, 2),
    delivery_address_id INT REFERENCES addresses(id),  -- Foreign key referencing the delivery_addresses table
    delivery_method VARCHAR(100)
);

--For storing the ordered items
--For storing the ordered items
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    product_id INT REFERENCES product(product_id) ON DELETE CASCADE,
    variant_name VARCHAR(255),
    quantity INT,
    unit_price DECIMAL(10, 2),
    delivery_price DECIMAL(10,2),
    total_price DECIMAL(10, 2),
    status VARCHAR(255)
);


--For storing the cancelled orders data
CREATE TABLE cancelled_orders (
    cancelled_order_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    customer_id INT REFERENCES users(id),
    product_id INT REFERENCES product(product_id) ON DELETE CASCADE,
    variant_name VARCHAR(255),
    quantity INT,
    unit_price DECIMAL(10, 2),
    delivery_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    status VARCHAR(255),
    cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--For storing cart details
CREATE TABLE user_cart (
    cart_item_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    product_id INT REFERENCES product(product_id) ON DELETE CASCADE,
    shop_id VARCHAR(255) REFERENCES shop(unique_id),
    variant_name VARCHAR(255)
);






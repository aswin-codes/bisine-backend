--User table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_url VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    pincode INT,
    flat TEXT,
    area TEXT,
    landmark TEXT,-- Assuming you want to store an array of strings for location
    city VARCHAR(100),
    state VARCHAR(100)
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
    owner_email VARCHAR(255) REFERENCES users(email)
);


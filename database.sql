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

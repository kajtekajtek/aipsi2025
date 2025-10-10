-- Create the application database
CREATE DATABASE IF NOT EXISTS app;

-- Create a dedicated user for the bookstore application
CREATE USER IF NOT EXISTS 'bookstore'@'localhost' IDENTIFIED BY 'bookstore123';

-- Grant all privileges on the app database to the bookstore user
GRANT ALL PRIVILEGES ON app.* TO 'bookstore'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;

-- Show the result
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User IN ('bookstore', 'root');


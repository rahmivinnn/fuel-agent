-- Clean existing data
DELETE FROM transactions;
DELETE FROM wallets;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM vehicles;
DELETE FROM payment_methods;
DELETE FROM reviews;
DELETE FROM notifications;
DELETE FROM chat_messages;
DELETE FROM fuel_friends;
DELETE FROM fuel_stations;
DELETE FROM customers;

-- Insert fresh data
INSERT INTO customers (id, full_name, email, phone_number, password, gender, city, address, is_email_verified) VALUES 
('cust1', 'Robin Sharma', 'robin@example.com', '923553344550', 'password123', 'Male', 'Toronto, Canada', '123 Main Street, Toronto', true);

INSERT INTO fuel_friends (id, full_name, phone_number, email, location, delivery_fee, rating, total_reviews, latitude, longitude, about, is_available) VALUES 
('ff1', 'Shah Hussain', '+1234567890', 'shah@fuelfriend.com', 'Tennessee', 5.00, 4.8, 46, 36.1627, -86.7816, 'Reliable fuel delivery service', true),
('ff2', 'Cristopert Dastin', '+1234567891', 'cristopert@fuelfriend.com', 'Tennessee', 5.00, 4.9, 52, 36.1627, -86.7816, 'Professional delivery service', true);

INSERT INTO fuel_stations (id, name, address, latitude, longitude, regular_price, premium_price, diesel_price, rating, total_reviews, average_delivery_time, is_open_24_7) VALUES 
('station1', 'Petro Tennessee', 'Abcd Tennessee', 36.1627, -86.7816, 1.23, 1.75, 2.14, 4.7, 146, 30, true),
('station2', 'TurboFuel Express', '1234 Energy Drive, Houston', 29.7604, -95.3698, 1.20, 1.70, 2.10, 4.6, 24, 25, true);

INSERT INTO vehicles (id, customer_id, brand, color, license_number, fuel_type, is_primary) VALUES 
('veh1', 'cust1', 'Mercedes-Benz', 'Red', 'CAN A980', 'Premium', true);

INSERT INTO orders (id, tracking_number, customer_id, station_id, fuel_friend_id, vehicle_id, delivery_address, delivery_phone, fuel_type, fuel_quantity, fuel_cost, delivery_fee, groceries_cost, total_amount, order_type, estimated_delivery_time, status, payment_status, payment_method) VALUES 
('order1', '162432', 'cust1', 'station1', 'ff1', 'veh1', '123 Main Street, Toronto, Canada', '923553344550', 'Premium', 2.00, 283.00, 5.00, 20.00, 308.00, 'instant', '8:30 - 9:15 PM', 'in_progress', 'completed', 'credit_card'),
('order2', 'GB8821', 'cust1', 'station1', null, 'veh1', '10 Downing St, London, UK', '+44 20 7925 0918', 'Diesel', 15.00, 25.00, 3.00, 0.00, 28.00, 'instant', '15-20 min', 'pending', 'pending', 'paypal'),
('order3', 'US9922', 'cust1', 'station2', 'ff1', 'veh1', '350 5th Ave, New York, NY, USA', '+1 212-736-3100', 'Regular', 10.00, 40.00, 5.00, 15.00, 60.00, 'instant', '30-45 min', 'active', 'completed', 'apple_pay'),
('order4', 'US9923', 'cust1', 'station2', null, 'veh1', '40 Wall St, New York, NY, USA', '+1 212-736-3100', 'Premium', 5.00, 22.00, 5.00, 0.00, 27.00, 'instant', '10-15 min', 'pending', 'pending', 'credit_card');

INSERT INTO wallets (id, driver_id, balance, currency, bank_name, card_number, expiry_date, cvv) VALUES 
('wallet1', 'ff1', 245.50, 'USD', 'Chase Bank', '4532', '12/26', '123');

INSERT INTO transactions (id, wallet_id, type, amount, status, date, time) VALUES 
('txn1', 'wallet1', 'deposit', 25.00, 'completed', CURRENT_DATE, '14:30'),
('txn2', 'wallet1', 'payment', 15.00, 'completed', CURRENT_DATE - INTERVAL '1 day', '09:15');

INSERT INTO products (id, station_id, name, category, price, in_stock) VALUES 
('prod1', 'station1', 'Potato Chips', 'Snacks', 3.49, true),
('prod2', 'station1', 'Still Water 500ml', 'Drinks', 1.29, true),
('prod3', 'station1', 'Sourdough Bread', 'Food', 4.50, true);
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customer Schema
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  password: text("password").notNull(),
  gender: text("gender"), // male, female
  city: text("city"),
  address: text("address"),
  about: text("about"), // Profile about section
  location: text("location"), // Current location
  services: text("services"), // JSON string of services array
  isEmailVerified: boolean("is_email_verified").default(false),
  profilePhoto: text("profile_photo"),
  otpCode: text("otp_code"),
  otpExpires: timestamp("otp_expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vehicle Schema (Can belong to customers or fuel friends)
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id), // Made optional
  fuelFriendId: varchar("fuel_friend_id").references(() => fuelFriends.id), // Added fuel friend reference
  brand: text("brand").notNull(), // Honda, Toyota, etc.
  color: text("color").notNull(), // Red, Blue, etc.
  licenseNumber: text("license_number").notNull(),
  fuelType: text("fuel_type").notNull(), // Petrol, Diesel, Premium
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fuel Station Schema
export const fuelStations = pgTable("fuel_stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  regularPrice: decimal("regular_price", { precision: 10, scale: 2 }), // per liter
  premiumPrice: decimal("premium_price", { precision: 10, scale: 2 }),
  dieselPrice: decimal("diesel_price", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  averageDeliveryTime: integer("average_delivery_time"), // in minutes
  isOpen24_7: boolean("is_open_24_7").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products/Groceries Schema
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stationId: varchar("station_id").references(() => fuelStations.id),
  name: text("name").notNull(),
  category: text("category").notNull(), // Snacks, Drinks, Bread, etc.
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  inStock: boolean("in_stock").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fuel Friend Schema (Delivery persons)
export const fuelFriends = pgTable("fuel_friends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Added password field
  location: text("location").notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  profilePhoto: text("profile_photo"),
  about: text("about"),
  isAvailable: boolean("is_available").default(true),
  fcmToken: text("fcm_token"), // For push notifications
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders Schema (Customer orders)
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNumber: text("tracking_number").notNull().unique(),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  stationId: varchar("station_id").references(() => fuelStations.id),
  fuelFriendId: varchar("fuel_friend_id").references(() => fuelFriends.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryPhone: text("delivery_phone").notNull(),
  fuelType: text("fuel_type"), // Regular, Premium, Diesel
  fuelQuantity: decimal("fuel_quantity", { precision: 10, scale: 2 }), // in liters
  fuelCost: decimal("fuel_cost", { precision: 10, scale: 2 }),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  groceriesCost: decimal("groceries_cost", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  orderType: text("order_type").notNull(), // instant, scheduled
  scheduledDate: text("scheduled_date"),
  scheduledTime: text("scheduled_time"),
  estimatedDeliveryTime: text("estimated_delivery_time"),
  status: text("status").notNull().default("pending"), // pending, confirmed, in_progress, completed, canceled, disputed
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed
  paymentMethod: text("payment_method"), // credit_card, paypal, apple_pay
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Items Schema (groceries in orders)
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment Methods Schema
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  type: text("type").notNull(), // mastercard, visa, paypal, apple_pay
  cardHolderName: text("card_holder_name"),
  cardNumber: text("card_number"), // last 4 digits only
  expiryDate: text("expiry_date"),
  billingAddress: text("billing_address"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews Schema
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  orderId: varchar("order_id").references(() => orders.id),
  targetType: text("target_type").notNull(), // station, fuel_friend
  targetId: varchar("target_id").notNull(), // ID of station or fuel friend
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications Schema
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // order_update, payment, cancellation, safety_alert, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages Schema
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  senderId: varchar("sender_id").notNull(), // customer or fuel friend ID
  senderType: text("sender_type").notNull(), // customer, fuel_friend
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet Schema (Mock for frontend compatibility as actual wallet might be complex)
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").references(() => fuelFriends.id).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  currency: varchar("currency").default("USD"),
  bankName: text("bank_name"),
  cardNumber: text("card_number"), // Last 4 digits
  expiryDate: text("expiry_date"),
  cvv: text("cvv"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions Schema
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").references(() => wallets.id).notNull(),
  type: text("type").notNull(), // deposit, withdrawal, payment
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // pending, completed, failed
  date: text("date"), // YYYY-MM-DD
  time: text("time"), // HH:MM
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  isEmailVerified: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertFuelStationSchema = createInsertSchema(fuelStations).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertFuelFriendSchema = createInsertSchema(fuelFriends).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Registration Step Schemas
export const registrationStep1Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const registrationStep2Schema = z.object({
  brand: z.string().min(2, "Vehicle brand is required"),
  color: z.string().min(2, "Vehicle color is required"),
  licenseNumber: z.string().min(3, "License number is required"),
  fuelType: z.string().min(2, "Fuel type is required"),
});

export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

export const emailVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const otpVerificationSchema = z.object({
  code: z.string().length(4, "Code must be 4 digits"),
});

export const forgotPasswordSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone number is required"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  gender: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  city: z.string().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  targetType: z.enum(["station", "fuel_friend"]),
  targetId: z.string(),
});

export const checkoutStep1Schema = z.object({
  address: z.string().min(5, "Address is required"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  fuelQuantity: z.number().min(1, "Fuel quantity is required"),
  orderType: z.enum(["instant", "scheduled"]),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type FuelStation = typeof fuelStations.$inferSelect;
export type InsertFuelStation = z.infer<typeof insertFuelStationSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type FuelFriend = typeof fuelFriends.$inferSelect;
export type InsertFuelFriend = z.infer<typeof insertFuelFriendSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type RegistrationStep1 = z.infer<typeof registrationStep1Schema>;
export type RegistrationStep2 = z.infer<typeof registrationStep2Schema>;
export type LoginData = z.infer<typeof loginSchema>;
export type EmailVerification = z.infer<typeof emailVerificationSchema>;
export type OtpVerification = z.infer<typeof otpVerificationSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type CheckoutStep1 = z.infer<typeof checkoutStep1Schema>;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

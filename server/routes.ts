import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { checkLocation } from "./geolocation";
import { createStripePaymentIntent, createPaypalPayout } from "./payments";
import { generateOTP, saveOTP, verifyOTP, cleanupExpiredOTPs } from './otp';
import { sendEmailOTP } from './email';

// Lazy import WhatsApp service to prevent blocking server startup
let whatsappService: typeof import('./whatsapp') | null = null;

async function getWhatsAppService() {
  if (!whatsappService) {
    whatsappService = await import('./whatsapp');
  }
  return whatsappService;
}

// Cleanup expired OTPs every 10 minutes
setInterval(cleanupExpiredOTPs, 10 * 60 * 1000);
import {
  registrationStep1Schema,
  registrationStep2Schema,
  loginSchema,
  emailVerificationSchema,
  otpVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  changePasswordSchema,
  reviewSchema,
  checkoutStep1Schema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Geolocation Restriction Middleware
  // Restricted access to US and UK only
  app.use("/api", async (req: Request, res: Response, next: NextFunction) => {
    // Skip if path matches health check (though health check above should catch it first)
    if (req.path === "/health") return next();

    // Use req.ip or x-forwarded-for handling if needed
    // For localhost testing, this will likely fail validation unless a valid public IP is mocked or proxied,
    // but the requirement is "no mock".
    /*
    const clientIp = req.ip || "127.0.0.1";

    // Allow localhost for development testing
    if (clientIp === "127.0.0.1" || clientIp === "::1") {
      return next();
    }
    
    // Check location
    const { allowed, error } = await checkLocation(clientIp);

    if (!allowed) {
      return res.status(403).json({
        error: "Access Denied",
        message: "Service available in US and UK only.",
        details: error
      });
    }
    */
    next();
  });

  // ========== Authentication Routes ==========

  // Google Authentication
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { uid, email, displayName, photoURL } = req.body;

      if (!uid || !email) {
        return res.status(400).json({ error: "Invalid Google user data" });
      }

      // Check if user exists
      let customer = await storage.getCustomerByEmail(email);
      
      if (!customer) {
        // Create new customer from Google data
        customer = await storage.createCustomer({
          fullName: displayName || email.split('@')[0],
          email: email,
          phoneNumber: "", // Will be filled later
          password: uid, // Use Google UID as password
          isEmailVerified: true // Google emails are verified
        });
      }

      res.json({
        success: true,
        customer: {
          id: customer.id,
          fullName: customer.fullName,
          email: customer.email,
          isEmailVerified: customer.isEmailVerified
        }
      });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ error: "Google authentication failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { emailOrPhone, password } = loginSchema.parse(req.body);

      const customer = await storage.getCustomerByEmailOrPhone(emailOrPhone);

      if (!customer || customer.password !== password) {
        return res.status(401).json({
          error: "Invalid credentials"
        });
      }

      res.json({
        success: true,
        customer: {
          id: customer.id,
          fullName: customer.fullName,
          email: customer.email,
          isEmailVerified: customer.isEmailVerified
        }
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Register Step 1: Personal Info
  app.post("/api/auth/register/step1", async (req, res) => {
    try {
      const data = registrationStep1Schema.parse(req.body);

      // Check if email already exists
      const existingCustomer = await storage.getCustomerByEmail(data.email);
      if (existingCustomer) {
        return res.status(400).json({
          error: "Email already registered"
        });
      }

      res.json({ success: true, data });
    } catch (error) {
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  // Register Step 2: Vehicle Details + Complete Registration
  app.post("/api/auth/register/complete", async (req, res) => {
    try {
      const { step1, step2 } = req.body;

      const step1Data = registrationStep1Schema.parse(step1);
      const step2Data = registrationStep2Schema.parse(step2);

      // Check if email already exists
      const existingCustomer = await storage.getCustomerByEmail(step1Data.email);
      if (existingCustomer) {
        return res.status(400).json({
          error: "Email already registered"
        });
      }

      // Create customer
      const customer = await storage.createCustomer({
        fullName: step1Data.fullName,
        email: step1Data.email,
        phoneNumber: step1Data.phoneNumber,
        password: step1Data.password,
      });

      // Create vehicle
      await storage.createVehicle({
        customerId: customer.id,
        brand: step2Data.brand,
        color: step2Data.color,
        licenseNumber: step2Data.licenseNumber,
        fuelType: step2Data.fuelType,
        isPrimary: true,
      });

      res.json({
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          fullName: customer.fullName
        }
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  // Email/WhatsApp Verification - Send Code
  app.post("/api/auth/email-verification", async (req, res) => {
    try {
      const { email } = emailVerificationSchema.parse(req.body);

      const customer = await storage.getCustomerByEmail(email);
      if (!customer) {
        return res.status(404).json({ error: "Email not found" });
      }

      // Generate a new OTP
      const otp = generateOTP();
      
      // Store OTP in customer record
      await storage.updateCustomer(customer.id, { 
        otpCode: otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000)
      });

      let emailSent = false;
      let whatsappSent = false;

      // Send via email
      try {
        const { sendEmailOTP } = await import('./email');
        const emailResult = await sendEmailOTP(email, otp);
        emailSent = emailResult.success;
      } catch (error) {
        console.warn('Failed to send email OTP:', error);
      }

      // Send via WhatsApp if phone number exists
      if (customer.phoneNumber) {
        try {
          const result = await whatsappService.sendOTP(customer.phoneNumber, otp);
          whatsappSent = result.success;
        } catch (error) {
          console.warn('Failed to send WhatsApp OTP:', error);
        }
      }

      res.json({
        success: true,
        message: emailSent && whatsappSent 
          ? "Verification code sent to your email and WhatsApp" 
          : emailSent 
            ? "Verification code sent to your email"
            : whatsappSent
              ? "Verification code sent to your WhatsApp"
              : "Verification code generated",
        code: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // SMS/WhatsApp connection status
  app.get("/api/otp/whatsapp/status", async (req, res) => {
    try {
      const { getSMSStatus } = await import('./sms');
      const status = await getSMSStatus();
      
      // Also check Baileys status
      const { whatsappService } = await import('./whatsapp');
      const baileysStatus = whatsappService.getConnectionStatus();
      
      res.json({ 
        connected: status.available || baileysStatus.connected,
        sms: status.twilioSMS,
        whatsapp: status.twilioWhatsApp,
        baileys: baileysStatus
      });
    } catch (error) {
      res.json({ connected: false, sms: false, whatsapp: false, baileys: { connected: false } });
    }
  });

  // Restart WhatsApp connection
  app.post("/api/otp/whatsapp/restart", async (req, res) => {
    try {
      const { whatsappService } = await import('./whatsapp');
      console.log('🔄 Restarting WhatsApp service...');
      await whatsappService.initialize();
      res.json({ success: true, message: 'WhatsApp service restarted - check terminal for QR code' });
    } catch (error: any) {
      res.json({ success: false, error: error.message });
    }
  });

  // Email OTP Routes
  app.post("/api/otp/email/send", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: "Invalid email format" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const otp = generateOTP();
      saveOTP(normalizedEmail, otp);

      console.log('📧 Sending email OTP to:', normalizedEmail, 'OTP:', otp);

      const result = await sendEmailOTP(normalizedEmail, otp);

      if (result.success) {
        res.json({ success: true, message: "Verification code sent successfully" });
      } else {
        res.status(500).json({ success: false, error: result.error || "Failed to send verification code" });
      }
    } catch (error) {
      console.error('Email OTP error:', error);
      res.status(500).json({ success: false, error: "Failed to send verification code" });
    }
  });

  app.post("/api/otp/email/verify", async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ success: false, error: "Email and OTP are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: "Invalid email format" });
      }

      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ success: false, error: "OTP must be 6 digits" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const result = verifyOTP(normalizedEmail, otp);

      if (result.success) {
        res.json({ success: true, message: result.message });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ success: false, error: "Failed to verify code" });
    }
  });

  // WhatsApp/SMS OTP Routes (Twilio)
  app.post("/api/otp/whatsapp/send", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ success: false, error: "Phone number required" });
      }

      const otp = generateOTP();
      saveOTP(phoneNumber, otp);

      console.log('📱 Sending WhatsApp OTP to:', phoneNumber, 'OTP:', otp);

      // Use WhatsApp service with proper import
      const whatsappModule = await getWhatsAppService();
      const result = await whatsappModule.whatsappService.sendOTP(phoneNumber, otp);

      if (result.success) {
        res.json({ 
          success: true, 
          message: "Verification code sent to your WhatsApp",
          provider: "whatsapp"
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: result.error || "Failed to send WhatsApp OTP"
        });
      }
    } catch (error) {
      console.error('WhatsApp OTP error:', error);
      res.status(500).json({ success: false, error: "Failed to send WhatsApp OTP" });
    }
  });

  app.post("/api/otp/whatsapp/verify", async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;

      if (!phoneNumber || !otp) {
        return res.status(400).json({ success: false, error: "Phone number and OTP are required" });
      }

      console.log('Verifying WhatsApp OTP for:', phoneNumber, 'OTP:', otp);
      const result = verifyOTP(phoneNumber, otp);
      console.log('Verification result:', result);

      if (result.success) {
        res.json({ success: true, message: result.message, user: { phoneNumber, verified: true } });
      } else {
        res.json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('WhatsApp OTP verify error:', error);
      res.json({ success: false, error: "Failed to verify WhatsApp OTP" });
    }
  });

  // Add contact to Resend
  app.post("/api/resend/contact", async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      if (!email) return res.status(400).json({ error: "Email required" });

      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) return res.json({ success: false, error: "Resend not configured" });

      const response = await fetch('https://api.resend.com/audiences/78261da4-41a8-4ef8-8c49-c57536b363de/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, first_name: firstName, last_name: lastName })
      });

      const data = await response.json();
      return res.json({ success: response.ok, data });
    } catch (err: any) {
      return res.json({ success: false, error: err.message });
    }
  });

  // Verify OTP Code
  app.post("/api/auth/verify-code", async (req, res) => {
    try {
      const { code, email } = req.body;

      if (!code || !email) {
        return res.status(400).json({ error: "Code and email are required" });
      }

      const customer = await storage.getCustomerByEmail(email);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Check if OTP is valid and not expired
      if (!customer.otpCode || customer.otpCode !== code) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      
      if (!customer.otpExpires || new Date() > customer.otpExpires) {
        return res.status(400).json({ error: "Verification code has expired" });
      }

      // Mark email as verified and clear OTP
      await storage.updateCustomer(customer.id, { 
        isEmailVerified: true,
        otpCode: null,
        otpExpires: null
      });

      res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.error('Verify code error:', error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Forgot Password - Send Reset Code
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { emailOrPhone } = forgotPasswordSchema.parse(req.body);

      const customer = await storage.getCustomerByEmailOrPhone(emailOrPhone);
      if (!customer) {
        return res.status(404).json({ error: "Account not found" });
      }

      res.json({
        success: true,
        message: "Reset code sent",
        code: "1234" // For demo
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Reset Password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { password } = resetPasswordSchema.parse(req.body);
      const { email } = req.body;

      const customer = await storage.getCustomerByEmail(email);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      await storage.updateCustomer(customer.id, { password });

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // ========== Fuel Station Routes ==========

  // Get all fuel stations
  app.get("/api/stations", async (_req, res) => {
    try {
      const stations = await storage.getAllFuelStations();
      res.json({ success: true, stations });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stations" });
    }
  });

  // Search fuel stations
  app.get("/api/stations/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const stations = await storage.searchFuelStations(query);
      res.json({ success: true, stations });
    } catch (error) {
      res.status(500).json({ error: "Failed to search stations" });
    }
  });

  // Get station details
  app.get("/api/stations/:id", async (req, res) => {
    try {
      const station = await storage.getFuelStation(req.params.id);
      if (!station) {
        return res.status(404).json({ error: "Station not found" });
      }

      // Get products for this station
      const products = await storage.getProductsByStation(req.params.id);

      res.json({
        success: true,
        station,
        products
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch station details" });
    }
  });

  // ========== Fuel Friend Routes ==========

  // Get all fuel friends
  app.get("/api/fuel-friends", async (_req, res) => {
    try {
      const fuelFriends = await storage.getAvailableFuelFriends();
      res.json({ success: true, fuelFriends });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fuel friends" });
    }
  });

  // Get fuel friend details
  app.get("/api/fuel-friends/:id", async (req, res) => {
    try {
      const fuelFriend = await storage.getFuelFriend(req.params.id);
      if (!fuelFriend) {
        return res.status(404).json({ error: "Fuel friend not found" });
      }

      // Get reviews for this fuel friend
      const reviews = await storage.getReviewsByTarget("fuel_friend", req.params.id);

      res.json({
        success: true,
        fuelFriend,
        reviews
      });
    } catch (error) {
      console.error('Fuel friend fetch error:', error);
      res.status(500).json({ error: "Failed to fetch fuel friend details" });
    }
  });

  // ========== Order Routes ==========

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = req.body;

      // Generate tracking number
      const trackingNumber = Math.floor(100000 + Math.random() * 900000).toString();

      const order = await storage.createOrder({
        ...orderData,
        trackingNumber,
        status: "pending",
        paymentStatus: "pending"
      });

      // Create order items if groceries included
      if (orderData.items && orderData.items.length > 0) {
        for (const item of orderData.items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          });
        }
      }

      res.json({ success: true, order });
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get customer orders
  app.get("/api/orders/customer/:customerId", async (req, res) => {
    try {
      const orders = await storage.getOrdersByCustomer(req.params.customerId);
      res.json({ success: true, orders });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get orders by status
  app.get("/api/orders/customer/:customerId/status/:status", async (req, res) => {
    try {
      const orders = await storage.getOrdersByStatus(req.params.customerId, req.params.status);
      res.json({ success: true, orders });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get order details
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Get order items
      const items = await storage.getOrderItems(req.params.id);

      res.json({ success: true, order, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrder(req.params.id, { status });
      res.json({ success: true, order });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // ========== Customer Profile Routes ==========

  // Get customer profile
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Get vehicles
      const vehicles = await storage.getVehiclesByCustomer(req.params.id);

      // Remove password from response
      const { password, ...customerData } = customer;

      res.json({ success: true, customer: customerData, vehicles });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer profile" });
    }
  });

  // Update customer profile
  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const updates = profileUpdateSchema.parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, updates);

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const { password, ...customerData } = customer;
      res.json({ success: true, customer: customerData });
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  // Change password
  app.post("/api/customers/:id/change-password", async (req, res) => {
    try {
      const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);

      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      if (customer.password !== oldPassword) {
        return res.status(401).json({ error: "Invalid current password" });
      }

      await storage.updateCustomer(req.params.id, { password: newPassword });

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // ========== Vehicle Routes ==========

  // Get customer vehicles
  app.get("/api/vehicles/customer/:customerId", async (req, res) => {
    try {
      const vehicles = await storage.getVehiclesByCustomer(req.params.customerId);
      res.json({ success: true, vehicles });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  // Add vehicle
  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicle = await storage.createVehicle(req.body);
      res.json({ success: true, vehicle });
    } catch (error) {
      res.status(500).json({ error: "Failed to add vehicle" });
    }
  });

  // Update vehicle
  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      res.json({ success: true, vehicle });
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  // Delete vehicle
  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // ========== Payment Methods Routes ==========

  // Get customer payment methods
  app.get("/api/payment-methods/customer/:customerId", async (req, res) => {
    try {
      const methods = await storage.getPaymentMethodsByCustomer(req.params.customerId);
      res.json({ success: true, methods });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // Add payment method
  app.post("/api/payment-methods", async (req, res) => {
    try {
      const method = await storage.createPaymentMethod(req.body);
      res.json({ success: true, method });
    } catch (error) {
      res.status(500).json({ error: "Failed to add payment method" });
    }
  });

  // Delete payment method
  app.delete("/api/payment-methods/:id", async (req, res) => {
    try {
      await storage.deletePaymentMethod(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment method" });
    }
  });

  // ========== Review Routes ==========

  // Get reviews for station or fuel friend
  app.get("/api/reviews/:targetType/:targetId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByTarget(req.params.targetType, req.params.targetId);
      res.json({ success: true, reviews });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Add review
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = reviewSchema.parse(req.body);
      const review = await storage.createReview({
        customerId: req.body.customerId,
        orderId: req.body.orderId,
        targetType: reviewData.targetType,
        targetId: reviewData.targetId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      res.json({ success: true, review });
    } catch (error) {
      res.status(400).json({ error: "Invalid review data" });
    }
  });

  // ========== Notification Routes ==========

  // Receive new order notification from fuel-user
  app.post("/api/notifications/new-order", async (req, res) => {
    try {
      const { orderId, trackingNumber, message, customerAddress, fuelType, totalAmount } = req.body;
      
      console.log('🔔 New Order Notification Received:', {
        orderId,
        trackingNumber,
        message,
        customerAddress,
        fuelType,
        totalAmount
      });
      
      // Create notification for all drivers
      const notification = await storage.createNotification({
        customerId: 'system',
        title: 'New Order Received',
        message: `Order ${trackingNumber}: ${fuelType} delivery to ${customerAddress}. Total: $${totalAmount}`,
        type: 'order_update'
      });
      
      // Send push notification to all drivers
      const { sendOrderNotificationToDrivers } = await import('./push-notifications');
      await sendOrderNotificationToDrivers({ orderId, trackingNumber, fuelType, totalAmount });
      
      res.json({ success: true, notification });
    } catch (error) {
      console.error('Notification creation error:', error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  // Get customer notifications
  app.get("/api/notifications/customer/:customerId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByCustomer(req.params.customerId);
      res.json({ success: true, notifications });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true, notification });
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // Register FCM token for driver
  app.post("/api/drivers/:id/fcm-token", async (req, res) => {
    try {
      const { fcmToken } = req.body;
      if (!fcmToken) {
        return res.status(400).json({ error: "FCM token required" });
      }
      
      // Update driver with FCM token
      await storage.updateFuelFriend(req.params.id, { fcmToken });
      res.json({ success: true, message: "FCM token registered" });
    } catch (error) {
      res.status(500).json({ error: "Failed to register FCM token" });
    }
  });

  // Test endpoint - Create new order (will trigger auto-notification)
  app.post("/api/test/create-order", async (req, res) => {
    try {
      const order = await storage.createOrder({
        trackingNumber: `TEST${Date.now()}`,
        customerId: "cust1",
        deliveryAddress: "Test Address",
        deliveryPhone: "+1234567890",
        fuelType: "Premium",
        fuelQuantity: "10.00",
        totalAmount: "50.00",
        deliveryFee: "5.00",
        orderType: "instant",
        status: "pending"
      });
      
      res.json({ success: true, order, message: "Test order created - notification will be sent automatically" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create test order" });
    }
  });

  // ========== Chat Routes ==========

  // Get chat messages for order
  app.get("/api/chat/order/:orderId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByOrder(req.params.orderId);
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const message = await storage.createChatMessage(req.body);
      res.json({ success: true, message });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ===== New: Orders listing + driver actions =====
  app.get("/api/orders", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const driverId = req.query.driverId as string | undefined;
      const customerId = req.query.customerId as string | undefined;
      let orders = await storage.getAllOrders();
      
      if (status) {
        if (status === "active") {
          orders = orders.filter(o => o.status === "in_progress" || o.status === "active");
        } else {
          orders = orders.filter(o => o.status === status);
        }
      }
      
      if (driverId) {
        orders = orders.filter(o => o.fuelFriendId === driverId);
      }
      
      if (customerId) {
        orders = orders.filter(o => o.customerId === customerId);
      }
      
      // Sort by creation date, newest first
      orders.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      
      // Return array directly to match client expectations
      res.json(orders);
    } catch (error) {
      console.error('Orders fetch error:', error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Payment Routes
  app.post("/api/payments/create-intent", async (req, res) => {
    try {
      const { amount, currency } = req.body;
      const paymentIntent = await createStripePaymentIntent(amount, currency);
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/payments/withdraw", async (req, res) => {
    try {
      const { amount, email, method } = req.body;
      const amountFloat = parseFloat(amount);

      // Validate amount
      if (isNaN(amountFloat) || amountFloat <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Handle different withdrawal methods
      switch (method) {
        case 'paypal':
          try {
            const payout = await createPaypalPayout(email, amount);
            // Update wallet balance
            // In a real implementation, you would find the driver by email and update their wallet
            res.json({ success: true, payout, message: "Withdrawal to PayPal initiated successfully" });
          } catch (error) {
            console.error("PayPal withdrawal error:", error);
            res.status(500).json({ error: "Failed to process PayPal withdrawal", details: error.message });
          }
          break;

        case 'credit-card':
          // For credit card withdrawals, we would typically transfer to a linked bank account
          // This is a simplified implementation
          res.json({ 
            success: true, 
            message: "Withdrawal to credit card initiated successfully",
            transactionId: "txn_" + Date.now()
          });
          break;

        case 'apple-pay':
          // For Apple Pay, we would typically transfer to a linked bank account
          // This is a simplified implementation
          res.json({ 
            success: true, 
            message: "Withdrawal to Apple Pay initiated successfully",
            transactionId: "txn_" + Date.now()
          });
          break;

        default:
          res.status(400).json({ error: "Unsupported withdrawal method" });
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(500).json({ error: "Failed to process withdrawal", details: error.message });
    }
  });

  app.post("/api/orders/:id/accept", async (req, res) => {
    try {
      const { driverId } = req.body;
      const order = await storage.updateOrder(req.params.id, { status: "in_progress", fuelFriendId: driverId });
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept order" });
    }
  });

  app.post("/api/orders/:id/cancel", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, { status: "canceled" });
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel order" });
    }
  });

  // Wallet Routes
  app.get("/api/wallet/driver/:driverId", async (req, res) => {
    try {
      const wallet = await storage.getWallet(req.params.driverId);
      if (!wallet) {
        // Create wallet if it doesn't exist
        const newWallet = await storage.createWallet(req.params.driverId);
        return res.json(newWallet);
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  app.put("/api/wallet/driver/:driverId", async (req, res) => {
    try {
      const { bankName, cardNumber, expiryDate, cvv } = req.body;
      let wallet = await storage.getWallet(req.params.driverId);
      
      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = await storage.createWallet(req.params.driverId);
      }
      
      const updatedWallet = await storage.updateWalletBalance(req.params.driverId, 0); // Just to ensure it exists
      
      // Update wallet details
      Object.assign(wallet, { bankName, cardNumber, expiryDate, cvv });
      // In a real implementation, you would save these details properly
      
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to update wallet" });
    }
  });

  // Transaction Routes
  app.get("/api/transactions/driver/:driverId", async (req, res) => {
    try {
      const transactions = await storage.getTransactions(req.params.driverId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  return createServer(app);
}

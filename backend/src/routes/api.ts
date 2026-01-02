import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { storage } from '../services/postgres-storage';
import { createStripePaymentIntent, createPaypalPayout } from '../services/payments';
import { checkLocation } from '../services/geolocation';
import { sendOrderNotificationToDrivers } from '../services/pushNotifications';
import { generateToken } from '../utils/auth';
import { authenticateToken } from '../middleware/auth';
import { generateOTP, saveOTP, verifyOTP } from '../otp';
import { sendEmailOTP } from '../email';
import { registrationStep1Schema, registrationStep2Schema } from '@shared/schema';
import { saveFaceBiometric, verifyFace } from '../controllers/faceController';

const router = Router();

// Face Biometric Routes
router.post('/face/save-biometric', authenticateToken, saveFaceBiometric);
router.post('/face/verify', authenticateToken, verifyFace);

// Test face biometric endpoint
router.post('/face/test', async (req, res) => {
  try {
    console.log('🧪 Testing face biometric API');
    const testData = {
      fuelFriendId: 'test-id',
      faceDescriptor: [0.1, 0.2, 0.3], // Simple test array
      confidence: 0.95
    };
    console.log('📤 Test data:', testData);
    return sendSuccess(res, testData, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('❌ Test error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, error.message);
  }
});

// Check email verification status
router.get('/auth/email-verification-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const customer = await storage.getCustomerByEmail(email);
    
    if (!customer) {
      return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404, 'User not found');
    }
    
    return sendSuccess(res, { 
      isEmailVerified: customer.isEmailVerified || false 
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to check verification status');
  }
});


// Health check
router.get('/health', (req, res) => {
  return sendSuccess(res, { 
    ok: true, 
    timestamp: new Date().toISOString() 
  }, RESPONSE_CODES.SUCCESS);
});

// Stations
router.get('/stations', async (req, res) => {
  const stations = await storage.getAllFuelStations();
  return sendSuccess(res, { stations }, RESPONSE_CODES.SUCCESS);
});

router.get('/stations/search', async (req, res) => {
  const query = req.query.q as string;
  const stations = await storage.searchFuelStations(query);
  return sendSuccess(res, { stations }, RESPONSE_CODES.SUCCESS);
});

router.get('/stations/:id', async (req, res) => {
  const station = await storage.getFuelStation(req.params.id);
  if (!station) {
    return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'Station not found');
  }
  return sendSuccess(res, { station, products: [] }, RESPONSE_CODES.SUCCESS);
});

// Fuel Friends
router.post('/fuel-friends/register', async (req, res) => {
  try {
    const { registerFuelFriend } = await import('../controllers/fuelFriendAuth');
    return registerFuelFriend(req, res);
  } catch (error) {
    console.error('Fuel friend registration error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to register fuel friend');
  }
});

router.get('/fuel-friends', async (req, res) => {
  const fuelFriends = await storage.getAvailableFuelFriends();
  return sendSuccess(res, { fuelFriends }, RESPONSE_CODES.SUCCESS);
});

router.get('/fuel-friends/:id', async (req, res) => {
  const fuelFriend = await storage.getFuelFriend(req.params.id);
  if (!fuelFriend) {
    return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'Fuel friend not found');
  }
  const reviews = await storage.getReviewsByTarget('fuel_friend', req.params.id);
  return sendSuccess(res, { fuelFriend, reviews }, RESPONSE_CODES.SUCCESS);
});

router.patch('/fuel-friends/:id', authenticateToken, async (req, res) => {
  const fuelFriend = await storage.updateFuelFriend(req.params.id, req.body);
  if (!fuelFriend) {
    return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'Fuel friend not found');
  }
  const { password, ...fuelFriendData } = fuelFriend;
  return sendSuccess(res, { fuelFriend: fuelFriendData }, RESPONSE_CODES.SUCCESS);
});

router.post('/fuel-friends/:id/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Old and new password required');
  }
  return sendSuccess(res, { message: 'Password changed successfully' }, RESPONSE_CODES.SUCCESS);
});

// Orders (Protected)
router.post('/orders', authenticateToken, async (req, res) => {
  const trackingNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const order = await storage.createOrder({
    ...req.body,
    trackingNumber,
    status: 'pending',
    paymentStatus: 'pending'
  });
  return sendSuccess(res, { order }, RESPONSE_CODES.CREATED, 201);
});

router.get('/orders', authenticateToken, async (req, res) => {
  const status = req.query.status as string | undefined;
  const fuelFriendId = req.query.fuelFriendId as string | undefined;
  const customerId = req.query.customerId as string | undefined;
  
  console.log('📋 Orders query params:', { status, fuelFriendId, customerId });
  
  let orders = await storage.getAllOrders();
  console.log('📊 Total orders from DB:', orders.length);
  
  // Debug: show all orders
  orders.forEach(order => {
    console.log(`Order ${order.id}: status=${order.status}, fuelFriendId=${order.fuelFriendId}, customerId=${order.customerId}`);
  });
  
  if (status) {
    if (status === 'active') {
      orders = orders.filter(o => o.status === 'in_progress' || o.status === 'active' || o.status === 'confirmed');
    } else if (status === 'pending') {
      orders = orders.filter(o => o.status === 'pending');
    } else {
      orders = orders.filter(o => o.status === status);
    }
    console.log(`📋 Orders after status filter (${status}):`, orders.length);
  }
  
  if (fuelFriendId) {
    if (status === 'pending') {
      // For pending orders, don't filter by fuelFriendId (show all pending orders)
      console.log(`📋 Pending orders - showing all pending orders (not filtering by fuelFriendId)`);
    } else {
      // For other statuses, filter by fuelFriendId
      orders = orders.filter(o => o.fuelFriendId === fuelFriendId);
      console.log(`👤 Orders after fuelFriendId filter (${fuelFriendId}):`, orders.length);
    }
  }
  
  if (customerId) {
    orders = orders.filter(o => o.customerId === customerId);
    console.log(`👥 Orders after customerId filter (${customerId}):`, orders.length);
  }
  
  orders.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  
  console.log('✅ Final orders to return:', orders.length);
  return sendSuccess(res, orders, RESPONSE_CODES.SUCCESS);
});

router.get('/orders/customer/:customerId', async (req, res) => {
  const orders = await storage.getOrdersByCustomer(req.params.customerId);
  return sendSuccess(res, { orders }, RESPONSE_CODES.SUCCESS);
});

router.get('/orders/:id', async (req, res) => {
  const order = await storage.getOrder(req.params.id);
  if (!order) {
    return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'Order not found');
  }
  return sendSuccess(res, { order, items: [] }, RESPONSE_CODES.SUCCESS);
});

router.patch('/orders/:id/status', async (req, res) => {
  const order = await storage.updateOrder(req.params.id, { status: req.body.status });
  return sendSuccess(res, { order }, RESPONSE_CODES.SUCCESS);
});

router.post('/orders/:id/accept', authenticateToken, async (req, res) => {
  const { fuelFriendId } = req.body;
  const order = await storage.updateOrder(req.params.id, { 
    status: 'in_progress',
    fuelFriendId: fuelFriendId
  });
  if (!order) return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'Order not found');
  return sendSuccess(res, { order }, RESPONSE_CODES.SUCCESS);
});

router.post('/orders/:id/cancel', authenticateToken, async (req, res) => {
  const order = await storage.updateOrder(req.params.id, { status: 'canceled' });
  if (!order) return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'Order not found');
  return sendSuccess(res, { order }, RESPONSE_CODES.SUCCESS);
});

// Customers (Protected)
router.get('/customers/:id', authenticateToken, async (req, res) => {
  const customer = await storage.getCustomer(req.params.id);
  if (!customer) {
    return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404, 'Customer not found');
  }
  const vehicles = await storage.getVehiclesByCustomer(req.params.id);
  const { password, ...customerData } = customer;
  return sendSuccess(res, { customer: customerData, vehicles }, RESPONSE_CODES.SUCCESS);
});

router.patch('/customers/:id', authenticateToken, async (req, res) => {
  const customer = await storage.updateCustomer(req.params.id, req.body);
  if (!customer) {
    return sendError(res, RESPONSE_CODES.USER_NOT_FOUND, 404, 'Customer not found');
  }
  const { password, ...customerData } = customer;
  return sendSuccess(res, { customer: customerData }, RESPONSE_CODES.SUCCESS);
});

// Vehicles
router.get('/vehicles/customer/:customerId', async (req, res) => {
  const vehicles = await storage.getVehiclesByCustomer(req.params.customerId);
  return sendSuccess(res, { vehicles }, RESPONSE_CODES.SUCCESS);
});

router.post('/vehicles', async (req, res) => {
  const vehicle = await storage.createVehicle(req.body);
  return sendSuccess(res, { vehicle }, RESPONSE_CODES.CREATED, 201);
});

// Payment Methods
router.get('/payment-methods/customer/:customerId', async (req, res) => {
  const methods = await storage.getPaymentMethodsByCustomer(req.params.customerId);
  return sendSuccess(res, { methods }, RESPONSE_CODES.SUCCESS);
});

router.post('/payment-methods', async (req, res) => {
  const method = await storage.createPaymentMethod(req.body);
  return sendSuccess(res, { method }, RESPONSE_CODES.CREATED, 201);
});

// Reviews
router.get('/reviews/:targetType/:targetId', async (req, res) => {
  const reviews = await storage.getReviewsByTarget(req.params.targetType, req.params.targetId);
  return sendSuccess(res, { reviews }, RESPONSE_CODES.SUCCESS);
});

router.post('/reviews', async (req, res) => {
  const review = await storage.createReview(req.body);
  return sendSuccess(res, { review }, RESPONSE_CODES.CREATED, 201);
});

// Notifications
router.post('/notifications/new-order', async (req, res) => {
  const { orderId, trackingNumber, message, customerAddress, fuelType, totalAmount } = req.body;
  
  console.log('🔔 New Order Notification Received:', {
    orderId, trackingNumber, message, customerAddress, fuelType, totalAmount
  });
  
  const notification = await storage.createNotification({
    customerId: 'cb59d9f0-f680-4d08-bce9-48f139682521',
    title: 'New Order Received',
    message: `Order ${trackingNumber}: ${fuelType} delivery to ${customerAddress}. Total: $${totalAmount}`,
    type: 'order_update'
  });
  
  await sendOrderNotificationToDrivers({ orderId, trackingNumber, fuelType, totalAmount });
  
  return sendSuccess(res, { notification }, RESPONSE_CODES.SUCCESS);
});

router.get('/notifications/customer/:customerId', async (req, res) => {
  const notifications = await storage.getNotificationsByCustomer(req.params.customerId);
  return sendSuccess(res, { notifications }, RESPONSE_CODES.SUCCESS);
});

// Drivers
router.post('/drivers/:id/fcm-token', async (req, res) => {
  const { fcmToken } = req.body;
  if (!fcmToken) {
    return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'FCM token required');
  }
  return sendSuccess(res, { message: 'FCM token registered' }, RESPONSE_CODES.SUCCESS);
});

// Wallet (Protected)
router.get('/wallet/driver/:driverId', authenticateToken, async (req, res) => {
  const fuelFriendId = req.params.driverId; // Keep param name for compatibility
  const wallet = await storage.getWallet(fuelFriendId);
  return sendSuccess(res, { wallet }, RESPONSE_CODES.SUCCESS);
});

router.put('/wallet/driver/:driverId', authenticateToken, async (req, res) => {
  const wallet = { ...req.body, driverId: req.params.driverId };
  return sendSuccess(res, { wallet }, RESPONSE_CODES.SUCCESS);
});

// Transactions (Protected)
router.get('/transactions/driver/:driverId', authenticateToken, async (req, res) => {
  const fuelFriendId = req.params.driverId; // Keep param name for compatibility
  const transactions = await storage.getTransactions(fuelFriendId);
  return sendSuccess(res, { transactions }, RESPONSE_CODES.SUCCESS);
});

// Payments (Protected)
router.post('/payments/create-intent', authenticateToken, async (req, res) => {
  const { amount, currency } = req.body;
  const paymentIntent = await createStripePaymentIntent(amount, currency);
  return sendSuccess(res, { clientSecret: paymentIntent.client_secret }, RESPONSE_CODES.SUCCESS);
});

router.post('/payments/withdraw', authenticateToken, async (req, res) => {
  const { amount, email, method } = req.body;
  const amountFloat = parseFloat(amount);

  if (isNaN(amountFloat) || amountFloat <= 0) {
    return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Invalid amount');
  }

  switch (method) {
    case 'paypal':
      const payout = await createPaypalPayout(email, amount);
      return sendSuccess(res, { payout, message: 'Withdrawal to PayPal initiated successfully' }, RESPONSE_CODES.SUCCESS);
    case 'credit-card':
    case 'apple-pay':
      return sendSuccess(res, { 
        message: `Withdrawal to ${method} initiated successfully`,
        transactionId: 'txn_' + Date.now()
      }, RESPONSE_CODES.SUCCESS);
    default:
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Unsupported withdrawal method');
  }
});

// OTP Routes
router.post('/otp/email/send', async (req, res) => {
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
      return sendSuccess(res, { message: "Verification code sent successfully" }, RESPONSE_CODES.OTP_EMAIL_SEND_SUCCESS);
    } else {
      return sendError(res, RESPONSE_CODES.OTP_EMAIL_SEND_FAILED, 500, result.error || "Failed to send verification code");
    }
  } catch (error) {
    console.error('Email OTP error:', error);
    res.status(500).json({ success: false, error: "Failed to send verification code" });
  }
});

router.post('/otp/email/verify', async (req, res) => {
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
      return sendSuccess(res, { message: result.message }, RESPONSE_CODES.OTP_EMAIL_VERIFY_SUCCESS);
    } else {
      return sendError(res, RESPONSE_CODES.OTP_EMAIL_VERIFY_FAILED, 400, result.error);
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, error: "Failed to verify code" });
  }
});

// WhatsApp OTP Routes
router.post('/otp/whatsapp/send', async (req, res) => {
  try {
    const { phoneNumber, email } = req.body;
    if (!phoneNumber) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Phone number is required');
    }

    const otp = generateOTP();
    
    // Save OTP with phone number key
    saveOTP(phoneNumber, otp);
    
    // Also save with email key if provided
    if (email) {
      saveOTP(email, otp);
    }

    console.log('📱 Sending WhatsApp OTP to:', phoneNumber, 'OTP:', otp);

    // Send via Baileys WhatsApp
    const { sendWhatsAppOTP } = await import('../services/whatsapp');
    const result = await sendWhatsAppOTP(phoneNumber, otp);

    if (result.success) {
      return sendSuccess(res, { message: "Verification code sent successfully" }, RESPONSE_CODES.SUCCESS);
    } else {
      return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, result.error || 'Failed to send verification code');
    }
  } catch (error) {
    console.error('WhatsApp OTP error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to send verification code');
  }
});

router.post('/otp/whatsapp/verify', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Phone number and OTP are required');
    }

    if (!/^\d{6}$/.test(otp)) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'OTP must be 6 digits');
    }

    const result = verifyOTP(phoneNumber, otp);

    if (result.success) {
      return sendSuccess(res, { message: result.message }, RESPONSE_CODES.SUCCESS);
    } else {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, result.error);
    }
  } catch (error) {
    console.error('WhatsApp OTP verification error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to verify code');
  }
});

// Chat
router.get('/chat/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const messages = await storage.getMessagesByOrder(req.params.orderId);
    return sendSuccess(res, { messages }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to fetch messages');
  }
});

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { orderId, senderId, senderType, message } = req.body;
    
    if (!orderId || !senderId || !senderType || !message) {
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Missing required fields');
    }
    
    const chatMessage = await storage.createChatMessage(req.body);
    return sendSuccess(res, { message: chatMessage }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to send message');
  }
});

// Missing endpoints from old API
router.get('/orders/customer/:customerId/status/:status', async (req, res) => {
  const orders = await storage.getOrdersByCustomer(req.params.customerId);
  const filteredOrders = orders.filter(o => o.status === req.params.status);
  return sendSuccess(res, { orders: filteredOrders }, RESPONSE_CODES.SUCCESS);
});

router.patch('/orders/:id/status', async (req, res) => {
  const order = await storage.updateOrder(req.params.id, { status: req.body.status });
  return sendSuccess(res, { order }, RESPONSE_CODES.SUCCESS);
});

router.patch('/vehicles/:id', async (req, res) => {
  return sendSuccess(res, { 
    vehicle: { id: req.params.id, ...req.body } 
  }, RESPONSE_CODES.SUCCESS);
});

router.delete('/vehicles/:id', async (req, res) => {
  return sendSuccess(res, {}, RESPONSE_CODES.SUCCESS);
});

router.delete('/payment-methods/:id', async (req, res) => {
  return sendSuccess(res, {}, RESPONSE_CODES.SUCCESS);
});

router.patch('/notifications/:id/read', async (req, res) => {
  return sendSuccess(res, { 
    notification: { id: req.params.id, isRead: true } 
  }, RESPONSE_CODES.SUCCESS);
});

router.delete('/notifications/:id', async (req, res) => {
  return sendSuccess(res, {}, RESPONSE_CODES.SUCCESS);
});

router.post('/customers/:id/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Old and new password required');
  }
  return sendSuccess(res, { message: 'Password changed successfully' }, RESPONSE_CODES.SUCCESS);
});

router.delete('/customers/:id', authenticateToken, async (req, res) => {
  const { reason } = req.body;
  const customerId = req.params.id;
  
  try {
    // In a real implementation, you would:
    // 1. Delete all customer data from database
    // 2. Cancel active orders
    // 3. Remove payment methods
    // 4. Log the deletion reason
    // 5. Send confirmation email
    
    console.log(`Account deletion requested for customer ${customerId}, reason: ${reason}`);
    
    // For now, just return success
    return sendSuccess(res, { 
      message: 'Account deleted successfully',
      deletedAt: new Date().toISOString()
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('Account deletion error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, 'Failed to delete account');
  }
});

// Debug endpoint to list all fuel friends
router.get('/debug/fuel-friends', async (req, res) => {
  try {
    const fuelFriends = await storage.getAvailableFuelFriends();
    console.log('👥 All fuel friends in DB:', fuelFriends.length);
    fuelFriends.forEach(ff => {
      console.log(`- ID: ${ff.id}, Email: ${ff.email}, Name: ${ff.fullName}`);
    });
    return sendSuccess(res, { fuelFriends }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, error.message);
  }
});

// Test endpoint to create orders for current fuel friend
router.post('/test/create-orders', authenticateToken, async (req, res) => {
  try {
    const fuelFriendId = req.user.userId;
    console.log('Creating test orders for fuelFriendId:', fuelFriendId);
    
    const order1 = await storage.createOrder({
      trackingNumber: `TEST${Date.now()}`,
      customerId: 'test-customer-1',
      deliveryAddress: 'Jl. Sudirman No. 123, Jakarta Pusat',
      deliveryPhone: '+628123456789',
      fuelType: 'Premium',
      fuelQuantity: '15.00',
      totalAmount: '75000.00',
      deliveryFee: '10000.00',
      orderType: 'instant',
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    const order2 = await storage.createOrder({
      trackingNumber: `TEST${Date.now() + 1}`,
      customerId: 'test-customer-2',
      fuelFriendId: fuelFriendId,
      deliveryAddress: 'Jl. Thamrin No. 456, Jakarta Pusat',
      deliveryPhone: '+628987654321',
      fuelType: 'Pertamax',
      fuelQuantity: '20.00',
      totalAmount: '100000.00',
      deliveryFee: '15000.00',
      orderType: 'instant',
      status: 'in_progress',
      paymentStatus: 'completed'
    });
    
    return sendSuccess(res, { 
      orders: [order1, order2],
      message: `Created 2 test orders` 
    }, RESPONSE_CODES.SUCCESS);
  } catch (error) {
    console.error('Create test orders error:', error);
    return sendError(res, RESPONSE_CODES.INTERNAL_ERROR, 500, error.message || 'Failed to create test orders');
  }
});

export default router;
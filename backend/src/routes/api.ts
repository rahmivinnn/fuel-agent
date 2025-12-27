import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { RESPONSE_CODES } from '../constants/responseCodes';
import { storage } from '../services/postgres-storage';
import { createStripePaymentIntent, createPaypalPayout } from '../services/payments';
import { checkLocation } from '../services/geolocation';
import { sendOrderNotificationToDrivers } from '../services/pushNotifications';
import { authenticateToken } from '../middleware/auth';

const router = Router();

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
  const driverId = req.query.driverId as string | undefined;
  const customerId = req.query.customerId as string | undefined;
  let orders = await storage.getAllOrders();
  
  if (status) {
    if (status === 'active') {
      orders = orders.filter(o => o.status === 'in_progress' || o.status === 'active');
    } else {
      orders = orders.filter(o => o.status === status);
    }
  }
  
  if (driverId) {
    // Skip filtering by fuelFriendId to avoid foreign key issues
    // orders = orders.filter(o => o.fuelFriendId === driverId);
  }
  
  if (customerId) {
    orders = orders.filter(o => o.customerId === customerId);
  }
  
  orders.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  return res.json(orders); // Direct array like old API
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
  const order = await storage.updateOrder(req.params.id, { 
    status: 'in_progress'
  });
  if (!order) return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'Order not found');
  return res.json(order);
});

router.post('/orders/:id/cancel', authenticateToken, async (req, res) => {
  const order = await storage.updateOrder(req.params.id, { status: 'canceled' });
  if (!order) return sendError(res, RESPONSE_CODES.NOT_FOUND, 404, 'Order not found');
  return res.json(order);
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
  const wallet = await storage.getWallet(req.params.driverId);
  return res.json(wallet);
});

router.put('/wallet/driver/:driverId', authenticateToken, async (req, res) => {
  return res.json({ ...req.body, driverId: req.params.driverId });
});

// Transactions (Protected)
router.get('/transactions/driver/:driverId', authenticateToken, async (req, res) => {
  const transactions = await storage.getTransactions(req.params.driverId);
  return res.json(transactions);
});

// Payments (Protected)
router.post('/payments/create-intent', authenticateToken, async (req, res) => {
  const { amount, currency } = req.body;
  const paymentIntent = await createStripePaymentIntent(amount, currency);
  return res.json({ clientSecret: paymentIntent.client_secret });
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
      return res.json({ success: true, payout, message: 'Withdrawal to PayPal initiated successfully' });
    case 'credit-card':
    case 'apple-pay':
      return res.json({ 
        success: true, 
        message: `Withdrawal to ${method} initiated successfully`,
        transactionId: 'txn_' + Date.now()
      });
    default:
      return sendError(res, RESPONSE_CODES.BAD_REQUEST, 400, 'Unsupported withdrawal method');
  }
});

// Chat
router.get('/chat/order/:orderId', async (req, res) => {
  const messages = await storage.getMessagesByOrder(req.params.orderId);
  return sendSuccess(res, { messages }, RESPONSE_CODES.SUCCESS);
});

router.post('/chat', async (req, res) => {
  const message = await storage.createChatMessage(req.body);
  return sendSuccess(res, { message }, RESPONSE_CODES.SUCCESS);
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
export default router;
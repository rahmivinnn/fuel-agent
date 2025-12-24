import { storage } from './storage';
import { sendOrderNotificationToDrivers } from './push-notifications';

let lastCheckedTime = new Date();
let isMonitoring = false;

export async function startOrderMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  console.log('🔍 Starting order monitoring...');
  
  setInterval(async () => {
    try {
      const orders = await storage.getAllOrders();
      const newOrders = orders.filter(order => 
        order.status === 'pending' && 
        order.createdAt && 
        order.createdAt > lastCheckedTime
      );

      for (const order of newOrders) {
        console.log('🆕 New order detected:', order.trackingNumber);
        
        // Create notification
        await storage.createNotification({
          customerId: 'cb59d9f0-f680-4d08-bce9-48f139682521',
          title: 'New Order Available',
          message: `Order ${order.trackingNumber}: ${order.fuelType} delivery - $${order.totalAmount}`,
          type: 'order_update'
        });

        // Send push notification
        await sendOrderNotificationToDrivers({
          id: order.id,
          trackingNumber: order.trackingNumber,
          fuelType: order.fuelType || 'Fuel',
          totalAmount: order.totalAmount
        });
      }

      lastCheckedTime = new Date();
    } catch (error) {
      console.error('❌ Order monitoring error:', error);
    }
  }, 5000); // Check every 5 seconds
}

export function stopOrderMonitoring() {
  isMonitoring = false;
  console.log('⏹️ Order monitoring stopped');
}
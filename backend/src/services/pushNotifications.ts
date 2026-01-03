import admin from 'firebase-admin';
import { storage } from './postgres-storage';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../maviss-d4910-firebase-adminsdk-fbsvc-774e546855.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.warn('⚠️ Firebase Admin initialization failed:', error.message);
  }
}

export async function sendOrderNotificationToDrivers(orderData: {
  orderId: string;
  trackingNumber: string;
  fuelType: string;
  totalAmount: string;
}): Promise<void> {
  console.log('📱 Sending push notification to drivers:', orderData);
  
  try {
    // Get all available fuel friends
    const fuelFriends = await storage.getAvailableFuelFriends();
    
    if (fuelFriends.length === 0) {
      console.log('No available drivers to notify');
      return;
    }

    const notification = {
      title: 'New Order Available',
      body: `${orderData.fuelType} delivery - $${orderData.totalAmount}`,
    };

    const data = {
      orderId: orderData.orderId,
      trackingNumber: orderData.trackingNumber,
      type: 'new_order'
    };

    // Send to all available drivers
    const promises = fuelFriends.map(async (driver) => {
      if (driver.fcmToken) {
        try {
          await admin.messaging().send({
            token: driver.fcmToken,
            notification,
            data,
            android: {
              priority: 'high',
              notification: {
                sound: 'default',
                priority: 'high'
              }
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1
                }
              }
            }
          });
          console.log(`✅ Notification sent to driver ${driver.id}`);
        } catch (error) {
          console.error(`❌ Failed to send to driver ${driver.id}:`, error);
        }
      }
    });

    await Promise.all(promises);
    console.log('📱 Push notifications sent to all available drivers');
    
  } catch (error) {
    console.error('❌ Error sending push notifications:', error);
  }
}
import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to load service account from file
    const serviceAccountPath = path.join(process.cwd(), 'maviss-d4910-firebase-adminsdk-fbsvc-774e546855.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
    console.log('✅ Firebase Admin initialized with service account file');
  } catch (error) {
    console.warn('⚠️ Firebase Admin initialization failed:', error.message);
  }
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    if (!admin.apps.length) {
      console.log('📱 Firebase Admin not initialized, skipping push notification');
      return { success: false, error: 'Firebase not initialized' };
    }

    const message = {
      token: fcmToken,
      notification: { title, body },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'fuel_orders'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Push notification failed:', error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderNotificationToDrivers(orderData: any) {
  try {
    const drivers = await import('./storage').then(m => m.storage.getAvailableFuelFriends());
    
    const notifications = drivers.map(driver => {
      if (driver.fcmToken) {
        return sendPushNotification(
          driver.fcmToken,
          'New Order Available',
          `${orderData.fuelType} delivery - $${orderData.totalAmount}`,
          {
            orderId: orderData.id,
            type: 'new_order',
            trackingNumber: orderData.trackingNumber
          }
        );
      }
    }).filter(Boolean);

    await Promise.all(notifications);
    console.log(`📱 Sent notifications to ${notifications.length} drivers`);
  } catch (error) {
    console.error('Failed to send order notifications:', error);
  }
}
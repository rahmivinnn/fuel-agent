import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "maviss-d4910",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
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
    // Get all active driver FCM tokens from storage
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
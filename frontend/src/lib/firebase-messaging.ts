let firebaseApp: any = null;
let messaging: any = null;

const initFirebase = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const { initializeApp } = await import('firebase/app');
    const { getMessaging, getToken, onMessage } = await import('firebase/messaging');
    
    const firebaseConfig = {
      apiKey: "AIzaSyCiB32fHGkd2ZZsPq3SS5SeOtnuc1iNSgk",
      authDomain: "maviss-d4910.firebaseapp.com",
      projectId: "maviss-d4910",
      storageBucket: "maviss-d4910.firebasestorage.app",
      messagingSenderId: "1046154702406",
      appId: "1:1046154702406:android:b24dbac4652e3b3e132447"
    };

    firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);
    
    return { getToken, onMessage };
  } catch (error) {
    console.warn('Firebase not available:', error);
    return null;
  }
};

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function getFCMToken() {
  try {
    const firebase = await initFirebase();
    if (!firebase) return null;
    
    const token = await firebase.getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    
    if (token) {
      console.log('📱 FCM Token:', token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export function setupForegroundNotifications(onNotificationReceived: (payload: any) => void) {
  initFirebase().then(firebase => {
    if (!firebase) return;
    
    firebase.onMessage(messaging, (payload: any) => {
      console.log('📨 Foreground notification received:', payload);
      
      if (payload.notification) {
        new Notification(payload.notification.title || 'New Notification', {
          body: payload.notification.body,
          icon: '/fuel-friend-icon.svg',
          badge: '/fuel-friend-icon.svg'
        });
      }
      
      onNotificationReceived(payload);
    });
  });
}

export async function registerFCMToken(driverId: string) {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    const token = await getFCMToken();
    if (!token) return false;

    // Register token with server
    const response = await fetch(`/api/drivers/${driverId}/fcm-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fcmToken: token })
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to register FCM token:', error);
    return false;
  }
}
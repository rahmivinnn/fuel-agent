importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCiB32fHGkd2ZZsPq3SS5SeOtnuc1iNSgk",
  authDomain: "maviss-d4910.firebaseapp.com",
  projectId: "maviss-d4910",
  storageBucket: "maviss-d4910.firebasestorage.app",
  messagingSenderId: "1046154702406",
  appId: "1:1046154702406:android:b24dbac4652e3b3e132447"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background Message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Order';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new fuel delivery order',
    icon: '/fuel-friend-icon.svg',
    badge: '/fuel-friend-icon.svg',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View Order'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    const orderId = event.notification.data?.orderId;
    const url = orderId ? `/track-customer/${orderId}` : '/dashboard';
    
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
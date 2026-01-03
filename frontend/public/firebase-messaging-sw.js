// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCiB32fHGkd2ZZsPq3SS5SeOtnuc1iNSgk",
  authDomain: "maviss-d4910.firebaseapp.com",
  projectId: "maviss-d4910",
  storageBucket: "maviss-d4910.firebasestorage.app",
  messagingSenderId: "1046154702406",
  appId: "1:1046154702406:android:b24dbac4652e3b3e132447"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Order Available';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new fuel delivery request',
    icon: '/fuel-friend-icon.svg',
    badge: '/fuel-friend-icon.svg',
    tag: 'fuel-order',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Order'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Open the app to dashboard
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});
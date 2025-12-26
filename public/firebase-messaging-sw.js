/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCswW5tgT8-QRiYsTeesT3C-1-r4WbTJmk",
  authDomain: "bella-7d169.firebaseapp.com",
  projectId: "bella-7d169",
  storageBucket: "bella-7d169.firebasestorage.app",
  messagingSenderId: "209839715174",
  appId: "1:209839715174:web:d6d5b96ba0632313758ea7"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/BellaLogo.png', // Ensure this file exists in public folder
    badge: '/BellaLogo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

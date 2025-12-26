import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase';
import { getApiUrl } from '../config/api';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

export const NotificationService = {
  async requestPermissionAndRegister(type: 'user' | 'partner') {
    try {
      let token: string | undefined;

      if (Capacitor.isNativePlatform()) {
        // Native (Android/iOS) Logic
        const result = await FirebaseMessaging.requestPermissions();
        if (result.receive === 'granted') {
          const { token: nativeToken } = await FirebaseMessaging.getToken();
          token = nativeToken;
          console.log('Native FCM Token generated:', token);
        } else {
          console.log('Native notification permission denied');
          return null;
        }
      } else {
        // Web Logic
        if (!messaging) {
          console.warn('Firebase Messaging is not initialized');
          return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          if (!vapidKey) {
            console.warn('VITE_FIREBASE_VAPID_KEY is missing. Notifications will not work.');
            return null;
          }

          token = await getToken(messaging, {
            vapidKey: vapidKey
          });
          console.log('Web FCM Token generated:', token);
        } else {
          console.log('Web notification permission denied');
          return null;
        }
      }

      // Register Token with Backend (Common for both)
      if (token) {
        if (type === 'user') {
          const authToken = localStorage.getItem('token');
          if (authToken) {
            await fetch(getApiUrl('notifications/register-token'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ token })
            });
            console.log('User FCM token registered with backend');
          }
        } else {
          const partnerToken = localStorage.getItem('partnerToken');
          if (partnerToken) {
            await fetch(getApiUrl('notifications/partner/register-token'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${partnerToken}`
              },
              body: JSON.stringify({ token })
            });
            console.log('Partner FCM token registered with backend');
          }
        }
        return token;
      }

      return null;

    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  },

  async listenForMessages() {
    // Native Listeners
    if (Capacitor.isNativePlatform()) {
      await FirebaseMessaging.addListener('notificationReceived', (event) => {
        console.log('Native foreground message:', event);
        const { title, body } = event.notification || {};
        if (title || body) {
          toast(() => (
            <div>
              <b>{title}</b>
              <p>{body}</p>
            </div>
          ), { icon: '🔔', duration: 5000 });
        }
      });

      await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
        console.log('Native notification tapped:', event);
        // Handle navigation if needed
      });
      return;
    }

    // Web Listeners
    if (!messaging) return;

    // This handles messages when the app is in the foreground
    onMessage(messaging, (payload) => {
      console.log('Foreground message received: ', payload);
      const { title, body } = payload.notification || {};

      if (title || body) {
        toast(() => (
          <div>
            <b>{title}</b>
            <p>{body}</p>
          </div>
        ), {
          icon: '🔔',
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    });
  }
};

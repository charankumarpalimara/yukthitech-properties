import { messaging, getToken, onMessage, deleteToken } from '../lib/firebase';
import { API_URL } from './api';

export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.warn(
      'Messaging not initialized. Check browser support or connection (HTTPS/localhost).'
    );
    return null;
  }
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        'BEfjmhBFVXfJaG3HXSpq1CrAj_Y7TgY5o6PPdvO1VB8vLD9YNH_VzphoEqVPMdJsOq1vglrvHII4JKql0iJvBoo',
    });

    console.log('FCM TOKEN:', token);

    localStorage.setItem('fcmToken', token);

    // Save token to backend if user is logged in
    const jwtToken = localStorage.getItem('token');
    if (jwtToken && token) {
      await fetch(`${API_URL}/auth/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ fcmToken: token }),
      });
      console.log('FCM Token saved to backend');
    }

    return token;
  } catch (error) {
    console.log('Notification Permission Error:', error);
  }
};

export const firebaseOnMessage = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.warn('Messaging not initialized. Skipping foreground listener.');
      return;
    }
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export const removeFcmToken = async () => {
  if (!messaging) return;
  try {
    const currentToken = localStorage.getItem('fcmToken');
    if (currentToken) {
      await deleteToken(messaging);
      localStorage.removeItem('fcmToken');
      console.log('FCM Token deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting FCM token:', error);
  }
};

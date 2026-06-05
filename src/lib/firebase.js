import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, deleteToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBpKzT4vU8iVljA4NVxSgjd2i_6vwPkFRM',
  authDomain: 'yukthiproperties-de3b7.firebaseapp.com',
  projectId: 'yukthiproperties-de3b7',
  storageBucket: 'yukthiproperties-de3b7.firebasestorage.app',
  messagingSenderId: '4824101919',
  appId: '1:4824101919:web:03df9ec85fddc38814512a',
  measurementId: 'G-4QK6TND4JZ',
};

const app = initializeApp(firebaseConfig);

// Initialize messaging only if supported (requires HTTPS or localhost)
let messaging = null;
isSupported()
  .then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    } else {
      console.warn(
        'Firebase Messaging is not supported in this browser/context (requires HTTPS or localhost).'
      );
    }
  })
  .catch((err) => {
    console.error('Error checking messaging support:', err);
  });

export { messaging, getToken, onMessage, deleteToken };

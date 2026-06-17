importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBpKzT4vU8iVljA4NVxSgjd2i_6vwPkFRM",
  authDomain: "yukthiproperties-de3b7.firebaseapp.com",
  projectId: "yukthiproperties-de3b7",
  storageBucket: "yukthiproperties-de3b7.firebasestorage.app",
  messagingSenderId: "4824101919",
  appId: "1:4824101919:web:03df9ec85fddc38814512a",
  measurementId: "G-4QK6TND4JZ"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "Received background message ",
    payload
  );

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/logo192.png",
    }
  );
});
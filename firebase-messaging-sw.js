// firebase-messaging-sw.js
// Place this file in the SAME folder as your HTML files

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyABaQ_wM2mEVwOODBgA-BrjW3Ln7H3pxYk",
  authDomain: "habitflow-6ac79.firebaseapp.com",
  projectId: "habitflow-6ac79",
  storageBucket: "habitflow-6ac79.firebasestorage.app",
  messagingSenderId: "204090409716",
  appId: "1:204090409716:web:f8f9186910f183492254a1"
});

const messaging = firebase.messaging();

// Handle background messages (when browser tab is not active)
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title || 'HabitFlow Reminder', {
    body: body || "Don't forget your habit today!",
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'habitflow-reminder',
    requireInteraction: false,
    actions: [
      { action: 'open', title: '✅ Check In Now' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url.includes('habitflow-dashboard') && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow('./habitflow-dashboard.html');
      })
    );
  }
});

// Local reminder scheduling — checks every minute
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_REMINDERS') {
    const reminders = event.data.reminders;
    scheduleLocalReminders(reminders);
  }
});

let reminderInterval = null;

function scheduleLocalReminders(reminders) {
  if (reminderInterval) clearInterval(reminderInterval);
  reminderInterval = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    reminders.forEach(r => {
      if (r.time === currentTime) {
        self.registration.showNotification(`⏰ HabitFlow Reminder`, {
          body: `Time to complete: ${r.name}! Keep your streak alive 🔥`,
          icon: '/favicon.ico',
          tag: `reminder-${r.id}`,
          requireInteraction: true,
          actions: [
            { action: 'open', title: '✅ Check In' },
            { action: 'dismiss', title: 'Later' }
          ]
        });
      }
    });
  }, 60000); // check every minute
}

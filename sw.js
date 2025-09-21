// GloSpot Service Worker
const CACHE_NAME = 'glospot-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-384x384.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Push notifications for test reminders
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your daily fitness test!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Start Test',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('GloSpot', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline data function (local storage only)
async function syncOfflineData() {
  try {
    // Get offline data from localStorage
    const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
    
    if (offlineData.length > 0) {
      // Store data locally (no server sync needed)
      console.log('Offline data available:', offlineData.length, 'items');
      // In a frontend-only app, we just keep data in localStorage
    }
  } catch (error) {
    console.error('Error managing offline data:', error);
  }
}

// Helper functions for offline data management
async function getOfflineData() {
  // Get data from localStorage
  return JSON.parse(localStorage.getItem('offlineData') || '[]');
}

async function clearOfflineData() {
  // Clear data from localStorage
  localStorage.removeItem('offlineData');
  console.log('Offline data cleared');
}

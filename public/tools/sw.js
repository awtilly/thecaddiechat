var CACHE_NAME = 'tc-v3';
var PRECACHE_URLS = [
  '/tools/task-command.html',
  '/tools/manifest.json',
  '/tools/icon.svg',
  '/tools/icon-192.png',
  '/tools/icon-512.png',
  '/tools/icon-180.png'
];

// Install: pre-cache app shell
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches, claim clients
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: route requests to cache or network
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Never cache API calls (Anthropic, Firebase)
  if (url.indexOf('api.anthropic.com') !== -1 ||
      url.indexOf('firestore.googleapis.com') !== -1 ||
      url.indexOf('identitytoolkit.googleapis.com') !== -1 ||
      url.indexOf('securetoken.googleapis.com') !== -1) {
    return;
  }

  // Firebase SDK & Google Fonts: stale-while-revalidate
  if (url.indexOf('gstatic.com/firebasejs') !== -1 ||
      url.indexOf('fonts.googleapis.com') !== -1 ||
      url.indexOf('fonts.gstatic.com') !== -1) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          var fetched = fetch(event.request).then(function(response) {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(function() { return cached; });
          return cached || fetched;
        });
      })
    );
    return;
  }

  // App shell (navigation + same-origin): network-first for fresh updates, fall back to cache
  if (event.request.mode === 'navigate' || url.indexOf('/tools/') !== -1) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }
});

// Push notifications (for future FCM integration)
self.addEventListener('push', function(event) {
  var data = { title: 'Task Command', body: 'You have tasks that need attention' };
  if (event.data) {
    try { data = event.data.json(); } catch (e) { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Task Command', {
      body: data.body || '',
      icon: '/tools/icon-192.png',
      badge: '/tools/icon-192.png',
      tag: data.tag || 'tc-push',
      data: data
    })
  );
});

// Handle notification clicks — open the app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Focus existing window if open
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf('/tools/task-command') !== -1) {
          return clientList[i].focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow('/tools/task-command.html');
    })
  );
});

/**
 * Unified Service Worker for PWA and Firebase Cloud Messaging
 * All event handlers must be registered during initial script evaluation
 */

// PWA Cache Configuration - only list assets that exist in public/icons
const CACHE_NAME = "sahay-pwa-v1";
const PRECACHE_ASSETS = [
  "/manifest.json",
  "/firebase-messaging-sw.js",
  "/icons/icon-72.png",
  "/icons/icon-96.png",
  "/icons/icon-128.png",
  "/icons/icon-144.png",
  "/icons/icon-192.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png",
];

// Install event - cache PWA assets (skip failed URLs so one 404 doesn't break install)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => {
            /* skip missing assets */
          }),
        ),
      ).then(() => self.skipWaiting());
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - serve cached icons and PWA files
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) {
    return;
  }

  const url = new URL(event.request.url);
  const pathname = url.pathname;

  // ONLY check cache for icons and PWA files
  const isIconFile = pathname.startsWith("/icons/");
  const isPWAFile =
    pathname === "/manifest.json" || pathname === "/firebase-messaging-sw.js";

  if (!isIconFile && !isPWAFile) {
    // For everything else, just fetch from network (no caching)
    return;
  }

  // For icons and PWA files, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Only cache icons and PWA files
        if ((isIconFile || isPWAFile) && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      });
    }),
  );
});

// Message event - handle messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      }),
    );
  }

  // Handle foreground notification request from PWA
  // This ensures only one notification is shown when PWA is installed
  // and works for all app states (foreground, background, killed)
  if (event.data && event.data.type === "SHOW_FOREGROUND_NOTIFICATION") {
    const { payload } = event.data;
    event.waitUntil(
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || "/icons/icon-192.png",
        badge: payload.badge || "/icons/icon-72.png",
        tag: payload.tag || "default",
        data: payload.data || {},
        vibrate: [200, 100, 200],
        requireInteraction: false,
      }),
    );
  }
});

// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js",
);

// Firebase config (injected at build time or via postMessage)
const firebaseConfig = {
  apiKey: "__NEXT_PUBLIC_FIREBASE_API_KEY__",
  projectId: "__NEXT_PUBLIC_FIREBASE_PROJECT_ID__",
  messagingSenderId: "__NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__NEXT_PUBLIC_FIREBASE_APP_ID__",
};

// Extract notification data
const extractNotificationData = (payload) => {
  if (payload.notification) {
    return {
      title: payload.notification.title || "Sahay",
      body: payload.notification.body || "",
      data: payload.data || {},
    };
  }

  if (payload.data) {
    const data = payload.data;
    return {
      title: data["google.c.a.c_l"] || data.title || "Sahay",
      body: data.body || data.message || data.text || "",
      data: data,
    };
  }

  return {
    title: "Sahay",
    body: "",
    data: payload.data || {},
  };
};

// Initialize Firebase immediately (required for event handlers)
let messaging = null;
try {
  const hasValidConfig =
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("__VITE_") &&
    firebaseConfig.apiKey !== "";

  if (hasValidConfig && typeof firebase !== "undefined") {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    messaging = firebase.messaging();
  }
} catch (error) {
  if (error.code !== "app/duplicate-app") {
    console.error("[SW] Firebase init error:", error);
  } else {
    messaging = firebase.messaging();
  }
}

// Register background message handler (must be during initial evaluation)
// This handler MUST be registered during script evaluation for background notifications to work
// It will work even if Firebase is initialized later via postMessage
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    // Notify all clients about the notification
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "FIREBASE_NOTIFICATION",
          payload: payload,
        });
      });
    });

    // IMPORTANT: If the payload contains a 'notification' field, the browser/FCM SDK
    // will automatically display the notification. We should NOT show it again manually
    // to avoid duplicate notifications. Only show manually for data-only messages.
    if (payload.notification) {
      // Browser handles this automatically - do not show duplicate
      return;
    }

    // Data-only message - we need to show the notification manually
    const notificationData = extractNotificationData(payload);

    // Show notification - this works even when app is closed
    return self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
      tag: notificationData.data?.tag || "default",
      data: {
        url: notificationData.data?.url || "/",
        ...notificationData.data,
      },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    });
  });
} else {
  // Fallback: Register a push handler that will work even if Firebase isn't initialized yet
  // This ensures notifications work even if config injection fails
  self.addEventListener("push", (event) => {
    let data = {};

    try {
      data = event.data ? event.data.json() : {};
    } catch (e) {
      console.warn("[SW] Could not parse push data:", e);
    }

    // FCM payload: { notification: { title, body }, data: { ... } } or { data: { title, body, ... } }
    const title =
      data.notification?.title ||
      data.data?.title ||
      (typeof data.data?.["google.c.a.c_l"] === "string"
        ? data.data["google.c.a.c_l"]
        : null) ||
      "Notification";
    const body =
      data.notification?.body ||
      data.data?.body ||
      data.data?.message ||
      data.data?.text ||
      "";

    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-72.png",
        tag: data.data?.tag || "default",
        data: {
          url: data.data?.url || "/",
          ...data.data,
        },
        vibrate: [200, 100, 200],
      }),
    );
  });
}

// Register notification click handler (must be during initial evaluation)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Handle close action
  if (event.action === "close") {
    return;
  }

  // Get URL to open from notification data
  const notificationData = event.notification.data || {};
  const urlPath = notificationData.url || "/";

  // Construct full URL to open
  const urlToOpen = new URL(urlPath, self.location.origin).href;

  const openApp = async () => {
    try {
      const clientList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Try to find an existing window/tab with the app
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url);
          // Check if this client is from our app (same origin)
          if (clientUrl.origin === self.location.origin) {
            // Focus the window first
            const focusedClient = await client.focus();

            // If focus succeeded and navigate is available, navigate to target URL
            if (focusedClient && "navigate" in focusedClient) {
              // Compare pathnames to avoid unnecessary navigation
              const targetUrl = new URL(urlToOpen);
              const currentUrl = new URL(focusedClient.url);
              if (currentUrl.pathname !== targetUrl.pathname) {
                await focusedClient.navigate(urlToOpen);
              }
            }
            return; // Successfully focused existing window
          }
        } catch (clientError) {
          // Continue to next client if this one fails
          console.warn("[SW] Client focus/navigate error:", clientError);
        }
      }

      // No existing window found or all focus attempts failed
      // Open a new window - this handles app completely closed/terminated
      await clients.openWindow(urlToOpen);
    } catch (error) {
      console.error("[SW] Notification click error:", error);
      // Last resort fallback
      try {
        await clients.openWindow(urlToOpen);
      } catch (openError) {
        console.error("[SW] Failed to open window:", openError);
      }
    }
  };

  event.waitUntil(openApp());
});

// Listen for config from main app (fallback if build-time injection fails)
self.addEventListener("message", (event) => {
  if (event.data?.type === "FIREBASE_CONFIG") {
    try {
      if (typeof firebase !== "undefined") {
        if (firebase.apps.length === 0) {
          firebase.initializeApp(event.data.config);
        }

        // Get messaging instance and register handler if not already done
        if (!messaging) {
          messaging = firebase.messaging();

          // Register onBackgroundMessage handler now (if not already registered)
          messaging.onBackgroundMessage((payload) => {
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({
                  type: "FIREBASE_NOTIFICATION",
                  payload: payload,
                });
              });
            });

            // IMPORTANT: If the payload contains a 'notification' field, the browser/FCM SDK
            // will automatically display the notification. We should NOT show it again manually
            // to avoid duplicate notifications. Only show manually for data-only messages.
            if (payload.notification) {
              // Browser handles this automatically - do not show duplicate
              return;
            }

            // Data-only message - we need to show the notification manually
            const notificationData = extractNotificationData(payload);

            return self.registration.showNotification(notificationData.title, {
              body: notificationData.body,
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-72.png",
              tag: notificationData.data?.tag || "default",
              data: {
                url: notificationData.data?.url || "/",
                ...notificationData.data,
              },
              vibrate: [200, 100, 200],
            });
          });
        }
      }
    } catch (error) {
      if (error.code === "app/duplicate-app") {
        messaging = firebase.messaging();
      } else {
        console.error("[SW] Firebase initialization error:", error);
      }
    }
  }
});

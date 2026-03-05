import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging';

/**
 * Firebase configuration for Cloud Messaging only.
 * authDomain is required by the Installations API (used by FCM) - omit and 400 INVALID_ARGUMENT can occur.
 * Supports both Vite (VITE_*) and Next.js (NEXT_PUBLIC_*) env vars. Use literals so Next.js can inline at build.
 */
const rawApiKey =
  process.env.VITE_FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '';
const rawProjectId =
  process.env.VITE_FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '';
const rawSenderId =
  process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
  '';
const rawAppId = process.env.VITE_FIREBASE_APP_ID ?? process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '';
const rawAuthDomain =
  process.env.VITE_FIREBASE_AUTH_DOMAIN ?? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '';

const firebaseConfig = {
  apiKey: String(rawApiKey).trim(),
  projectId: String(rawProjectId).trim(),
  messagingSenderId: String(rawSenderId).trim(),
  appId: String(rawAppId).trim(),
  authDomain:
    String(rawAuthDomain).trim() ||
    (rawProjectId ? `${String(rawProjectId).trim()}.firebaseapp.com` : ''),
};

/** Firebase app instance */
let app: FirebaseApp | null = null;

/** Firebase messaging instance */
let messaging: Messaging | null = null;

/** Web appId must be like 1:123456789:web:abcdef (platform:senderId:web:hash) */
const VALID_APP_ID = /^\d+:\d+:web:[a-f0-9]+$/i;

let configInvalidWarned = false;

/**
 * Returns true if Firebase config is valid for FCM/Installations.
 * Invalid config causes "400 INVALID_ARGUMENT" from Create Installation.
 */
export const isFirebaseConfigValid = (): boolean => {
  const { apiKey, projectId, messagingSenderId, appId, authDomain } = firebaseConfig;
  if (!apiKey || !projectId || !messagingSenderId || !appId || !authDomain) return false;
  if (apiKey.includes('__VITE_') || apiKey.includes('NEXT_PUBLIC_')) return false;
  if (!VALID_APP_ID.test(appId)) return false;
  return true;
};

const warnInvalidConfig = (): void => {
  if (configInvalidWarned) return;
  configInvalidWarned = true;
  console.warn(
    '[Firebase] FCM skipped: invalid config. Check .env has NEXT_PUBLIC_FIREBASE_* set correctly. ' +
      'appId must look like 1:123456789:web:abcdef. Add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (e.g. your-project.firebaseapp.com) if missing.'
  );
};

/**
 * Initialize Firebase app
 * Only initializes once, returns existing instance if already initialized
 */
export const initializeFirebase = (): FirebaseApp => {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

/**
 * Send Firebase config to service worker
 * This allows the service worker to use environment variables instead of hardcoded values
 * This is a fallback if build-time injection fails
 */
const sendFirebaseConfigToServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Get all service worker registrations
    const registrations = await navigator.serviceWorker.getRegistrations();

    // Find the unified service worker (firebase-messaging-sw.js with root scope)
    const unifiedSW = registrations.find(
      reg =>
        reg.active?.scriptURL?.includes('firebase-messaging-sw.js') &&
        reg.scope === window.location.origin + '/'
    );

    // Fallback: use any root scope service worker
    const targetSW =
      unifiedSW ||
      registrations.find(reg => reg.scope === window.location.origin + '/') ||
      (await navigator.serviceWorker.ready);

    if (targetSW?.active) {
      targetSW.active.postMessage({
        type: 'FIREBASE_CONFIG',
        config: firebaseConfig,
      });
    } else {
      console.warn('[Firebase] No active service worker found to send config');
    }
  } catch (error) {
    console.warn('[Firebase] Could not send config to service worker:', error);
  }
};

/**
 * Get Firebase Messaging instance
 * Initializes Firebase if not already done. Returns null if config is invalid.
 */
export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  if (!isFirebaseConfigValid()) {
    return null;
  }

  if (!messaging) {
    const firebaseApp = initializeFirebase();
    messaging = getMessaging(firebaseApp);
    sendFirebaseConfigToServiceWorker();
  }

  return messaging;
};

/**
 * Get service worker registration for Firebase messaging
 * Uses the root scope service worker (PWA service worker) which is the recommended approach
 * @returns ServiceWorkerRegistration or null
 */
const getFirebaseMessagingServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // Wait for service workers to be registered (they register on window load)
    // Give it some time to ensure registration is complete
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get all registrations
    const registrations = await navigator.serviceWorker.getRegistrations();

    // Prefer the unified service worker (firebase-messaging-sw.js with root scope)
    // This is the service worker that handles both PWA and Firebase messaging
    let registration = registrations.find(
      reg =>
        reg.active?.scriptURL?.includes('firebase-messaging-sw.js') &&
        reg.scope === window.location.origin + '/'
    );

    // Fallback: use any root scope service worker (recommended by Firebase)
    if (!registration) {
      registration = registrations.find(reg => reg.scope === window.location.origin + '/');
    }

    // If root scope not found, try to find any active service worker
    if (!registration) {
      registration = registrations.find(reg => reg.active);
    }

    // If still not found, try to get the ready one
    if (!registration) {
      try {
        registration = await navigator.serviceWorker.ready;
      } catch (readyError) {
        console.warn('[Firebase] Service worker not ready:', readyError);
      }
    }

    // Wait for service worker to be active
    if (registration) {
      if (registration.installing) {
        await new Promise<void>(resolve => {
          const worker = registration!.installing!;
          const timeout = setTimeout(() => resolve(), 5000);
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') {
              clearTimeout(timeout);
              resolve();
            }
          });
        });
      }

      // Ensure we have an active worker
      if (registration.active) {
        return registration;
      }

      // Wait a bit more if not active yet
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (registration.active) {
        return registration;
      }
    }

    console.warn('[Firebase] No suitable service worker found');
    return null;
  } catch (error) {
    console.error('[Firebase] Error getting service worker:', error);
    return null;
  }
};

/**
 * Get FCM token when notification permission is already granted.
 * Use this to register the token with your backend without prompting the user.
 * @returns FCM token string or null if permission not granted / error
 */
export const getFCMTokenIfGranted = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  if (!isNotificationSupported()) {
    if (typeof window !== 'undefined')
      console.warn('[FCM] Not supported (no Notification/serviceWorker/PushManager)');
    return null;
  }
  if (Notification.permission !== 'granted') {
    if (typeof window !== 'undefined')
      console.warn('[FCM] Permission not granted:', Notification.permission);
    return null;
  }
  if (!isFirebaseConfigValid()) {
    warnInvalidConfig();
    return null;
  }
  try {
    const firebaseMessaging = getFirebaseMessaging();
    if (!firebaseMessaging) {
      console.warn('[FCM] getFirebaseMessaging() returned null');
      return null;
    }

    const registration = await getFirebaseMessagingServiceWorker();
    if (!registration) {
      console.warn('[FCM] No service worker registration found');
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const vapidKey =
      process.env.VITE_FIREBASE_VAPID_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const token = await getToken(firebaseMessaging, {
      vapidKey: vapidKey ?? undefined,
      serviceWorkerRegistration: registration,
    });
    const result = token ?? null;
    if (result && typeof window !== 'undefined') {
      console.log("=== FCM TOKEN (copy for testing) ===", result);
      console.log('[FCM] Token obtained:', result);
    }
    return result;
  } catch (error) {
    console.error('[Firebase] getFCMTokenIfGranted:', error);
    return null;
  }
};

/**
 * Request permission and get FCM token
 * @returns FCM token string or null if permission denied/error
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return null;
    }

    const firebaseMessaging = getFirebaseMessaging();
    if (!firebaseMessaging) {
      return null;
    }

    // Get the Firebase messaging service worker registration
    const registration = await getFirebaseMessagingServiceWorker();

    if (!registration) {
      return null;
    }

    // Wait a bit to ensure service worker is fully ready
    await new Promise(resolve => setTimeout(resolve, 500));

    const vapidKey =
      process.env.VITE_FIREBASE_VAPID_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const token = await getToken(firebaseMessaging, {
      vapidKey: vapidKey ?? undefined,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await registerFCMTokenWithBackend(token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Subscribe to foreground messages
 * @param callback - Function to handle incoming messages
 * @returns Unsubscribe function
 */
export const onForegroundMessage = (callback: (payload: MessagePayload) => void): (() => void) => {
  const firebaseMessaging = getFirebaseMessaging();

  if (!firebaseMessaging) {
    return () => {};
  }

  return onMessage(firebaseMessaging, payload => {
    callback(payload);
  });
};

/**
 * Check if notifications are supported in current environment
 */
export const isNotificationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

/**
 * Get current notification permission status
 */
export const getNotificationPermissionStatus = (): NotificationPermission | null => {
  if (!isNotificationSupported()) {
    return null;
  }
  return Notification.permission;
};

/**
 * Subscribe this device's FCM token to the given topics (via backend Firebase Admin).
 * Call after saving the token so the user receives topic-based push notifications.
 */
export async function subscribeToTopicsInBackend(
  token: string,
  topics: string[]
): Promise<{ subscribed: string[]; failed: string[] }> {
  if (typeof window === 'undefined' || topics.length === 0) {
    return { subscribed: [], failed: [] };
  }
  try {
    const res = await fetch('/api/notifications/subscribe-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, topics }),
    });
    const data = await res.json();
    if (!res.ok) return { subscribed: [], failed: [...topics] };
    return {
      subscribed: data.subscribed ?? [],
      failed: data.failed ?? [],
    };
  } catch {
    return { subscribed: [], failed: [...topics] };
  }
}

// Re-export topic helpers from shared lib (used by client and server)
export { getInitialTopicsForUser, getModuleTopicsForUser } from '@/lib/notification-topics';

/**
 * Save FCM token to the backend (MongoDB). Call after getFCMTokenIfGranted() or
 * requestNotificationPermission() so the server can send push notifications to this device.
 */
export async function registerFCMTokenWithBackend(
  token: string,
  options?: { platform?: string; deviceInfo?: Record<string, string> }
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const platform = options?.platform ?? 'web';
    const deviceInfo =
      options?.deviceInfo ??
      ({
        userAgent: navigator.userAgent,
        platform:
          (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData
            ?.platform ?? '',
      } as Record<string, string>);

    const res = await fetch('/api/notifications/fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, platform, deviceInfo }),
    });
    if (res.ok) {
      console.log('[FCM] Token saved to backend successfully');
      return true;
    }
    const text = await res.text();
    console.warn('[FCM] Backend rejected token:', res.status, text || res.statusText);
    return false;
  } catch (err) {
    console.error('[FCM] Failed to register token with backend:', err);
    return false;
  }
}

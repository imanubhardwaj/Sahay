"use client";

import { useEffect, useRef } from "react";
import {
  getFCMTokenIfGranted,
  isNotificationSupported,
  registerFCMTokenWithBackend,
  subscribeToTopicsInBackend,
  getInitialTopicsForUser,
} from "@/config/firebase";

const FCM_SW_URL = "/firebase-messaging-sw.js";
const FCM_SW_SCOPE = "/";

/**
 * Register the FCM service worker if not already registered. Must be called before getToken.
 * Returns the registration once the SW is active (or null).
 */
async function ensureServiceWorkerRegistered(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistrations();
    let reg = existing.find(
      (r) => r.scope === window.location.origin + "/" && r.active?.scriptURL?.includes("firebase-messaging-sw.js")
    );
    if (!reg) {
      reg = await navigator.serviceWorker.register(FCM_SW_URL, { scope: FCM_SW_SCOPE });
      console.log("[FCM] Service worker registered");
    }
    if (reg.installing) {
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, 8000);
        reg!.installing!.addEventListener("statechange", () => {
          if (reg!.installing?.state === "activated" || reg!.waiting || reg!.active) {
            clearTimeout(t);
            resolve();
          }
        });
      });
    }
    if (reg.waiting && !reg.active) {
      await new Promise((r) => setTimeout(r, 500));
    }
    await navigator.serviceWorker.ready;
    return reg;
  } catch (e) {
    console.warn("[FCM] Service worker registration failed:", e);
    return null;
  }
}

/**
 * When user is logged in and notification permission is already granted:
 * registers FCM token in DB and subscribes to role-based topics (creators, organizations, gigs, etc.).
 */
export default function FCMTokenInitializer() {
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !isNotificationSupported()) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        await ensureServiceWorkerRegistered();
        if (cancelled) return;

        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        const meData = await meRes.json();
        if (!meData?.success || !meData?.user?.id) {
          if (typeof window !== "undefined") console.log("[FCM] User not logged in or /api/auth/me failed, skipping token registration");
          return;
        }

        const token = await getFCMTokenIfGranted();
        if (cancelled || !token) {
          if (!token && !cancelled) console.log('[FCM] No token (permission/config/SW or not granted)');
          return;
        }

        // Copy this token for testing (e.g. Firebase Console, Postman)
        console.log("=== FCM TOKEN (copy for testing) ===", token);
        console.log("[FCM] Token for DB:", token);
        const alreadyRegistered = registeredTokenRef.current === token;
        if (!alreadyRegistered) {
          const ok = await registerFCMTokenWithBackend(token);
          if (ok) {
            registeredTokenRef.current = token;
          } else {
            console.warn('[FCM] registerFCMTokenWithBackend returned false');
          }
        }

        const { id, role, organizationId } = meData.user;
        const topics = getInitialTopicsForUser({
          role: role ?? "student",
          userId: id,
          organizationId: organizationId ?? null,
        });
        if (topics.length > 0) {
          await subscribeToTopicsInBackend(token, topics);
        }
      } catch {
        // Ignore errors (e.g. not configured, no permission)
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "FIREBASE_NOTIFICATION") {
        console.log("[FCM] Notification received (from service worker):", event.data?.payload ?? event.data);
        // Native notification is shown by service worker; no extra UI needed
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}

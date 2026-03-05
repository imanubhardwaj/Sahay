'use client';

import { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  subscribeToTopicsInBackend,
  getInitialTopicsForUser,
} from '@/config/firebase';

const DISMISSED_KEY = 'notification_prompt_dismissed';

/**
 * Shows a single notification permission prompt when user is signed in on any route.
 * On Allow: requests permission → saves FCM token to DB → subscribes to role-based topics.
 * Does not render if permission already granted or denied/dismissed this session.
 */
export default function NotificationPermissionBanner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    if (!isNotificationSupported()) {
      setShow(false);
      return;
    }

    const dismissed = sessionStorage.getItem(DISMISSED_KEY) === '1';
    if (dismissed) {
      setShow(false);
      return;
    }

    const permission = getNotificationPermissionStatus();
    if (permission !== 'default') {
      setShow(false);
      return;
    }

    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data?.success && data?.user?.id) {
          setShow(true);
        } else {
          setShow(false);
        }
      })
      .catch(() => {
        if (!cancelled) setShow(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  // Hide banner immediately after notification permission is resolved (regardless of backend speed)
  const handleAllow = async () => {
    setLoading(true);
    setShow(false); // Hide immediately for UX smoothness
    try {
      const token = await requestNotificationPermission();
      if (token) {
        // Don't await the backend logic; run in background for speedier dismissal
        (async () => {
          try {
            const meRes = await fetch('/api/auth/me', { credentials: 'include' });
            const meData = await meRes.json();
            if (meData?.success && meData?.user) {
              const { id, role, organizationId } = meData.user;
              const topics = getInitialTopicsForUser({
                role: role ?? 'student',
                userId: id,
                organizationId: organizationId ?? null,
              });
              await subscribeToTopicsInBackend(token, topics);
            }
          } catch {
            // handle if needed, or ignore
          }
        })();
      }
    } catch {
      // If permission is denied or failed, already hidden immediately above
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Enable notifications"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-lg sm:left-auto sm:right-4"
    >
      <p className="text-sm font-medium text-slate-800">
        Get updates on bookings, sessions, and messages
      </p>
      <p className="mt-1 text-xs text-slate-500">Allow notifications to stay in the loop.</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleAllow}
          disabled={loading}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Enabling…' : 'Allow'}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={loading}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

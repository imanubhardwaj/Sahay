"use client";

import dynamic from "next/dynamic";

const FCMTokenInitializer = dynamic(
  () => import("@/config/FCMTokenInitializer"),
  { ssr: false },
);

const NotificationPermissionBanner = dynamic(
  () => import("@/components/notifications/NotificationPermissionBanner"),
  { ssr: false },
);

export function LazyFirebaseComponents() {
  return (
    <>
      <FCMTokenInitializer />
      <NotificationPermissionBanner />
    </>
  );
}

"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import Loader from "@/components/Loader";

/**
 * Admin layout: requires authentication.
 * Unauthenticated users are redirected to /login.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useRequireAuth();

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}

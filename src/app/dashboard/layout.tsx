"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import Loader from "@/components/Loader";

/**
 * Dashboard layout: requires authentication.
 * Unauthenticated users are redirected to /login with the current path as redirect param.
 */
export default function DashboardLayout({
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

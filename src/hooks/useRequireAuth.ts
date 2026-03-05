"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Ensures user is authenticated. Does NOT redirect while auth is still loading,
 * preventing the login page flash on reload. Only redirects when we're certain
 * the user is not logged in.
 */
export function useRequireAuth() {
  const auth = useAuth();
  const { user, isLoading } = auth;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      const redirect = pathname || "/dashboard";
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [user, isLoading, router, pathname]);

  return auth;
}

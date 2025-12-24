"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

// Routes where we should show the global loader while fetching user
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/onboarding"];

export function GlobalLoader() {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  // Only show loader on protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

  if (!isLoading || !isProtectedRoute) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo/Spinner */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          {/* Inner pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Sahay</h1>
          <p className="text-slate-400 text-sm animate-pulse">
            Loading your experience...
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1.5">
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

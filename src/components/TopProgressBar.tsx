"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";

export function TopProgressBar() {
  const [localProgress, setLocalProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading: isApiLoading, progress: apiProgress } = useLoading();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
    setLocalProgress(0);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Simulate progress - quick start, slow middle
    intervalRef.current = setInterval(() => {
      setLocalProgress((prev) => {
        if (prev >= 90) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 90;
        }
        const increment = prev < 30 ? 12 : prev < 60 ? 6 : prev < 80 ? 3 : 1;
        return Math.min(prev + increment, 90);
      });
    }, 100);
  }, []);

  const completeNavigation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLocalProgress(100);
    setTimeout(() => {
      setIsNavigating(false);
      setLocalProgress(0);
    }, 250);
  }, []);

  // Handle route changes
  useEffect(() => {
    startNavigation();

    // Complete after a short delay
    const timer = setTimeout(() => {
      completeNavigation();
    }, 400);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pathname, searchParams, startNavigation, completeNavigation]);

  // Determine which progress to show (API loading takes priority when active)
  const showProgress = isApiLoading || isNavigating;
  const currentProgress = isApiLoading ? apiProgress : localProgress;

  if (!showProgress && currentProgress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 shadow-lg shadow-blue-500/50"
        style={{
          width: `${currentProgress}%`,
          opacity: showProgress || currentProgress === 100 ? 1 : 0,
          transition:
            currentProgress === 100
              ? "width 150ms ease-out, opacity 200ms ease-out 100ms"
              : "width 150ms ease-out",
        }}
      />
      {/* Glowing effect at the tip */}
      {showProgress && currentProgress > 0 && currentProgress < 100 && (
        <div
          className="absolute top-0 h-[3px] w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{
            left: `calc(${currentProgress}% - 2.5rem)`,
            animation: "pulse 1s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

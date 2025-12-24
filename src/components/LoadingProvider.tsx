"use client";

import { Suspense } from "react";
import { TopProgressBar } from "./TopProgressBar";
import { GlobalLoader } from "./GlobalLoader";

// Wrapper for TopProgressBar to handle Suspense (useSearchParams requires it)
function TopProgressBarWrapper() {
  return (
    <Suspense fallback={null}>
      <TopProgressBar />
    </Suspense>
  );
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Top blue progress bar for page navigation */}
      <TopProgressBarWrapper />

      {/* Global spinner loader synced with user fetch */}
      <GlobalLoader />

      {/* Page content */}
      {children}
    </>
  );
}

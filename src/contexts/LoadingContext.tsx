"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  progress: number;
  startLoading: () => void;
  stopLoading: () => void;
  setProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingContextProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const loadingCount = useRef(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    loadingCount.current += 1;

    if (loadingCount.current === 1) {
      setIsLoading(true);
      setProgress(0);

      // Start progress animation
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          const increment = prev < 30 ? 15 : prev < 60 ? 8 : prev < 80 ? 3 : 1;
          return Math.min(prev + increment, 90);
        });
      }, 150);
    }
  }, []);

  const stopLoading = useCallback(() => {
    loadingCount.current = Math.max(0, loadingCount.current - 1);

    if (loadingCount.current === 0) {
      // Clear the interval
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }

      // Complete the progress bar
      setProgress(100);

      // Hide after animation completes
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    }
  }, []);

  return (
    <LoadingContext.Provider
      value={{ isLoading, progress, startLoading, stopLoading, setProgress }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingContextProvider");
  }
  return context;
}

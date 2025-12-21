import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onPoll?: () => void;
  skipIfUnchanged?: boolean; // Only refetch if data actually changed
}

/**
 * Custom hook for polling/auto-refetching data
 * Automatically calls the provided function at regular intervals
 * Can optionally skip refetching if data hasn't changed (using hash comparison)
 * 
 * @param fetchFunction - The function to call periodically
 * @param options - Configuration options
 * @returns Object with manual refetch function and polling state
 */
export function usePolling(
  fetchFunction: () => Promise<void> | void,
  options: UsePollingOptions = {}
) {
  const { enabled = true, interval = 30000, onPoll, skipIfUnchanged = false } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const lastDataHashRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Simple hash function for data comparison
  const getDataHash = useCallback((data: unknown): string => {
    try {
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }, []);

  const pollWithChangeDetection = useCallback(async () => {
    if (!enabled) return;

    try {
      // Call the fetch function
      const result = await fetchFunction();
      
      if (onPoll) {
        onPoll();
      }

      // If skipIfUnchanged is enabled, check if data changed
      if (skipIfUnchanged && result !== undefined) {
        const currentHash = getDataHash(result);
        
        // Skip if data hasn't changed (except on initial load)
        if (!isInitialLoadRef.current && lastDataHashRef.current === currentHash) {
          return; // Data unchanged, skip update
        }
        
        lastDataHashRef.current = currentHash;
        isInitialLoadRef.current = false;
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [fetchFunction, enabled, onPoll, skipIfUnchanged, getDataHash]);

  const startPolling = useCallback(() => {
    if (intervalRef.current || !enabled || isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;
    intervalRef.current = setInterval(() => {
      pollWithChangeDetection();
    }, interval);
  }, [pollWithChangeDetection, interval, enabled]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isPollingRef.current = false;
    }
  }, []);

  const refetch = useCallback(() => {
    lastDataHashRef.current = null; // Reset hash to force refetch
    isInitialLoadRef.current = true;
    fetchFunction();
  }, [fetchFunction]);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    refetch,
    startPolling,
    stopPolling,
    isPolling: isPollingRef.current,
  };
}


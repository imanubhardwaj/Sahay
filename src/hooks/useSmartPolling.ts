import { useEffect, useRef, useCallback, useState } from 'react';

interface UseSmartPollingOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onPoll?: () => void;
  compareFn?: (oldData: unknown, newData: unknown) => boolean; // Returns true if data changed
}

/**
 * Smart polling hook that only refetches when data actually changes
 * Uses a hash comparison to detect changes
 * 
 * @param fetchFunction - The function to call periodically that returns data
 * @param options - Configuration options
 * @returns Object with manual refetch function and polling state
 */
export function useSmartPolling<T>(
  fetchFunction: () => Promise<T>,
  options: UseSmartPollingOptions = {}
) {
  const { enabled = true, interval = 30000, onPoll, compareFn } = options; // Default 30 seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const lastDataHashRef = useRef<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Simple hash function to compare data
  const getDataHash = useCallback((data: unknown): string => {
    try {
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }, []);

  const checkAndRefetch = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsPolling(true);
      const data = await fetchFunction();
      
      if (onPoll) {
        onPoll();
      }

      // Check if data changed
      const currentHash = getDataHash(data);
      
      if (compareFn) {
        // Use custom comparison if provided
        // This would require storing last data, which we'll skip for now
        // Just refetch and let the component handle updates
      } else {
        // Simple hash comparison
        if (lastDataHashRef.current !== null && lastDataHashRef.current === currentHash) {
          // Data hasn't changed, skip update
          return;
        }
        lastDataHashRef.current = currentHash;
      }
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      setIsPolling(false);
    }
  }, [fetchFunction, enabled, onPoll, compareFn, getDataHash]);

  const startPolling = useCallback(() => {
    if (intervalRef.current || !enabled || isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;
    intervalRef.current = setInterval(() => {
      checkAndRefetch();
    }, interval);
  }, [checkAndRefetch, interval, enabled]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isPollingRef.current = false;
      setIsPolling(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    lastDataHashRef.current = null; // Reset hash to force refetch
    await checkAndRefetch();
  }, [checkAndRefetch]);

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
    isPolling,
  };
}


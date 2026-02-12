'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCachedData, setCachedData } from '@/lib/cache';

interface UseCachedFetchOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  maxAge: number;
  enabled?: boolean;
}

interface UseCachedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isCached: boolean;
  isBackgroundRefreshing: boolean;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for cached data fetching
 * Features:
 * - Returns cached data immediately if available
 * - Shows loading state for minimum 1 second
 * - Background refresh when stale
 * - Error handling with cached fallback
 */
export function useCachedFetch<T>({
  key,
  fetchFn,
  maxAge,
  enabled = true,
}: UseCachedFetchOptions<T>): UseCachedFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  
  const loadingStartTime = useRef<number>(0);
  const minLoadingTime = 1000; // Minimum 1 second loading time

  const fetchData = useCallback(async (isBackground = false) => {
    if (!enabled) return;

    if (!isBackground) {
      loadingStartTime.current = Date.now();
      setLoading(true);
    } else {
      setIsBackgroundRefreshing(true);
    }

    try {
      // Add timeout to prevent hanging (10 seconds max)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - please try again')), 10000);
      });
      
      const result = await Promise.race([fetchFn(), timeoutPromise]);
      setData(result);
      setError(null);
      setIsCached(false);
      
      // Cache the fresh data
      setCachedData(key, result, maxAge);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error(`Error fetching ${key}:`, error);
      setError(error);
      
      // If we have cached data, keep showing it
      const cached = getCachedData<T>(key, maxAge);
      if (cached) {
        setData(cached.data);
        setIsCached(true);
      }
    } finally {
      if (!isBackground) {
        // Ensure minimum loading time of 1 second
        const elapsed = Date.now() - loadingStartTime.current;
        const remaining = Math.max(0, minLoadingTime - elapsed);
        
        setTimeout(() => {
          setLoading(false);
        }, remaining);
      } else {
        setIsBackgroundRefreshing(false);
      }
    }
  }, [key, fetchFn, maxAge, enabled]);

  const refresh = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = getCachedData<T>(key, maxAge);
    
    if (cached && !cached.isExpired) {
      // Show cached data immediately - no minimum loading time for cache hits
      setData(cached.data);
      setIsCached(false);
      setLoading(false);
    } else if (cached && cached.isExpired) {
      // Show expired cached data while fetching
      setData(cached.data);
      setIsCached(true);
      fetchData(false);
    } else {
      // No cache, fetch fresh
      fetchData(false);
    }
  }, [key, maxAge, enabled, fetchData]);

  return {
    data,
    loading,
    error,
    isCached,
    isBackgroundRefreshing,
    refresh,
  };
}

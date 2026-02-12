/**
 * Smart client-side caching system using localStorage
 * Features:
 * - Dual-layer caching (memory + localStorage)
 * - Automatic expiration handling
 * - Cross-tab synchronization
 * - Periodic cleanup of expired entries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: number;
}

interface CacheConfig {
  PRICES_MAX_AGE: number;      // 5 minutes
  HISTORY_MAX_AGE: number;     // 1 hour
  PREDICTIONS_MAX_AGE: number; // 30 minutes
  CLEANUP_INTERVAL: number;    // 5 minutes
  CURRENT_VERSION: number;     // Cache version for invalidation
}

export const CACHE_CONFIG: CacheConfig = {
  PRICES_MAX_AGE: 5 * 60 * 1000,      // 5 minutes
  HISTORY_MAX_AGE: 60 * 60 * 1000,    // 1 hour
  PREDICTIONS_MAX_AGE: 30 * 60 * 1000, // 30 minutes
  CLEANUP_INTERVAL: 5 * 60 * 1000,    // 5 minutes
  CURRENT_VERSION: 1,                  // Bump to invalidate all caches
};

// In-memory cache for faster access
const memoryCache = new Map<string, CacheEntry<unknown>>();

// Cache key prefix to avoid collisions
const CACHE_PREFIX = 'dhab_';

/**
 * Generate a cache key from prefix and parameters
 */
export function generateCacheKey(prefix: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return `${CACHE_PREFIX}${prefix}`;
  }
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('&');
  return `${CACHE_PREFIX}${prefix}_${paramString}`;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get cached data if it exists and hasn't expired
 */
export function getCachedData<T>(key: string, maxAge: number): { data: T; isExpired: boolean } | null {
  const fullKey = key.startsWith(CACHE_PREFIX) ? key : `${CACHE_PREFIX}${key}`;
  const now = Date.now();

  // Check memory cache first (fastest)
  const memoryEntry = memoryCache.get(fullKey) as CacheEntry<T> | undefined;
  if (memoryEntry && memoryEntry.version === CACHE_CONFIG.CURRENT_VERSION) {
    if (now < memoryEntry.expiresAt) {
      return { data: memoryEntry.data, isExpired: false };
    }
  }

  // Check localStorage
  if (isLocalStorageAvailable()) {
    try {
      const stored = localStorage.getItem(fullKey);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        
        // Check version (invalidate if old)
        if (entry.version !== CACHE_CONFIG.CURRENT_VERSION) {
          localStorage.removeItem(fullKey);
          return null;
        }

        // Check expiration
        const isExpired = now >= entry.expiresAt;
        
        if (!isExpired) {
          // Restore to memory cache
          memoryCache.set(fullKey, entry);
          return { data: entry.data, isExpired: false };
        } else {
          // Data exists but expired - return it for offline use
          return { data: entry.data, isExpired: true };
        }
      }
    } catch (error) {
      console.warn('Error reading from cache:', error);
    }
  }

  return null;
}

/**
 * Store data in cache with expiration
 */
export function setCachedData<T>(key: string, data: T, maxAge: number): void {
  const fullKey = key.startsWith(CACHE_PREFIX) ? key : `${CACHE_PREFIX}${key}`;
  const now = Date.now();
  
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    expiresAt: now + maxAge,
    version: CACHE_CONFIG.CURRENT_VERSION,
  };

  // Store in memory
  memoryCache.set(fullKey, entry);

  // Store in localStorage
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      // If quota exceeded, clear old entries and try again
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        clearExpiredCache();
        try {
          localStorage.setItem(fullKey, JSON.stringify(entry));
        } catch (e) {
          console.warn('Failed to cache data even after cleanup');
        }
      }
    }
  }
}

/**
 * Remove specific cache entry
 */
export function clearCache(key: string): void {
  const fullKey = key.startsWith(CACHE_PREFIX) ? key : `${CACHE_PREFIX}${key}`;
  memoryCache.delete(fullKey);
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(fullKey);
  }
}

/**
 * Clear all expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  
  // Clear from memory
  for (const [key, entry] of memoryCache.entries()) {
    if (now >= entry.expiresAt || entry.version !== CACHE_CONFIG.CURRENT_VERSION) {
      memoryCache.delete(key);
    }
  }

  // Clear from localStorage
  if (isLocalStorageAvailable()) {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry<unknown> = JSON.parse(stored);
            if (now >= entry.expiresAt || entry.version !== CACHE_CONFIG.CURRENT_VERSION) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // Invalid entry, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

/**
 * Clear all cache entries (full reset)
 */
export function clearAllCache(): void {
  memoryCache.clear();
  
  if (isLocalStorageAvailable()) {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): { memoryEntries: number; localStorageEntries: number } {
  let localStorageEntries = 0;
  
  if (isLocalStorageAvailable()) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        localStorageEntries++;
      }
    }
  }

  return {
    memoryEntries: memoryCache.size,
    localStorageEntries,
  };
}

// Auto-cleanup on module load
clearExpiredCache();

// Periodic cleanup (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(clearExpiredCache, CACHE_CONFIG.CLEANUP_INTERVAL);
}

// Listen for storage events from other tabs (cross-tab sync)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith(CACHE_PREFIX)) {
      // Another tab updated the cache, clear memory cache to force re-read
      if (event.newValue === null) {
        // Item was deleted
        memoryCache.delete(event.key);
      } else {
        // Item was updated, remove from memory to force re-read from localStorage
        memoryCache.delete(event.key);
      }
    }
  });
}

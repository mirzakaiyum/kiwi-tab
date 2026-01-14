/**
 * Shared caching utilities for services
 * Uses chrome.storage.local with localStorage fallback for development
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Check if running in Chrome extension context
 */
function isChromeExtension(): boolean {
  return typeof chrome !== 'undefined' && chrome.storage?.local !== undefined;
}

/**
 * Get cached data by key
 */
export async function getCache<T>(key: string): Promise<{ data: T; fresh: boolean } | null> {
  try {
    if (isChromeExtension()) {
      const result = await chrome.storage.local.get(key);
      const cached = result[key] as CachedData<T> | undefined;
      if (cached) {
        const fresh = Date.now() - cached.timestamp < cached.ttl;
        return { data: cached.data, fresh };
      }
    } else {
      const stored = localStorage.getItem(key);
      if (stored) {
        const cached = JSON.parse(stored) as CachedData<T>;
        const fresh = Date.now() - cached.timestamp < cached.ttl;
        return { data: cached.data, fresh };
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }
  return null;
}

/**
 * Set cached data with TTL
 */
export async function setCache<T>(key: string, data: T, ttlMs: number): Promise<void> {
  const cached: CachedData<T> = {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  };

  try {
    if (isChromeExtension()) {
      await chrome.storage.local.set({ [key]: cached });
    } else {
      localStorage.setItem(key, JSON.stringify(cached));
    }
  } catch (e) {
    console.warn('Cache write error:', e);
  }
}

/**
 * Clear cached data by key
 */
export async function clearCache(key: string): Promise<void> {
  try {
    if (isChromeExtension()) {
      await chrome.storage.local.remove(key);
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('Cache clear error:', e);
  }
}

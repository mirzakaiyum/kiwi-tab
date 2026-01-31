import {
  DEFAULT_PINNED_SITES,
  type PinnedSite,
} from "@/defaults/default-pinSite";

export type { PinnedSite };

const STORAGE_KEY = "kiwi-pinned-sites";
const MAX_PINNED_SITES = 16;

// Get favicon URL using Google's service
export function getFaviconUrl(url: string, size: number = 64): string {
  try {
    const domain = new URL(url).origin;
    return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${domain}&size=${size}`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=example.com&sz=${size}`;
  }
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Check if running in Chrome extension context
function isChromeExtension(): boolean {
  return typeof chrome !== "undefined" && !!chrome.storage?.sync;
}

// Load pinned sites from storage
export function loadPinnedSites(): PinnedSite[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, MAX_PINNED_SITES);
      }
    }
  } catch {
    // Fall through to defaults
  }
  return DEFAULT_PINNED_SITES;
}

// Save pinned sites to storage
export function savePinnedSites(sites: PinnedSite[]): void {
  const toSave = sites.slice(0, MAX_PINNED_SITES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));

  // Also sync to chrome.storage if available
  if (isChromeExtension()) {
    chrome.storage.sync.set({ [STORAGE_KEY]: toSave });
  }
}

// Load from chrome.storage.sync (async, for extension context)
export async function loadPinnedSitesAsync(): Promise<PinnedSite[]> {
  if (isChromeExtension()) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEY], (result) => {
        const sites = result[STORAGE_KEY];
        if (Array.isArray(sites) && sites.length > 0) {
          resolve(sites.slice(0, MAX_PINNED_SITES));
        } else {
          resolve(loadPinnedSites());
        }
      });
    });
  }
  return loadPinnedSites();
}

// Update a single site
export function updatePinnedSite(
  sites: PinnedSite[],
  id: string,
  updates: Partial<Omit<PinnedSite, "id">>,
): PinnedSite[] {
  return sites.map((site) => site.id === id ? { ...site, ...updates } : site);
}

// Remove a site (leaves slot empty by setting to null-like state)
export function removePinnedSite(
  sites: PinnedSite[],
  id: string,
): PinnedSite[] {
  return sites.filter((site) => site.id !== id);
}

// Add a new site (if under max limit)
export function addPinnedSite(
  sites: PinnedSite[],
  url: string,
  title: string,
  backgroundColor?: string,
): PinnedSite[] {
  if (sites.length >= MAX_PINNED_SITES) {
    return sites;
  }
  const newSite: PinnedSite = {
    id: generateId(),
    url: url.startsWith("http") ? url : `https://${url}`,
    title,
    backgroundColor,
  };
  return [...sites, newSite];
}

// Reorder sites for drag-and-drop sorting
export function reorderPinnedSites(
  sites: PinnedSite[],
  oldIndex: number,
  newIndex: number,
): PinnedSite[] {
  const result = [...sites];
  const [removed] = result.splice(oldIndex, 1);
  result.splice(newIndex, 0, removed);
  return result;
}

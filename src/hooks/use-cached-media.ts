import { useState, useEffect } from 'react';

const CACHE_NAME = 'kiwi-media-cache-v1';

export function useCachedMedia(url: string | undefined, options: { enabled?: boolean } = {}) {
    const { enabled = true } = options;
    const [cachedSrc, setCachedSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If caching is disabled or no URL, handled differently
        if (!url) {
            setCachedSrc(null);
            return;
        }

        if (!enabled) {
            setCachedSrc(url);
            return;
        }

        setCachedSrc(null); // Reset for new cached load

        let isMounted = true;
        let objectUrl: string | null = null;
        
        const fetchMedia = async () => {
             setIsLoading(true);
             try {
                 const cache = await caches.open(CACHE_NAME);
                 let response = await cache.match(url);
                 
                 if (!response) {
                     response = await fetch(url, { mode: 'cors' });
                     if (response.ok) {
                         await cache.put(url, response.clone());
                     } else {
                         throw new Error(`Failed to fetch: ${response.status}`);
                     }
                 }
                 
                 const blob = await response.blob();
                 if (isMounted) {
                     objectUrl = URL.createObjectURL(blob);
                     setCachedSrc(objectUrl);
                 }
             } catch (error) {
                 console.warn("Media caching failed, falling back to network URL", error);
                 if (isMounted) setCachedSrc(url);
             } finally {
                 if (isMounted) setIsLoading(false);
             }
        };

        fetchMedia();

        return () => {
            isMounted = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [url, enabled]);

    return { src: cachedSrc, isLoading };
}

import { useCallback, useEffect, useRef, useState } from "react";
import { getImageByUrl, images } from "./images";
import { getVideoByUrl, videos } from "./videos";
import { useCachedMedia } from "@/hooks/use-cached-media";
import { BackgroundCredit } from "@/background/background-credit";
import { getCustomFiles } from "@/lib/custom-files-db";

const BACKGROUND_ENABLED_KEY = "kiwi-background-enabled";
const BACKGROUND_TYPE_KEY = "kiwi-background-type";
const BACKGROUND_FREQUENCY_KEY = "kiwi-background-frequency";
const BACKGROUND_INDEX_KEY = "kiwi-background-index";
const BACKGROUND_LAST_SHUFFLE_KEY = "kiwi-background-last-shuffle";
const BACKGROUND_BLUR_KEY = "kiwi-background-blur";
const BACKGROUND_BRIGHTNESS_KEY = "kiwi-background-brightness";

type BackgroundFrequency = "tab" | "1hour" | "1day" | "1week";

// Background media options
const backgrounds = [
    ...videos.map((url) => ({ type: "video" as const, url })),
    ...images.map((url) => ({ type: "image" as const, url })),
];

// Get frequency duration in milliseconds
function getFrequencyMs(freq: BackgroundFrequency): number {
    switch (freq) {
        case "tab":
            return 0; // Shuffle on every tab/page load
        case "1hour":
            return 60 * 60 * 1000;
        case "1day":
            return 24 * 60 * 60 * 1000;
        case "1week":
            return 7 * 24 * 60 * 60 * 1000;
    }
}

// Get background index based on frequency and type
function getBackgroundIndex(): number {
    const frequency =
        (localStorage.getItem(
            BACKGROUND_FREQUENCY_KEY,
        ) as BackgroundFrequency) || "tab";
    const type =
        (localStorage.getItem(BACKGROUND_TYPE_KEY) as
            | "none"
            | "images"
            | "videos") || "images";
    const lastShuffle = parseInt(
        localStorage.getItem(BACKGROUND_LAST_SHUFFLE_KEY) || "0",
    );
    const savedIndex = parseInt(
        localStorage.getItem(BACKGROUND_INDEX_KEY) || "-1",
    );
    const now = Date.now();

    // Helper to find valid indices for current type
    const getValidIndices = () => {
        return (
            backgrounds
                .map((bg, index) => ({ ...bg, index }))
                // Map "images" -> "image" type, "videos" -> "video" type
                .filter((bg) => {
                    if (type === "images") return bg.type === "image";
                    if (type === "videos") return bg.type === "video";
                    return true; // Fallback for mixed or undefined
                })
                .map((bg) => bg.index)
        );
    };

    // If never shuffled or time to shuffle or forced (lastShuffle === 0)
    if (
        savedIndex === -1 ||
        lastShuffle === 0 ||
        now - lastShuffle >= getFrequencyMs(frequency)
    ) {
        const validIndices = getValidIndices();
        if (validIndices.length === 0) return 0; // Fallback

        // Ensure we pick a different background if possible
        const availableIndices =
            validIndices.length > 1
                ? validIndices.filter((i) => i !== savedIndex)
                : validIndices;

        const randomChoice = Math.floor(
            Math.random() * availableIndices.length,
        );
        const newIndex = availableIndices[randomChoice];

        localStorage.setItem(BACKGROUND_INDEX_KEY, String(newIndex));
        localStorage.setItem(BACKGROUND_LAST_SHUFFLE_KEY, String(now));
        return newIndex;
    }

    // Ensure saved index matches current type (in case type changed but index didn't update yet)
    // If mismatch, force update
    const currentBg = backgrounds[savedIndex];
    if (currentBg) {
        const typeMismatch =
            (type === "images" && currentBg.type !== "image") ||
            (type === "videos" && currentBg.type !== "video");
        if (typeMismatch) {
            const validIndices = getValidIndices();
            if (validIndices.length > 0) {
                const randomChoice = Math.floor(
                    Math.random() * validIndices.length,
                );
                const newIndex = validIndices[randomChoice];
                localStorage.setItem(BACKGROUND_INDEX_KEY, String(newIndex));
                return newIndex;
            }
        }
    }

    return savedIndex;
}

// Define the state for a background layer
interface BackgroundLayerState {
    id: number; // Unique ID for key
    url: string;
    type: "image" | "video";
    loaded: boolean;
}

// --- Background Layer Component ---
// Pure component that handles fetching and rendering media
interface BackgroundLayerProps {
    data: BackgroundLayerState;
    onLoad: (id: number) => void;
    onError: (id: number) => void;
    zIndex: number;
    blur: number;
    brightness: number;
}

function BackgroundLayer({
    data,
    onLoad,
    onError,
    zIndex,
    blur,
    brightness,
}: BackgroundLayerProps) {
    const { src: cachedUrl } = useCachedMedia(data.url, {
        enabled: data.type === "video",
    });
    const [localLoaded, setLocalLoaded] = useState(false);

    // Notify parent ONCE when loaded locally
    useEffect(() => {
        if (localLoaded && !data.loaded) {
            onLoad(data.id);
        }
    }, [localLoaded, data.loaded, data.id, onLoad]);

    // Handle fallback if cache fails or media corrupt
    // Note: useCachedMedia handles internal fallback to network URL.
    // Here we handle if the URL itself fails to render.

    // Safety timeout
    useEffect(() => {
        if (cachedUrl && !localLoaded) {
            const timer = setTimeout(() => {
                // Determine if we should treat timeout as load success (to show something)
                // or error. User strategy: "wait till fully downloaded".
                // If it times out (e.g. 10s), we probably should trigger error to fallback.
                // But for now, let's just force show to avoid infinite stalled state,
                // or let onError handle it.
                // Actually, if we never trigger onLoad, the layer stays invisible (opacity 0).
                // And the previous layer stays visible. That is the DESIRED behavior ("until then... current is shown").
                // So NO timeout forcing here unless we want to abort.
                onError(data.id); // Abort transition after timeout
            }, 10000); // 10s timeout
            return () => clearTimeout(timer);
        }
    }, [cachedUrl, localLoaded, data.id, onError]);

    if (!cachedUrl) return null;

    return (
        <div
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out`}
            style={{
                opacity: data.loaded ? 1 : 0,
                zIndex: zIndex,
            }}
        >
            {data.type === "video" ? (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                    style={{ filter: `blur(${blur}px)` }}
                    src={cachedUrl}
                    onLoadedData={() => setLocalLoaded(true)}
                    // Backup events
                    onCanPlay={() => setLocalLoaded(true)}
                    onError={() => onError(data.id)}
                />
            ) : (
                <img
                    src={cachedUrl}
                    alt="Background"
                    className="h-full w-full object-cover"
                    style={{ filter: `blur(${blur}px)` }}
                    onLoad={() => setLocalLoaded(true)}
                    onError={() => onError(data.id)}
                />
            )}
            {/* Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: `rgba(0, 0, 0, ${brightness / 100})`,
                }}
            />
        </div>
    );
}

// --- Main Background Component ---
export function Background() {
    const [backgroundEnabled, setBackgroundEnabled] = useState<boolean>(
        () => localStorage.getItem(BACKGROUND_ENABLED_KEY) !== "false",
    );
    const [backgroundType, setBackgroundType] = useState<
        "none" | "images" | "videos" | "custom"
    >(
        () =>
            (localStorage.getItem(BACKGROUND_TYPE_KEY) as
                | "none"
                | "images"
                | "videos"
                | "custom") || "images",
    );

    const [blur, setBlur] = useState<number>(() =>
        parseInt(localStorage.getItem(BACKGROUND_BLUR_KEY) || "0"),
    );
    const [brightness, setBrightness] = useState<number>(() =>
        parseInt(localStorage.getItem(BACKGROUND_BRIGHTNESS_KEY) || "50"),
    );

    // Queue of background layers.
    // Usually contains 1 item (current).
    // During transition, contains 2 items (current, next).
    const [layers, setLayers] = useState<BackgroundLayerState[]>([]);
    const nextId = useRef(1);

    // Initial Load
    useEffect(() => {
        // Check if using custom files
        if (backgroundType === "custom") {
            getCustomFiles().then((files) => {
                if (files.length > 0) {
                    // Pick a random custom file
                    const randomIndex = Math.floor(
                        Math.random() * files.length,
                    );
                    const file = files[randomIndex];
                    const url = URL.createObjectURL(file.blob);
                    setLayers([
                        {
                            id: nextId.current++,
                            url,
                            type: file.type,
                            loaded: false,
                        },
                    ]);
                }
            });
        } else {
            const index = getBackgroundIndex();
            const bg = backgrounds[index];
            if (bg) {
                setLayers([
                    {
                        id: nextId.current++,
                        url: bg.url,
                        type: bg.type,
                        loaded: false, // Will fade in on first load
                    },
                ]);
            }
        }
    }, []); // Run once on mount

    // cleanup old layers after transition
    useEffect(() => {
        // If we have more than 1 layer, and the top layer (last) is loaded...
        // We can remove the older layers after the transition duration.
        if (layers.length > 1) {
            const topLayer = layers[layers.length - 1];
            if (topLayer.loaded) {
                const timer = setTimeout(() => {
                    setLayers((prev) => {
                        // Keep only the last layer
                        if (prev.length > 1) {
                            return [prev[prev.length - 1]];
                        }
                        return prev;
                    });
                }, 700); // 700ms matches CSS transition
                return () => clearTimeout(timer);
            }
        }
    }, [layers]);

    // Handle background loading success
    const handleLayerLoad = useCallback((id: number) => {
        setLayers((prev) =>
            prev.map((layer) =>
                layer.id === id ? { ...layer, loaded: true } : layer,
            ),
        );
    }, []);

    // Handle background error (abort transition)
    const handleLayerError = useCallback((id: number) => {
        console.warn(`Background layer ${id} failed to load.`);
        setLayers((prev) => {
            // If this is the ONLY layer, we might want to keep it (broken) or try standard fallback?
            // If it's a NEW layer (pending transition), remove it so we stay on current.
            if (prev.length > 1 && prev[prev.length - 1].id === id) {
                // It's the incoming layer. Remove it.
                return prev.slice(0, -1);
            }
            // If it's the current active layer (index 0) and it fails...
            // We might just leave it (it might be hidden or showing broken generic icon).
            // But we mark it loaded so opacity sets to 1 (at least show something vs invisible).
            return prev.map((layer) =>
                layer.id === id ? { ...layer, loaded: true } : layer,
            );
        });
    }, []);

    // Listen for events
    useEffect(() => {
        const handleBackgroundChange = () => {
            const enabled =
                localStorage.getItem(BACKGROUND_ENABLED_KEY) !== "false";
            setBackgroundEnabled(enabled);

            const type =
                (localStorage.getItem(BACKGROUND_TYPE_KEY) as
                    | "none"
                    | "images"
                    | "videos"
                    | "custom") || "images";
            setBackgroundType(type);

            // Update custom files from IndexedDB and queue new background if needed
            if (type === "custom") {
                getCustomFiles().then((files) => {
                    if (files.length > 0) {
                        const randomIndex = Math.floor(
                            Math.random() * files.length,
                        );
                        const file = files[randomIndex];
                        const url = URL.createObjectURL(file.blob);
                        setLayers((prev) => [
                            ...prev,
                            {
                                id: nextId.current++,
                                url,
                                type: file.type,
                                loaded: false,
                            },
                        ]);
                    }
                });
            }

            // Update blur and brightness
            const newBlur = parseInt(
                localStorage.getItem(BACKGROUND_BLUR_KEY) || "0",
            );
            const newBrightness = parseInt(
                localStorage.getItem(BACKGROUND_BRIGHTNESS_KEY) || "50",
            );
            setBlur(newBlur);
            setBrightness(newBrightness);

            // Queue new background for non-custom types
            if (type !== "custom") {
                const newIndex = getBackgroundIndex();
                const newBg = backgrounds[newIndex];

                if (newBg) {
                    setLayers((prev) => {
                        // Avoid adding duplicate if already loading the same key?
                        // But random might pick same if forced? (My logic prevents it usually)
                        // Just add to queue.
                        return [
                            ...prev,
                            {
                                id: nextId.current++,
                                url: newBg.url,
                                type: newBg.type,
                                loaded: false,
                            },
                        ];
                    });
                }
            }
        };

        // Separate handler for style changes (blur/brightness) without shuffling
        const handleStyleChange = () => {
            const newBlur = parseInt(
                localStorage.getItem(BACKGROUND_BLUR_KEY) || "0",
            );
            const newBrightness = parseInt(
                localStorage.getItem(BACKGROUND_BRIGHTNESS_KEY) || "50",
            );
            setBlur(newBlur);
            setBrightness(newBrightness);
        };

        window.addEventListener(
            "kiwi-background-changed",
            handleBackgroundChange,
        );
        window.addEventListener(
            "kiwi-background-style-changed",
            handleStyleChange,
        );
        return () => {
            window.removeEventListener(
                "kiwi-background-changed",
                handleBackgroundChange,
            );
            window.removeEventListener(
                "kiwi-background-style-changed",
                handleStyleChange,
            );
        };
    }, []);

    // Resolve credit for the displayed layer
    const activeLayer = layers.find((l) => l.loaded)
        ? layers
              .slice()
              .reverse()
              .find((l) => l.loaded)
        : layers[0];

    const getCredit = () => {
        if (!activeLayer) return null;
        if (activeLayer.type === "image") {
            const data = getImageByUrl(activeLayer.url);
            return data
                ? {
                      name: data.credit,
                      link: data.creditLink,
                      type: "Photo" as const,
                      caption: data.caption,
                      url: data.url,
                  }
                : null;
        }
        if (activeLayer.type === "video") {
            const data = getVideoByUrl(activeLayer.url);
            return data
                ? {
                      name: data.credit,
                      link: data.creditLink,
                      type: "Video" as const,
                      caption: data.caption,
                      url: data.url,
                  }
                : null;
        }
        return null;
    };

    const credit = getCredit();

    if (!backgroundEnabled) {
        return <div className="fixed inset-0 -z-10 bg-background" />;
    }

    return (
        <>
            <div className="fixed inset-0 -z-20 bg-background">
                {layers.map((layer, index) => (
                    <BackgroundLayer
                        key={layer.id}
                        data={layer}
                        zIndex={index} // Stacking context: newer on top
                        onLoad={handleLayerLoad}
                        onError={handleLayerError}
                        blur={blur}
                        brightness={brightness}
                    />
                ))}
            </div>
            {credit && <BackgroundCredit credit={credit} />}
        </>
    );
}

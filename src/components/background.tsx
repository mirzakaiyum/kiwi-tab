import { useState, useEffect } from "react";

const BACKGROUND_TYPE_KEY = "kiwi-background-type";
const BACKGROUND_FREQUENCY_KEY = "kiwi-background-frequency";
const BACKGROUND_INDEX_KEY = "kiwi-background-index";
const BACKGROUND_LAST_SHUFFLE_KEY = "kiwi-background-last-shuffle";

type BackgroundFrequency = "1hour" | "1day" | "1week" | "never";

// Background media options
const ALIVE_BACKGROUNDS = [
    { type: "video" as const, url: "https://videos.pexels.com/video-files/35037587/14842032_1920_1080_25fps.mp4" },
    { type: "image" as const, url: "https://images.pexels.com/photos/1350197/pexels-photo-1350197.jpeg?cs=srgb&dl=pexels-earano-1350197.jpg&fm=jpg&w=1920&h=1271" },
];

// Get frequency duration in milliseconds
function getFrequencyMs(freq: BackgroundFrequency): number {
    switch (freq) {
        case "1hour": return 60 * 60 * 1000;
        case "1day": return 24 * 60 * 60 * 1000;
        case "1week": return 7 * 24 * 60 * 60 * 1000;
        case "never": return Infinity;
    }
}

// Get background index based on frequency
function getBackgroundIndex(): number {
    const frequency = (localStorage.getItem(BACKGROUND_FREQUENCY_KEY) as BackgroundFrequency) || "never";
    const lastShuffle = parseInt(localStorage.getItem(BACKGROUND_LAST_SHUFFLE_KEY) || "0");
    const savedIndex = parseInt(localStorage.getItem(BACKGROUND_INDEX_KEY) || "-1");
    const now = Date.now();
    
    // If never shuffled or time to shuffle
    if (savedIndex === -1 || (frequency !== "never" && now - lastShuffle >= getFrequencyMs(frequency))) {
        const newIndex = Math.floor(Math.random() * ALIVE_BACKGROUNDS.length);
        localStorage.setItem(BACKGROUND_INDEX_KEY, String(newIndex));
        localStorage.setItem(BACKGROUND_LAST_SHUFFLE_KEY, String(now));
        return newIndex;
    }
    
    return savedIndex;
}

export function Background() {
    const [backgroundType, setBackgroundType] = useState<"none" | "images" | "videos">(() => 
        (localStorage.getItem(BACKGROUND_TYPE_KEY) as "none" | "images" | "videos") || "videos"
    );
    const [currentBackground, setCurrentBackground] = useState(() => 
        ALIVE_BACKGROUNDS[getBackgroundIndex()]
    );
    // Start with background visible if already set to show background to prevent flash
    const [backgroundLoaded, setBackgroundLoaded] = useState(() => {
        const stored = localStorage.getItem(BACKGROUND_TYPE_KEY);
        return stored === "images" || stored === "videos";
    });

    // Handle background loading with fallback timer
    useEffect(() => {
        if ((backgroundType === "images" || backgroundType === "videos") && !backgroundLoaded) {
            // Fallback: show background after 2 seconds even if load event doesn't fire
            const fallbackTimer = setTimeout(() => {
                setBackgroundLoaded(true);
            }, 2000);
            return () => clearTimeout(fallbackTimer);
        }
        if (backgroundType === "none") {
            setBackgroundLoaded(false);
        }
    }, [backgroundType, currentBackground, backgroundLoaded]);

    // Listen for background changes from settings
    useEffect(() => {
        const handleBackgroundChange = () => {
            const type = (localStorage.getItem(BACKGROUND_TYPE_KEY) as "none" | "images" | "videos") || "videos";
            setBackgroundType(type);
            // Also update the current background in case frequency changed
            setCurrentBackground(ALIVE_BACKGROUNDS[getBackgroundIndex()]);
        };
        window.addEventListener("kiwi-background-changed", handleBackgroundChange);
        return () => window.removeEventListener("kiwi-background-changed", handleBackgroundChange);
    }, []);

    return (
        <div className="fixed inset-0 -z-10 bg-background">
            {(backgroundType === "images" || backgroundType === "videos") && (
                <div 
                    className={`h-full w-full transition-opacity duration-700 ${backgroundLoaded ? "opacity-100" : "opacity-0"}`}
                >
                    {currentBackground.type === "video" ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-full w-full object-cover"
                            onLoadedData={() => setBackgroundLoaded(true)}
                            onCanPlay={() => setBackgroundLoaded(true)}
                            onCanPlayThrough={() => setBackgroundLoaded(true)}
                        >
                            <source src={currentBackground.url} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src={currentBackground.url}
                            alt="Background"
                            className="h-full w-full object-cover"
                            onLoad={() => setBackgroundLoaded(true)}
                        />
                    )}
                    {/* Overlay for readability */}
                    <div className="absolute inset-0 bg-black/50" />
                </div>
            )}
        </div>
    );
}

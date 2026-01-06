import { useState, useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Chatbox } from "./components/chatbox";
import { WidgetGrid } from "./components/widget-grid";
import { ScrollArea } from "./components/ui/scroll-area";

// Lazy-load deferred components (not critical for initial render)
const SettingsButton = lazy(() => import("./components/settings-panel"));
const CustomizeButton = lazy(() => import("./components/customize-widgets"));


const BACKGROUND_TYPE_KEY = "kiwi-background-type";
const BACKGROUND_FREQUENCY_KEY = "kiwi-background-frequency";
const BACKGROUND_INDEX_KEY = "kiwi-background-index";
const BACKGROUND_LAST_SHUFFLE_KEY = "kiwi-background-last-shuffle";

type BackgroundFrequency = "1hour" | "1day" | "1week" | "never";

// Background media options
const ALIVE_BACKGROUNDS = [
    { type: "video", url: "https://videos.pexels.com/video-files/35037587/14842032_1920_1080_25fps.mp4" },
    { type: "image", url: "https://images.pexels.com/photos/1350197/pexels-photo-1350197.jpeg?cs=srgb&dl=pexels-earano-1350197.jpg&fm=jpg&w=1920&h=1271" },
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

export function App() {
    const [backgroundType, setBackgroundType] = useState<"minimal" | "alive">(() => 
        (localStorage.getItem(BACKGROUND_TYPE_KEY) as "minimal" | "alive") || "minimal"
    );
    const [currentBackground, setCurrentBackground] = useState(() => 
        ALIVE_BACKGROUNDS[getBackgroundIndex()]
    );
    // Start with background visible if already set to "alive" to prevent flash
    const [backgroundLoaded, setBackgroundLoaded] = useState(() => 
        (localStorage.getItem(BACKGROUND_TYPE_KEY) as "minimal" | "alive") === "alive"
    );
    const [pickerOpen, setPickerOpen] = useState(false);
    const [widgetCount, setWidgetCount] = useState(() => {
        try {
            const saved = localStorage.getItem("kiwi-widgets");
            return saved ? JSON.parse(saved).length : 0;
        } catch {
            return 0;
        }
    });

    // Handle background loading with fallback timer
    useEffect(() => {
        if (backgroundType === "alive" && !backgroundLoaded) {
            // Fallback: show background after 2 seconds even if load event doesn't fire
            const fallbackTimer = setTimeout(() => {
                setBackgroundLoaded(true);
            }, 2000);
            return () => clearTimeout(fallbackTimer);
        }
        if (backgroundType === "minimal") {
            setBackgroundLoaded(false);
        }
    }, [backgroundType, currentBackground, backgroundLoaded]);

    // Listen for background changes from settings
    useEffect(() => {
        const handleBackgroundChange = () => {
            const type = (localStorage.getItem(BACKGROUND_TYPE_KEY) as "minimal" | "alive") || "minimal";
            setBackgroundType(type);
            // Also update the current background in case frequency changed
            setCurrentBackground(ALIVE_BACKGROUNDS[getBackgroundIndex()]);
        };
        window.addEventListener("kiwi-background-changed", handleBackgroundChange);
        return () => window.removeEventListener("kiwi-background-changed", handleBackgroundChange);
    }, []);

    // Listen for widget picker open/close
    useEffect(() => {
        const handlePickerOpen = (e: CustomEvent<{ open: boolean }>) => {
            setPickerOpen(e.detail.open);
        };
        window.addEventListener("kiwi-picker-open", handlePickerOpen as EventListener);
        return () => window.removeEventListener("kiwi-picker-open", handlePickerOpen as EventListener);
    }, []);

    // Listen for widget count changes
    useEffect(() => {
        const handleWidgetChange = () => {
            try {
                const saved = localStorage.getItem("kiwi-widgets");
                setWidgetCount(saved ? JSON.parse(saved).length : 0);
            } catch {
                setWidgetCount(0);
            }
        };
        window.addEventListener("storage", handleWidgetChange);
        // Also listen for add/remove events
        window.addEventListener("kiwi-add-widget", handleWidgetChange);
        const observer = new MutationObserver(() => {
            handleWidgetChange();
        });
        // Poll for changes (backup method)
        const interval = setInterval(handleWidgetChange, 100);
        return () => {
            window.removeEventListener("storage", handleWidgetChange);
            window.removeEventListener("kiwi-add-widget", handleWidgetChange);
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    // Calculate transform: shift up when picker open OR when widgets exist
    const getTransform = () => {
        if (pickerOpen) return "translateY(-15vh)";
        // Each widget row is ~200px, shift up proportionally
        if (widgetCount > 0) {
            const rows = Math.ceil(widgetCount / 4);
            const offset = Math.min(rows * 5, 15); // Max 15vh offset
            return `translateY(-${offset}vh)`;
        }
        return "translateY(0)";
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            {/* Background layer */}
            <div className="fixed inset-0 -z-10 bg-background">
                {backgroundType === "alive" && (
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
            <ScrollArea className="h-screen w-screen">
                <div 
                    className="mx-auto text-foreground flex min-h-screen flex-col items-center justify-center p-4 pt-32 w-3xl transition-transform duration-300 ease-in-out"
                    style={{ transform: getTransform() }}
                >
                    <Chatbox />
                    <WidgetGrid />
                </div>
            </ScrollArea>
            {/* Deferred components - load after critical path */}
            <Suspense fallback={null}>
                <CustomizeButton />
                <SettingsButton />
            </Suspense>
        </ThemeProvider>
    );
}

export default App;



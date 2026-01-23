import { lazy, Suspense, useState } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { ContextMenuProvider } from "./contexts/context-menu";
import { Background } from "./background/background";
import { MainContent } from "./components/main-content";
import { Greeting } from "./components/greeting/greeting";
import { Chatbox } from "./components/chatbox/chatbox";
import { WidgetGrid } from "./components/widgetWrapper/widget-grid";
import { PinnedSitesBar } from "./components/pinSites/pinned-sites-bar";
import { DesktopContextMenu } from "./components/desktop-context-menu";

// Lazy-load deferred components (not critical for initial render)
const Settings = lazy(() => import("./components/settings/settings-panel"));
const Customize = lazy(
    () => import("./components/widgetWrapper/widgets-picker"),
);
const Onboarding = lazy(() => import("./components/onboarding/onboarding"));

// Declare the global window property set by index.html
declare global {
    interface Window {
        __KIWI_ONBOARDED__: boolean;
    }
}

export function App() {
    // Read from window flag (set by index.html before React loads)
    const [isOnboarded, setIsOnboarded] = useState(
        () => window.__KIWI_ONBOARDED__ ?? false,
    );

    // Show onboarding for first-time users
    if (!isOnboarded) {
        return (
            <ThemeProvider>
                <Suspense fallback={null}>
                    <Onboarding onComplete={() => setIsOnboarded(true)} />
                </Suspense>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <ContextMenuProvider>
                <Background />
                <MainContent>
                    <Greeting />
                    <Chatbox />
                    <WidgetGrid />
                </MainContent>
                <PinnedSitesBar />
                <DesktopContextMenu />
                <Suspense fallback={null}>
                    <Customize />
                    <Settings />
                </Suspense>
            </ContextMenuProvider>
        </ThemeProvider>
    );
}

export default App;

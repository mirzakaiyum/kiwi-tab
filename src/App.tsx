import { lazy, Suspense } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { ContextMenuProvider } from "./contexts/context-menu-context";
import { Background } from "./background/background";
import { MainContent } from "./components/main-content";
import { Chatbox } from "./components/chatbox";
import { WidgetGrid } from "./components/widget-grid";
import { PinnedSitesBar } from "./components/pinSites/pinned-sites-bar";
import { DesktopContextMenu } from "./components/desktop-context-menu";

// Lazy-load deferred components (not critical for initial render)
const Settings = lazy(() => import("./components/settings-panel"));
const Customize = lazy(() => import("./components/customize-widgets"));

export function App() {
    return (
        <ThemeProvider>
            <ContextMenuProvider>
                <Background />
                <MainContent>
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

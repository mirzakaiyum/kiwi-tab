import { lazy, Suspense } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Background } from "./components/background";
import { MainContent } from "./components/main-content";
import { Chatbox } from "./components/chatbox";
import { WidgetGrid } from "./components/widget-grid";

// Lazy-load deferred components (not critical for initial render)
const SettingsButton = lazy(() => import("./components/settings-panel"));
const CustomizeButton = lazy(() => import("./components/customize-widgets"));

export function App() {
    return (
        <ThemeProvider>
            <Background />
            <MainContent>
                <Chatbox />
                <WidgetGrid />
            </MainContent>
            <Suspense fallback={null}>
                <CustomizeButton />
                <SettingsButton />
            </Suspense>
        </ThemeProvider>
    );
}

export default App;

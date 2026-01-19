import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MainContentProps {
    children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [widgetCount, setWidgetCount] = useState(() => {
        try {
            const saved = localStorage.getItem("kiwi-widgets");
            return saved ? JSON.parse(saved).length : 0;
        } catch {
            return 0;
        }
    });

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
        window.addEventListener("kiwi-add-widget", handleWidgetChange);
        // Poll for changes (backup method)
        const interval = setInterval(handleWidgetChange, 100);
        return () => {
            window.removeEventListener("storage", handleWidgetChange);
            window.removeEventListener("kiwi-add-widget", handleWidgetChange);
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
        <ScrollArea className="h-screen w-screen relative pointer-events-none">
            <div 
                className="mx-auto text-foreground flex flex-col items-center justify-center px-4 pt-24 w-3xl transition-transform duration-300 ease-in-out pointer-events-auto"
                style={{ transform: getTransform() }}
            >
                {children}
            </div>
        </ScrollArea>
    );
}

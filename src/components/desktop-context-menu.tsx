import { useCallback, useEffect, useState } from "react";
import { LayoutGrid, Lock, Pin, Settings, Shuffle, Unlock } from "lucide-react";
import { useContextMenu } from "@/contexts/context-menu";

// Handle menu item clicks (static)
const handleSettings = () => {
    window.dispatchEvent(new CustomEvent("kiwi-open-settings"));
};

const handleAddWidget = () => {
    window.dispatchEvent(new CustomEvent("kiwi-open-widget-picker"));
};

const handlePinSite = () => {
    window.dispatchEvent(new CustomEvent("kiwi-open-pin-site-dialog"));
};

const handleChangeBackground = () => {
    // Force a background shuffle by resetting the last shuffle time
    localStorage.setItem("kiwi-background-last-shuffle", "0");
    window.dispatchEvent(new Event("kiwi-background-changed"));
};

export function DesktopContextMenu() {
    const { showContextMenu } = useContextMenu();
    const [isLocked, setIsLocked] = useState(() =>
        localStorage.getItem("kiwi-background-locked") === "true"
    );

    const handleLockBackground = useCallback(() => {
        const newLocked = !isLocked;
        setIsLocked(newLocked);
        if (newLocked) {
            localStorage.setItem("kiwi-background-locked", "true");
            // Set frequency to never when locked
            localStorage.setItem("kiwi-background-frequency", "never");
        } else {
            localStorage.removeItem("kiwi-background-locked");
        }
        window.dispatchEvent(new Event("kiwi-background-changed"));
    }, [isLocked]);

    // Sync locked state with localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            setIsLocked(
                localStorage.getItem("kiwi-background-locked") === "true",
            );
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // Handle right-click on desktop
    useEffect(() => {
        const handleContextMenuEvent = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Don't show menu if clicking on interactive elements
            const isInteractive = target.closest("button") ||
                target.closest("a") ||
                target.closest("input") ||
                target.closest("textarea") ||
                target.closest('[role="button"]') ||
                target.closest(".widget-wrapper") ||
                target.closest('[data-slot*="dropdown"]') ||
                target.closest('[data-slot*="context-menu"]') ||
                target.closest("[data-radix-popper-content-wrapper]");

            // Show desktop menu if not clicking on interactive elements
            if (!isInteractive) {
                showContextMenu(e, [
                    {
                        id: "add-widget",
                        label: "Add Widget...",
                        icon: <LayoutGrid className="size-4" />,
                        onClick: handleAddWidget,
                    },
                    {
                        id: "pin-site",
                        label: "Pin Site...",
                        icon: <Pin className="size-4" />,
                        onClick: handlePinSite,
                        separator: true,
                    },
                    {
                        id: "change-background",
                        label: "Next Background",
                        icon: <Shuffle className="size-4" />,
                        onClick: handleChangeBackground,
                    },
                    {
                        id: "lock-background",
                        label: isLocked
                            ? "Unlock Background"
                            : "Lock Background",
                        icon: isLocked
                            ? <Lock className="size-4" />
                            : <Unlock className="size-4" />,
                        onClick: handleLockBackground,
                        separator: true,
                    },
                    {
                        id: "settings",
                        label: "Settings",
                        icon: <Settings className="size-4" />,
                        onClick: handleSettings,
                    },
                ]);
            }
        };

        // Listen to contextmenu events on document
        document.addEventListener("contextmenu", handleContextMenuEvent);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenuEvent);
        };
    }, [isLocked, showContextMenu, handleLockBackground]);

    return null;
}

export default DesktopContextMenu;

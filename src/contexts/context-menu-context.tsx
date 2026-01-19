import * as React from "react";
import { createPortal } from "react-dom";

export interface ContextMenuItemConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onClick: () => void;
  separator?: boolean; // Add separator after this item
}

interface ContextMenuState {
  isOpen: boolean;
  items: ContextMenuItemConfig[];
  position: { x: number; y: number } | null;
}

interface ContextMenuContextType {
  showContextMenu: (
    event: React.MouseEvent | MouseEvent,
    items: ContextMenuItemConfig[],
  ) => void;
  hideContextMenu: () => void;
}

const ContextMenuContext = React.createContext<
  ContextMenuContextType | undefined
>(undefined);

export function ContextMenuProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuState, setMenuState] = React.useState<ContextMenuState>({
    isOpen: false,
    items: [],
    position: null,
  });
  const menuRef = React.useRef<HTMLDivElement>(null);

  const showContextMenu = React.useCallback(
    (event: React.MouseEvent | MouseEvent, items: ContextMenuItemConfig[]) => {
      event.preventDefault();
      event.stopPropagation();

      setMenuState({
        isOpen: true,
        items,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [],
  );

  const hideContextMenu = React.useCallback(() => {
    setMenuState({
      isOpen: false,
      items: [],
      position: null,
    });
  }, []);

  // Adjust position to keep menu in viewport
  const getAdjustedPosition = React.useCallback(() => {
    if (!menuState.position || !menuRef.current) {
      return menuState.position;
    }

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    let { x, y } = menuState.position;

    // Check horizontal position - flip to left if not enough space on right
    const spaceOnRight = viewportWidth - x;
    const spaceOnLeft = x;

    if (spaceOnRight < menuRect.width + padding) {
      // Not enough space on right, try left
      if (spaceOnLeft > spaceOnRight) {
        // More space on left, open to the left of cursor
        x = x - menuRect.width;
      } else {
        // Still not enough, align to right edge with padding
        x = viewportWidth - menuRect.width - padding;
      }
    }

    // Check vertical position - flip to top if not enough space on bottom
    const spaceOnBottom = viewportHeight - y;
    const spaceOnTop = y;

    if (spaceOnBottom < menuRect.height + padding) {
      // Not enough space on bottom, try top
      if (spaceOnTop > spaceOnBottom) {
        // More space on top, open above cursor
        y = y - menuRect.height;
      } else {
        // Still not enough, align to bottom edge with padding
        y = viewportHeight - menuRect.height - padding;
      }
    }

    // Ensure menu doesn't go off left edge
    if (x < padding) {
      x = padding;
    }

    // Ensure menu doesn't go off top edge
    if (y < padding) {
      y = padding;
    }

    return { x, y };
  }, [menuState.position]);

  // Close menu on click outside
  React.useEffect(() => {
    if (menuState.isOpen) {
      const handleClick = () => hideContextMenu();

      // Small delay to prevent immediate close
      setTimeout(() => {
        document.addEventListener("click", handleClick);
      }, 0);

      return () => {
        document.removeEventListener("click", handleClick);
      };
    }
  }, [menuState.isOpen, hideContextMenu]);

  // Close menu on Escape key
  React.useEffect(() => {
    if (menuState.isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          hideContextMenu();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [menuState.isOpen, hideContextMenu]);

  const adjustedPosition = getAdjustedPosition();

  return (
    <ContextMenuContext.Provider value={{ showContextMenu, hideContextMenu }}>
      {children}

      {/* Global Context Menu */}
      {menuState.isOpen &&
        adjustedPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 min-w-32 overflow-hidden rounded-md border border-white/10 p-1 shadow-lg backdrop-blur-xl bg-black/40 dark:bg-black/60 text-popover-foreground animate-in fade-in-0 zoom-in-95"
            style={{
              left: adjustedPosition.x,
              top: adjustedPosition.y,
            }}
            onClick={(e) =>
              e.stopPropagation()}
          >
            {menuState.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <button
                  className={`relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground ${
                    item.variant === "destructive"
                      ? "text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                      : ""
                  }`}
                  onClick={() => {
                    item.onClick();
                    hideContextMenu();
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
                {item.separator && index < menuState.items.length - 1 && (
                  <div className="bg-border -mx-1 my-1 h-px" />
                )}
              </React.Fragment>
            ))}
          </div>,
          document.body,
        )}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const context = React.useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useContextMenu must be used within ContextMenuProvider");
  }
  return context;
}

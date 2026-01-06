import * as React from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface WidgetMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export interface WidgetWrapperProps {
  widgetId: string;
  onRemove: (id: string) => void;
  onSettings?: (id: string) => void;
  menuItems?: WidgetMenuItem[];
  children: React.ReactNode;
  className?: string;
}

const WidgetWrapper = React.forwardRef<HTMLDivElement, WidgetWrapperProps>(
  ({ widgetId, onRemove, onSettings, menuItems = [], children, className }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number } | null>(null);
    const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 400);
    };

    const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      if (!menuOpen && !contextMenu) {
        setIsHovered(false);
      }
    };

    // Handle right-click context menu
    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      // Close any other open context menus first
      window.dispatchEvent(new CustomEvent("kiwi-close-context-menu", { detail: { widgetId } }));
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    // Close context menu
    const closeContextMenu = () => {
      setContextMenu(null);
      setIsHovered(false);
    };

    // Handle click outside context menu and listen for close events from other widgets
    React.useEffect(() => {
      const handleClick = () => closeContextMenu();
      const handleScroll = () => closeContextMenu();
      const handleCloseEvent = (e: CustomEvent<{ widgetId: string }>) => {
        // Close this widget's context menu if another widget opened theirs
        if (e.detail.widgetId !== widgetId) {
          closeContextMenu();
        }
      };
      
      document.addEventListener("click", handleClick);
      document.addEventListener("scroll", handleScroll, true);
      window.addEventListener("kiwi-close-context-menu", handleCloseEvent as EventListener);
      
      return () => {
        document.removeEventListener("click", handleClick);
        document.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("kiwi-close-context-menu", handleCloseEvent as EventListener);
      };
    }, [widgetId]);

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      };
    }, []);

    const handleOpenChange = (open: boolean) => {
      setMenuOpen(open);
      if (!open && !isHovered) {
        setIsHovered(false);
      }
    };

    // Context menu items
    const contextMenuContent = (
      <div
        className="z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
        style={{
          position: 'fixed',
          left: contextMenu?.x ?? 0,
          top: contextMenu?.y ?? 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {onSettings && (
          <button
            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onSettings(widgetId);
              closeContextMenu();
            }}
          >
            Settings
          </button>
        )}
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={cn(
              "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
              item.variant === "destructive" && "text-destructive hover:text-destructive"
            )}
            onClick={() => {
              item.onClick();
              closeContextMenu();
            }}
          >
            {item.label}
          </button>
        ))}
        {(onSettings || menuItems.length > 0) && (
          <div className="-mx-1 my-1 h-px bg-border" />
        )}
        <button
          className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none text-destructive hover:bg-accent hover:text-destructive"
          onClick={() => {
            onRemove(widgetId);
            closeContextMenu();
          }}
        >
          Remove
        </button>
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn("group relative", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {children}
        
        {/* Hover button dropdown */}
        <div
          className={cn(
            "absolute -right-2 -top-2 transition-opacity duration-150",
            isHovered || menuOpen
              ? "opacity-100 pointer-events-auto" 
              : "opacity-0 pointer-events-none"
          )}
        >
          <DropdownMenu open={menuOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="bg-background rounded-full border border-border backdrop-blur-sm hover:bg-input"
                >
                  <MoreHorizontal className="size-3" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-32">
              {onSettings && (
                <DropdownMenuItem onClick={() => onSettings(widgetId)}>
                  Settings
                </DropdownMenuItem>
              )}
              {menuItems.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={item.onClick}
                  className={cn(
                    item.variant === "destructive" && "text-destructive focus:text-destructive"
                  )}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
              {(onSettings || menuItems.length > 0) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => onRemove(widgetId)}
                className="text-destructive focus:text-destructive"
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Context menu (right-click) - portal to body */}
        {contextMenu && createPortal(contextMenuContent, document.body)}
      </div>
    );
  }
);

WidgetWrapper.displayName = "WidgetWrapper";

export { WidgetWrapper };

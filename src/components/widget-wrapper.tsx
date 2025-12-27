import * as React from "react";
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
      if (!menuOpen) {
        setIsHovered(false);
      }
    };

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={ref}
        className={cn("group relative", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        
        <div
          className={cn(
            "absolute -right-2 -top-2 transition-opacity duration-150",
            isHovered || menuOpen 
              ? "opacity-100 pointer-events-auto" 
              : "opacity-0 pointer-events-none"
          )}
        >
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
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
            <DropdownMenuContent align="end" className="max-w-20">
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
      </div>
    );
  }
);

WidgetWrapper.displayName = "WidgetWrapper";

export { WidgetWrapper };

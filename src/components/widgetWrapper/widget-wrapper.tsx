import * as React from "react";
import { Settings, Trash2 } from "lucide-react";
import { useContextMenu } from "@/contexts/context-menu";
import { cn } from "@/lib/utils";

export interface WidgetMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
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
  (
    { widgetId, onRemove, onSettings, menuItems = [], children, className },
    ref,
  ) => {
    const { showContextMenu } = useContextMenu();

    // Build menu items array for context menu (right-click)
    const buildContextMenuItems = () => {
      const items = [];

      if (onSettings) {
        items.push({
          id: `settings-${widgetId}`,
          label: "Settings",
          icon: <Settings className="size-4 mr-2" />,
          onClick: () => onSettings(widgetId),
          separator: menuItems.length > 0,
        });
      }

      menuItems.forEach((item, index) => {
        items.push({
          id: `custom-${widgetId}-${index}`,
          label: item.label,
          icon: item.icon,
          variant: item.variant,
          onClick: item.onClick,
        });
      });

      // Add separator before remove if there are other items
      if (items.length > 0) {
        items[items.length - 1].separator = true;
      }

      items.push({
        id: `remove-${widgetId}`,
        label: "Remove",
        icon: <Trash2 className="size-4 mr-2" />,
        variant: "destructive" as const,
        onClick: () => onRemove(widgetId),
      });

      return items;
    };

    const handleContextMenu = (e: React.MouseEvent) => {
      showContextMenu(e, buildContextMenuItems());
    };

    return (
      <div
        ref={ref}
        className={cn("group relative widget-wrapper", className)}
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>
    );
  },
);

WidgetWrapper.displayName = "WidgetWrapper";

export { WidgetWrapper };

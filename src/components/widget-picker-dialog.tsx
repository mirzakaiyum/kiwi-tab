import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Calendar from "@/components/widgets/calendar";

// Available widget definitions
export interface WidgetDefinition {
  type: string;
  name: string;
  defaultVariant: string;
  preview: React.ReactNode;
}

const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    type: "calendar",
    name: "Calendar",
    defaultVariant: "compact",
    preview: <Calendar />,
  },
];

interface WidgetPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (type: string, variant: string) => void;
}

export function WidgetPickerDialog({
  open,
  onOpenChange,
  onAddWidget,
}: WidgetPickerDialogProps) {
  const handleAdd = (widget: WidgetDefinition) => {
    onAddWidget(widget.type, widget.defaultVariant);
  };

  // Handle escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-200"
      )}
    >
      <div className="bg-background border border-border rounded-2xl p-2 shadow-2xl min-w-[500px]">
        <div className="grid grid-cols-2 gap-1">
          {AVAILABLE_WIDGETS.map((widget) => (
            <div key={widget.type} className="flex flex-col items-center gap-2 w-full">
              <div className="group relative w-full">
                {/* Widget Preview */}
                <div className="w-full *:w-full">
                  {widget.preview}
                </div>
                {/* Add Button */}
                <button
                  onClick={() => handleAdd(widget)}
                  className={cn(
                    "absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full",
                    "bg-background border border-border shadow-sm",
                    "transition-transform hover:scale-110 active:scale-95"
                  )}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              {/* Widget Name */}
              <span className="text-sm text-muted-foreground">{widget.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </div>
    </div>
  );
}

export { AVAILABLE_WIDGETS };


import { useState, lazy, Suspense } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Lazy-load widget components - only loaded when picker opens
const Calendar = lazy(() => import("@/components/widgets/calendar"));
const AnalogClock = lazy(() => import("@/components/widgets/analogClock"));

// Available widget definitions with lazy-loaded components
interface WidgetDefinition {
  type: string;
  name: string;
  defaultVariant: string;
  component: React.ReactNode;
}

const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    type: "calendar",
    name: "Calendar",
    defaultVariant: "compact",
    component: <Calendar />,
  },
  {
    type: "analogClock",
    name: "Analog Clock",
    defaultVariant: "default",
    component: <AnalogClock />,
  },
];



export function CustomizeButton() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setIsVisible(true);
    setIsClosing(false);
    window.dispatchEvent(new CustomEvent("kiwi-picker-open", { detail: { open: true } }));
  };

  const handleClose = () => {
    if (isClosing) return; // Prevent multiple calls
    setIsClosing(true);
    window.dispatchEvent(new CustomEvent("kiwi-picker-open", { detail: { open: false } }));
    setTimeout(() => {
      setOpen(false);
      setIsVisible(false);
      setIsClosing(false);
    }, 200);
  };

  const handleAddWidget = (widget: WidgetDefinition) => {
    window.dispatchEvent(
      new CustomEvent("kiwi-add-widget", { detail: { type: widget.type, variant: widget.defaultVariant } })
    );
  };

  return (
    <>
      {/* Customize Button */}
      <Button
        variant="ghost"
        onClick={() => (open ? handleClose() : handleOpen())}
        className="fixed bottom-4 right-14 rounded-full bg-background/10 backdrop-blur-xl border border-border hover:bg-input"
      >
        <Pencil className="size-3" />
        <span className="">Customize</span>
      </Button>

      {/* Widget Picker Popup */}
      {isVisible && (
        <div
          className={cn(
            "fixed bottom-2 left-1/2 z-50 -translate-x-1/2",
            "duration-200 ease-in",
            isClosing 
              ? "animate-out slide-out-to-bottom-full fill-mode-forwards" 
              : "animate-in slide-in-from-bottom-full"
          )}
        >
          <div className="bg-background border border-border rounded-2xl w-3xl shadow-2xl overflow-hidden">
            <div className="max-h-80 overflow-y-auto p-4">
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_WIDGETS.map((widget) => (
                  <div key={widget.type} className="flex flex-col items-center gap-2 scale-80 origin-top-left">
                    <div className="group relative w-full">
                      <Suspense fallback={
                        <div className="w-full aspect-square rounded-xl bg-muted/50 border border-border animate-pulse" />
                      }>
                        {widget.component}
                      </Suspense>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleAddWidget(widget)}
                        className="absolute -right-2 -top-2 bg-background rounded-full border border-border backdrop-blur-sm hover:bg-input"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">{widget.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border p-4 flex justify-end">
              <Button size="sm" onClick={handleClose}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close on click outside */}
      {isVisible && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleClose}
        />
      )}
    </>
  );
}

export { AVAILABLE_WIDGETS };
export default CustomizeButton;

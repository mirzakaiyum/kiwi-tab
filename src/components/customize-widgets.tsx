import { useState, Suspense } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getAllWidgets, type WidgetDefinition } from "@/lib/widgets";

export function CustomizeButton() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Get all registered widgets from the registry
  const availableWidgets = getAllWidgets();

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
      new CustomEvent("kiwi-add-widget", { detail: { type: widget.metadata.id, variant: widget.metadata.defaultVariant } })
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
            <ScrollArea className="h-64">
              <div className="grid grid-cols-4 gap-3 p-4">
                {availableWidgets.map((widget) => {
                  const LazyComponent = widget.componentLazy;
                  return (
                    <div key={widget.metadata.id} className="flex flex-col items-center gap-2">
                      <div className="group relative w-full transform scale-75 origin-top">
                        <Suspense fallback={
                          <div className="w-full aspect-square rounded-xl bg-muted/50 border border-border animate-pulse" />
                        }>
                          <LazyComponent />
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
                      <span className="text-xs text-muted-foreground -mt-6">{widget.metadata.name}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="border-t border-border p-3 flex justify-end bg-background">
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

export default CustomizeButton;

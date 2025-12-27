import * as React from "react";
import { cn } from "@/lib/utils";
import { WidgetWrapper } from "@/components/widget-wrapper";
import Calendar from "@/components/widgets/calendar";
import AnalogClock from "@/components/widgets/analogClock";
import { ClockSettingsDialog, type ClockSettings } from "@/components/clock-settings-dialog";

const WIDGETS_STORAGE_KEY = "kiwi-widgets";

// Widget type registry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WIDGET_REGISTRY: Record<string, React.ComponentType<any>> = {
  calendar: Calendar,
  analogClock: AnalogClock,
};

// Widgets that have settings
const WIDGETS_WITH_SETTINGS = ["analogClock"];

export interface WidgetConfig {
  id: string;
  type: keyof typeof WIDGET_REGISTRY;
  variant?: string;
  settings?: {
    clock?: ClockSettings;
  };
}

// Default widgets configuration
const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "calendar-1", type: "calendar", variant: "compact" },
  { id: "calendar-2", type: "calendar", variant: "compact" },
  { id: "calendar-3", type: "calendar", variant: "compact" },
  { id: "calendar-4", type: "calendar", variant: "compact" },
];

function loadWidgets(): WidgetConfig[] {
  try {
    const saved = localStorage.getItem(WIDGETS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return DEFAULT_WIDGETS;
}

function saveWidgets(widgets: WidgetConfig[]) {
  localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets));
}

interface WidgetGridProps extends React.HTMLAttributes<HTMLDivElement> {}

const WidgetGrid = React.forwardRef<HTMLDivElement, WidgetGridProps>(
  ({ className, ...props }, ref) => {
    const [widgets, setWidgets] = React.useState<WidgetConfig[]>(loadWidgets);
    const [settingsWidgetId, setSettingsWidgetId] = React.useState<string | null>(null);

    // Get the widget being edited
    const settingsWidget = settingsWidgetId 
      ? widgets.find(w => w.id === settingsWidgetId) 
      : null;

    // Default clock settings
    const defaultClockSettings: ClockSettings = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      useCurrentLocation: true,
    };

    // Persist widgets on change
    React.useEffect(() => {
      saveWidgets(widgets);
    }, [widgets]);

    // Listen for add widget events from settings panel
    React.useEffect(() => {
      const handleAddWidget = (e: CustomEvent<{ type: string; variant: string }>) => {
        const { type, variant } = e.detail;
        const newWidget: WidgetConfig = {
          id: `${type}-${Date.now()}`,
          type,
          variant,
          settings: type === "analogClock" ? { clock: defaultClockSettings } : undefined,
        };
        setWidgets((prev) => [...prev, newWidget]);
      };

      window.addEventListener("kiwi-add-widget", handleAddWidget as EventListener);
      return () => {
        window.removeEventListener("kiwi-add-widget", handleAddWidget as EventListener);
      };
    }, []);

    const handleRemove = (id: string) => {
      setWidgets((prev) => prev.filter((w) => w.id !== id));
    };

    const handleSettings = (id: string) => {
      setSettingsWidgetId(id);
    };

    const handleSaveClockSettings = (settings: ClockSettings) => {
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === settingsWidgetId
            ? { ...w, settings: { ...w.settings, clock: settings } }
            : w
        )
      );
      setSettingsWidgetId(null);
    };

    if (widgets.length === 0) {
      return (
        <div 
          ref={ref}
          className={cn(
            "w-full grid grid-cols-2 gap-3 md:grid-cols-4 transition-all duration-300 ease-in-out",
            className
          )}
          {...props}
        />
      );
    }

    return (
      <>
        <div
          ref={ref}
          className={cn(
            "w-full grid grid-cols-2 gap-3 py-8 md:grid-cols-4 transition-all duration-300 ease-in-out",
            className
          )}
          {...props}
        >
          {widgets.map((widget) => {
            const WidgetComponent = WIDGET_REGISTRY[widget.type];
            if (!WidgetComponent) return null;

            const hasSettings = WIDGETS_WITH_SETTINGS.includes(widget.type);

            // Get widget-specific props
            const widgetProps: Record<string, unknown> = { variant: widget.variant };
            if (widget.type === "analogClock" && widget.settings?.clock) {
              widgetProps.timezone = widget.settings.clock.timezone;
              widgetProps.useCurrentLocation = widget.settings.clock.useCurrentLocation;
            }

            return (
              <WidgetWrapper
                key={widget.id}
                widgetId={widget.id}
                onRemove={handleRemove}
                onSettings={hasSettings ? handleSettings : undefined}
              >
                <WidgetComponent {...widgetProps} />
              </WidgetWrapper>
            );
          })}
        </div>

        {/* Clock Settings Dialog */}
        <ClockSettingsDialog
          open={settingsWidgetId !== null && settingsWidget?.type === "analogClock"}
          onOpenChange={(open) => !open && setSettingsWidgetId(null)}
          settings={settingsWidget?.settings?.clock || defaultClockSettings}
          onSave={handleSaveClockSettings}
        />
      </>
    );
  }
);

WidgetGrid.displayName = "WidgetGrid";

export { WidgetGrid };

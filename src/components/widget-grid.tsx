import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { WidgetWrapper } from "@/components/widget-wrapper";
import { SortableWidget } from "@/components/sortable-widget";
import { ClockSettingsDialog, type ClockSettings } from "@/components/dialogs/clock-settings-dialog";
import { DualClockSettingsDialog, type DualClockSettings } from "@/components/dialogs/dual-clock-settings-dialog";
import { WeatherSettingsDialog } from "@/components/dialogs/weather-settings-dialog";
import type { WeatherSettings } from "@/lib/widgets/types";
import {
  getWidget,
  getWidgetComponent,
  getWidgetDefaultSettings,
  loadWidgets,
  saveWidgets,
  createWidgetInstance,
  updateWidgetSettings,
  removeWidget,
  type WidgetInstance,
} from "@/lib/widgets";

// Default widgets configuration
const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: "calendar-1", type: "calendar", variant: "compact" },
  { id: "calendar-2", type: "calendar", variant: "compact" },
  { id: "calendar-3", type: "calendar", variant: "compact" },
  { id: "calendar-4", type: "calendar", variant: "compact" },
];

function getWidgetProps(widget: WidgetInstance): Record<string, unknown> {
  const props: Record<string, unknown> = { variant: widget.variant };
  
  // Spread settings into props
  if (widget.settings) {
    Object.assign(props, widget.settings);
  }
  
  return props;
}

interface WidgetGridProps extends React.HTMLAttributes<HTMLDivElement> {}

const WidgetGrid = React.forwardRef<HTMLDivElement, WidgetGridProps>(
  ({ className, ...props }, ref) => {
    const [widgets, setWidgets] = React.useState<WidgetInstance[]>(() => 
      loadWidgets(DEFAULT_WIDGETS)
    );
    const [settingsWidgetId, setSettingsWidgetId] = React.useState<string | null>(null);

    const settingsWidget = settingsWidgetId 
      ? widgets.find(w => w.id === settingsWidgetId) 
      : null;

    // Configure sensors for drag detection
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8, // 8px movement required to start drag
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    // Handle drag end - reorder widgets
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setWidgets((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };

    // Persist widgets on change
    React.useEffect(() => {
      saveWidgets(widgets);
    }, [widgets]);

    // Listen for add widget events from settings panel
    React.useEffect(() => {
      const handleAddWidget = (e: CustomEvent<{ type: string; variant: string }>) => {
        const { type, variant } = e.detail;
        const newWidget = createWidgetInstance(type, variant);
        setWidgets((prev) => [...prev, newWidget]);
      };

      window.addEventListener("kiwi-add-widget", handleAddWidget as EventListener);
      return () => {
        window.removeEventListener("kiwi-add-widget", handleAddWidget as EventListener);
      };
    }, []);

    const handleRemove = (id: string) => {
      setWidgets((prev) => removeWidget(prev, id));
    };

    const handleSettings = (id: string) => {
      setSettingsWidgetId(id);
    };

    const handleSaveClockSettings = (settings: ClockSettings) => {
      setWidgets((prev) => updateWidgetSettings(prev, settingsWidgetId!, settings));
      setSettingsWidgetId(null);
    };

    const handleSaveDualClockSettings = (settings: DualClockSettings) => {
      setWidgets((prev) => updateWidgetSettings(prev, settingsWidgetId!, settings));
      setSettingsWidgetId(null);
    };

    const handleSaveWeatherSettings = (settings: WeatherSettings) => {
      setWidgets((prev) => updateWidgetSettings(prev, settingsWidgetId!, settings));
      setSettingsWidgetId(null);
    };

    // Get default settings for dialogs
    const defaultClockSettings: ClockSettings = (getWidgetDefaultSettings("analogClock") as unknown as ClockSettings) || {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      useCurrentLocation: true,
    };

    const defaultDualClockSettings: DualClockSettings = (getWidgetDefaultSettings("dualClock") as unknown as DualClockSettings) || {
      timezone1: "Europe/London",
      timezone2: "America/New_York",
    };

    const defaultWeatherSettings: WeatherSettings = (getWidgetDefaultSettings("weather") as unknown as WeatherSettings) || {
      city: "Dhaka",
      unit: "C",
      autoDetect: false,
    };

    const gridClassName = cn(
      "w-full grid grid-cols-2 gap-3 md:grid-cols-4 transition-all duration-300 ease-in-out",
      widgets.length > 0 && "py-8",
      className
    );

    return (
      <>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={widgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            <div ref={ref} className={gridClassName} {...props}>
              {widgets.map((widget) => {
                const WidgetComponent = getWidgetComponent(widget.type);
                if (!WidgetComponent) return null;

                const widgetDef = getWidget(widget.type);
                const hasSettings = widgetDef?.metadata.hasSettings ?? false;
                const widgetProps = getWidgetProps(widget);

                return (
                  <SortableWidget key={widget.id} id={widget.id}>
                    <WidgetWrapper
                      widgetId={widget.id}
                      onRemove={handleRemove}
                      onSettings={hasSettings ? handleSettings : undefined}
                    >
                      <WidgetComponent {...widgetProps} />
                    </WidgetWrapper>
                  </SortableWidget>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Clock Settings Dialog */}
        <ClockSettingsDialog
          open={settingsWidgetId !== null && settingsWidget?.type === "analogClock"}
          onOpenChange={(open) => !open && setSettingsWidgetId(null)}
          settings={(settingsWidget?.settings as unknown as ClockSettings) || defaultClockSettings}
          onSave={handleSaveClockSettings}
        />

        {/* Dual Clock Settings Dialog */}
        <DualClockSettingsDialog
          open={settingsWidgetId !== null && settingsWidget?.type === "dualClock"}
          onOpenChange={(open) => !open && setSettingsWidgetId(null)}
          settings={(settingsWidget?.settings as unknown as DualClockSettings) || defaultDualClockSettings}
          onSave={handleSaveDualClockSettings}
        />

        {/* Weather Settings Dialog */}
        <WeatherSettingsDialog
          open={settingsWidgetId !== null && settingsWidget?.type === "weather"}
          onOpenChange={(open) => !open && setSettingsWidgetId(null)}
          settings={(settingsWidget?.settings as unknown as WeatherSettings) || defaultWeatherSettings}
          onSave={handleSaveWeatherSettings}
        />
      </>
    );
  }
);

WidgetGrid.displayName = "WidgetGrid";

export { WidgetGrid };

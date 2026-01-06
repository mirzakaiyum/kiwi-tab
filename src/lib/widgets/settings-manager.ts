import { getWidgetDefaultSettings } from "./registry";
import type { WidgetInstance } from "./types";

const WIDGETS_STORAGE_KEY = "kiwi-widgets";

/**
 * Load widgets from localStorage
 */
export function loadWidgets(defaultWidgets: WidgetInstance[]): WidgetInstance[] {
  try {
    const saved = localStorage.getItem(WIDGETS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as WidgetInstance[];
      // Ensure each widget has default settings if missing
      return parsed.map((widget) => ({
        ...widget,
        settings: widget.settings || getWidgetDefaultSettings(widget.type),
      }));
    }
  } catch {
    // Silently fail and return defaults
  }
  return defaultWidgets;
}

/**
 * Save widgets to localStorage
 */
export function saveWidgets(widgets: WidgetInstance[]): void {
  localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets));
}

/**
 * Create a new widget instance with default settings
 */
export function createWidgetInstance(
  type: string,
  variant: string
): WidgetInstance {
  return {
    id: `${type}-${Date.now()}`,
    type,
    variant,
    settings: getWidgetDefaultSettings(type),
  };
}

/**
 * Update widget settings
 */
export function updateWidgetSettings<T extends object>(
  widgets: WidgetInstance[],
  widgetId: string,
  newSettings: T
): WidgetInstance[] {
  return widgets.map((widget) =>
    widget.id === widgetId
      ? { ...widget, settings: { ...widget.settings, ...newSettings } }
      : widget
  );
}

/**
 * Remove a widget by ID
 */
export function removeWidget(
  widgets: WidgetInstance[],
  widgetId: string
): WidgetInstance[] {
  return widgets.filter((widget) => widget.id !== widgetId);
}

/**
 * Get widget settings or default
 */
export function getWidgetSettings<T extends Record<string, unknown>>(
  widget: WidgetInstance,
  defaultSettings: T
): T {
  return (widget.settings as T) || defaultSettings;
}

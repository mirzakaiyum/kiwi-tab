import type { WidgetDefinition, WidgetMetadata } from "./types";

// Central registry for all widgets
const widgetRegistry = new Map<string, WidgetDefinition>();

/**
 * Register a widget with the system.
 * Called by each widget during module initialization.
 */
export function registerWidget<TSettings = unknown>(
  definition: WidgetDefinition<TSettings>
): void {
  const { id } = definition.metadata;
  if (widgetRegistry.has(id)) {
    console.warn(`Widget "${id}" is already registered. Skipping duplicate.`);
    return;
  }
  widgetRegistry.set(id, definition as WidgetDefinition);
}

/**
 * Get a single widget definition by ID.
 */
export function getWidget(id: string): WidgetDefinition | undefined {
  return widgetRegistry.get(id);
}

/**
 * Get all registered widgets.
 */
export function getAllWidgets(): WidgetDefinition[] {
  return Array.from(widgetRegistry.values());
}

/**
 * Get all widget metadata (for picker display).
 */
export function getAllWidgetMetadata(): WidgetMetadata[] {
  return getAllWidgets().map((w) => w.metadata);
}

/**
 * Check if a widget type exists.
 */
export function hasWidget(id: string): boolean {
  return widgetRegistry.has(id);
}

/**
 * Get widget component for rendering.
 */
export function getWidgetComponent(id: string) {
  return widgetRegistry.get(id)?.component;
}

/**
 * Get lazy widget component for picker preview.
 */
export function getWidgetLazyComponent(id: string) {
  return widgetRegistry.get(id)?.componentLazy;
}

/**
 * Get default settings for a widget.
 */
export function getWidgetDefaultSettings(id: string): Record<string, unknown> | undefined {
  return widgetRegistry.get(id)?.defaultSettings as Record<string, unknown> | undefined;
}

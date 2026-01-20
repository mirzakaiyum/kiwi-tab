import { Widget, WidgetContent } from "@/components/widgetWrapper/widget";
import { Label } from "@/components/ui/label";
import { lazy } from "react";
import { registerWidget } from "@/lib/widgets/registry";

export default function CalendarWidget() {
  const now = new Date();

  const day = now.toLocaleDateString("en-US", { weekday: "short" });
  const month = now.toLocaleDateString("en-US", { month: "short" });
  const date = now.getDate().toString().padStart(2, "0");

  return (
    <Widget>
      <WidgetContent className="mx-auto flex-col items-start">
        <div className="flex w-full items-center justify-center gap-2">
          <Label className="text-destructive text-2xl">{day}</Label>
          <Label className="text-2xl">{month}</Label>
        </div>
        <Label className="text-7xl">{date}</Label>
        {/* <Label className="text-muted-foreground mx-auto">{now.getFullYear()}</Label> */}
      </WidgetContent>
    </Widget>
  );
}

// Self-registration
registerWidget({
  metadata: {
    id: "calendar",
    name: "Calendar",
    description: "Display current date",
    defaultVariant: "compact",
    hasSettings: false,
  },
  component: CalendarWidget,
  componentLazy: lazy(() => import("./calendar")),
});

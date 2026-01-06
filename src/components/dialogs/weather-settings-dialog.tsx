import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { WeatherSettings } from "@/lib/widgets/types";

interface WeatherSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: WeatherSettings;
  onSave: (settings: WeatherSettings) => void;
}

export function WeatherSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: WeatherSettingsDialogProps) {
  const [city, setCity] = React.useState(settings.city);
  const [unit, setUnit] = React.useState(settings.unit);
  const [autoDetect, setAutoDetect] = React.useState(settings.autoDetect ?? false);

  // Reset to current settings when dialog opens
  React.useEffect(() => {
    if (open) {
      setCity(settings.city);
      setUnit(settings.unit);
      setAutoDetect(settings.autoDetect ?? false);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave({ city, unit, autoDetect });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Weather Settings</DialogTitle>
          <DialogDescription>
            Configure location and temperature unit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-4">
              {/* City */}
              <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="city">City</Label>
                  <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Dhaka"
                      disabled={autoDetect}
                      className="bg-background w-40 text-sm disabled:opacity-50"
                  />
              </div>

              {/* Auto-detect */}
              <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="auto-detect">Auto-detect location</Label>
                  <Switch
                      id="auto-detect"
                      checked={autoDetect}
                      onCheckedChange={(checked) => setAutoDetect(checked)}
                  />
              </div>

              {/* Temperature Unit */}
              <div className="flex items-center justify-between">
                  <Label>Temperature unit</Label>
                  <div className="bg-muted inline-flex items-center overflow-hidden rounded-md p-0.5">
                      {[
                          { value: "C" as const, label: "°C" },
                          { value: "F" as const, label: "°F" },
                      ].map((option) => (
                          <button
                              key={option.value}
                              className={cn(
                                  "relative flex items-center gap-1.5 px-2.5 py-1 text-xs cursor-pointer rounded transition-all",
                                  unit === option.value
                                      ? "text-foreground bg-background shadow-sm"
                                      : "text-muted-foreground hover:text-foreground"
                              )}
                              onClick={() => setUnit(option.value)}
                          >
                              {option.label}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

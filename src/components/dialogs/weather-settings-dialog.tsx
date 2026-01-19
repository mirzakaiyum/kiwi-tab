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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
                      className="w-40 text-sm disabled:opacity-50"
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
                  <Tabs value={unit} onValueChange={(v) => setUnit(v as "C" | "F")}>
                      <TabsList className="grid w-24 grid-cols-2">
                          <TabsTrigger value="C">°C</TabsTrigger>
                          <TabsTrigger value="F">°F</TabsTrigger>
                      </TabsList>
                  </Tabs>
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

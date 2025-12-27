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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Major cities grouped by region
const TIMEZONE_CITIES = {
  "Americas": [
    { city: "New York", timezone: "America/New_York" },
    { city: "Los Angeles", timezone: "America/Los_Angeles" },
    { city: "Chicago", timezone: "America/Chicago" },
    { city: "Toronto", timezone: "America/Toronto" },
    { city: "Vancouver", timezone: "America/Vancouver" },
    { city: "Mexico City", timezone: "America/Mexico_City" },
    { city: "São Paulo", timezone: "America/Sao_Paulo" },
  ],
  "Europe": [
    { city: "London", timezone: "Europe/London" },
    { city: "Paris", timezone: "Europe/Paris" },
    { city: "Berlin", timezone: "Europe/Berlin" },
    { city: "Rome", timezone: "Europe/Rome" },
    { city: "Madrid", timezone: "Europe/Madrid" },
    { city: "Amsterdam", timezone: "Europe/Amsterdam" },
    { city: "Moscow", timezone: "Europe/Moscow" },
  ],
  "Asia": [
    { city: "Tokyo", timezone: "Asia/Tokyo" },
    { city: "Shanghai", timezone: "Asia/Shanghai" },
    { city: "Hong Kong", timezone: "Asia/Hong_Kong" },
    { city: "Singapore", timezone: "Asia/Singapore" },
    { city: "Dubai", timezone: "Asia/Dubai" },
    { city: "Mumbai", timezone: "Asia/Kolkata" },
    { city: "Dhaka", timezone: "Asia/Dhaka" },
    { city: "Seoul", timezone: "Asia/Seoul" },
  ],
  "Pacific": [
    { city: "Sydney", timezone: "Australia/Sydney" },
    { city: "Melbourne", timezone: "Australia/Melbourne" },
    { city: "Auckland", timezone: "Pacific/Auckland" },
  ],
};

export interface ClockSettings {
  timezone: string;
  useCurrentLocation: boolean;
}

interface ClockSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ClockSettings;
  onSave: (settings: ClockSettings) => void;
}

export function ClockSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: ClockSettingsDialogProps) {
  const [timezone, setTimezone] = React.useState(settings.timezone);
  const [useCurrentLocation, setUseCurrentLocation] = React.useState(settings.useCurrentLocation);

  // Reset to current settings when dialog opens
  React.useEffect(() => {
    if (open) {
      setTimezone(settings.timezone);
      setUseCurrentLocation(settings.useCurrentLocation);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave({ timezone, useCurrentLocation });
    onOpenChange(false);
  };

  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleTimezoneChange = (value: string | null) => {
    if (value) {
      setTimezone(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clock Settings</DialogTitle>
          <DialogDescription>
            Choose the timezone for this clock widget.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Timezone Select */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={timezone}
              onValueChange={handleTimezoneChange}
              disabled={useCurrentLocation}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIMEZONE_CITIES).map(([region, cities]) => (
                  <SelectGroup key={region}>
                    <SelectLabel>{region}</SelectLabel>
                    {cities.map((item) => (
                      <SelectItem key={item.timezone} value={item.timezone}>
                        {item.city}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Use Current Location Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useCurrentLocation}
              onChange={(e) => {
                setUseCurrentLocation(e.target.checked);
                if (e.target.checked) {
                  setTimezone(currentTimezone);
                }
              }}
              className="size-4 rounded border-border accent-primary"
            />
            <span className="text-sm">
              Use current location ({currentTimezone.split("/").pop()?.replace(/_/g, " ")})
            </span>
          </label>
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


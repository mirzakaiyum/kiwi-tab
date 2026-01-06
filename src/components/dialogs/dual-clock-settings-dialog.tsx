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
import { TIMEZONE_CITIES } from "@/lib/constants";

export interface DualClockSettings {
  timezone1: string;
  timezone2: string;
}

interface DualClockSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: DualClockSettings;
  onSave: (settings: DualClockSettings) => void;
}

export function DualClockSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: DualClockSettingsDialogProps) {
  const [timezone1, setTimezone1] = React.useState(settings.timezone1);
  const [timezone2, setTimezone2] = React.useState(settings.timezone2);

  // Reset to current settings when dialog opens
  React.useEffect(() => {
    if (open) {
      setTimezone1(settings.timezone1);
      setTimezone2(settings.timezone2);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave({ timezone1, timezone2 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dual Clock Settings</DialogTitle>
          <DialogDescription>
            Choose the timezones for your dual clock widget.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Clock 1 Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone1">First Clock</Label>
            <Select
              value={timezone1}
              onValueChange={(val) => val && setTimezone1(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIMEZONE_CITIES).map(([region, cities]) => (
                  <SelectGroup key={region}>
                    <SelectLabel>{region}</SelectLabel>
                    {cities.map((item) => (
                      <SelectItem key={`tz1-${item.timezone}`} value={item.timezone}>
                        {item.city}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clock 2 Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone2">Second Clock</Label>
            <Select
              value={timezone2}
              onValueChange={(val) => val && setTimezone2(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIMEZONE_CITIES).map(([region, cities]) => (
                  <SelectGroup key={region}>
                    <SelectLabel>{region}</SelectLabel>
                    {cities.map((item) => (
                      <SelectItem key={`tz2-${item.timezone}`} value={item.timezone}>
                        {item.city}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
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

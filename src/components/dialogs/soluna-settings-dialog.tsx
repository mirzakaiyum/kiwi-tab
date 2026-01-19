"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SolunaSettings, SolunaDisplayMode } from "@/lib/widgets/types";
import { getMethods } from "@/lib/services/soluna";

interface SolunaSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SolunaSettings;
  onSave: (settings: SolunaSettings) => void;
}

const displayModeOptions: { value: SolunaDisplayMode; label: string }[] = [
  { value: "sun", label: "Sun" },
  { value: "moon", label: "Moon" },
  { value: "prayer", label: "Prayer" },
];

export function SolunaSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: SolunaSettingsDialogProps) {
  const [displayMode, setDisplayMode] = React.useState<SolunaDisplayMode>(settings.displayMode);
  const [location, setLocation] = React.useState(settings.location);
  const [autoDetect, setAutoDetect] = React.useState(settings.autoDetect ?? false);
  const [calculationMethod, setCalculationMethod] = React.useState(settings.calculationMethod ?? "1");

  const methods = React.useMemo(() => getMethods(), []);

  // Reset to current settings when dialog opens
  React.useEffect(() => {
    if (open) {
      setDisplayMode(settings.displayMode);
      setLocation(settings.location);
      setAutoDetect(settings.autoDetect ?? false);
      setCalculationMethod(settings.calculationMethod ?? "1");
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave({
      displayMode,
      location,
      autoDetect,
      calculationMethod,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Soluna Settings</DialogTitle>
          <DialogDescription>
            Configure display mode and location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Display Mode */}
          <div className="flex items-center justify-between">
            <Label>Display</Label>
            <Tabs value={displayMode} onValueChange={(value) => setDisplayMode(value as SolunaDisplayMode)}>
              <TabsList>
                {displayModeOptions.map((option) => (
                  <TabsTrigger key={option.value} value={option.value}>
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="London"
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

          {/* Calculation Method - only show for prayer mode */}
          {displayMode === "prayer" && (
            <div className="space-y-2">
              <Label htmlFor="method">Calculation Method</Label>
              <Select value={calculationMethod} onValueChange={(value) => value && setCalculationMethod(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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

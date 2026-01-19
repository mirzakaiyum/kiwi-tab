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
import { Input } from "@/components/ui/input";

export interface EditPinnedSiteData {
  title: string;
  url: string;
  backgroundColor?: string;
}

// Preset color options
const PRESET_COLORS = [
  { value: "#ffffff", label: "Default" },
  { value: "#000000", label: "Black" },
];

interface EditPinnedSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EditPinnedSiteData;
  onSave: (data: EditPinnedSiteData) => void;
  mode: "edit" | "add";
}

export function EditPinnedSiteDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  mode,
}: EditPinnedSiteDialogProps) {
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [url, setUrl] = React.useState(initialData?.url || "");
  const [backgroundColor, setBackgroundColor] = React.useState(initialData?.backgroundColor || "");

  // Reset when dialog opens with new data
  React.useEffect(() => {
    if (open) {
      setTitle(initialData?.title || "");
      setUrl(initialData?.url || "");
      setBackgroundColor(initialData?.backgroundColor || "");
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (!title.trim() || !url.trim()) return;
    
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;
    onSave({ 
      title: title.trim(), 
      url: finalUrl,
      backgroundColor: backgroundColor || undefined,
    });
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Site" : "Edit Site"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new pinned site to your shortcuts."
              : "Modify the title and URL of this pinned site."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="site-title">Title</Label>
            <Input
              id="site-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., YouTube"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-url">URL</Label>
            <Input
              id="site-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., youtube.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value || "default"}
                  type="button"
                  title={color.label}
                  onClick={() => setBackgroundColor(color.value)}
                  className={`size-7 rounded-lg border-2 transition-all hover:scale-110 ${
                    backgroundColor === color.value
                      ? "border-white ring-2 ring-white/50"
                      : "border-transparent"
                  }`}
                  style={{
                    backgroundColor: color.value || "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
              {/* Custom color picker */}
              <label className="relative">
                <input
                  type="color"
                  value={backgroundColor || "#3b82f6"}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="absolute inset-0 size-7 cursor-pointer opacity-0"
                />
                <div
                  className={`size-7 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center bg-linear-to-br from-red-500 via-green-500 to-blue-500 ${
                    backgroundColor && !PRESET_COLORS.some(c => c.value === backgroundColor)
                      ? "border-white ring-2 ring-white/50"
                      : "border-transparent"
                  }`}
                  title="Custom color"
                />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !url.trim()}>
            {mode === "add" ? "Add" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

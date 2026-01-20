"use client";

import * as React from "react";
import { lazy, useCallback } from "react";
import { Widget } from "@/components/widgetWrapper/widget";
import { registerWidget } from "@/lib/widgets/registry";

const STORAGE_KEY_PREFIX = "kiwi-sticky-note-";

// Helper to check if Chrome storage is available
const isChromeStorageAvailable = () =>
  typeof chrome !== "undefined" && chrome.storage?.sync;

interface StickyNoteWidgetProps {
  instanceId?: string;
}

export default function StickyNoteWidget(
  { instanceId }: StickyNoteWidgetProps,
) {
  const [note, setNote] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Create unique storage key for this instance
  const storageKey = `${STORAGE_KEY_PREFIX}${instanceId || "default"}`;

  // Load note from storage on mount
  React.useEffect(() => {
    if (isChromeStorageAvailable()) {
      chrome.storage.sync.get([storageKey], (result) => {
        if (result[storageKey]) {
          setNote(result[storageKey] as string);
        }
      });
    } else {
      // Fallback to localStorage for development
      const savedNote = localStorage.getItem(storageKey);
      if (savedNote) {
        setNote(savedNote);
      }
    }
  }, [storageKey]);

  // Debounced save to storage
  const saveNote = useCallback((value: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (isChromeStorageAvailable()) {
        chrome.storage.sync.set({ [storageKey]: value });
      } else {
        // Fallback to localStorage for development
        localStorage.setItem(storageKey, value);
      }
    }, 500);
  }, [storageKey]);

  // Save note whenever it changes (debounced)
  React.useEffect(() => {
    saveNote(note);
  }, [note, saveNote]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  return (
    <Widget className="p-0 overflow-hidden" design="tight">
      <textarea
        ref={textareaRef}
        value={note}
        onChange={handleChange}
        onKeyDown={(e) => e.stopPropagation()}
        placeholder="New note..."
        className="
          w-full h-full min-h-[120px] p-4
          bg-transparent          
          resize-none
          border-none outline-none
          text-sm leading-relaxed
          font-medium
        "
        spellCheck={false}
      />
    </Widget>
  );
}

// Self-registration
registerWidget({
  metadata: {
    id: "stickyNote",
    name: "Sticky Note",
    description: "Save quick notes locally",
    defaultVariant: "default",
    hasSettings: false,
  },
  component: StickyNoteWidget,
  componentLazy: lazy(() => import("./stickyNote")),
});

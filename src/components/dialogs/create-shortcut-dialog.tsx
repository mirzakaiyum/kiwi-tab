import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UserShortcut = {
    id: string;
    name: string;
    prompt: string;
};

export interface CreateShortcutDialogProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onSave: (s: UserShortcut, isEdit: boolean) => void;
    onDelete: (id: string) => void;
    shortcuts: UserShortcut[];
    maxReached?: boolean;
    reservedNames?: string[];
}

export default function CreateShortcutDialog({
    open,
    onOpenChange,
    onSave,
    onDelete,
    shortcuts,
    maxReached = false,
    reservedNames = [],
}: CreateShortcutDialogProps) {
    const [selectedShortcut, setSelectedShortcut] =
        React.useState<UserShortcut | null>(null);
    const [name, setName] = React.useState("");
    const [prompt, setPrompt] = React.useState("");
    const [error, setError] = React.useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    // Reset form when dialog opens/closes
    React.useEffect(() => {
        if (!open) {
            setName("");
            setPrompt("");
            setError("");
            setSelectedShortcut(null);
        }
    }, [open]);

    // Load selected shortcut data into form
    const handleSelectShortcut = (shortcut: UserShortcut) => {
        setSelectedShortcut(shortcut);
        // Remove the leading slash for editing
        setName(shortcut.name.replace(/^\//, ""));
        setPrompt(shortcut.prompt);
        setError("");
    };

    // Clear form for new shortcut
    const handleNewShortcut = () => {
        setSelectedShortcut(null);
        setName("");
        setPrompt("");
        setError("");
    };

    const handleNameChange = (value: string) => {
        // Remove leading slash if user types it, replace spaces with dashes, lowercase
        const cleaned = value
            .replace(/^\//, "") // Remove leading slash
            .replace(/\s+/g, "-") // Replace spaces with dashes
            .toLowerCase();
        setName(cleaned);
    };

    const handleSave = () => {
        setError("");
        if (!name.trim()) return setError("Name is required");
        if (!prompt.trim()) return setError("Prompt is required");

        const isEdit = selectedShortcut !== null;

        const normalized = name.trim().toLowerCase();

        // Check reserved names only for new shortcuts or if name changed
        if (!isEdit || selectedShortcut.name !== `/${normalized}`) {
            if (reservedNames.some((r) => r.toLowerCase() === normalized)) {
                return setError("That name is reserved for quick suggestions");
            }
        }

        // Check max limit only for new shortcuts
        if (!isEdit && maxReached) {
            return setError("Maximum shortcuts reached");
        }

        const id = selectedShortcut
            ? selectedShortcut.id
            : normalized.replace(/[^a-z0-9-]+/g, "-");
        const displayName = `/${normalized}`;

        onSave({ id, name: displayName, prompt: prompt.trim() }, isEdit);
        handleNewShortcut();
    };

    const handleDelete = () => {
        if (selectedShortcut) {
            onDelete(selectedShortcut.id);
            setShowDeleteConfirm(false);
            handleNewShortcut();
        }
    };

    const isEditMode = selectedShortcut !== null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl!">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? "Edit Shortcut" : "Create a Shortcut"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-4 min-h-[400px] max-h-[600px]">
                        {/* Left Sidebar - Shortcut List */}
                        <div className="w-56 flex flex-col gap-2 border-r pr-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-xs font-medium text-muted-foreground">
                                    Your Shortcuts ({shortcuts.length}/6)
                                </h3>
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleNewShortcut}
                                className={cn(
                                    "justify-start gap-2 mb-2",
                                    !isEditMode &&
                                        "bg-primary/10 border-primary",
                                )}
                                disabled={maxReached && !isEditMode}
                            >
                                <Plus className="size-4" />
                                New Shortcut
                            </Button>

                            {/* Scrollable Shortcut List */}
                            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {shortcuts.length === 0 ? (
                                    <div className="text-xs text-muted-foreground/60 text-center py-8">
                                        No shortcuts yet
                                    </div>
                                ) : (
                                    shortcuts.map((shortcut) => {
                                        const isSelected =
                                            selectedShortcut?.id ===
                                            shortcut.id;
                                        return (
                                            <button
                                                key={shortcut.id}
                                                onClick={() =>
                                                    handleSelectShortcut(
                                                        shortcut,
                                                    )
                                                }
                                                className={cn(
                                                    "w-full flex items-center gap-2 px-3 py-2 rounded-full text-left transition-colors text-xs",
                                                    isSelected
                                                        ? "bg-foreground/10 text-foreground"
                                                        : "hover:bg-foreground/10",
                                                )}
                                            >
                                                <span className="truncate">
                                                    {shortcut.name}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Pane - Shortcut Form */}
                        <div className="flex-1 flex flex-col">
                            <ScrollArea className="flex-1 pr-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs opacity-60">
                                            Shortcut name
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground">
                                                /
                                            </span>
                                            <Input
                                                value={name}
                                                onChange={(e) =>
                                                    handleNameChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-6 rounded-md border-transparent bg-input"
                                                placeholder="shortcut-name"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs opacity-60">
                                            Prompt
                                        </label>
                                        <Textarea
                                            value={prompt}
                                            onChange={(e) =>
                                                setPrompt(e.target.value)
                                            }
                                            className="h-48 rounded-md border-transparent bg-input resize-none custom-scrollbar"
                                            placeholder="Enter the prompt that will be used when this shortcut is triggered..."
                                            maxLength={1000}
                                        />
                                        <div className="text-xs text-muted-foreground/60 text-right">
                                            {prompt.length}/1000 characters
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-destructive text-sm">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                {isEditMode && !showDeleteConfirm && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            setShowDeleteConfirm(true)
                                        }
                                        className="gap-2"
                                    >
                                        <Trash2 className="size-4" />
                                        Delete Shortcut
                                    </Button>
                                )}
                                {isEditMode && showDeleteConfirm && (
                                    <>
                                        <span className="text-sm text-muted-foreground">
                                            Are you sure?
                                        </span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDelete}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setShowDeleteConfirm(false)
                                            }
                                        >
                                            No
                                        </Button>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <DialogClose asChild>
                                    <Button variant="outline">Close</Button>
                                </DialogClose>
                                <Button
                                    onClick={handleSave}
                                    disabled={!isEditMode && maxReached}
                                >
                                    {isEditMode ? "Update" : "Save"}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

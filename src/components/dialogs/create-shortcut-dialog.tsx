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

type UserShortcut = {
    id: string;
    name: string;
    prompt: string;
};

export interface CreateShortcutDialogProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onSave: (s: UserShortcut) => void;
    maxReached?: boolean;
    reservedNames?: string[];
}

export default function CreateShortcutDialog({
    open,
    onOpenChange,
    onSave,
    maxReached = false,
    reservedNames = [],
}: CreateShortcutDialogProps) {
    const [name, setName] = React.useState("");
    const [prompt, setPrompt] = React.useState("");
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        if (!open) {
            setName("");
            setPrompt("");
            setError("");
        }
    }, [open]);

    const handleNameChange = (value: string) => {
        // Remove leading slash if user types it, replace spaces with dashes, lowercase
        const cleaned = value
            .replace(/^\//, '') // Remove leading slash
            .replace(/\s+/g, '-') // Replace spaces with dashes
            .toLowerCase();
        setName(cleaned);
    };

    const handleSave = () => {
        setError("");
        if (!name.trim()) return setError("Name is required");
        if (!prompt.trim()) return setError("Prompt is required");
        const normalized = name.trim().toLowerCase();
        if (reservedNames.some((r) => r.toLowerCase() === normalized)) {
            return setError("That name is reserved for quick suggestions");
        }
        if (maxReached) return setError("Maximum shortcuts reached");
        const id = normalized.replace(/[^a-z0-9-]+/g, "-");
        const displayName = `/${normalized}`;
        onSave({ id, name: displayName, prompt: prompt.trim() });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a shortcut</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs opacity-60">Shortcut name</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground">/</span>
                            <Input
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                className="pl-4 rounded-md border-transparent bg-input"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                    <label className="text-xs opacity-60">Prompt</label>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="h-24 rounded-md border-transparent bg-input"
                    />
                    </div>
                    {error && (
                        <div className="text-destructive text-sm">{error}</div>
                    )}
                </div>

                <DialogFooter>
                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                        <Button onClick={handleSave} disabled={maxReached}>
                            Save
                        </Button>
                    </div>
                    {maxReached && (
                        <div className="text-sm text-muted-foreground/70 mt-2">
                            You have reached the maximum of 6 shortcuts. Please
                            delete one to add another.
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

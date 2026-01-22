import * as React from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { type Expert } from "@/defaults/default-prompts";

export interface CreateExpertDialogProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onSave: (e: Expert) => void;
    maxReached?: boolean;
}

export default function CreateExpertDialog({
    open,
    onOpenChange,
    onSave,
    maxReached = false,
}: CreateExpertDialogProps) {
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

    const handleSave = () => {
        setError("");
        if (!name.trim()) return setError("Name is required");
        if (!prompt.trim()) return setError("Prompt is required");
        if (maxReached) return setError("Maximum experts reached");

        const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
        onSave({
            id,
            name: name.trim(),
            prompt: prompt.trim(),
            icon: "Sparkles",
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Make an expert</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs opacity-60">
                            Expert name
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Marketing Specialist"
                            className="rounded-md border-transparent bg-input"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs opacity-60">
                            System prompt
                        </label>
                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe how this expert should behave, their expertise, and response style..."
                            className="h-32 rounded-md border-transparent bg-input"
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
                            You have reached the maximum of 10 experts. Please
                            delete one to add another.
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

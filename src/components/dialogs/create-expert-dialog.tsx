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
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Expert } from "@/defaults/default-prompts";
import {
    Award,
    BookOpen,
    Brain,
    Briefcase,
    Code,
    Coffee,
    Globe,
    GraduationCap,
    Heart,
    Lightbulb,
    type LucideIcon,
    Palette,
    Plus,
    Rocket,
    Sparkles,
    Target,
    Trash2,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping for experts - expanded to 15 icons
const EXPERT_ICONS: Record<string, LucideIcon> = {
    Sparkles,
    Code,
    GraduationCap,
    Heart,
    Palette,
    Lightbulb,
    Rocket,
    Brain,
    Briefcase,
    BookOpen,
    Zap,
    Target,
    Award,
    Globe,
    Coffee,
};

// Available icons for selection (15 icons)
const AVAILABLE_ICONS = [
    { name: "Sparkles", icon: Sparkles },
    { name: "Code", icon: Code },
    { name: "GraduationCap", icon: GraduationCap },
    { name: "Heart", icon: Heart },
    { name: "Palette", icon: Palette },
    { name: "Lightbulb", icon: Lightbulb },
    { name: "Rocket", icon: Rocket },
    { name: "Brain", icon: Brain },
    { name: "Briefcase", icon: Briefcase },
    { name: "BookOpen", icon: BookOpen },
    { name: "Zap", icon: Zap },
    { name: "Target", icon: Target },
    { name: "Award", icon: Award },
    { name: "Globe", icon: Globe },
    { name: "Coffee", icon: Coffee },
];

export interface CreateExpertDialogProps {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onSave: (e: Expert, isEdit: boolean) => void;
    onDelete: (id: string) => void;
    experts: Expert[];
    maxReached?: boolean;
}

export default function CreateExpertDialog({
    open,
    onOpenChange,
    onSave,
    onDelete,
    experts,
    maxReached = false,
}: CreateExpertDialogProps) {
    const [selectedExpert, setSelectedExpert] = React.useState<Expert | null>(
        null,
    );
    const [name, setName] = React.useState("");
    const [prompt, setPrompt] = React.useState("");
    const [selectedIcon, setSelectedIcon] = React.useState("Sparkles");
    const [error, setError] = React.useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    // Reset form when dialog opens/closes
    React.useEffect(() => {
        if (!open) {
            setName("");
            setPrompt("");
            setError("");
            setSelectedExpert(null);
        }
    }, [open]);

    // Load selected expert data into form
    const handleSelectExpert = (expert: Expert) => {
        setSelectedExpert(expert);
        setName(expert.name);
        setPrompt(expert.prompt);
        setSelectedIcon(expert.icon || "Sparkles");
        setError("");
    };

    // Clear form for new expert
    const handleNewExpert = () => {
        setSelectedExpert(null);
        setName("");
        setPrompt("");
        setSelectedIcon("Sparkles");
        setError("");
    };

    const handleSave = () => {
        setError("");
        if (!name.trim()) return setError("Name is required");
        if (!prompt.trim()) return setError("Prompt is required");

        const isEdit = selectedExpert !== null;

        // Check max limit only for new experts
        if (!isEdit && maxReached) {
            return setError("Maximum experts reached");
        }

        const expert: Expert = {
            id: selectedExpert
                ? selectedExpert.id
                : name
                      .trim()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-"),
            name: name.trim(),
            prompt: prompt.trim(),
            icon: selectedIcon,
        };

        onSave(expert, isEdit);
        handleNewExpert();
    };

    const handleDelete = () => {
        if (selectedExpert) {
            onDelete(selectedExpert.id);
            setShowDeleteConfirm(false);
            handleNewExpert();
        }
    };

    const isEditMode = selectedExpert !== null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl!">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? "Edit Expert" : "Add an Experts"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-4 min-h-[400px] max-h-[600px]">
                        {/* Left Sidebar - Expert List */}
                        <div className="w-56 flex flex-col gap-2 border-r pr-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-xs font-medium text-muted-foreground">
                                    Your Experts ({experts.length}/10)
                                </h3>
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleNewExpert}
                                className={cn(
                                    "justify-start gap-2 mb-2",
                                    !isEditMode &&
                                        "bg-primary/10 border-primary",
                                )}
                                disabled={maxReached && !isEditMode}
                            >
                                <Plus className="size-4" />
                                New Expert
                            </Button>

                            {/* Scrollable Expert List */}
                            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {experts.length === 0 ? (
                                    <div className="text-xs text-muted-foreground/60 text-center py-8">
                                        No experts yet
                                    </div>
                                ) : (
                                    experts.map((expert) => {
                                        const IconComponent =
                                            EXPERT_ICONS[expert.icon] ||
                                            Sparkles;
                                        const isSelected =
                                            selectedExpert?.id === expert.id;
                                        return (
                                            <button
                                                key={expert.id}
                                                onClick={() =>
                                                    handleSelectExpert(expert)
                                                }
                                                className={cn(
                                                    "w-full flex items-center gap-2 px-3 py-2 rounded-full text-left transition-colors text-xs",
                                                    isSelected
                                                        ? "bg-foreground/10 text-foreground"
                                                        : "hover:bg-foreground/10",
                                                )}
                                            >
                                                <IconComponent className="size-4 shrink-0" />
                                                <span className="truncate">
                                                    {expert.name}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Pane - Expert Form */}
                        <div className="flex-1 flex flex-col">
                            <ScrollArea className="flex-1 pr-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs opacity-60">
                                            Expert name
                                        </label>
                                        <Input
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            placeholder="e.g. Marketing Specialist"
                                            className="rounded-md border-transparent bg-input"
                                        />
                                    </div>

                                    {/* Icon Picker */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs opacity-60">
                                            Choose an icon
                                        </label>
                                        <div className="grid grid-cols-10 gap-2">
                                            {AVAILABLE_ICONS.map(
                                                ({ name, icon: Icon }) => (
                                                    <button
                                                        key={name}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedIcon(
                                                                name,
                                                            )
                                                        }
                                                        className={cn(
                                                            "flex items-center justify-center p-2 rounded-md border transition-all hover:bg-muted",
                                                            selectedIcon ===
                                                                name
                                                                ? "bg-primary/10 border-primary text-primary"
                                                                : "border-transparent bg-input",
                                                        )}
                                                        title={name}
                                                    >
                                                        <Icon className="size-4" />
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs opacity-60">
                                            System prompt
                                        </label>
                                        <Textarea
                                            value={prompt}
                                            onChange={(e) =>
                                                setPrompt(e.target.value)
                                            }
                                            placeholder="Describe how this expert should behave, their expertise, and response style..."
                                            className="h-48 rounded-md border-transparent bg-input resize-none custom-scrollbar"
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
                                        Delete Expert
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

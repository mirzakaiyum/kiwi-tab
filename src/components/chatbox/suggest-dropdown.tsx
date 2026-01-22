import * as React from "react";
import {
    Code,
    CornerDownLeft,
    GraduationCap,
    Heart,
    type LucideIcon,
    Palette,
    Plus,
    Search,
    Sparkles,
} from "lucide-react";
import CreateShortcutDialog from "@/components/dialogs/create-shortcut-dialog";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
    DEFAULT_SHORTCUTS,
    type Expert,
    type UserShortcut,
} from "@/defaults/default-prompts";

// Icon mapping for experts
const EXPERT_ICONS: Record<string, LucideIcon> = {
    Code,
    GraduationCap,
    Heart,
    Palette,
    Sparkles, // Default fallback
};

const STORAGE_KEY = "prompt_shortcuts";

interface SuggestDropdownProps {
    visible: boolean;
    query?: string;
    selectedIndex?: number;
    experts?: Expert[];
    disableExperts?: boolean;
    searchSuggestions?: string[];
    searchLoading?: boolean;
    onSelectSuggestion?: (s: string) => void;
    onSelectExpert?: (expert: Expert) => void;
    onShortcutChange?: (prompt: string | null, count: number) => void;
    onHoverIndex?: (index: number) => void;
}

export function SuggestDropdown({
    visible,
    query = "",
    selectedIndex = 0,
    experts = [],
    disableExperts = false,
    searchSuggestions = [],
    searchLoading = false,
    onSelectSuggestion,
    onSelectExpert,
    onShortcutChange,
    onHoverIndex,
}: SuggestDropdownProps) {
    const [userShortcuts, setUserShortcuts] = React.useState<UserShortcut[]>(
        [],
    );
    const [createOpen, setCreateOpen] = React.useState(false);

    // Load shortcuts from localStorage on mount
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed: UserShortcut[] = JSON.parse(raw);
                setUserShortcuts(parsed.slice(0, 6));
            } else {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(DEFAULT_SHORTCUTS),
                );
                setUserShortcuts(DEFAULT_SHORTCUTS);
            }
        } catch {
            setUserShortcuts(DEFAULT_SHORTCUTS);
        }
    }, []);

    const persist = (list: UserShortcut[]) => {
        setUserShortcuts(list);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch {
            // ignore
        }
    };

    const handleCreateSave = (s: UserShortcut) => {
        const existingIndex = userShortcuts.findIndex((u) => u.id === s.id);
        let next: UserShortcut[];
        if (existingIndex >= 0) {
            const copy = userShortcuts.slice();
            copy.splice(existingIndex, 1);
            next = [s, ...copy].slice(0, 6);
        } else {
            next = [s, ...userShortcuts].slice(0, 6);
        }
        persist(next);
    };

    // Filter shortcuts when query starts with /
    const filteredShortcuts = React.useMemo(() => {
        if (!query.startsWith("/")) return userShortcuts;
        const searchTerm = query.toLowerCase();
        return userShortcuts.filter((s) =>
            s.name.toLowerCase().includes(searchTerm) ||
            s.id.toLowerCase().includes(searchTerm.slice(1))
        );
    }, [query, userShortcuts]);

    // Filter experts when query starts with @
    const filteredExperts = React.useMemo(() => {
        if (!query.startsWith("@")) return experts;
        const searchTerm = query.slice(1).toLowerCase();
        return experts.filter((e) =>
            e.name.toLowerCase().includes(searchTerm) ||
            e.id.toLowerCase().includes(searchTerm)
        );
    }, [query, experts]);

    // Determine mode and active list
    const isShortcutMode = query.startsWith("/");
    const isExpertMode = !disableExperts && query.startsWith("@");
    const activeList = isShortcutMode
        ? filteredShortcuts
        : isExpertMode
        ? filteredExperts
        : [];

    // Calculate safe index that stays within bounds
    const safeIndex = activeList.length > 0
        ? Math.min(selectedIndex, activeList.length - 1)
        : 0;

    // Notify parent of selected item for Enter key selection
    React.useEffect(() => {
        if (isShortcutMode && filteredShortcuts.length > 0) {
            onShortcutChange?.(
                filteredShortcuts[safeIndex].prompt,
                filteredShortcuts.length,
            );
        } else if (isExpertMode && filteredExperts.length > 0) {
            onShortcutChange?.(
                filteredExperts[safeIndex].id,
                filteredExperts.length,
            );
        } else {
            onShortcutChange?.(null, 0);
        }
    }, [
        filteredShortcuts,
        filteredExperts,
        isShortcutMode,
        isExpertMode,
        safeIndex,
        onShortcutChange,
    ]);

    if (!visible) return null;

    const showShortcuts = !searchLoading && searchSuggestions.length === 0 &&
        !isExpertMode;

    return (
        <div className="bg-input border-border animate-in fade-in slide-in-from-top-1 absolute top-full -left-px -right-px z-30 rounded-b-xl border overflow-hidden shadow-md p-1">
            <Command className="bg-transparent">
                <CommandList className="max-h-none">
                    {/* Loading state */}
                    {searchLoading && searchSuggestions.length === 0 &&
                        !isExpertMode && !isShortcutMode && (
                        <CommandGroup heading="Suggestions">
                            <CommandItem className="gap-3 text-muted-foreground/60">
                                Loading...
                            </CommandItem>
                        </CommandGroup>
                    )}

                    {/* Search suggestions */}
                    {!searchLoading && searchSuggestions.length > 0 &&
                        !isExpertMode && !isShortcutMode && (
                        <CommandGroup heading="Suggestions">
                            {searchSuggestions.slice(0, 3).map((s) => (
                                <CommandItem
                                    key={s}
                                    onSelect={() => onSelectSuggestion?.(s)}
                                    className="gap-3 w-full justify-between group/item"
                                >
                                    <div className="flex gap-1 items-center opacity-40">
                                        <Search className="size-3" />
                                        {s}
                                    </div>
                                    <CornerDownLeft className="size-3 text-muted-foreground/40 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {/* Shortcuts list */}
                    {showShortcuts && (
                        <CommandGroup heading="Shortcuts">
                            {filteredShortcuts.map((u, index) => {
                                const isSelected = isShortcutMode &&
                                    index === safeIndex;
                                return (
                                    <CommandItem
                                        key={u.id}
                                        onSelect={() =>
                                            onSelectSuggestion?.(u.prompt)}
                                        onMouseEnter={() =>
                                            isShortcutMode &&
                                            onHoverIndex?.(index)}
                                        className={cn(
                                            "gap-3 justify-between",
                                            // Override cmdk's data-selected when in filter mode
                                            isShortcutMode &&
                                                "data-[selected=true]:bg-transparent",
                                            isSelected && "bg-muted!",
                                        )}
                                    >
                                        <span className="font-medium">
                                            {u.name}
                                        </span>
                                        {isSelected && (
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span>Press</span>
                                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
                                                    ↵
                                                </kbd>
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}

                    {/* Experts list */}
                    {isExpertMode && (
                        <CommandGroup heading="Experts">
                            {filteredExperts.map((e, index) => {
                                const isSelected = index === safeIndex;
                                const IconComponent = EXPERT_ICONS[e.icon] ||
                                    Sparkles;
                                return (
                                    <CommandItem
                                        key={e.id}
                                        onSelect={() => onSelectExpert?.(e)}
                                        onMouseEnter={() =>
                                            onHoverIndex?.(index)}
                                        className={cn(
                                            "gap-3 justify-between",
                                            // Override cmdk's data-selected when in expert mode
                                            "data-[selected=true]:bg-transparent",
                                            isSelected && "bg-muted!",
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <IconComponent className="size-4 text-muted-foreground/60" />
                                            <span className="text-foreground">
                                                {e.name}
                                                {isSelected && (
                                                    <span className="text-foreground/30 ml-2 text-xs font-light">
                                                        — Add this expert to
                                                        this chat
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span>Press</span>
                                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
                                                    ↵
                                                </kbd>
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}

                    <CommandSeparator />
                    <CommandItem
                        onSelect={() => setCreateOpen(true)}
                        className="gap-3"
                    >
                        <Plus className="size-4 text-muted-foreground/40" />
                        Create a shortcut
                    </CommandItem>
                </CommandList>
            </Command>

            <CreateShortcutDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSave={handleCreateSave}
                maxReached={userShortcuts.length >= 6}
            />
        </div>
    );
}

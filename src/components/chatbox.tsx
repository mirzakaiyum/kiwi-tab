import * as React from "react";
import {
    ArrowRight,
    ChevronDown,
    Languages,
    DollarSign,
    Tv,
    Calendar,
    Plus,
    Sparkles,
    Code,
    GraduationCap,
    Heart,
    Palette,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SuggestDropdown } from "@/components/suggest-dropdown";
import CreateExpertDialog from "@/components/dialogs/create-expert-dialog";
import { DEFAULT_EXPERTS, type Expert } from "@/components/default-values";

// Icon mapping for experts
const EXPERT_ICONS: Record<string, LucideIcon> = {
    Code,
    GraduationCap,
    Heart,
    Palette,
    Sparkles, // Default fallback
};

// AI model configurations
const MODELS = [
    {
        id: "chatgpt",
        name: "ChatGPT",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/chatgpt-icon.png",
        url: (q: string) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
    },
    {
        id: "perplexity",
        name: "Perplexity",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Perplexity_AI_Turquoise_on_White.png/960px-Perplexity_AI_Turquoise_on_White.png?20250123162739",
        url: (q: string) =>
            `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
    },
    {
        id: "google-ai",
        name: "Google AI Mode",
        icon: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png?20150901215638",
        url: (q: string) =>
            `https://www.google.com/search?sourceid=chrome&udm=50&q=${encodeURIComponent(q)}`,
    },
] as const;

// Search engine configurations
const SEARCH_ENGINES = [
    {
        id: "google",
        name: "Google",
        icon: "https://www.google.com/favicon.ico",
        url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    },
    {
        id: "bing",
        name: "Bing",
        icon: "https://www.bing.com/favicon.ico",
        url: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    },
    {
        id: "duckduckgo",
        name: "DuckDuckGo",
        icon: "https://duckduckgo.com/favicon.ico",
        url: (q: string) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    },
] as const;

// Combined options type
type SearchOption = (typeof MODELS)[number] | (typeof SEARCH_ENGINES)[number];

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
    { label: "Translate", icon: Languages },
    { label: "Net Worth", icon: DollarSign },
    { label: "What to watch", icon: Tv },
    { label: "Upcoming Events", icon: Calendar },
];

// Storage keys
const MODEL_STORAGE_KEY = "kiwi-selected-model";
const EXPERTS_LIST_KEY = "kiwi-experts";
const GREETING_STORAGE_KEY = "kiwi-greeting";
const NAME_STORAGE_KEY = "kiwi-name";

// Get greeting based on time of day or custom greeting
function getGreeting(): string {
    const customGreeting = localStorage.getItem(GREETING_STORAGE_KEY);
    if (customGreeting) return customGreeting;
    
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return "Good Morning";
    if (hr >= 12 && hr < 17) return "Good Afternoon";
    if (hr >= 17 && hr < 21) return "Good Evening";
    return "Hello";
}

// Get display name from localStorage or default
function getDisplayName(): string {
    return localStorage.getItem(NAME_STORAGE_KEY) || "there";
}

// Load saved model from localStorage
function getSavedModel(): SearchOption {
    const savedId = localStorage.getItem(MODEL_STORAGE_KEY);
    if (savedId) {
        const foundModel = MODELS.find((m) => m.id === savedId);
        if (foundModel) return foundModel;
        const foundEngine = SEARCH_ENGINES.find((e) => e.id === savedId);
        if (foundEngine) return foundEngine;
    }
    return MODELS[0];
}

// Load experts from localStorage
function getExperts(): Expert[] {
    try {
        const saved = localStorage.getItem(EXPERTS_LIST_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure all experts have an icon (for backwards compatibility)
            return parsed.map((e: Expert) => ({
                ...e,
                icon: e.icon || DEFAULT_EXPERTS.find(d => d.id === e.id)?.icon || "Sparkles"
            }));
        }
    } catch {}
    return DEFAULT_EXPERTS;
}

export interface ChatboxProps {}

export function Chatbox() {
    const [query, setQuery] = React.useState("");
    const [selectedModel, setSelectedModel] = React.useState<SearchOption>(getSavedModel);
    const [experts, setExperts] = React.useState<Expert[]>(getExperts);
    const [selectedExpert, setSelectedExpert] = React.useState<Expert | null>(null);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [searchSuggestions, setSearchSuggestions] = React.useState<string[]>([]);
    const [suggestLoading, setSuggestLoading] = React.useState(false);
    const [createExpertOpen, setCreateExpertOpen] = React.useState(false);
    const [selectedShortcutIndex, setSelectedShortcutIndex] = React.useState(0);
    const selectedShortcutRef = React.useRef<string | null>(null);
    const shortcutCountRef = React.useRef(0);
    
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Check if selected model is a search engine
    const isSearchEngine = SEARCH_ENGINES.some(e => e.id === selectedModel.id);

    const [greeting, setGreeting] = React.useState(getGreeting);
    const [displayName, setDisplayName] = React.useState(getDisplayName);

    // Listen for settings changes
    React.useEffect(() => {
        const handleSettingsChange = () => {
            setGreeting(getGreeting());
            setDisplayName(getDisplayName());
        };
        window.addEventListener("kiwi-settings-changed", handleSettingsChange);
        return () => window.removeEventListener("kiwi-settings-changed", handleSettingsChange);
    }, []);

    // Persist model selection and clear expert if switching to search engine
    React.useEffect(() => {
        localStorage.setItem(MODEL_STORAGE_KEY, selectedModel.id);
        // Clear expert selection when switching to a search engine
        if (isSearchEngine && selectedExpert) {
            setSelectedExpert(null);
        }
    }, [selectedModel, isSearchEngine]);



    // Persist experts list
    React.useEffect(() => {
        localStorage.setItem(EXPERTS_LIST_KEY, JSON.stringify(experts));
    }, [experts]);

    // Close suggestions on outside click or Escape
    React.useEffect(() => {
        if (!showSuggestions) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (containerRef.current?.contains(target)) return;
            if (target.closest('[data-slot="dialog-content"], [data-slot="dialog-overlay"], [data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-item"]')) return;
            setShowSuggestions(false);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowSuggestions(false);
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showSuggestions]);

    // Fetch search suggestions with debounce
    React.useEffect(() => {
        if (!showSuggestions) {
            setSearchSuggestions([]);
            return;
        }

        const q = query.trim();
        if (q.length < 1 || q.length > 50 || q.startsWith("/")) {
            setSearchSuggestions([]);
            setSuggestLoading(false);
            return;
        }

        setSuggestLoading(true);
        const timeout = setTimeout(async () => {
            try {
                const items = await fetchSuggestions(q);
                setSearchSuggestions(items);
            } catch {
                setSearchSuggestions([]);
            } finally {
                setSuggestLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, showSuggestions]);

    const handleSearch = () => {
        if (!query.trim()) return;
        // If an expert is selected, prepend the expert prompt to the query
        const finalQuery = selectedExpert 
            ? `${selectedExpert.prompt}\n\nUser query: ${query}`
            : query;
        window.open(selectedModel.url(finalQuery), "_self");
    };

    const handleSelectSuggestion = (suggestion: string) => {
        setQuery(`${suggestion} `);
        setShowSuggestions(false);
        textareaRef.current?.focus();
    };

    const handleSaveExpert = (expert: Expert) => {
        const exists = experts.findIndex((e) => e.id === expert.id);
        let next: Expert[];
        if (exists >= 0) {
            const copy = experts.slice();
            copy.splice(exists, 1);
            next = [expert, ...copy].slice(0, 10);
        } else {
            next = [expert, ...experts].slice(0, 10);
        }
        setExperts(next);
        setSelectedExpert(expert);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <h2 className="text-lg sm:text-4xl mb-8 text-center">
                {greeting}, {displayName}!
            </h2>
            
            <div
                className={cn(
                    "focus-within:bg-input border-border/80 focus-within:border-border focus-within:ring-ring/20 relative z-20 flex w-full flex-col gap-2 border p-2 transition-all",
                    query.length > 0 ? "bg-input" : "bg-input/50 backdrop-blur-xl",
                    showSuggestions ? "rounded-t-xl border-b-transparent" : "rounded-xl"
                )}
            >
                <Textarea
                    ref={textareaRef}
                    placeholder={isSearchEngine ? `Search anything on ${selectedModel.name}` : "Ask anything. Type @ for Experts and / for shortcuts."}
                    value={query}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                        setSelectedShortcutIndex(0); // Reset selection when typing
                    }}
                    onKeyDown={(e) => {
                        const isShortcutMode = query.startsWith("/") && showSuggestions;
                        const isExpertMode = query.startsWith("@") && showSuggestions;
                        
                        if (isShortcutMode || isExpertMode) {
                            if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setSelectedShortcutIndex((prev) => 
                                    Math.min(prev + 1, shortcutCountRef.current - 1)
                                );
                            } else if (e.key === "ArrowUp") {
                                e.preventDefault();
                                setSelectedShortcutIndex((prev) => Math.max(prev - 1, 0));
                            } else if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (isShortcutMode && selectedShortcutRef.current) {
                                    handleSelectSuggestion(selectedShortcutRef.current);
                                } else if (isExpertMode && selectedShortcutRef.current) {
                                    // Find and select the expert by id
                                    const expert = experts.find(ex => ex.id === selectedShortcutRef.current);
                                    if (expert) {
                                        setSelectedExpert(expert);
                                        setQuery("");
                                        setShowSuggestions(false);
                                    }
                                }
                            }
                        } else if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                    className="placeholder:text-muted-foreground/60 min-h-14 w-full border-none bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 md:text-md"
                />
                
                <div className="flex items-center justify-between px-1 pb-1">
                    <div className="flex items-center gap-1">
                        {/* Model Picker */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="sm" className="gap-2 rounded-md px-2">
                                        <img
                                            src={selectedModel.icon}
                                            alt={selectedModel.name}
                                            width={16}
                                            height={16}
                                            className="size-4 rounded-sm"
                                        />
                                        <span className="text-xs font-medium">{selectedModel.name}</span>
                                        <ChevronDown className="size-3 text-muted-foreground/60" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="start" className="w-40">
                                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">AI Models</div>
                                {MODELS.map((model) => (
                                    <DropdownMenuItem
                                        key={model.id}
                                        onClick={() => setSelectedModel(model)}
                                        className="gap-2"
                                    >
                                        <img
                                            src={model.icon}
                                            alt={model.name}
                                            width={16}
                                            height={16}
                                            className="size-4 rounded-sm"
                                        />
                                        {model.name}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Search Engines</div>
                                {SEARCH_ENGINES.map((engine) => (
                                    <DropdownMenuItem
                                        key={engine.id}
                                        onClick={() => setSelectedModel(engine)}
                                        className="gap-2"
                                    >
                                        <img
                                            src={engine.icon}
                                            alt={engine.name}
                                            width={16}
                                            height={16}
                                            className="size-4 rounded-sm"
                                        />
                                        {engine.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Experts Picker - only show for AI models */}
                        {!isSearchEngine && (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={(() => {
                                        const TriggerIcon = selectedExpert 
                                            ? (EXPERT_ICONS[selectedExpert.icon] || Sparkles)
                                            : Sparkles;
                                        return (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className={cn(
                                                    "gap-2 px-2 border-primary hover:text-primary hover:bg-primary/10 focus-visible:text-primary focus-visible:bg-primary/10 text-primary rounded-md bg-primary/10",
                                                    !selectedExpert && "text-foreground/50 bg-transparent hover:text-foreground hover:bg-foreground/10 border-transparent"
                                                )}
                                            >
                                                <TriggerIcon className="size-3" />
                                                <span className="text-xs font-medium">
                                                    {selectedExpert?.name || "Expert"}
                                                </span>
                                                <ChevronDown className="size-3 opacity-60" />
                                            </Button>
                                        );
                                    })()}
                                />
                                <DropdownMenuContent align="start" className="w-48">
                                    <div className="flex items-center justify-between px-2 py-1.5">
                                        <span className="text-xs font-medium text-muted-foreground">Select Expert</span>
                                        {selectedExpert && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedExpert(null);
                                                }}
                                                className="rounded-full text-[10px] leading-tight px-1 border hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    {experts.map((expert) => {
                                        const IconComponent = EXPERT_ICONS[expert.icon] || Sparkles;
                                        return (
                                            <DropdownMenuItem
                                                key={expert.id}
                                                onClick={() => setSelectedExpert(
                                                    selectedExpert?.id === expert.id ? null : expert
                                                )}
                                                className={cn(
                                                    "gap-2",
                                                    selectedExpert?.id === expert.id && "bg-primary/10 text-primary"
                                                )}
                                            >
                                                <IconComponent className={cn(
                                                    "size-3",
                                                    selectedExpert?.id === expert.id && "text-primary"
                                                )} />
                                                {expert.name}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setCreateExpertOpen(true)}
                                        className="gap-2"
                                    >
                                        <Plus className="size-4 text-muted-foreground/60" />
                                        Add an expert
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <Button
                        size="icon-sm"
                        onClick={handleSearch}
                        disabled={!query.trim()}
                        className={cn(
                            "rounded-lg font-semibold transition-all",
                            query.trim() 
                                ? "bg-primary/80 text-primary-foreground hover:bg-primary" 
                                : "bg-muted-foreground/10 text-muted-foreground"
                        )}
                    >
                        <ArrowRight className="size-4" strokeWidth={2.5} />
                    </Button>
                </div>

                <SuggestDropdown
                    visible={showSuggestions}
                    query={query}
                    selectedIndex={selectedShortcutIndex}
                    experts={experts}
                    disableExperts={isSearchEngine}
                    searchSuggestions={searchSuggestions}
                    searchLoading={suggestLoading}
                    onSelectSuggestion={handleSelectSuggestion}
                    onSelectExpert={(expert) => {
                        setSelectedExpert(expert);
                        setQuery("");
                        setShowSuggestions(false);
                    }}
                    onShortcutChange={(prompt, count) => { 
                        selectedShortcutRef.current = prompt;
                        shortcutCountRef.current = count;
                    }}
                    onHoverIndex={setSelectedShortcutIndex}
                />
            </div>

            <div className="flex flex-wrap justify-center gap-2 px-1 pt-4">
                {QUICK_SUGGESTIONS.map((s) => {
                    const Icon = s.icon;
                    return (
                        <Button
                            key={s.label}
                            variant="ghost"
                            onClick={() => handleSelectSuggestion(s.label)}
                            className="cursor-pointer border border-border text-muted-foreground hover:bg-input/30 rounded-full px-3 py-1 text-sm gap-1.5 backdrop-blur-lg"
                        >
                            <Icon className="size-3.5" />
                            {s.label}
                        </Button>
                    );
                })}
            </div>

            <CreateExpertDialog
                open={createExpertOpen}
                onOpenChange={setCreateExpertOpen}
                onSave={handleSaveExpert}
                maxReached={experts.length >= 10}
            />
        </div>
    );
}

// Fetch suggestions from multiple sources with fallbacks
async function fetchSuggestions(q: string): Promise<string[]> {
    // Try Google Suggest
    try {
        const res = await fetch(
            `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}`
        );
        const data = await res.json();
        if (Array.isArray(data?.[1]) && data[1].length > 0) {
            return data[1].slice(0, 3).map(String);
        }
    } catch {}

    // Fallback: Wikipedia
    try {
        const res = await fetch(
            `https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&search=${encodeURIComponent(q)}&limit=3&namespace=0&format=json`
        );
        const data = await res.json();
        if (data?.[1]?.length > 0) {
            return data[1];
        }
    } catch {}

    // Local fallback
    return [q, `${q} news`, `${q} overview`].slice(0, 3);
}

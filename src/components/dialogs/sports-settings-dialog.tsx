"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SportsSettings } from "@/lib/widgets/types";
import { getSports, getTeams } from "@/lib/services/sports";

// Types for local service
interface LeagueOption {
  name: string;
  league: string;
  slug: string;
}

interface SportOption {
  name: string;
  sport: string;
  slug: string;
  leagues: LeagueOption[];
}

interface TeamOption {
  id: string;
  name: string;
  abbrev: string;
}

interface SportsSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SportsSettings;
  onSave: (settings: SportsSettings) => void;
}

function SortableTeamChip({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ComboboxChip
      ref={setNodeRef}
      style={style}
      showRemove={false}
      className={isDragging ? "opacity-50 z-50 cursor-grabbing" : "cursor-grab"}
      {...attributes}
      {...listeners}
    >
      {children}
    </ComboboxChip>
  );
}

export function SportsSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: SportsSettingsDialogProps) {
  // Sports and leagues from API
  const [sportsData, setSportsData] = React.useState<SportOption[]>([]);
  const [loadingSports, setLoadingSports] = React.useState(false);
  
  // Form state
  const [sport, setSport] = React.useState("");
  const [league, setLeague] = React.useState("");
  const [teamIds, setTeamIds] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  
  // Teams state
  const [availableTeams, setAvailableTeams] = React.useState<TeamOption[]>([]);
  const [loadingTeams, setLoadingTeams] = React.useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTeamIds((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Get current sport's leagues
  const currentLeagues = React.useMemo(() => {
    const sportData = sportsData.find((s) => s.sport === sport);
    return sportData?.leagues || [];
  }, [sportsData, sport]);

  // Get display name for sport
  const getSportName = (sportId: string) => {
    return sportsData.find((s) => s.sport === sportId)?.name || sportId;
  };

  // Get display name for league
  const getLeagueName = (leagueId: string) => {
    return currentLeagues.find((l) => l.league === leagueId)?.name || leagueId;
  };

  // Get display name for team
  const getTeamName = (teamId: string) => {
    const t = availableTeams.find((t) => t.id === teamId);
    return t ? t.name : teamId;
  };

  // Filter teams based on input (Combobox filtering)
  const filteredTeams = React.useMemo(() => {
    if (!inputValue.trim()) return availableTeams;
    const search = inputValue.toLowerCase();
    return availableTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.abbrev.toLowerCase().includes(search)
    );
  }, [availableTeams, inputValue]);

  // Load sports data from local service when dialog opens
  React.useEffect(() => {
    if (!open) return;

    setLoadingSports(true);
    try {
      // Using local service - synchronous call
      const data = getSports();
      setSportsData(data as SportOption[]);
    } catch {
      console.error("Failed to load sports");
    } finally {
      setLoadingSports(false);
    }
  }, [open]);

  // Initialize form when dialog opens or settings change
  React.useEffect(() => {
    if (!open) return;
    
    // Set form values from settings
    setSport(settings.sport || "");
    setLeague(settings.league || "");
    
    // Initialize teams (comma separated string -> array)
    if (settings.team) {
      setTeamIds(settings.team.split(",").map(t => t.trim()).filter(Boolean));
    } else {
      setTeamIds([]);
    }
    setInputValue("");
  }, [open, settings]);

  // Set default sport/league when sports data loads
  React.useEffect(() => {
    if (sportsData.length === 0) return;
    
    if (!sport && sportsData.length > 0) {
      const firstSport = sportsData[0];
      setSport(firstSport.sport);
      if (firstSport.leagues.length > 0) {
        setLeague(firstSport.leagues[0].league);
      }
    }
  }, [sportsData, sport]);

  // Update league when sport changes
  React.useEffect(() => {
    if (!sport || currentLeagues.length === 0) return;
    
    const leagueExists = currentLeagues.some((l) => l.league === league);
    if (!leagueExists) {
      setLeague(currentLeagues[0].league);
    }
  }, [sport, currentLeagues, league]);

  // Get the league slug from sportsData for API calls
  const getLeagueSlug = React.useCallback((sportId: string, leagueId: string) => {
    const sportData = sportsData.find((s) => s.sport === sportId);
    const leagueData = sportData?.leagues.find((l) => l.league === leagueId);
    return leagueData?.slug;
  }, [sportsData]);

  // Fetch teams when sport or league changes
  React.useEffect(() => {
    if (!sport || !league) return;
    
    // Get the slug for team filtering
    const leagueSlug = getLeagueSlug(sport, league);
    if (!leagueSlug) return;
    
    async function fetchTeamsData() {
      setLoadingTeams(true);
      try {
        // Use local service
        const teams = await getTeams(sport, leagueSlug!);
        setAvailableTeams(teams);
      } catch {
        console.error("Failed to fetch teams");
        setAvailableTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    }

    fetchTeamsData();
  }, [sport, league, getLeagueSlug]);

  // Handle saving
  const handleSave = () => {
    onSave({
      sport,
      league,
      // Join array back to comma-separated string
      team: teamIds.length > 0 ? teamIds.join(",") : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-visible">
        <DialogHeader>
          <DialogTitle>Sports Settings</DialogTitle>
          <DialogDescription>
            Configure sport, league, and teams to display.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sport Select */}
          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Select 
              value={sport} 
              onValueChange={(v) => {
                setSport(v ?? "");
                setTeamIds([]);
                setInputValue("");
              }} 
              disabled={loadingSports}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {loadingSports ? "Loading..." : (sport ? getSportName(sport) : "Select sport")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sportsData.map((s) => (
                  <SelectItem key={s.sport} value={s.sport}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* League Select */}
          <div className="space-y-2">
            <Label htmlFor="league">League</Label>
            <Select 
              value={league} 
              onValueChange={(v) => {
                setLeague(v ?? "");
                setTeamIds([]);
                setInputValue("");
              }} 
              disabled={loadingSports || currentLeagues.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {loadingSports ? "Loading..." : (league ? getLeagueName(league) : "Select league")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {currentLeagues.map((l) => (
                  <SelectItem key={l.league} value={l.league}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Select (Multi-select) */}
          <div className="space-y-2">
            <Label>Teams</Label>
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
            >
              <Combobox
                value={teamIds}
                onValueChange={(val) => setTeamIds(val as string[])}
                onInputValueChange={setInputValue}
                multiple
                disabled={loadingTeams}
              >
                <ComboboxChips className="bg-background border rounded-md px-2 py-1 flex-wrap gap-1 min-h-[38px] w-full">
                  <SortableContext 
                    items={teamIds} 
                    strategy={horizontalListSortingStrategy}
                  >
                    {teamIds.map((id) => (
                      <SortableTeamChip key={id} id={id}>
                        {getTeamName(id)}
                        <span
                          role="button"
                          className="ml-1 opacity-50 hover:opacity-100 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTeamIds((prev) => prev.filter((p) => p !== id));
                          }}
                        >
                          <XIcon className="size-3" />
                        </span>
                      </SortableTeamChip>
                    ))}
                  </SortableContext>
                  <ComboboxChipsInput 
                    placeholder={teamIds.length === 0 ? "Select teams..." : ""} 
                    className="min-w-[100px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                  />
                </ComboboxChips>
                <ComboboxContent className="max-h-60 overflow-y-auto w-[var(--radix-combobox-trigger-width)]">
                  <ComboboxList>
                    {/* Custom Option */}
                    {inputValue && filteredTeams.length === 0 && (
                      <ComboboxItem value={inputValue}>
                        Add "{inputValue}"
                      </ComboboxItem>
                    )}
                    {/* Filtered Teams */}
                    {filteredTeams.map((t) => (
                      <ComboboxItem key={t.id} value={t.id}>
                        {t.name} ({t.abbrev})
                      </ComboboxItem>
                    ))}
                    {filteredTeams.length === 0 && !inputValue && (
                      <ComboboxEmpty>No teams found</ComboboxEmpty>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </DndContext>
            <p className="text-[10px] text-muted-foreground">
              Click and hold to arrange teams by priority
            </p>
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

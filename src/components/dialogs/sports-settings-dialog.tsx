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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { SportsSettings } from "@/lib/widgets/types";

// API Response Types
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
  const [specificTeam, setSpecificTeam] = React.useState(false);
  const [teamInput, setTeamInput] = React.useState("");
  
  // Teams state
  const [availableTeams, setAvailableTeams] = React.useState<TeamOption[]>([]);
  const [loadingTeams, setLoadingTeams] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  // Filter teams based on input
  const filteredTeams = React.useMemo(() => {
    if (!teamInput.trim()) return availableTeams;
    const search = teamInput.toLowerCase();
    return availableTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.abbrev.toLowerCase().includes(search)
    );
  }, [availableTeams, teamInput]);

  // Fetch sports data when dialog opens
  React.useEffect(() => {
    if (!open) return;

    async function fetchSports() {
      setLoadingSports(true);
      try {
        const response = await fetch(
          "https://kiwi-sports.makfissh.workers.dev/api/sports"
        );
        if (response.ok) {
          const data: SportOption[] = await response.json();
          setSportsData(data);
        }
      } catch {
        console.error("Failed to fetch sports");
      } finally {
        setLoadingSports(false);
      }
    }

    fetchSports();
  }, [open]);

  // Initialize form when dialog opens or settings change
  React.useEffect(() => {
    if (!open) return;
    
    // Set form values from settings
    setSport(settings.sport || "");
    setLeague(settings.league || "");
    setSpecificTeam(!!settings.team);
    setTeamInput(settings.team || "");
  }, [open, settings]);

  // Set default sport/league when sports data loads (only if not already set from settings)
  React.useEffect(() => {
    if (sportsData.length === 0) return;
    
    // If no sport is set yet, use the first available
    if (!sport && sportsData.length > 0) {
      const firstSport = sportsData[0];
      setSport(firstSport.sport);
      if (firstSport.leagues.length > 0) {
        setLeague(firstSport.leagues[0].league);
      }
    }
  }, [sportsData, sport]);

  // Update league when sport changes (if current league is not valid for new sport)
  React.useEffect(() => {
    if (!sport || currentLeagues.length === 0) return;
    
    const leagueExists = currentLeagues.some((l) => l.league === league);
    if (!leagueExists) {
      setLeague(currentLeagues[0].league);
    }
  }, [sport, currentLeagues, league]);

  // Fetch teams when sport changes
  React.useEffect(() => {
    if (!sport) return;
    
    async function fetchTeams() {
      setLoadingTeams(true);
      try {
        const response = await fetch(
          `https://kiwi-sports.makfissh.workers.dev/api/teams?sport=${sport}`
        );
        if (response.ok) {
          const data = await response.json();
          setAvailableTeams(data.teams || []);
        }
      } catch {
        console.error("Failed to fetch teams");
        setAvailableTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    }

    fetchTeams();
    // Reset team selection when sport changes
    setTeamInput("");
    setSpecificTeam(false);
  }, [sport]);

  // Update team input display when teams load (convert ID to display name)
  React.useEffect(() => {
    if (availableTeams.length > 0 && settings.team) {
      const team = availableTeams.find((t) => t.id === settings.team);
      if (team) {
        setTeamInput(`${team.name} (${team.abbrev})`);
      }
    }
  }, [availableTeams, settings.team]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTeamSelect = (team: TeamOption) => {
    setTeamInput(`${team.name} (${team.abbrev})`);
    setShowDropdown(false);
  };

  const handleSave = () => {
    // Try to find matching team by name or use input as-is
    const matchedTeam = availableTeams.find(
      (t) =>
        `${t.name} (${t.abbrev})` === teamInput ||
        t.name.toLowerCase() === teamInput.toLowerCase() ||
        t.abbrev.toLowerCase() === teamInput.toLowerCase()
    );

    onSave({
      sport,
      league,
      team: specificTeam ? (matchedTeam?.id || teamInput.trim() || undefined) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sports Settings</DialogTitle>
          <DialogDescription>
            Configure sport, league, and team to display.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sport Select */}
          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Select value={sport} onValueChange={(v) => setSport(v ?? "")} disabled={loadingSports}>
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
              onValueChange={(v) => setLeague(v ?? "")} 
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

          {/* Specific Team Switch */}
          <div className="flex items-center justify-between">
            <Label htmlFor="specific-team" className="flex flex-col gap-1 items-start">
              <span>Show Specific Match Score</span>
              <span className="text-xs font-normal text-muted-foreground">
                Filter matches by a specific team
              </span>
            </Label>
            <Switch
              id="specific-team"
              checked={specificTeam}
              onCheckedChange={setSpecificTeam}
            />
          </div>

          {/* Team Input with Suggestions */}
          {specificTeam && (
            <div className="space-y-2">
              <Label>Team</Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  placeholder={loadingTeams ? "Loading teams..." : "Type or select a team..."}
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  disabled={loadingTeams}
                  className="pr-8"
                />
                {teamInput && (
                  <button
                    type="button"
                    onClick={() => setTeamInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XIcon className="size-4" />
                  </button>
                )}
                {showDropdown && (filteredTeams.length > 0 || teamInput.trim()) && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-popover p-1 shadow-md"
                  >
                    {/* Show "Add custom" option when input doesn't match a team */}
                    {teamInput.trim() && !availableTeams.some(
                      (t) => 
                        t.name.toLowerCase() === teamInput.toLowerCase() ||
                        t.abbrev.toLowerCase() === teamInput.toLowerCase() ||
                        `${t.name} (${t.abbrev})`.toLowerCase() === teamInput.toLowerCase()
                    ) && (
                      <button
                        type="button"
                        onClick={() => setShowDropdown(false)}
                        className="w-full px-2 py-1.5 text-left text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer border-b mb-1 pb-1.5"
                      >
                        Add "{teamInput.trim()}"
                      </button>
                    )}
                    {filteredTeams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => handleTeamSelect(team)}
                        className="w-full px-2 py-1.5 text-left text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        {team.name} ({team.abbrev})
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

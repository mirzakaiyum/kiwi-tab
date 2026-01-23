"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { TeamMultiSelect } from "@/components/ui/multi-select";
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

    // Teams state
    const [availableTeams, setAvailableTeams] = React.useState<TeamOption[]>(
        [],
    );
    const [, setLoadingTeams] = React.useState(false);

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
        return (
            currentLeagues.find((l) => l.league === leagueId)?.name || leagueId
        );
    };

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
            setTeamIds(
                settings.team
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
            );
        } else {
            setTeamIds([]);
        }
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
    const getLeagueSlug = React.useCallback(
        (sportId: string, leagueId: string) => {
            const sportData = sportsData.find((s) => s.sport === sportId);
            const leagueData = sportData?.leagues.find(
                (l) => l.league === leagueId,
            );
            return leagueData?.slug;
        },
        [sportsData],
    );

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
                            }}
                            disabled={loadingSports}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    {loadingSports
                                        ? "Loading..."
                                        : sport
                                          ? getSportName(sport)
                                          : "Select sport"}
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
                            }}
                            disabled={
                                loadingSports || currentLeagues.length === 0
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    {loadingSports
                                        ? "Loading..."
                                        : league
                                          ? getLeagueName(league)
                                          : "Select league"}
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
                    <TeamMultiSelect
                        teams={availableTeams}
                        selectedTeamIds={teamIds}
                        onSelectionChange={setTeamIds}
                        placeholder="Select teams..."
                        label="Teams"
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

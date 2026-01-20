"use client";

import * as React from "react";
import { lazy } from "react";

import {
  Widget,
  WidgetContent,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
} from "@/components/widgetWrapper/widget";
import { Label } from "@/components/ui/label";
import { registerWidget } from "@/lib/widgets/registry";
import type { SportsSettings } from "@/lib/widgets/types";
import { Radio } from "lucide-react";
import { type ApiResponse, getScoreboard } from "@/lib/services/sports";

// Helper function to parse and format cricket scores
// Handles formats like "343 & 384/4" -> shows "343" smaller and "384" as main score
function formatCricketScore(score: string | undefined): React.ReactNode {
  if (!score) return "-";

  // Check if score contains "&" (multi-innings format)
  if (score.includes("&")) {
    const parts = score.split("&").map((s) => s.trim());
    if (parts.length === 2) {
      const firstInnings = parts[0]; // e.g., "343"
      const secondInnings = parts[1]; // e.g., "384/4"

      return (
        <span className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{firstInnings}</span>
          <span>{secondInnings}</span>
        </span>
      );
    }
  }

  return score;
}

// API Response Types
interface Team {
  id: string;
  name: string;
  abbrev: string;
  logo?: string;
  score?: string;
  turn?: boolean;
}

interface Match {
  id: string;
  home: Team;
  away: Team;
  status: "ongoing" | "upcoming" | "done";
  statusDetail: string;
  league: string;
}

// Use ApiResponse from local service
type SportsData = ApiResponse;

interface SportsWidgetProps {
  sport?: string;
  league?: string;
  team?: string;
  preview?: boolean;
}

async function fetchSportsData(
  sport = "soccer",
  league?: string,
  team?: string,
): Promise<SportsData> {
  // Use local service instead of external API
  return getScoreboard(sport, league, team);
}

export default function SportsWidget({
  sport = "soccer",
  league = "eng.1",
  team,
  preview = false,
}: SportsWidgetProps) {
  // Cache key based on settings
  const cacheKey = `kiwi-sports-${sport}-${league}-${team || "all"}`;
  const CACHE_TTL = 60 * 1000; // 1 minute

  // Load initial data from localStorage cache
  const [data, setData] = React.useState<SportsData | null>(() => {
    if (preview) return null;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data: cachedData } = JSON.parse(cached);
        return cachedData;
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  });
  const [error, setError] = React.useState<string | null>(null);

  // Placeholder data shown while loading (and used for preview mode)
  const placeholderData: SportsData = React.useMemo(() => ({
    meta: {
      sport: "soccer",
      league: "eng.1",
      time: new Date().toISOString(),
      count: 1,
      status: "ok",
    },
    matches: [
      {
        id: "placeholder-1",
        home: {
          id: "ars",
          name: "Arsenal",
          abbrev: "ARS",
          score: "2",
          turn: false,
        },
        away: {
          id: "mci",
          name: "Man City",
          abbrev: "MCI",
          score: "1",
          turn: true,
        },
        status: "ongoing" as const,
        statusDetail: "78'",
        league: "Premier League",
      },
    ],
  }), []);

  React.useEffect(() => {
    // Skip fetching in preview mode
    if (preview) return;

    let mounted = true;

    // Check if cache is still fresh
    const isCacheFresh = () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          return Date.now() - timestamp < CACHE_TTL;
        }
      } catch {
        // Ignore cache errors
      }
      return false;
    };

    async function loadData() {
      try {
        const result = await fetchSportsData(sport, league, team);
        if (mounted) {
          setData(result);
          setError(null);
          // Save to cache with timestamp
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                data: result,
                timestamp: Date.now(),
              }),
            );
          } catch {
            // Ignore storage errors
          }
        }
      } catch (err) {
        // Only set error if we have no cached data
        if (mounted && !data) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      }
    }

    // Only fetch if cache is stale or missing
    if (!isCacheFresh()) {
      loadData();
    }

    // Refresh on interval regardless of cache
    const interval = setInterval(loadData, CACHE_TTL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [sport, league, team, preview, cacheKey]);

  // Use fetched data, or placeholder if no data yet (preview mode always uses placeholder)
  const displayData = preview ? placeholderData : (data || placeholderData);

  // Filter matches by selected team
  // This hook MUST be before any conditional returns
  const filteredMatches = React.useMemo(() => {
    if (!displayData?.matches) return [];
    if (!team) return displayData.matches;

    const selectedTeams = team.split(",").map((t) => t.trim()).filter(Boolean);
    if (selectedTeams.length === 0) return displayData.matches;

    // Filter matches that involve ANY of the selected teams
    const matches = displayData.matches.filter((m) => {
      const homeId = m.home.id.split("-")[0];
      const awayId = m.away.id.split("-")[0];
      const homeAbbrev = m.home.abbrev.toLowerCase();
      const awayAbbrev = m.away.abbrev.toLowerCase();
      const homeName = m.home.name.toLowerCase();
      const awayName = m.away.name.toLowerCase();

      return selectedTeams.some((t) => {
        const tLower = t.toLowerCase();
        return homeId === t || awayId === t ||
          homeAbbrev === tLower || awayAbbrev === tLower ||
          homeName.includes(tLower) || awayName.includes(tLower);
      });
    });

    // Sort matches: Priority 1 = Ongoing, Priority 2 = Selection Order
    return matches.sort((a, b) => {
      // If one is ongoing and other isn't, ongoing wins
      if (a.status === "ongoing" && b.status !== "ongoing") return -1;
      if (b.status === "ongoing" && a.status !== "ongoing") return 1;

      // Otherwise, sort by selection order priority
      const getPriority = (m: Match) => {
        const homeId = m.home.id.split("-")[0];
        const awayId = m.away.id.split("-")[0];
        const homeName = m.home.name.toLowerCase();
        const awayName = m.away.name.toLowerCase();

        // Find the index of the PRIMARY selected team that triggered this match inclusion
        // If multiple selected teams are in the match (e.g. A vs B), return the lowest index (highest priority)
        let priority = Number.MAX_SAFE_INTEGER;

        selectedTeams.forEach((t, index) => {
          const tLower = t.toLowerCase();
          if (
            homeId === t || awayId === t || homeName.includes(tLower) ||
            awayName.includes(tLower)
          ) {
            priority = Math.min(priority, index);
          }
        });

        return priority;
      };

      return getPriority(a) - getPriority(b);
    });
  }, [displayData?.matches, team]);

  // Select the first match from the sorted list
  const match = filteredMatches[0];

  if (error && !data) {
    return (
      <Widget>
        <WidgetContent className="items-center justify-center">
          <Label className="text-sm text-muted-foreground">
            {error}
          </Label>
        </WidgetContent>
      </Widget>
    );
  }

  if (!match) {
    return (
      <Widget>
        <WidgetContent className="items-center justify-center">
          <Label className="text-sm text-muted-foreground">
            No live matches
          </Label>
        </WidgetContent>
      </Widget>
    );
  }

  const matchTeams = [match.home, match.away];

  return (
    <Widget>
      <WidgetHeader>
        <WidgetTitle className="text-muted-foreground text-xs flex items-center justify-between w-full">
          {match.league}
          {match.status === "ongoing"
            ? <Radio size={14} className="text-red-500" />
            : null}
        </WidgetTitle>
      </WidgetHeader>
      <WidgetContent className="flex-col items-center gap-4">
        {matchTeams.map((team) => (
          <div
            key={team.id}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center justify-start gap-2">
              {team.logo
                ? (
                  <img
                    src={team.logo}
                    alt={team.abbrev}
                    className="size-5 object-contain"
                  />
                )
                : (
                  <div className="size-5 flex items-center justify-center rounded bg-muted text-[10px] font-medium">
                    {team.abbrev.slice(0, 2)}
                  </div>
                )}
              <Label
                className={`text-base ${team.turn ? "font-semibold" : ""}`}
              >
                {team.abbrev}
              </Label>
              {team.turn && (
                <span className="size-1.5 rounded-full bg-productive" />
              )}
            </div>
            <div className="flex items-center justify-end gap-1">
              <Label className="text-base">
                {formatCricketScore(team.score)}
              </Label>
            </div>
          </div>
        ))}
      </WidgetContent>
      <WidgetFooter className="justify-center">
        <p className="text-muted-foreground text-xs text-center">
          {match.statusDetail}
        </p>
      </WidgetFooter>
    </Widget>
  );
}

// Self-registration
registerWidget<SportsSettings>({
  metadata: {
    id: "sports",
    name: "Sports",
    description: "Display live sports scores",
    defaultVariant: "default",
    hasSettings: true,
  },
  component: SportsWidget,
  componentLazy: lazy(() => import("./sports")),
  defaultSettings: {
    sport: "soccer",
    league: "eng.1",
  },
});

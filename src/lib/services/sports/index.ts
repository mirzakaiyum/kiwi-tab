/**
 * Sports Service - Live sports scores
 * Client-side implementation using ESPN API
 */

import * as espn from './espn';
import { SPORTS_CONFIG, getSportBySlug } from './sports-config';
import type { Match, SportConfig, ApiResponse } from './types';
import { filterByTeam } from './types';

export type { Match, Team, MatchStatus, SportConfig, LeagueConfig, ApiResponse } from './types';

/**
 * Get available sports
 */
export function getSports(): SportConfig[] {
  return SPORTS_CONFIG;
}

/**
 * Get leagues for a sport
 */
export function getLeagues(sportSlug: string) {
  return espn.getLeagues(sportSlug);
}

/**
 * Get teams for a sport/league
 */
export async function getTeams(
  sportSlug: string,
  leagueSlug: string
): Promise<{ id: string; name: string; abbrev: string; logo?: string }[]> {
  return espn.getTeams(sportSlug, leagueSlug);
}

/**
 * Get scoreboard - fetches fresh data each time
 * Widget handles its own caching, so we don't cache at service level
 */
export async function getScoreboard(
  sportSlug: string = 'soccer',
  leagueSlug?: string,
  teamFilter?: string,
  date?: string
): Promise<ApiResponse> {
  const sport = getSportBySlug(sportSlug);
  if (!sport) {
    throw new Error(`Unknown sport: ${sportSlug}`);
  }

  let matches: Match[];

  // ESPN: If specific league provided, fetch only that; otherwise fetch all
  let leaguesToFetch = sport.leagues;
  if (leagueSlug) {
    // Match by either slug OR league (ESPN API identifier)
    const specificLeague = sport.leagues.find(
      (l) => l.slug === leagueSlug || l.league === leagueSlug
    );
    if (specificLeague) {
      leaguesToFetch = [specificLeague];
    }
  }

  const leaguePromises = leaguesToFetch.map((league) =>
    espn.getScoreboard(sportSlug, league.slug, date).catch(() => [] as Match[])
  );
  const leagueResults = await Promise.all(leaguePromises);
  matches = leagueResults.flat();

  // Apply team filter if specified
  if (teamFilter) {
    matches = filterByTeam(matches, teamFilter);
  }

  // Sort: ongoing first, then upcoming, then done
  matches.sort((a, b) => {
    const order = { ongoing: 0, upcoming: 1, done: 2 };
    return order[a.status] - order[b.status];
  });

  // Limit results if too many
  if (!teamFilter && matches.length > 10) {
    matches = matches.slice(0, 10);
  }

  const response: ApiResponse = {
    meta: {
      sport: sport.name,
      league: leagueSlug || 'all',
      time: new Date().toISOString(),
      count: matches.length,
      status: 'ok',
    },
    matches,
  };

  return response;
}

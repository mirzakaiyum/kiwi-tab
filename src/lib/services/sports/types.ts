/**
 * Sports Types
 */

export type MatchStatus = 'ongoing' | 'upcoming' | 'done';

export interface Team {
  id: string;
  name: string;
  abbrev: string;
  logo?: string;
  score?: string;
  turn?: boolean; // For cricket - indicates batting team
}

export interface Match {
  id: string;
  home: Team;
  away: Team;
  status: MatchStatus;
  statusDetail: string;
  time?: string;
  venue?: string;
  broadcast?: string;
  league: string;
}

export interface SportConfig {
  name: string;
  slug: string;
  sport: string; // ESPN API sport path
  leagues: LeagueConfig[];
}

export interface LeagueConfig {
  name: string;
  slug: string;
  league: string; // ESPN API league path
}

export interface ApiResponse {
  meta: {
    sport: string;
    league: string;
    time: string;
    count: number;
    status: string;
  };
  matches: Match[];
}

/**
 * Filter matches by status
 */
export function filterByStatus(matches: Match[], status: MatchStatus): Match[] {
  return matches.filter((m) => m.status === status);
}

/**
 * Filter matches by team (name, abbreviation, or ID)
 */
export function filterByTeam(matches: Match[], teamFilter: string): Match[] {
  const teams = teamFilter.split(',').map((t) => t.trim().toLowerCase());

  return matches.filter((m) => {
    const homeId = m.home.id.split('-')[0].toLowerCase();
    const awayId = m.away.id.split('-')[0].toLowerCase();
    const homeAbbrev = m.home.abbrev.toLowerCase();
    const awayAbbrev = m.away.abbrev.toLowerCase();
    const homeName = m.home.name.toLowerCase();
    const awayName = m.away.name.toLowerCase();

    return teams.some(
      (t) =>
        homeId === t ||
        awayId === t ||
        homeAbbrev === t ||
        awayAbbrev === t ||
        homeName.includes(t) ||
        awayName.includes(t)
    );
  });
}

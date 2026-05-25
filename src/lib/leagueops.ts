/**
 * LeagueOps client — stub.
 *
 * Targets the contract proposed in
 * /Volumes/Crucial X10/tmp/nfyll-leagueops-contract-proposal.md.
 * When Sean publishes @nfyll/leagueops-types and the /api/v1/ endpoints
 * exist on https://leagueops.vercel.app (or wherever the prod host lands),
 * replace the inline types with `import type { ... } from '@nfyll/leagueops-types'`
 * and point LEAGUEOPS_BASE at the live host.
 *
 * Until then every function returns the off-season empty state. That's
 * the correct UX ~7 months a year (NFYLL = single-season Spring Rec).
 */

const LEAGUEOPS_BASE =
  import.meta.env.LEAGUEOPS_BASE ?? 'https://leagueops.vercel.app';
const LEAGUEOPS_ENABLED =
  (import.meta.env.LEAGUEOPS_ENABLED ?? 'false') === 'true';

// ---------- Inline types — replace with @nfyll/leagueops-types when published ----------

export type SeasonStatus = 'upcoming' | 'active' | 'completed';

export interface Season {
  slug: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SeasonStatus;
  registrationOpensAt?: string;
  registrationUrl?: string;
}

export interface Program {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  homeVenue?: string;
}

export interface Game {
  id: string;
  seasonSlug: string;
  divisionId: string;
  homeTeamId: string;
  awayTeamId: string;
  startsAt: string;
  endsAt?: string;
  venue: { name: string; address?: string };
  status: 'scheduled' | 'in-progress' | 'final' | 'postponed' | 'cancelled';
  score?: { home: number; away: number };
  externalUrl?: string;
}

export interface StandingRow {
  teamId: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

// ---------- Fetch helpers ----------

async function get<T>(path: string, fallback: T): Promise<T> {
  if (!LEAGUEOPS_ENABLED) return fallback;
  try {
    const res = await fetch(`${LEAGUEOPS_BASE}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// ---------- Public API ----------

export async function getSeasons(): Promise<Season[]> {
  return get<Season[]>('/api/v1/seasons', []);
}

export async function getActiveSeasons(): Promise<Season[]> {
  const all = await getSeasons();
  return all.filter((s) => s.status === 'active');
}

export async function getMostRecentCompletedSeason(): Promise<Season | null> {
  const all = await getSeasons();
  const done = all
    .filter((s) => s.status === 'completed')
    .sort((a, b) => b.endDate.localeCompare(a.endDate));
  return done[0] ?? null;
}

export async function getUpcomingSeason(): Promise<Season | null> {
  const all = await getSeasons();
  const upcoming = all
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return upcoming[0] ?? null;
}

export async function getSeasonSchedule(slug: string): Promise<Game[]> {
  return get<Game[]>(`/api/v1/seasons/${encodeURIComponent(slug)}/schedule`, []);
}

export async function getSeasonStandings(
  slug: string,
  divisionId: string,
): Promise<StandingRow[]> {
  return get<StandingRow[]>(
    `/api/v1/seasons/${encodeURIComponent(slug)}/divisions/${encodeURIComponent(divisionId)}/standings`,
    [],
  );
}

export async function getPrograms(): Promise<Program[]> {
  return get<Program[]>('/api/v1/programs', []);
}

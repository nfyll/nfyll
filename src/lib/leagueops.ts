/**
 * LeagueOps client.
 *
 * 🎯 NFYLL is a non-competitive REC LEAGUE. Public consumer API does NOT
 * include scores, standings, or W/L records. Internal matchmaking data
 * stays in LeagueOps. See `@nfyll/leagueops-types` repo for the contract.
 *
 * v1 (current): reads from a BUNDLED ARCHIVE of Spring 2026 schedule data
 * scraped from SE Tourney (regular season) + LeagueOps (May 2 jamboree).
 * Site renders Spring 2026 as the most-recent-completed season — off-season
 * state is the default until the next NFYLL season starts.
 *
 * v1.1 (future): when Sean ships the LeagueOps public consumer API, replace
 * the bundled-archive reads with HTTP fetches against /api/v1/public/*.
 * The Season/Program/Game types stay the same; only the data source flips.
 */

import {
  season as spring2026Season,
  programs as canonicalPrograms,
  games as spring2026Games,
} from '../data/leagueops/spring-2026/canonical';

// ---------- Types ----------
//
// Public-safe shapes (no score, no standings). Will be re-exported from
// `@nfyll/leagueops-types` once that package is published.

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
  /** ISO 8601 with offset, e.g. "2026-02-28T09:00:00-05:00". */
  startsAt: string;
  endsAt?: string;
  venue: { name: string; address?: string };
  status: 'scheduled' | 'in-progress' | 'final' | 'postponed' | 'cancelled';
  externalUrl?: string;
}

// ---------- Public API ----------

export async function getSeasons(): Promise<Season[]> {
  return [spring2026Season];
}

export async function getActiveSeasons(): Promise<Season[]> {
  return (await getSeasons()).filter((s) => s.status === 'active');
}

export async function getMostRecentCompletedSeason(): Promise<Season | null> {
  const done = (await getSeasons())
    .filter((s) => s.status === 'completed')
    .sort((a, b) => b.endDate.localeCompare(a.endDate));
  return done[0] ?? null;
}

export async function getUpcomingSeason(): Promise<Season | null> {
  const upcoming = (await getSeasons())
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return upcoming[0] ?? null;
}

export async function getSeasonSchedule(slug: string): Promise<Game[]> {
  if (slug !== spring2026Season.slug) return [];
  return spring2026Games;
}

export async function getPrograms(): Promise<Program[]> {
  return canonicalPrograms;
}

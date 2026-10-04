/**
 * Spring 2027 season dates — announcement data.
 *
 * Source: Dave's scheduling session 2026-09-16. School-break dates verified
 * against the districts' own 2026-27 calendars (Duval, St. Johns, Clay).
 * Matchups and game times are NOT here; they arrive with the LeagueOps feed.
 *
 * `draft: true` hides the dates site-wide and shows the review ribbon on /spring-2027.
 */

export type SeasonDayKind = 'game' | 'dark' | 'jamboree';

export interface SeasonDay {
  /** Date-only ISO string; always a Saturday. */
  date: string;
  kind: SeasonDayKind;
  label: string;
  note?: string;
}

export const spring2027 = {
  draft: false,
  name: 'NFYLL Spring 2027',
  practicesWeekOf: '2027-02-22',
  openingDay: '2027-03-06',
  jamboree: '2027-05-08',
  days: [
    { date: '2027-03-06', kind: 'game', label: 'Opening Day', note: 'Game Day 1' },
    { date: '2027-03-13', kind: 'game', label: 'Game Day 2' },
    { date: '2027-03-20', kind: 'dark', label: 'Spring Break', note: 'No Games' },
    { date: '2027-03-27', kind: 'dark', label: 'Easter Weekend', note: 'No Games' },
    { date: '2027-04-03', kind: 'game', label: 'Game Day 3' },
    { date: '2027-04-10', kind: 'game', label: 'Game Day 4' },
    { date: '2027-04-17', kind: 'game', label: 'Game Day 5' },
    { date: '2027-04-24', kind: 'game', label: 'Game Day 6' },
    { date: '2027-05-01', kind: 'game', label: 'Game Day 7' },
    { date: '2027-05-08', kind: 'jamboree', label: 'Season-Ending Jamboree', note: 'Double Header for Every Team' },
  ] satisfies SeasonDay[],
};

/** Format a date-only ISO string without a timezone shift. */
export function formatSeasonDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' },
): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}

export const gameDayCount = spring2027.days.filter((d) => d.kind === 'game').length;

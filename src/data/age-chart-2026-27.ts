/**
 * TO ROLL TO A NEW SEASON: change CUTOFF_YEAR below when USA Lacrosse publishes the next Age Grouping
 * Quick Reference Table (each summer), rebuild, and read the Age Groups section of the page.
 *
 * NFYLL Age Groups (24 months each, even groups only). Everything below derives from CUTOFF_YEAR.
 * Built on the USA Lacrosse Age Grouping Quick Reference Table (12 months) for play between
 * September 1, CUTOFF_YEAR and August 31, CUTOFF_YEAR + 1 (cut-off September 1). Each NFYLL
 * group covers two USA Lacrosse years:
 *   14U = 14U + 13U, 12U = 12U + 11U, 10U = 10U + 9U, 8U = 8U + 7U, 6U = 6U + one younger year.
 * Source: https://www.usalacrosse.com/game/age-verification
 */

/** The September 1 cut-off year. The ONE number to change each year. */
export const CUTOFF_YEAR = 2026;
/** The spring season this chart covers (e.g. 2027). */
export const SEASON_YEAR = CUTOFF_YEAR + 1;
/** The school year, e.g. "2026–27" (en dash). */
export const SCHOOL_YEAR_LABEL = `${CUTOFF_YEAR}–${String(SEASON_YEAR).slice(-2)}`;

export type NfyllAgeGroup = '14U' | '12U' | '10U' | '8U' | '6U';

/** One run of grade text, optionally followed by an ordinal suffix rendered as a real <sup>. */
export type GradePart = { text: string; sup?: string };

/**
 * Summary rows, led by grade as a quick reference. The grade only points to the group;
 * the player's date of birth decides it. `grade` reads as plain text when joined
 * (e.g. "Grades: 7th & 8th"); the `sup` parts are shown as superscript ordinals.
 */
/** Born September 1, (CUTOFF_YEAR − age) – August 31, (CUTOFF_YEAR − age + 2); graduates CUTOFF_YEAR + 19 − age and the year after. */
function bandFor(age: number): { born: string; graduation: string } {
  const from = CUTOFF_YEAR - age;
  const grad = CUTOFF_YEAR + 19 - age;
  return { born: `September 1, ${from} – August 31, ${from + 2}`, graduation: `${grad} & ${grad + 1}` };
}

export const nfyllAgeGroups: { grade: GradePart[]; group: NfyllAgeGroup; born: string; graduation: string }[] = [
  { grade: [{ text: 'Grades: 7', sup: 'th' }, { text: ' & 8', sup: 'th' }], group: '14U', ...bandFor(14) },
  { grade: [{ text: 'Grades: 5', sup: 'th' }, { text: ' & 6', sup: 'th' }], group: '12U', ...bandFor(12) },
  { grade: [{ text: 'Grades: 3', sup: 'rd' }, { text: ' & 4', sup: 'th' }], group: '10U', ...bandFor(10) },
  { grade: [{ text: 'Grades: 1', sup: 'st' }, { text: ' & 2', sup: 'nd' }], group: '8U', ...bandFor(8) },
  { grade: [{ text: 'Grades: K & Pre-K' }], group: '6U', ...bandFor(6) },
];

/** Birth-year columns of the grid: CUTOFF_YEAR − 14 … CUTOFF_YEAR − 4 (eleven years). */
export const ageChartBirthYears: number[] = Array.from({ length: 11 }, (_, i) => CUTOFF_YEAR - 14 + i);

export const ageChartMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** NFYLL group for a birth month (0 = January) and birth year, or null where no group applies. */
export function nfyllGroup(monthIndex: number, birthYear: number): NfyllAgeGroup | null {
  // USA Lacrosse age for the season: born September Y – August Y+1 plays (CUTOFF_YEAR - Y)U.
  const cohortStart = monthIndex >= 8 ? birthYear : birthYear - 1;
  const usaAge = CUTOFF_YEAR - cohortStart;
  if (usaAge < 5 || usaAge > 14) return null;
  return `${usaAge % 2 === 0 ? usaAge : usaAge + 1}U` as NfyllAgeGroup;
}

export const ageChartRows = ageChartMonths.map((month, i) => ({
  month,
  groups: ageChartBirthYears.map((y) => nfyllGroup(i, y)),
}));

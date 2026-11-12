/**
 * NFYLL Age Groups, Spring 2027 (24 months each, even groups only).
 *
 * Built on the USA Lacrosse Age Grouping Quick Reference Table (12 months) for play
 * between September 1, 2026 and August 31, 2027 (cut-off September 1). Each NFYLL
 * group covers two USA Lacrosse years:
 *   14U = 14U + 13U, 12U = 12U + 11U, 10U = 10U + 9U, 8U = 8U + 7U, 6U = 6U + one younger year.
 * Source: https://www.usalacrosse.com/game/age-verification
 */

export type NfyllAgeGroup = '14U' | '12U' | '10U' | '8U' | '6U';

/**
 * Summary rows, led by grade as a quick reference. The grade only points to the group;
 * the player's date of birth decides it.
 */
export const nfyllAgeGroups: { grade: string; group: NfyllAgeGroup; born: string; graduation: string }[] = [
  { grade: '7th and 8th Grade', group: '14U', born: 'September 1, 2012 – August 31, 2014', graduation: '2031 and 2032' },
  { grade: '5th and 6th Grade', group: '12U', born: 'September 1, 2014 – August 31, 2016', graduation: '2033 and 2034' },
  { grade: '3rd and 4th Grade', group: '10U', born: 'September 1, 2016 – August 31, 2018', graduation: '2035 and 2036' },
  { grade: '1st and 2nd Grade', group: '8U', born: 'September 1, 2018 – August 31, 2020', graduation: '2037 and 2038' },
  { grade: 'Kindergarten and Pre-K', group: '6U', born: 'September 1, 2020 – August 31, 2022', graduation: '2039 and 2040' },
];

export const ageChartBirthYears = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022] as const;

export const ageChartMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** NFYLL group for a birth month (0 = January) and birth year, or null where no group applies. */
export function nfyllGroup(monthIndex: number, birthYear: number): NfyllAgeGroup | null {
  // USA Lacrosse age for 2026-27: born September Y – August Y+1 plays (2026 - Y)U.
  const cohortStart = monthIndex >= 8 ? birthYear : birthYear - 1;
  const usaAge = 2026 - cohortStart;
  if (usaAge < 5 || usaAge > 14) return null;
  return `${usaAge % 2 === 0 ? usaAge : usaAge + 1}U` as NfyllAgeGroup;
}

export const ageChartRows = ageChartMonths.map((month, i) => ({
  month,
  groups: ageChartBirthYears.map((y) => nfyllGroup(i, y)),
}));

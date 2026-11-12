/**
 * USA Lacrosse Club and Event Age Chart (15 months), 2026-27.
 *
 * For play between September 1, 2026 and August 31, 2027. Values reproduce the
 * chart's graduation years by birth month and birth year (birth years 2013-2019):
 *   born January-May of Y    -> class Y+18
 *   born June-August of Y    -> class Y+18 or Y+19 (either)
 *   born September-December  -> class Y+19
 * Source: https://www.usalacrosse.com/game/age-verification
 */

export const ageChartBirthYears = [2013, 2014, 2015, 2016, 2017, 2018, 2019] as const;

export const ageChartMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** Graduation year(s) for a birth month (0 = January) and birth year, as printed on the chart. */
export function graduationYear(monthIndex: number, birthYear: number): string {
  if (monthIndex <= 4) return String(birthYear + 18);
  if (monthIndex <= 7) return `${birthYear + 18}/${birthYear + 19}`;
  return String(birthYear + 19);
}

export const ageChartRows = ageChartMonths.map((month, i) => ({
  month,
  years: ageChartBirthYears.map((y) => graduationYear(i, y)),
}));

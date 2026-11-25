/**
 * Spring 2027 team registration — the facts and the words for /team-registration-2027.
 *
 * DRAFT FOR REVIEW. The page is not linked from anywhere, carries `noindex`, and shows
 * the "Draft for Review. Not published." ribbon unconditionally.
 *
 * Every word the page shows comes from this file, so the league president's edits are
 * made here and nowhere else:
 *   - APPROVED: three sentences approved by the league president. Copied character for
 *     character; do not edit them without a new approval.
 *   - PROPOSED: every other sentence, heading and label on the page. Each one is open
 *     for the league president to approve or change.
 *
 * Facts (dates, divisions, fees) are the league president's decisions as encoded in the
 * league platform repository at commit 2cf136e: `packages/db/src/spring-2027.ts`
 * (season dates and the sixteen offerings) and `docs/DECISIONS.md`.
 */

import { formatSeasonDate } from './spring-2027';

/* ------------------------------------------------------------------ */
/* Dates (date-only ISO strings, league dates in America/New_York)     */
/* ------------------------------------------------------------------ */

export const TEAM_REGISTRATION_DATES = {
  registrationOpens: '2027-01-04', // Monday
  registrationCloses: '2027-02-17', // Wednesday
  newDivisionsConfirmedBy: '2027-02-20', // Saturday, two weeks before the first game
  practicesWeekOf: '2027-02-22', // Monday of the week practices start
  scheduleOutBy: '2027-02-26', // Friday
  openingDay: '2027-03-06', // Saturday, the first game
  jamboree: '2027-05-08', // Saturday, the last game day
} as const;

const D = TEAM_REGISTRATION_DATES;
/** "Monday, January 4" */
const long = (iso: string) => formatSeasonDate(iso);
/** "Monday, January 4, 2027" */
const longWithYear = (iso: string) =>
  formatSeasonDate(iso, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
/** "January 4" */
const monthDay = (iso: string) => formatSeasonDate(iso, { month: 'long', day: 'numeric' });

/* ------------------------------------------------------------------ */
/* Divisions and team fees                                             */
/* ------------------------------------------------------------------ */

export type Players = 'Boys' | 'Girls' | 'Co-ed';

export interface Division {
  ageGroup: string;
  grades: string;
  players: Players;
  format: string;
  /** Fee per team, in whole US dollars. */
  feeDollars: number;
  /** true for the four standard divisions; every other division is a new division. */
  standard: boolean;
}

/**
 * All sixteen Spring 2027 offerings from the platform's `SPRING_2027_OFFERINGS`, listed by
 * age group (standard division first, then the other Boys formats, then Girls).
 * Platform rules set `boys` / `girls` / `coed` is shown as Boys / Girls / Co-ed.
 */
export const DIVISIONS: readonly Division[] = [
  { ageGroup: '6U', grades: 'Pre-K & K', players: 'Co-ed', format: '4v4', feeDollars: 995, standard: false },

  { ageGroup: '8U', grades: '1st & 2nd', players: 'Boys', format: '4v4', feeDollars: 995, standard: true },
  { ageGroup: '8U', grades: '1st & 2nd', players: 'Boys', format: '7v7', feeDollars: 1150, standard: false },
  { ageGroup: '8U', grades: '1st & 2nd', players: 'Boys', format: 'Sixes', feeDollars: 1150, standard: false },
  { ageGroup: '8U', grades: '1st & 2nd', players: 'Girls', format: '4v4', feeDollars: 995, standard: false },

  { ageGroup: '10U', grades: '3rd & 4th', players: 'Boys', format: '7v7', feeDollars: 1150, standard: true },
  { ageGroup: '10U', grades: '3rd & 4th', players: 'Boys', format: 'Sixes', feeDollars: 1150, standard: false },
  { ageGroup: '10U', grades: '3rd & 4th', players: 'Girls', format: '8v8', feeDollars: 1150, standard: false },

  { ageGroup: '12U', grades: '5th & 6th', players: 'Boys', format: '10v10', feeDollars: 1450, standard: true },
  { ageGroup: '12U', grades: '5th & 6th', players: 'Boys', format: '7v7', feeDollars: 1450, standard: false },
  { ageGroup: '12U', grades: '5th & 6th', players: 'Boys', format: 'Sixes', feeDollars: 1450, standard: false },
  { ageGroup: '12U', grades: '5th & 6th', players: 'Girls', format: '12v12', feeDollars: 1450, standard: false },

  { ageGroup: '14U', grades: '7th & 8th', players: 'Boys', format: '10v10', feeDollars: 1450, standard: true },
  { ageGroup: '14U', grades: '7th & 8th', players: 'Boys', format: '7v7', feeDollars: 1450, standard: false },
  { ageGroup: '14U', grades: '7th & 8th', players: 'Boys', format: 'Sixes', feeDollars: 1450, standard: false },
  { ageGroup: '14U', grades: '7th & 8th', players: 'Girls', format: '12v12', feeDollars: 1450, standard: false },
];

/** "$1,150" */
export const formatFee = (dollars: number) => `$${dollars.toLocaleString('en-US')}`;

/* ------------------------------------------------------------------ */
/* APPROVED wording — copied exactly; do not edit without a new approval */
/* ------------------------------------------------------------------ */

/**
 * Source: league platform `packages/db/src/wording.ts` (commit 2cf136e), approved by the
 * league president on nfyll/infra#25, comment 7089186375.
 */
export const APPROVED = {
  /**
   * Platform `MIN_TEAMS_NOTE`. Approved 2026-11-22; this text approved again 2026-11-23,
   * replacing the 2026-11-22 note. Shown once, beneath the divisions table.
   */
  newDivisionNote:
    'New division. Each division requires at least 4 teams in order to go ahead. The league confirms two weeks before the first game. If it does not go ahead, your team can move to another division or get a full refund.',
  /** Platform `NEW_PROGRAM_NOTE`. Approved 2026-11-22. */
  newProgramNote:
    'All new programs are subject to board review and approval. If a new program is not approved, its payment is refunded in full.',
  /** Platform `CERTIFICATION_AT_REGISTRATION`. Approved 2026-11-22. */
  certification:
    'I certify that every coach and every player in this program will hold a current USA Lacrosse membership before taking part in any league event, and through the end of the season.',
  /**
   * Platform `WITHDRAWAL_REFUND_NOTE`. Approved 2026-11-24. Replaces the two PROPOSED withdrawal
   * sentences that spoke of the first game.
   */
  withdrawalRefundNote:
    'Before the game schedule is released, a team that withdraws gets back everything it paid. After the schedule is released, the refund may be reduced. The league sets the amount: for example, when a game cannot be rescheduled, its referees must still be paid.',
} as const;

/* ------------------------------------------------------------------ */
/* PROPOSED wording — open for the league president to approve or change */
/* Listed in the order they appear on the page.                        */
/* ------------------------------------------------------------------ */

export const PROPOSED = {
  // Browser tab and search description
  pageTitle: 'Spring 2027 team registration',
  metaDescription: `How programs register their teams for the NFYLL Spring 2027 season. Team registration opens ${longWithYear(D.registrationOpens)}.`,

  // Hero
  heroEyebrow: 'Spring 2027 · Team Registration',
  heroHeading: 'Team Registration for Spring 2027',
  heroWhoRegisters: 'Each program (club) registers its teams with the league.',
  heroFamilies: 'Families register their players through their club.',
  /** The disabled-looking notice shown until registration opens. Not a link. */
  opensNotice: `Team registration opens ${longWithYear(D.registrationOpens)}.`,
  heroFindClubLink: 'Families: Find Your Club →',
  heroDivisionsLink: 'See Divisions and Fees →',

  // At a glance
  glanceHeading: 'At a Glance',
  glanceOpensLabel: 'Registration Opens',
  glanceOpensText: 'Programs register their teams online.',
  glanceClosesLabel: 'Registration Closes',
  glanceClosesText: 'The last day to register a team.',
  glanceNewDivisionsLabel: 'New Divisions',
  glanceNewDivisionsText: 'The league confirms which new divisions go ahead.',
  glanceOpeningDayLabel: 'Opening Day',
  glanceOpeningDayText: 'First games of the season.',

  // Key dates
  datesHeading: 'Key Dates',
  dateOpens: 'Team registration opens',
  dateCloses: 'Team registration closes',
  dateNewDivisions: 'The league confirms new divisions',
  datePractices: 'Practices start',
  datePracticesMeta: `Week of ${long(D.practicesWeekOf)}`,
  dateSchedule: 'Game schedule out',
  dateScheduleMeta: `By ${long(D.scheduleOutBy)}`,
  dateOpeningDay: 'Opening day',
  dateJamboree: 'Jamboree',

  // Divisions and fees
  divisionsHeading: 'Divisions and Team Fees',
  divisionsLede: 'Fees are per team. Pick a division for each team you register.',
  tableCaption: 'Spring 2027 divisions and team fees',
  colAgeGroup: 'Age Group',
  colGrades: 'Grades',
  colPlayers: 'Boys / Girls / Co-ed',
  colFormat: 'Format',
  colFee: 'Team Fee',
  colNote: 'Note',
  newDivisionTag: 'New division',

  // Playing rules
  rulesHeading: 'Before You Pick a Division',
  rulesGoalies: 'Every team in every division plays with a goalie.',
  rulesGirlsOnBoys:
    "Girls may play on any Boys team. They wear the boys' protective equipment, except the athletic cup.",
  rulesBoysOnGirls: 'Boys may not play on a Girls team.',
  rulesField: 'Girls 12v12 and Boys 10v10 are played on one unified full field.',

  // How registration works
  howHeading: 'How Team Registration Works',
  stepProgramHeading: 'Choose Your Program',
  stepProgramText:
    'Pick your program from the list. A program that is not yet a league member chooses "Create a New Program."',
  stepTeamsHeading: 'Enter Each Team',
  stepTeamsText: 'For each team, you enter:',
  stepCertifyHeading: 'Certify USA Lacrosse Membership',
  stepCertifyText: "Before paying, the program's leader will be asked to certify:",
  stepPayHeading: 'Pay Online',
  stepPayText: 'Pay online by card or bank account when you register each team.',
  stepPayRegistered: 'A team is registered once payment is confirmed.',
  // PROPOSED, from the league president's words (2026-11-24): "Teams must be paid in order to be included in game schedule and confirmation of divisions".
  stepPayIncluded: 'Teams must be paid to be included in the confirmation of divisions and in the game schedule.',
  stepPayFee: 'A processing fee applies to online payments.',

  // Withdrawing
  withdrawHeading: 'Withdrawing a Team',

  // Closing card
  closingHeading: `Registration Opens ${monthDay(D.registrationOpens)}`,
  closingText: 'Team registration is online.',
  closingContact: 'Questions about team registration?',
  closingContactLink: 'Contact the league',
} as const;

/** What a program enters for each team (PROPOSED wording; the list itself is decided). */
export const TEAM_FIELDS: readonly string[] = [
  'Team name',
  'Division',
  'Head coach name, e-mail and cell',
  'Assistant coaches (optional)',
  'Expected number of players',
  'Any game days the team cannot play',
];

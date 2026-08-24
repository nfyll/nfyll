/**
 * THE member-club list. This is the only place clubs are defined.
 *
 * To add a club: drop its logo in `src/assets/brand/clubs/`, import it below,
 * and add one row to `clubs` (keep the list alphabetical by `name`). That's it
 * — the grid on /clubs and the home page picks it up, and every "nine clubs"
 * phrase in the site copy re-counts itself from `clubCount` / `clubCountWord`.
 * Do not hard-code the number in page copy.
 *
 * A club with no usable artwork yet can be added as a monogram entry instead
 * (`monogram` + `color` in place of `logo`), which renders a colored badge in
 * the same bordered-square frame.
 */
import type { ImageMetadata } from 'astro';

import ameliaIsland from '../assets/brand/clubs/amelia-island.jpg';
import boldCity from '../assets/brand/clubs/bold-city.png';
import bulldogsLc from '../assets/brand/clubs/bulldogs-lc.png';
import creeks from '../assets/brand/clubs/creeks.png';
import filc from '../assets/brand/clubs/filc.png';
import jaxLax from '../assets/brand/clubs/jax-lax.png';
import npaaPanthers from '../assets/brand/clubs/npaa-panthers.png';
import ponteVedra from '../assets/brand/clubs/ponte-vedra.png';
import redhawks from '../assets/brand/clubs/redhawks.png';

export type LogoClub = {
  name: string;
  town: string;
  logo: ImageMetadata;
  url?: string;
};
export type MonogramClub = {
  name: string;
  town: string;
  monogram: string;
  color: string;
  url?: string;
};
export type ClubEntry = LogoClub | MonogramClub;

export function isLogoClub(c: ClubEntry): c is LogoClub {
  return 'logo' in c;
}

export const clubs: ClubEntry[] = [
  { name: 'Amelia Island Hammerheads',     town: 'Amelia Island, FL',     logo: ameliaIsland, url: 'https://www.hammerheadlacrosse.com/' },
  { name: 'Bold City Eagles',              town: 'Jacksonville, FL',      logo: boldCity,     url: 'https://www.boldcitylaxevents.com/' },
  { name: 'Bulldogs LC',                   town: 'Jacksonville, FL',      logo: bulldogsLc,   url: 'https://www.bolles.org/middle/athletics/spring-sports/lacrosse' },
  { name: 'Creeks Youth Lacrosse',         town: 'St. Johns, FL',         logo: creeks,       url: 'https://creekslax.com' },
  { name: 'Fleming Island Lacrosse Club',  town: 'Fleming Island, FL',    logo: filc,         url: 'https://filc.us' },
  { name: 'Jax Lax',                       town: 'Jacksonville, FL',      logo: jaxLax,       url: 'https://jaxlax.leagueapps.com/' },
  { name: 'NPAA Panthers',                 town: 'Ponte Vedra, FL',       logo: npaaPanthers, url: 'https://www.npaalacrosse.com/' },
  { name: 'Ponte Vedra Riptide Lacrosse',  town: 'Ponte Vedra, FL',       logo: ponteVedra,   url: 'https://www.pontevedralax.com/' },
  { name: 'Redhawks',                      town: 'Gainesville, FL',       logo: redhawks,     url: 'https://www.gainesvilleyouthlax.com/' },
];

/** How many member clubs there are. Derived — never edit by hand. */
export const clubCount: number = clubs.length;

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
];

/** Spelled-out count for mid-sentence prose: "across all nine clubs". */
export const clubCountWord: string = NUMBER_WORDS[clubCount] ?? String(clubCount);

/** Spelled-out count for the start of a sentence: "Nine member clubs...". */
export const clubCountWordTitle: string =
  clubCountWord.charAt(0).toUpperCase() + clubCountWord.slice(1);

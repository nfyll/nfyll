# LeagueOps ↔ nfyll.org / filc.us — API contract proposal

**Audience:** Sean (via Dave). Draft for discussion — nothing here is committed.

**Goal:** Let nfyll.org be the public face to LeagueOps and let filc.us consume the same data without per-consumer reverse engineering. We do this by agreeing on a small versioned REST API + a shared TypeScript types package (`@nfyll/leagueops-types`) that both sides import. Sean's Claude implements the endpoints; Dave's Claude consumes them. Schema drift becomes a typecheck failure in CI, not a silent runtime bug.

---

## What LeagueOps emits today (verified from filc-legacy `leagueops.php`)

- **Host:** `https://leagueops.vercel.app` (Vercel-hosted, Sean's account)
- **Endpoint:** `GET /api/ics/{event-slug}?program={program-name}`
- **Slug pattern:** `nfyll-spring-2026` (season + year baked in)
- **Response:** RFC 5545 iCalendar — flat list of `VEVENT` game blocks
- **Fields used downstream:** `UID` (dedup), `SUMMARY` (division + matchup regex-extracted), `DTSTART` (Eastern TZ assumed), `LOCATION`, `DESCRIPTION` (division/age-group regex-extracted)
- **Auth:** none
- **Cache:** none documented; FILC parser used a 1-hour file cache

This is a great calendar-subscription primitive but it's not enough for a public site that wants standings, division tables, season switching, team rosters, etc. The proposal **keeps** the iCal endpoint as-is (calendar subscriptions are valuable) and **adds** structured JSON endpoints around it.

---

## Proposed REST API (v1)

Public read-only. Versioned under `/api/v1/`. All responses JSON; ETag + `Cache-Control: public, max-age=300` so a CDN edge can absorb traffic; CORS allows `https://nfyll.org`, `https://www.nfyll.org`, `https://filc.us` origins.

```
GET /api/v1/seasons
  → list every season LeagueOps knows about with status (upcoming/active/completed)

GET /api/v1/seasons/{slug}
  → season metadata (dates, divisions[], teams[], status)

GET /api/v1/seasons/{slug}/divisions
  → per-division summary (id, name, age-group code, current standings snapshot)

GET /api/v1/seasons/{slug}/divisions/{id}/standings
  → full standings table (team, W-L-T, GF/GA, points, rank)

GET /api/v1/seasons/{slug}/divisions/{id}/teams
  → teams in this division with their program

GET /api/v1/seasons/{slug}/schedule
  → all games in the season (filterable by ?division=, ?program=, ?from=, ?to=)
  → each game has structured division/teams, NOT regex-extracted

GET /api/v1/seasons/{slug}/teams/{id}
  → team detail with full schedule for that team

GET /api/v1/seasons/{slug}/teams/{id}/schedule.ics
  → per-team iCal (replaces the SUMMARY-regex hack)

GET /api/v1/seasons/{slug}/schedule.ics
  → season-wide iCal (replaces today's /api/ics/{slug}?program=)

GET /api/v1/programs
  → list of member clubs (id, name, logo URL, home venue)
```

Keep the **existing** `/api/ics/{slug}?program={name}` endpoint working until the FILC parser switches over (zero-disruption migration).

---

## Shared TypeScript types — `@nfyll/leagueops-types`

```ts
// season.ts
export type SeasonStatus = 'upcoming' | 'active' | 'completed';

export interface Season {
  slug: string;            // 'nfyll-spring-2026'
  name: string;            // 'Spring 2026 Rec'
  startDate: string;       // ISO date
  endDate: string;
  status: SeasonStatus;
  divisions: DivisionRef[];
  registrationOpensAt?: string;  // for off-season CTA
  registrationUrl?: string;
}

// division.ts
export interface Division {
  id: string;
  seasonSlug: string;
  name: string;             // 'HS Boys', 'MS Girls', '5/6 Boys'
  ageGroup: AgeGroup;       // structured, NOT regex-extracted
  teamCount: number;
  gamesPerTeam?: number;
}
export type AgeGroup =
  | { kind: 'youth'; gradeMin: number; gradeMax: number; gender: 'boys' | 'girls' | 'coed' }
  | { kind: 'high-school'; gender: 'boys' | 'girls' }
  | { kind: 'middle-school'; gender: 'boys' | 'girls' };

// team.ts
export interface Program {
  id: string;               // 'filc', 'creeks', 'jaxlax', 'ponte-vedra', etc.
  name: string;             // 'Fleming Island Lacrosse'
  shortName: string;        // 'FILC'
  logoUrl?: string;
  homeVenue?: string;
}
export interface Team {
  id: string;
  programId: Program['id'];
  divisionId: Division['id'];
  seasonSlug: string;
  displayName: string;      // 'FILC 5/6 Boys White'
}

// game.ts
export interface Game {
  id: string;               // stable across refreshes (today's iCal UID)
  seasonSlug: string;
  divisionId: Division['id'];
  homeTeamId: Team['id'];
  awayTeamId: Team['id'];
  startsAt: string;         // ISO 8601 with offset (no implicit TZ)
  endsAt?: string;
  venue: Venue;
  status: 'scheduled' | 'in-progress' | 'final' | 'postponed' | 'cancelled';
  score?: { home: number; away: number };
  externalUrl?: string;     // deep-link back to LeagueOps game detail
}
export interface Venue {
  id?: string;
  name: string;              // 'Fleming Island HS Field A'
  address?: string;
  lat?: number;
  lng?: number;
}

// standings.ts
export interface StandingRow {
  teamId: Team['id'];
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}
```

Versioning: semver. Breaking changes bump the major; Renovate raises PRs in `nfyll/nfyll` and `fi-lax/filc` automatically.

---

## Open questions for Sean

1. **Where does LeagueOps store its data today?** (Postgres? Files? Sheets?) Affects whether the JSON endpoints are cheap or need a query refactor.
2. **Is `nfyll-spring-2026` the only season slug, or do clubs / age groups have their own slugs?** Decides whether we need a multi-season concept right now or just one.
3. **Auth model for future admin endpoints** — when LeagueOps adds score-entry, roster-edit, registration, do you want to do (a) bearer tokens issued by LeagueOps, (b) Microsoft Entra External ID (matches FILC's setup), (c) something else?
4. **CORS allowlist** — confirm `nfyll.org`, `www.nfyll.org`, `filc.us`, plus any dev origins.
5. **Score ingestion** — who keeps scores? If a coach enters them in LeagueOps, the `Game.status='final'` + `score` fields propagate to nfyll.org via the same cron. If scores live elsewhere, that's a separate integration.
6. **Vercel free-tier limits** — public site might generate enough traffic to bump LeagueOps' limits. If that's a risk, nfyll.org/filc.us caching via our Function App becomes mandatory rather than nice-to-have.

---

## Suggested next concrete step

Sean picks one endpoint to implement first — `GET /api/v1/seasons` returning a stub array — and publishes `@nfyll/leagueops-types@0.1.0` with just the `Season` type. nfyll.org's home page consumes it. We learn the deployment + types-publishing loop with the cheapest possible endpoint, then add the rest. Plan §4.

Once stable, the legacy `leagueops.php` parser in `fi-lax/filc-legacy` is retired and `fi-lax/filc` consumes the same `/api/v1/` endpoints with the same types.

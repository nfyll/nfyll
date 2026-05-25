# nfyll.org website

Astro static site for **North Florida Youth Lacrosse League** (NFYLL).

Mirrors the FILC `apps/marketing/` stack (Astro 6, static output) for consistency
with the rest of the FI-LAX toolchain Dave maintains. Deploys to **Azure Static
Web Apps Free tier** under the NFYLL nonprofit Azure tenant.

## What's here

```
src/
  layouts/Base.astro         — shared header/footer + brand CSS vars
  pages/                     — Astro file-based routes
    index.astro              — home
    about.astro              — board, mission, contact links
    clubs.astro              — member-club grid (Amelia Island, Creeks, FILC, Jax Lax, Ponte Vedra)
    schedule.astro           — season-aware: live schedule in-season, "next season opens" off-season
    standings.astro          — same season-aware shape as /schedule
    sponsors.astro           — placeholder for sponsor logos
    contact.astro            — board@nfyll.org + form
    404.astro
  components/
    ClubGrid.astro           — renders the member-club cards
    ScheduleCard.astro       — single-game card (used by schedule + index)
  lib/
    leagueops.ts             — typed client for Sean's LeagueOps REST API; STUB pending @nfyll/leagueops-types
  assets/brand/
    nfyll-logo.jpg           — main NFYLL mark
    clubs/                   — member-club logos (provenance: SE CDN via Wayback snapshot 2023-11-28; see git history)
public/
  logo.png                   — favicon + OG image (currently the same NFYLL logo; swap with a 512×512 square version when one exists)
```

## Brand colors

Placeholder palette in `src/layouts/Base.astro` under `:root`. Set to neutral
slate + emerald until Dave/Sean confirm NFYLL's actual brand colors. Search for
`--brand-` to find the swap points.

## LeagueOps integration

`src/lib/leagueops.ts` is a typed stub that mirrors the contract proposed in
[`docs/leagueops-api-contract.md`](docs/leagueops-api-contract.md). Once Sean
publishes `@nfyll/leagueops-types`, replace the inline types with
`import type { Season, Game, StandingRow } from '@nfyll/leagueops-types'`
and point the fetch base URL at the live LeagueOps host.

The pages render off `getSeasons()` returning `[]` until then — that's the
**off-season default**, so the site degrades to "next season info coming soon"
which is the correct UX 7 months a year.

## Local dev

```
pnpm install
pnpm dev
```

## Deploy

GitHub Actions → Azure Static Web Apps (Free tier). Workflow comes from the
`fi-lax/filc/.github/workflows/deploy-marketing.yml` pattern adapted for
this repo. SWA resource: `swa-nfyll-prod` in `rg-nfyll-prod` (NFYLL tenant).

## What this is NOT

- Not the system of record for the league — that's LeagueOps (Sean's tool).
- Not a member portal — no auth, no registration flow lives here. If those
  land later, they live in LeagueOps with deep-links from here.
- Not a CMS — content updates ship as PRs. If the board ever needs
  self-service editing, bolt on Decap CMS later.

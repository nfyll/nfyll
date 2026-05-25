#!/usr/bin/env python3
"""
Transform raw Spring 2026 archive (SE Tourney HTML scrape + LeagueOps jamboree CSV)
into a canonical TS module that the Astro site imports at build time.

Outputs src/data/leagueops/spring-2026/canonical.ts conforming to the Season/Game
types in src/lib/leagueops.ts. Score fields are intentionally NOT included (NFYLL
is a rec league — no public competitive results).

Run:  python3 scripts/transform-spring-2026.py
"""
import json
import csv
import re
import os
from datetime import datetime, date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'src', 'data', 'leagueops', 'spring-2026')

SE_TOURNEY = os.path.join(DATA_DIR, 'raw-se-tourney.json')
LO_CSV = os.path.join(DATA_DIR, 'raw-leagueops-jamboree.csv')
OUT = os.path.join(DATA_DIR, 'canonical.ts')


# Map week dates to canonical ISO dates
DATE_HEADER_RE = re.compile(r'(?P<weekday>\w+),\s+(?P<month>\w+)\s+(?P<day>\d+),\s+(?P<year>\d+)')


def parse_date_header(s):
    """'Saturday, February 28, 2026' → '2026-02-28'"""
    m = DATE_HEADER_RE.search(s)
    if not m:
        return None
    return datetime.strptime(f"{m['month']} {m['day']} {m['year']}", '%B %d %Y').date().isoformat()


def parse_short_date(s):
    """'02/28/26' → '2026-02-28'"""
    if not s:
        return None
    try:
        return datetime.strptime(s, '%m/%d/%y').date().isoformat()
    except ValueError:
        return None


def parse_time(s):
    """'9:00 AM' → '09:00' (24h)"""
    if not s:
        return None
    try:
        return datetime.strptime(s.strip(), '%I:%M %p').strftime('%H:%M')
    except ValueError:
        return None


def normalize_field(loc):
    """'Julington Creek Plantation Park - Field 4 - Behind Fenced Field (8U)' → 'Field 4'"""
    m = re.search(r'Field\s+(\d+)', loc)
    return f'Field {m.group(1)}' if m else loc


# Read SE Tourney regular season
games = []
with open(SE_TOURNEY) as f:
    se = json.load(f)

for div in se['divisions']:
    div_id = div['name']
    for g in div['games']:
        iso_date = parse_short_date(g.get('short_date')) or parse_date_header(g['date'])
        iso_time = parse_time(g.get('time'))
        starts_at = f'{iso_date}T{iso_time}:00-05:00' if iso_date and iso_time else None
        games.append({
            'id': f"se-{div_id.replace('/', '').replace(' ', '-')}-{g['game_id']}-{iso_date}",
            'seasonSlug': 'spring-2026',
            'divisionId': div_id,
            'homeTeamId': g['team1'],
            'awayTeamId': g['team2'],
            'startsAt': starts_at,
            'venue': {'name': normalize_field(g['location']), 'address': 'Julington Creek Plantation Park, St Johns, FL'},
            'status': 'final',  # entire regular season is past
        })

# Read LeagueOps jamboree CSV (May 2, 2026)
with open(LO_CSV) as f:
    reader = csv.DictReader(f)
    for row in reader:
        iso_date = '2026-05-02'
        iso_time = parse_time(row['time'])
        starts_at = f'{iso_date}T{iso_time}:00-05:00' if iso_time else f'{iso_date}T09:00:00-05:00'
        status_raw = (row.get('status') or 'final').lower()
        # Strip scores per rec-league policy — never publish even in archive
        games.append({
            'id': f"lo-jamboree-{row['home_team']}-{row['away_team']}-{iso_time}".replace(' ', '_').replace('/', ''),
            'seasonSlug': 'spring-2026',
            'divisionId': row['division'],
            'homeTeamId': row['home_team'],
            'awayTeamId': row['away_team'],
            'startsAt': starts_at,
            'venue': {'name': normalize_field(row['field']), 'address': 'Julington Creek Plantation Park, St Johns, FL'},
            'status': 'final' if status_raw == 'final' else ('postponed' if status_raw == 'delayed' else status_raw),
        })

# Build canonical season + program lists
season = {
    'slug': 'spring-2026',
    'name': 'NFYLL Spring 2026',
    'startDate': '2026-02-28',
    'endDate': '2026-05-02',
    'status': 'completed',
}

# Canonical program list (8 NFYLL member clubs as of 2026-05-25, ordered as in memory)
programs = [
    {'id': 'creeks',         'name': 'Creeks Youth Lacrosse',        'shortName': 'Creeks',        'logoUrl': '/clubs/creeks.png'},
    {'id': 'ponte-vedra',    'name': 'Ponte Vedra Riptide Lacrosse', 'shortName': 'Riptide',       'logoUrl': '/clubs/ponte-vedra.png'},
    {'id': 'jax-lax',        'name': 'Jax Lax',                      'shortName': 'Jax Lax',       'logoUrl': '/clubs/jax-lax.png'},
    {'id': 'filc',           'name': 'Fleming Island Lacrosse Club', 'shortName': 'Fleming Island','logoUrl': '/clubs/filc.png'},
    {'id': 'amelia-island',  'name': 'Amelia Island Hammerheads',    'shortName': 'Hammerheads',   'logoUrl': '/clubs/amelia-island.png'},
    {'id': 'bold-city',      'name': 'Bold City Eagles',             'shortName': 'Bold City'},
    {'id': 'redhawks',       'name': 'Redhawks',                     'shortName': 'Redhawks'},
    {'id': 'bulldogs-lc',    'name': 'Bulldogs LC',                  'shortName': 'Bulldogs'},
]


# Emit TypeScript module
def js_str(s):
    if s is None: return 'null'
    return json.dumps(s)


lines = [
    '// AUTO-GENERATED by scripts/transform-spring-2026.py — do not edit.',
    '// Source: SE Tourney + LeagueOps May 2 jamboree CSV. Scores intentionally stripped',
    '// per NFYLL rec-league policy (no public competitive results).',
    '',
    "import type { Season, Program, Game } from '../../../lib/leagueops';",
    '',
    f'export const season: Season = {json.dumps(season, indent=2)};',
    '',
    f'export const programs: Program[] = {json.dumps(programs, indent=2)};',
    '',
    f'// {len(games)} games',
    f'export const games: Game[] = {json.dumps(games, indent=2)};',
    '',
]

with open(OUT, 'w') as f:
    f.write('\n'.join(lines))

print(f'Wrote {OUT}')
print(f'  Season: {season["name"]} ({season["startDate"]} → {season["endDate"]}, {season["status"]})')
print(f'  Programs: {len(programs)} clubs')
print(f'  Games: {len(games)} total')
print(f'    Regular season (SE Tourney): {len([g for g in games if g["id"].startswith("se-")])}')
print(f'    Jamboree (LeagueOps): {len([g for g in games if g["id"].startswith("lo-")])}')

teams = sorted(set(g['homeTeamId'] for g in games) | set(g['awayTeamId'] for g in games))
print(f'  Unique team names: {len(teams)}')
for t in teams[:5]:
    print(f'    {t}')
print(f'    ...')

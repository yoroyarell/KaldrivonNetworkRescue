# Kaldrivon Network Rescue: Kaldrivon Valley

A village-style, turn-based SMO strategy game. Care for three districts over seven chapters of 7–14 days. Read O1 faults, stage and apply CM changes, repair hardware, collect PM, deploy rApps through R1 services, coordinate Non-RT RIC priorities, and plan for storms and festivals.

Play: https://challenge.kaldrivon.com

## What changed in Season 3

The original timed matching/clicking game is replaced by a persistent season simulation. Four daily actions, credits, spare parts, trust, capacity, energy bills and compute slots create trade-offs. Permanent season upgrades, community grants, day-end forecasts and deterministic shared challenges reward planning. There is no countdown or clicking bonus.

Full-viewport animated in-engine cutscenes accompany O1 restoration, telemetry collection, CM changes, field repairs, construction, rApp deployment, policy changes and day transitions. Skip with Escape or disable with Scenes. Reduced motion is supported. These are canvas/CSS animations, not downloaded video files.

## Run and test

Static HTML/CSS/JavaScript, no build or dependencies. GitHub Pages serves main at the repository root. CNAME and existing artwork are retained.

```sh
python3 -m http.server 8000
node --test tests/engine.test.cjs
```

Open `http://localhost:8000`. See `guide.html` for exact game rules and architecture references. Simulation is separate from the UI in `assets/engine.js`.

## Persistence and scores

Browser-local season autosave plus an automatic permanent global scoreboard. The separate score service replays completed seasons before accepting their results. Players do not sign in or publish manually. Offline results queue locally and retry. Keeper names are public; browser IDs are not. Weekly and shared seeded challenges are supported. Old clicking-game scores are retained under the old key and excluded from the new strategy scores. Practice is unranked.

Score: average service ×6 + final trust ×2 + min(100, treasury/3) + 30 per community promise; rounded, capped at 1,000. Failed seasons are capped at 599. No time bonus.

## Architecture and assets

The SMO/OAM manages sites via O1; rApps consume R1 services; A1 represents policy intent toward a Near-RT RIC. No real network control, live AI or standards-conformance claim. Costs, capacity, policy interactions and daily timing are deliberately simplified game mechanics. Reference: https://docs.o-ran-sc.org/projects/o-ran-sc-nonrtric/en/latest/requirements.html

Original city illustration generated for this project. Existing Kaldrivon logo retained. No runtime asset downloads beyond the static site.

## Permanent scoreboard

The score API is configured in `assets/online.js`. Source for the separate D1-backed service is preserved in its managed source repository. `.github/workflows/backup-scoreboard.yml` exports public verified results into `data/scoreboard.json` every six hours, retaining Git history. This repository contains no API credentials. The game never writes GitHub files directly. Replay verification is deterministic rule validation, not a guarantee against bots or copied strategies.

## Guided tutorial campaign

Open `game.html?tutorial=1` for 18 guided lessons across three in-game days, then an independent four-day shift. Training uses real simulation rules, highlights the next action, explains its purpose, saves lesson progress, and remains unranked. Players can leave guidance without losing the valley.

# Kaldrivon Network Rescue

A graphical browser game about saving a connected city. Investigate network faults, identify the cause, approve the right targeted repair, verify recovery and race the clock.

## Play

Open `index.html`, or serve this directory with `python3 -m http.server 8000` and visit `http://localhost:8000`.

The site is plain HTML, CSS and JavaScript. No build, dependencies, cloud AI, API keys or backend are required. All routes and assets use relative paths, so a GitHub Pages project URL works.

## Features

- Original isometric city artwork with animated traffic packets, fault rings and recovery effects.
- Seven missions progressing from an accidental cell lock to a cascading outage.
- Alarms, performance trends, dependencies, configuration baselines and change history.
- Safe change approval, target selection, multi-step repairs and verification.
- Ranked mission unlocks, time pressure, hints, penalties, clean-rescue awards and star ratings.
- Weekly Friday Fault, reset Friday at 00:00 UTC; fixed scenario and target for that week.
- Shareable challenge links with the same seed, copied result text, LinkedIn sharing and PNG score cards.
- Optional synthesized audio, keyboard navigation, responsive layout and reduced-motion support.
- High scores and callsigns saved locally. This is a device-local scoreboard, not a global leaderboard.
- Rule-based autopilot solution replay with no live LLM calls.

## GitHub Pages

1. Upload these files to the root of `KaldrivonNetworkRescue` on the `main` branch.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**, then **main** and **/(root)**, and save.
4. Wait for the Pages deployment. The project URL is `https://yoroyarell.github.io/KaldrivonNetworkRescue/`.

No CNAME is included. To use `challenge.kaldrivon.com`, configure that custom domain in GitHub Pages and add its DNS record. Do not add a CNAME until you intend to activate that domain.

## Scores and fairness

Maximum score: 1,000. Evidence: 250; diagnosis: 200; repairs: 250; recovery verification: 100; remaining-time bonus: 200. Practice omits the speed bonus and is not recorded. Wrong diagnosis: -70; wrong action or target: -120 and -15 health; hint: -80. Failed attempts are capped at 499. Scores are bounded at zero.

A ranked win unlocks the next ranked mission. Weekly and shared challenge modes are open to everyone. Score records, unlocks, player callsign and sound preference use browser localStorage. Clearing browser site data resets them. Scores are client-side and not protected against tampering. A global leaderboard would need a server with score validation and abuse controls.

## Simulation scope

All telemetry is synthetic. RF effects and restoration workflows are simplified educational scenarios, not predictions or production controls. This game does not connect to live NFs, implement an O1 endpoint or expose MiniSMO. Autopilot is a deterministic explanation replay; its visual pacing is not a benchmark. Result skill metrics describe game interactions only.

## Files

- `index.html`: mission selection and weekly challenge.
- `game.html`: playable rescue console.
- `scores.html`: local scoreboard.
- `guide.html`: controls, scoring, privacy and simulation scope.
- `assets/data.js`: missions, actions, shared helpers.
- `assets/game.js`: game state, rules, visuals, sound and sharing.
- `assets/city.webp`: original generated city artwork.
- `assets/logo.svg`: logo extracted from the owner's Kaldrivon SMO page.
- `.nojekyll`: serves the static files without Jekyll.

Artwork created using the built-in image-generation tool. Prompt: “Polished isometric low-poly miniature futuristic city at night, high overhead 45-degree view, three city districts, server complex, river and bridges, navy cyan lime palette, clean roads and luminous windows, no text or interface.”

Copyright © 2026 Kaldrivon. No open-source license is granted by this repository. Contact the owner before redistributing or reusing the code, artwork or brand assets.

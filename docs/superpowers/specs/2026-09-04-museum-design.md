# Virtual Museum — Design Spec
Date: 2026-09-04
Status: draft for review
Repo: https://mugglebornpadawan.github.io/chittu-demo/

## 1. Goal
- Show 3D generative art inside a bespoke virtual museum on the web.
- Fixed tour. Visitor moves back and forth between artworks.
- Fresh art each visit. Same family, new seed.

## 2. Non-goals (v1)
- No login. No saves. No likes. No stats.
- No backend server. No DB.
- No sliders. No user-driven morph. Auto-motion only.
- No sound. No blog. No search.

## 3. Stack
- Lab (local only, not shipped): Clojure CLI + Quil. REPL play.
- Web (shipped): TypeScript + Three.js + Vite. Static only.
- RNG: mulberry32 in both lab and web. No other rand.
- Host: GitHub Pages. HTTPS auto.
  - `main` branch -> `/` live
  - `dev` branch -> `/preview` stage
  - One GitHub Action builds both paths.
- No backend. Seeds made in browser at runtime.

Why:
- Clojure where you win (ideas, REPL).
- JS where web wins (rooms, lights, camera).
- Zero server to run. Fast push.

## 4. Tour
- Size: 8 rooms (range 6-10).
- Nav: back / forth buttons + dots + room numbers + arrow keys + touch swipe.
- Load: build only 3 rooms (current + next + prev). Lazy rest. Pause off-screen.
- URL shares tour: `?tour=12,42,77&v=1&room=3`
  - `tour` = seed list. `v` = artVersion. `room` = start index.
  - Copy link = share. Reload = same tour.

## 5. Art core
- One pure fn: `seed -> staticParams`
  - Example: `{count, twist, scales[], paletteIdx, lightAngle}`
- One frame fn: `draw(staticParams, time) -> frame`
  - Live part: rotate + pulse scale ~5% + light shift.
  - Only current room animates.
- Determinism: same seed + same v = same numbers. Same art.
- ArtVersion: `v=1` now. New rules = `v=2`. Old links keep working.

## 6. Lab -> Web workflow
1. Play in Quil REPL with fixed seeds (e.g. 1, 42, 99).
2. Freeze good rules as data (counts, ranges, palette).
3. Port math once to TS. Keep mulberry32 identical.
4. Check in `/preview`. Tweak in lab. Repeat.
5. Lock. Merge `dev` -> `main` for live.
- Parity test: 3 fixed seeds must give same numbers in CLJ and TS.

## 7. Look — locked
- Museum: monochromatic grey walls. Dark grey floor. Soft white spots.
- Artworks: mono shades only (white / black / grey). No color.
- Light mood: calm gallery. Low contrast. No harsh shadows.
- Share image: one static OG preview (museum hall + one art). Same for all tours.

## 8. Perf budget — locked
- First load <3s on broadband. Bundle <5MB total. No video textures.
- Target 60fps. Low GPU fallback: 30fps, stop pulse, keep rotate.
- Pause hidden rooms. Cap pixelRatio at 2. Reuse geometry / materials.

## 9. Mobile + browsers — locked
- Touch swipe = back / forth. Large tap targets. Fits small screens.
- Browsers: latest LTS of Chrome, Safari, Firefox + Edge Chromium. Evergreen.
- No WebGL -> show static image + message: "WebGL needed for 3D tour".

## 10. Motion-safe
- Toggle: Anim on / off. Respect `prefers-reduced-motion` default off.
- Off = still frames. Nav still works.

## 11. Repo layout (planned)
- `lab/` — `deps.edn`, `src/art.clj`, `test/art_test.clj`
- `web/` — `package.json`, `vite.config.ts`, `src/main.ts`, `src/art.ts`, `src/museum.ts`, `src/rng.ts`
- `.github/workflows/pages.yml` — build `main->/`, `dev->/preview`
- `docs/superpowers/specs/` — this file

## 12. Tests (v1)
- Seed determinism: same seed = same params (CLJ + TS).
- Nav: forward, back, dots, keys, swipe change room index.
- FPS: current room animates, others paused.
- Fallback: no WebGL shows image.
- Link: URL with seeds restores same tour.

## 13. Risks + fixes
- Lab/Web drift -> parity test on 3 seeds.
- 8 rooms heavy -> lazy 3 only.
- GH Pages one site -> two paths in one build.
- Old links break -> artVersion in URL.
- Low GPU stalls -> auto drop to 30fps.

## 14. Open after v1
- Backend later for saves / votes / curated tours. Design keeps door open (seed API can replace local RNG).
- Custom domain later. No code change.

---
Review ask: read this file. Say yes or list changes. Next step after yes = writing-plans skill for build plan.

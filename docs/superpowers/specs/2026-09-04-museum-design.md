# Virtual Museum — Design Spec
Date: 2026-09-04
Status: approved with fixes 2026-09-04, ready for plan
Repo: https://mugglebornpadawan.github.io/chittu-demo/

## 1. Goal
- Show 3D generative art in a virtual museum on the web.
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
- RNG: mulberry32 for art in both lab and web. Seed creation uses `crypto.getRandomValues()` only.
- Host: GitHub Pages. HTTPS auto.
  - `main` branch -> `/` live
  - `dev` branch -> `/preview` stage
  - One GitHub Action builds both paths.
- No backend. Seeds made in browser at runtime.

Why:
- Clojure for ideas and REPL.
- JS for rooms, lights, camera.
- Zero server to run. Fast push.

## 4. Tour
- Size: default 8 rooms. Allow 6-10.
  - Config lives in `web/src/config.ts`.
  - Example: `export const ROOM_COUNT = 8`.
  - v1 uses fixed const for fresh visits. No UI. No URL param.
  - Shared tour: `tour` length wins over `ROOM_COUNT`.
- Seeds: integer only. Range 0 to 99999.
  - Short URL. Easy to test. Easy to read.
  - Fresh visit: make `ROOM_COUNT` seeds with `crypto.getRandomValues()`. One seed per room.
- Nav: back / forth buttons + dots + room numbers + arrow keys + touch swipe.
  - Buttons use `aria-label`.
  - Dots use `role=tab` + `aria-label` with room number. Parent uses `role=tablist`. Arrow keys move between tabs.
  - Focus ring is visible at all times.
  - Min tap size is 44x44px.
- Load: build only 3 rooms (current + next + prev). Lazy rest. Pause off-screen.
- URL shares tour: `?tour=12,42,77&v=1&room=2`
  - `tour` = seed list. `v` = artVersion. `room` = start index, 0-based.
  - First room = `room=0`. Last room = `tour.length - 1`.
  - Copy link = share. Reload = same tour.

## 5. Art core
- One pure fn: `seed -> staticParams`
  - Shape: `{count, twist, scales[], paletteIdx, lightAngle}`
  - `paletteIdx` is 0, 1, or 2. Mono only. Wall stays fixed.
  - Palettes (art color only):
    - 0 = white art: `#FFFFFF`
    - 1 = black art: `#000000`
    - 2 = mid-grey art: `#808080`
- One frame fn: `draw(staticParams, time) -> frame`
  - Live part: rotate + pulse scale ~5% + light shift.
  - Only current room animates.
- Determinism: same seed + same v = same numbers. Same art.
- ArtVersion: `v=1` now. New rules = `v=2`. Old links keep working.
- Param ranges: left to lab. Frozen output lives in `vectors.json`. Spec does not lock ranges in v1.
- RNG rule:
  - Art code uses only mulberry32 in TS and Clojure. No other rand in art code.
  - Seed creation is the sole exception: use `crypto.getRandomValues()`.
  - Use this exact code in both ports:
    ```ts
    // mulberry32 - canonical v1. Do not change without bumping v.
    export function mulberry32(seed: number): () => number {
      let a = seed >>> 0;
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    ```
  - TS uses `>>> 0` for 32-bit int.
  - Clojure uses `bit-and` with `0xFFFFFFFF` for same result.

## 6. Lab -> Web workflow
1. Play in Quil REPL with fixed seeds 1, 42, 99.
2. Freeze good rules as data (counts, ranges, palette).
3. Port math once to TS. Keep mulberry32 identical.
4. Check in `/preview`. Tweak in lab. Repeat.
5. Lock. Merge `dev` -> `main` for live.
- Parity test:
  - Seeds 1, 42, 99 must give same numbers in CLJ and TS.
  - Frozen vectors live in `lab/test/vectors.json` and `web/test/vectors.json`.
  - Test fails if numbers drift.

## 7. Look — locked
- Museum:
  - Wall `#B0B0B0`
  - Floor `#333333`
  - Spot light `#FFFFFF`, intensity 0.8
- Artworks: mono shades only (white / black / grey). No color.
- Light mood: calm gallery. Low contrast. No harsh shadows.
- Share image: one static OG preview at `web/public/og.png`. Same for all tours.
  - Image shows museum hall + one art.

## 8. Perf budget — locked
- First load <3s on broadband. Raw dist JS <5MB total. No video textures.
  - Import from `three` core only. No addons. No `three-stdlib`. No `three/examples/`.
  - Use Vite tree-shake.
  - CI checks raw dist size. Fail if >5MB.
- Target 60fps. Low GPU fallback: 30fps, stop pulse, keep rotate.
- Pause hidden rooms. Cap pixelRatio at 2. Reuse geometry / materials.

## 9. Mobile + browsers — locked
- Touch swipe = back / forth. Large tap targets. Fits small screens.
  - Min tap target 44x44px.
- Browsers: latest LTS of Chrome, Safari, Firefox + Edge Chromium. Evergreen.
- No WebGL -> show `web/public/fallback.png` + message: "WebGL needed for 3D tour".

## 10. Motion-safe
- Toggle: Anim on / off. Respect `prefers-reduced-motion` default off.
- Off = still frames. Nav still works.
- Test: off = 0 animation frames. Nav still changes room.

## 11. Repo layout (planned)
- `lab/` — `deps.edn`, `src/art.clj`, `test/art_test.clj`, `test/vectors.json`
- `web/` — `package.json`, `vite.config.ts`, `src/main.ts`, `src/art.ts`, `src/museum.ts`, `src/rng.ts`, `src/config.ts`
- `web/test/` — `art.test.ts`, `vectors.json`
- `web/public/` — `fallback.png`, `og.png`
- `.github/workflows/pages.yml` — build `main->/`, `dev->/preview`
  - One Action, two jobs.
  - Build `main` to `/`. Build `dev` to `/preview`.
  - Deploy to `gh-pages` branch.
  - Temp dirs: `dist-main` and `dist-preview`.
  - Vite base: `/` for main build, `/preview/` for dev build. Use `--base` flag per job.
- `docs/superpowers/specs/` — this file

## 12. Tests (v1)
- Seed determinism: same seed = same params (CLJ + TS). Uses vectors.json.
- Nav: forward, back, dots, keys, swipe change room index.
- FPS: current room animates, others paused.
- Fallback: no WebGL shows image.
- Link: URL with seeds restores same tour.
- Motion: off = still frame. Nav still works.
- Size: CI fails if raw dist JS >5MB.

## 13. Risks + fixes
- Lab/Web drift -> parity test on seeds 1, 42, 99.
- 8 rooms heavy -> lazy 3 only.
- GH Pages one site -> two jobs in one build to `gh-pages`.
- Old links break -> artVersion in URL.
- Low GPU stalls -> auto drop to 30fps.

## 14. Open after v1
- Backend later for saves / votes / curated tours. Design keeps door open (seed API can replace local RNG).
- Custom domain later. No code change.
- Room count via URL (`?rooms=8`) later. v1 uses fixed const.
- More palettes later. v1 uses 3 mono palettes.

---
Status: approved 2026-09-04. All 9 fixes applied. Next step = writing-plans skill for build plan.

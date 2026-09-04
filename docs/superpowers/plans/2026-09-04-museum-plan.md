# Virtual Museum — Implementation Plan

Date: 2026-09-04
Spec: [2026-09-04-museum-design.md](../specs/2026-09-04-museum-design.md)
Status: Completed

---

## Overview

This document details the step-by-step implementation plan for the Virtual Museum project as specified in [2026-09-04-museum-design.md](../specs/2026-09-04-museum-design.md).

---

## Tasks & Phases

### Phase 1: Project Setup & Canonical RNG Engine

- [x] **1.1 Web App Directory & Tooling Setup**
  - Create `web/` directory with Vite, TypeScript, Vitest, and Three.js (`three` core only).
  - Configure `vite.config.ts` and `package.json` with scripts (`dev`, `build`, `test`).
  - Create `web/public/` placeholder files (`og.png`, `fallback.png`).

- [x] **1.2 Lab Directory Setup**
  - Create `lab/` directory with Clojure CLI structure (`deps.edn`).
  - Configure namespace `art.clj` and test namespace `art_test.clj`.

- [x] **1.3 Canonical RNG Implementation (`rng.ts` & `art.clj`)**
  - Implement 32-bit integer `mulberry32` generator in TypeScript (`web/src/rng.ts`).
  - Implement bitwise equivalent `mulberry32` generator in Clojure (`lab/src/art.clj`).
  - Implement seed generation using `crypto.getRandomValues()` for runtime visits.

- [x] **1.4 RNG Unit & Determinism Tests**
  - Create initial test vectors in `web/test/vectors.json` and `lab/test/vectors.json`.
  - Add unit tests verifying `mulberry32` produces deterministic floating-point outputs given fixed seeds `1`, `42`, `99`.

---

### Phase 2: Art Generation Core & Vector Parity

- [x] **2.1 Pure Parameter Generation (`seed -> staticParams`)**
  - Implement parameter generation function in TS (`web/src/art.ts`) and Clojure (`lab/src/art.clj`).
  - Schema: `{ count, twist, scales, paletteIdx, lightAngle }`.
  - Implement palette selection mapping (0: `#FFFFFF`, 1: `#000000`, 2: `#808080`).

- [x] **2.2 Parity Verification Test Suite**
  - Freeze output vectors for seeds `1`, `42`, `99` into `vectors.json`.
  - Write parity test in `web/test/art.test.ts` and `lab/test/art_test.clj` ensuring CLJ and TS output identical vectors.

- [x] **2.3 Frame Render Function (`draw`)**
  - Implement `draw(staticParams, time)` in TS returning frame transformation data (rotation, ~5% scale pulse, subtle light shift).

---

### Phase 3: Three.js Gallery Scene & Room Management

- [x] **3.1 Museum Gallery Scene (`web/src/museum.ts`)**
  - Build gallery scene with wall (`#B0B0B0`), floor (`#333333`), and spot light (`#FFFFFF`, intensity 0.8).
  - Enforce three core imports only (no addons or `three-stdlib`).

- [x] **3.2 Room Instantiation & Geometry/Material Reuse**
  - Create room layout manager instantiating geometry and materials efficiently.
  - Implement windowing logic: load only 3 rooms (current, next, previous) and lazy load remaining.
  - Pause frame rendering and updates on off-screen rooms.

---

### Phase 4: Tour Navigation, URL State & Accessibility

- [x] **4.1 Navigation Controls & Accessibility**
  - Implement back/forth UI buttons with `aria-label`.
  - Implement dot navigation using `role="tablist"` and `role="tab"`.
  - Add keyboard arrow key navigation and touch swipe support.
  - Ensure minimum tap size is $44 \times 44\text{px}$ with visible focus rings.

- [x] **4.2 URL State & Seed Parsing**
  - Read & construct tour URLs with parameters: `?tour=seed1,seed2,...&v=1&room=0`.
  - Handle shared tours vs. fresh random tour generation via `crypto.getRandomValues()`.

- [x] **4.3 Motion Preferences & WebGL Fallback**
  - Implement animation toggle respecting `prefers-reduced-motion` (0 animation frames when disabled, navigation preserved).
  - Implement WebGL support check; display `fallback.png` and message ("WebGL needed for 3D tour") when unsupported.

---

### Phase 5: CI/CD Pipeline & Asset Budget Verification

- [x] **5.1 GitHub Actions Workflow (`.github/workflows/pages.yml`)**
  - Configure workflow with two jobs: `main` branch to `/`, `dev` branch to `/preview`.
  - Add Vite `--base` build parameter per target path.

- [x] **5.2 Dist Bundle Size Check**
  - Add build step asserting raw JS dist size is under 5 MB limit.

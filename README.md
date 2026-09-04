# Virtual Museum 🏛️🎨

A web-based 3D virtual museum displaying deterministic generative art pieces. Built with TypeScript, Three.js, Vite, and Clojure.

---

## 🚀 Live Demo

- **Production (`main` branch)**: [https://mugglebornpadawan.github.io/chittu-demo/](https://mugglebornpadawan.github.io/chittu-demo/)
- **Stage Preview (`dev` branch)**: [https://mugglebornpadawan.github.io/chittu-demo/preview/](https://mugglebornpadawan.github.io/chittu-demo/preview/)

---

## ✨ Features

- **3D Generative Art**: Fresh procedural art generated for each visit, driven by deterministic random seeds.
- **Fixed Room Tour**: Smooth navigation across gallery rooms with lazy loading (loads maximum 3 active rooms at a time: `current - 1`, `current`, `current + 1`).
- **Canonical RNG Engine**: Bitwise-identical `mulberry32` PRNG implementation shared across the Clojure REPL lab and the TypeScript web client.
- **Accessible UI**: Keyboard arrow navigation, touch swipe support, minimum $44 \times 44\text{px}$ tap targets, visible focus rings, and proper ARIA tab roles (`role="tablist"`, `role="tab"`).
- **Motion Safety**: Respects `prefers-reduced-motion` with an interactive motion toggle (ON/OFF).
- **WebGL Fallback**: Gracefully detects WebGL availability and displays a fallback preview if WebGL is unsupported.
- **Shareable Tours**: Expresses full tour state via clean URL query parameters (`?tour=12,42,77&v=1&room=0`).

---

## 🛠️ Tech Stack & Architecture

- **Web Frontend**: TypeScript + Three.js (core only, zero addons) + Vite.
- **Generative Lab**: Clojure CLI + REPL for procedural art experimentation.
- **RNG**: 32-bit `mulberry32` canonical PRNG algorithm. Seed creation via Web `crypto.getRandomValues()`.
- **CI/CD**: GitHub Actions deploying `main` $\to$ `/` and `dev` $\to$ `/preview/` with automated dist JS budget assertion ($< 5\text{MB}$).

---

## 📁 Repository Structure

```text
├── web/                      # Frontend TypeScript web application
│   ├── src/
│   │   ├── art.ts            # Seed -> staticParams generator & frame transforms
│   │   ├── museum.ts         # Three.js gallery scene & 3-room window manager
│   │   ├── rng.ts            # Mulberry32 canonical PRNG & crypto seed generator
│   │   ├── ui.ts             # Accessible UI navigation overlay & touch/keyboard handlers
│   │   ├── url.ts            # Query parameter state parser & generator
│   │   ├── config.ts         # Museum tour configuration constants
│   │   └── main.ts           # Application entry point & WebGL fallback initialization
│   ├── test/                 # Vitest / Node test runner specifications & vectors.json
│   └── index.html            # Vite HTML entry point
│
├── lab/                      # Clojure REPL art lab
│   ├── src/art.clj           # Bitwise-identical Clojure mulberry32 & staticParams math
│   ├── test/art_test.clj     # Clojure unit tests asserting vector parity
│   └── deps.edn              # Clojure dependencies
│
├── docs/                     # Design specs & implementation plans
│   ├── superpowers/specs/    # Approved design specifications
│   └── superpowers/plans/    # Detailed phase-by-phase implementation plan
│
└── .github/workflows/        # GitHub Actions workflow for Pages deployment
    └── pages.yml             # Dual branch deployment (main -> /, dev -> /preview/)
```

---

## ⚡ Quickstart

### 1. Web Client (TypeScript & Vite)

```bash
# Navigate to web folder
cd web

# Install dependencies
npm install

# Start local dev server
npm run dev

# Run unit test suite
npm test

# Build production bundle
npm run build
```

### 2. Lab (Clojure CLI)

```bash
# Navigate to lab folder
cd lab

# Run Clojure parity unit tests
clj -M -e "(require '[clojure.test :refer [run-tests]]) (require 'art-test) (run-tests 'art-test)"
```

---

## 🔒 Determinism & Parity Tests

The lab (Clojure) and web client (TypeScript) share identical floating-point output vectors for test seeds `1`, `42`, and `99`. Test vectors are frozen in `vectors.json` and validated on every build.

---

## 📄 License

MIT License

# Virtual Museum 🏛️🎨

A web-based 3D virtual museum displaying deterministic generative art pieces. Built with TypeScript, Three.js, Vite, and Clojure with Quil (Processing).

---

## 🚀 Live & Local URLs

### Live GitHub Pages Deployments
- **Production (`main` branch)**: [https://mugglebornpadawan.github.io/chittu-demo/](https://mugglebornpadawan.github.io/chittu-demo/)
- **Stage Preview (`dev` branch)**: [https://mugglebornpadawan.github.io/chittu-demo/preview/](https://mugglebornpadawan.github.io/chittu-demo/preview/)

### Local Development Server
- **Active Dev Server**: `http://localhost:5173/` *(Run `npm run dev` in `web/`)*

> [!NOTE]
> **Do you need multiple servers running?**
> **No!** You only need to run **`npm run dev`** (Port 5173) for all local development and live-reloading. The production preview commands (`npm run preview` on port 4173) are optional commands used only to inspect compiled build artifacts locally before deploying.

---

## ✨ Features

- **3D Generative Art**: Fresh procedural art generated for each visit, driven by deterministic random seeds.
- **Quil (Processing) REPL Lab**: Interactive 3D art design environment using Clojure + Quil (Processing P3D) for rapid REPL prototyping before shipping to web.
- **Fixed Room Tour**: Smooth navigation across gallery rooms with lazy loading (loads maximum 3 active rooms at a time: `current - 1`, `current`, `current + 1`).
- **Canonical RNG Engine**: Bitwise-identical `mulberry32` PRNG implementation shared across the Clojure REPL lab and the TypeScript web client.
- **Accessible UI**: Keyboard arrow navigation, touch swipe support, minimum $44 \times 44\text{px}$ tap targets, visible focus rings, and proper ARIA tab roles (`role="tablist"`, `role="tab"`).
- **Motion Safety**: Respects `prefers-reduced-motion` with an interactive motion toggle (ON/OFF).
- **WebGL Fallback**: Gracefully detects WebGL availability and displays a fallback preview if WebGL is unsupported.
- **Shareable Tours**: Expresses full tour state via clean URL query parameters (`?tour=12,42,77&v=1&room=0`).

---

## 🎨 Beginner-Friendly Generative Artist Workflow

If you are new to this repo, here is how you design, test, and publish new 3D generative art step-by-step!

### 💡 Understanding the Two Folders
* 🧪 **`lab/` (The Art Sandbox)**: An interactive 3D desktop window where you play with shapes, colors, and math formulas using Clojure.
* 🌐 **`web/` (The Main Website)**: The actual website built with TypeScript & Three.js that visitors see in their web browsers.

---

```mermaid
flowchart TD
    A["1. Design 3D art formula in lab/"] --> B["2. Copy math formula into web/src/art.ts"]
    B --> C["3. Test locally in browser (npm run dev)"]
    C --> D["4. Push to dev branch for Stage Preview"]
    D --> E["5. Merge dev -> main to Publish Live!"]
```

### 1️⃣ Step 1: Experiment with 3D Art in the Sandbox (`lab/`)
* **What you're doing:** Tweaking numbers to see instant 3D art changes in a popup desktop window.
* **Commands to run:**
  ```bash
  cd lab
  clj -M -m art 42
  ```
* **How to change the art:** Open `lab/src/art.clj` and adjust rotational speeds, twist values, or scale ranges. A desktop window will pop up showing the generated 3D piece for seed `42` (you can also try seed `1` or `99`).

---

### 2️⃣ Step 2: Copy your Math to the Web App (`web/`)
* **What you're doing:** Porting your math formulas from Clojure (`lab/`) into TypeScript (`web/`) so the web browser renders the exact same art.
* **Where to edit:** Open `web/src/art.ts` and update the `generateStaticParams` function with your updated values.
* **Check math parity:** Run the test command to verify that the lab and web app produce bitwise-identical numbers:
  ```bash
  cd web
  npm test
  ```

---

### 3️⃣ Step 3: Test Local Website in Browser (`web/`)
* **What you're doing:** Previewing your new 3D museum exhibition locally on your computer.
* **Commands to run:**
  ```bash
  cd web
  npm run dev
  ```
* Open `http://localhost:5173/` in your browser to walk through gallery rooms and inspect the art.

---

### 4️⃣ Step 4: Share a Stage Preview (`dev` branch)
* **What you're doing:** Publishing a temporary preview link to test on mobile devices or share with teammates.
* **Commands to run:**
  ```bash
  git checkout dev
  git add .
  git commit -m "Update generative art formula"
  git push origin dev
  ```
* GitHub Actions will automatically update the online preview page at:  
  👉 **[https://mugglebornpadawan.github.io/chittu-demo/preview/](https://mugglebornpadawan.github.io/chittu-demo/preview/)**

---

### 5️⃣ Step 5: Publish Live to Production (`main` branch)
* **What you're doing:** Publishing your finished 3D virtual museum exhibition to the main website for everyone!
* **Commands to run:**
  ```bash
  git checkout main
  git merge dev
  git push origin main
  ```
* Your updated exhibition is now live at:  
  👉 **[https://mugglebornpadawan.github.io/chittu-demo/](https://mugglebornpadawan.github.io/chittu-demo/)**

---

## 🛠️ Tech Stack & Architecture

- **Web Frontend**: TypeScript + Three.js (core only, zero addons) + Vite.
- **Generative Lab**: Clojure CLI + Quil (Processing P3D) for 3D REPL art experimentation.
- **RNG**: 32-bit `mulberry32` canonical PRNG algorithm. Seed creation via Web `crypto.getRandomValues()`.
- **CI/CD**: GitHub Actions deploying `main` $\to$ `/` and `dev` $\to$ `/preview/` with automated dist JS budget assertion ($< 5\text{MB}$).

---

## 📁 Repository Structure

```text
├── LICENSE                   # GNU General Public License v3.0 (GPLv3)
├── web/                      # Frontend TypeScript web application
│   ├── src/
│   │   ├── art.ts            # Seed -> staticParams generator & frame transforms
│   │   ├── museum.ts         # Three.js gallery scene & 3-room window manager
│   │   ├── rng.ts            # Mulberry32 canonical PRNG & crypto seed generator
│   │   ├── ui.ts             # Accessible UI navigation overlay & touch/keyboard handlers
│   │   ├── url.ts            # Query parameter state parser & generator
│   │   ├── config.ts         # Museum tour configuration constants
│   │   └── main.ts           # Application entry point & WebGL fallback initialization
│   ├── test/                 # Node test runner specs & frozen test vectors
│   │   ├── art.test.ts       # Generator static params & transform unit tests
│   │   ├── museum.test.ts    # Gallery scene & 3-room manager unit tests
│   │   ├── ui.test.ts        # Navigation UI & accessibility unit tests
│   │   ├── url.test.ts       # Query parameter state parser unit tests
│   │   └── vectors.json      # Frozen test vectors for PRNG & static params
│   └── index.html            # Vite HTML entry point
│
├── lab/                      # Clojure REPL art lab (Quil Processing)
│   ├── src/art.clj           # Bitwise-identical Clojure mulberry32, staticParams & Quil P3D sketch
│   ├── test/art_test.clj     # Clojure unit tests asserting vector parity
│   └── deps.edn              # Clojure CLI dependencies (Quil 4.3)
│
├── docs/                     # Design specs & implementation plans
│   ├── superpowers/specs/    # Approved design specifications
│   └── superpowers/plans/    # Detailed phase-by-phase implementation plan
│
└── .github/workflows/        # GitHub Actions workflow for Pages deployment
    └── pages.yml             # Dual branch deployment (main -> /, dev -> /preview/)
```

---

## 💻 Local Machine Setup & Build Guidelines

### 1. Prerequisites

Ensure your local development environment has the following tools installed:

- **Node.js**: `v18.0.0` or higher (`v20+` / `v24+` recommended)
- **npm**: `v9.0.0` or higher
- **Java JDK**: `v11` or higher (required for Clojure CLI)
- **Clojure CLI (`clj`)**: `v1.11+`

Verify installations:
```bash
node -v
npm -v
java -version
clj -v
```

---

### 2. Web Client Build & Execution (`web/`)

#### Step A: Install Dependencies
```bash
cd web
npm install
```

#### Step B: Run Development Server (Main Dev Command)
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser. This is the **only server you need** while developing!

#### Step C: Run Web Unit Test Suite
```bash
npm test
```

#### Step D: Build Production Distribution
```bash
npm run build
```
Compiles TypeScript and bundles production assets into `web/dist/` (or `../dist-main/` when building with CI flags).

#### Step E (Optional): Inspect Production & Stage Builds Locally
- **Inspect Production Bundle (`/` base)**:
  ```bash
  npm run preview
  ```
  Opens compiled production build at `http://localhost:4173/`.

- **Inspect Stage Bundle (`/preview/` base)**:
  ```bash
  npx vite build --base=/preview/ --outDir=../dist-preview
  npx vite preview --outDir=../dist-preview
  ```
  Opens compiled stage build at `http://localhost:4173/preview/`.

---

### 3. Generative Lab Build & Execution (`lab/`)

#### Launch 3D Quil (Processing) Sketch from Terminal:
```bash
cd lab

# Launch interactive 3D Quil window for seed 42
clj -M -m art 42

# Launch interactive 3D Quil window for seed 99
clj -M -m art 99
```

#### Launch from Clojure REPL:
```clojure
(require '[art :as art])

;; Launch interactive 3D Quil window for any seed integer
(art/run-lab-sketch 42)
```

#### Run Clojure Parity Unit Tests:
```bash
cd lab
clj -M -e "(require '[clojure.test :refer [run-tests]]) (require 'art-test) (run-tests 'art-test)"
```

---

## 🔒 Determinism & Parity Tests

The lab (Clojure) and web client (TypeScript) share identical floating-point output vectors for test seeds `1`, `42`, and `99`. Test vectors are frozen in `vectors.json` and validated on every build.

---

## 📄 License

Distributed under the **GNU General Public License v3.0 (GPLv3)**. See [`LICENSE`](./LICENSE) for full text.

# Project Presentation 2: Mid-Term Progress Review & Implementation Update

Interactive presentation deck for the **Software Project Lab 1 (SE 2105)** project:
> **"Implementation & Tiled Parallelization of Retinex and DT-CWT Based Low-Light Image Enhancement"**

- **Student:** Md. Rakinuzzaman Talukder (Roll: BSSE 1728)
- **Course Instructor:** Prof. Dr. B M Mainul Hossain
- **Supervisor:** Dr. Zerina Begum
- **Institution:** Institute of Information Technology (IIT), University of Dhaka
- **Reference Paper:** Yang et al. (2018), "Low-light image enhancement based on Retinex theory and dual-tree complex wavelet transform", *Optoelectronics Letters*, DOI: [10.1007/s11801-018-8046-5](https://doi.org/10.1007/s11801-018-8046-5)

---

## Overview

This directory contains the second interactive presentation deck (`presentation2`), continuing directly from `presentation1`. Built with React 19, Vite, Tailwind CSS v4, and `vite-plugin-singlefile`, this deck presents the **mid-term engineering progress**, contrasting the initial high-level plan with the realized 8-phase roadmap, providing an interactive repository directory, clean linear git history breakdown, CLI usage instructions, and comprehensive phase-by-phase visual results and mathematical learnings (Phases 0 through 5).

---

## Slide Structure & Content

1. **Slide 1: Title & Mid-Term Overview**
   - Project title, student credentials, supervisor, course instructor, and institutional affiliation.
   - Interactive Before/After **Split Viewer** comparing raw underexposed capture against the Phase 5 enhanced output.
   - Milestone status chip: *Phases 0 – 5 Complete • Sub-pixel MATLAB Benchmark Parity (0.24 levels MAE)*.

2. **Slide 2: Evolution of Plans & Timeline Progress**
   - **Original Timeline (Presentation 1 Slide 6):** Recreates the initial 5-milestone sequential Gantt chart (Sep – Dec).
   - **Realized 8-Phase Engineering Roadmap:** Detailed status across Phases 0 through 7.
   - **Adaptation & Rationale Analysis:**
     - De-risking mathematics first by splitting the core algorithm into 5 verifiable phases before GUI development.
     - Discoveries from the author's reference MATLAB codebase (full-res gain modulation, auto-contrast floor clamping).
     - Re-sequencing the JavaFX GUI (Phase 7) after the parallel Tiling Engine (Phase 6) for direct binding.

3. **Slide 3: Repository Architecture, Git History & CLI Guide**
   - **Interactive Directory Tree:** Animated file explorer showcasing `EnhancementPipeline.java`, `DualTreeCWT.java`, `GuidedFilter.java`, `JOURNAL.md`, etc., with LOC and role metrics.
   - **Linear Git Commit History:** Chronological breakdown of commits (`cc5b75b` → `4ba2f33` → `3022149` → `a2ff7d2` → `2c6d635` → `9545857`) with SHA hashes, author timestamps, touched files, and milestone impacts.
   - **CLI Usage Guide & Terminal Emulator:** Copyable execution commands for the default pipeline, custom I/O paths, and intermediate phase runners with realistic simulated terminal logs.

4. **Slide 4: Phase-by-Phase Results, Implementation & What We Learned**
   - Interactive 5-phase navigator covering:
     - **Phase 1 (HSV Decomposition):** H, S, V channels, direct RGB highlight clipping error ($63$ levels), and saturation analysis.
     - **Phase 2 (Gaussian Retinex & Log Tone Mapping):** SSR ($\sigma \in \{15, 80, 250\}$), MSR, Stockham global tone mapping, and Gaussian edge halo diagnosis.
     - **Phase 3 (Guided Filter Tone Mapping):** $O(N)$ linear-time box filter, halo elimination diff map ($\times 5$), local adaptive contrast factor $a(x,y)$, and dynamic anchoring.
     - **Phase 4 (2D DT-CWT & Soft Wavelet Denoising):** 6 directional sub-bands ($\pm 15^\circ, \pm 45^\circ, \pm 75^\circ$), Kingsbury 5/7 filter pairs, machine-precision perfect reconstruction ($1.1 \times 10^{-8}$ MAE), and Donoho MAD noise shrinkage.
     - **Phase 5 (Full Pipeline & Benchmark Calibration):** Monotonic Retinex formulation, native resolution gain modulation, shadow floor anchoring ($v_{\min} \le 0$), and sub-pixel parity ($0.24$ levels MAE) with author's benchmark.

5. **Slide 5: Upcoming Milestones & Next Horizons**
   - **Phase 6 (Spatial Tiling & Parallel Engine):** Uniform $4 \times 4$ tile partitioning, $\pm 16\text{ px}$ halo overlap matching filter radius $r$, `ForkJoinPool` CPU concurrency, and seamless recombination.
   - **Phase 7 (Interactive JavaFX Desktop GUI):** Split before/after wipe-slider, asynchronous worker threads, and multi-resolution benchmark suite.
   - Concluding remarks and Q&A.

---

## Tech Stack & Tooling

- **Framework:** React 19, React DOM 19
- **Build Tool:** Vite 8, TypeScript 5.7
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), Vanilla CSS keyframe animations
- **Typography:** Inter (body/headings), Roboto Mono (code, metrics, badges)
- **Bundler Plugin:** `vite-plugin-singlefile` for offline standalone packaging

---

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- `pnpm` (or `npm`)

### Development Server

```bash
cd assets/presentations/presentation2
pnpm dev
# Or: node node_modules/vite/bin/vite.js
```

### Standalone Production Build

```bash
cd assets/presentations/presentation2
pnpm build
# Or: node node_modules/vite/bin/vite.js build
```

The resulting build is generated at:
- **`assets/presentations/presentation2/dist/index.html`** (~8.2 MB)

> [!NOTE]
> All JavaScript, CSS, SVGs, and 27 high-resolution phase result images are fully inlined as base64 and embedded scripts. You can copy `dist/index.html` to any flash drive, send it via email, or open it directly by double-clicking on **any browser, any device, completely offline without any local server running**.


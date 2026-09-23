# Project Presentation: Implementation & Tiled Parallelization of Retinex and DT-CWT Based Low-Light Image Enhancement

Interactive presentation deck for the **Software Project Lab 1 (SE 2105)** project:
> **"Implementation & Tiled Parallelization of Retinex and DT-CWT Based Low-Light Image Enhancement"**

- **Student:** Md. Rakinuzzaman Talukder (Roll: 1728)
- **Supervisor:** Dr. Zerina Begum
- **Institution:** Institute of Information Technology (IIT), University of Dhaka
- **Reference Paper:** Yang et al. (2018), "Low-light image enhancement based on Retinex theory and dual-tree complex wavelet transform", *Optoelectronics Letters*, DOI: [10.1007/s11801-018-8046-5](https://doi.org/10.1007/s11801-018-8046-5)

---

## Overview

This directory contains a standalone React + Vite web application built as a high-fidelity, interactive presentation slide deck. Designed with Figma Make, Tailwind CSS v4, and bespoke dark-theme visual components, it showcases the algorithm theory, software architecture, tiling pipeline, interactive UI mockups, and milestone timelines.

---

## Slide Structure & Content

1. **Slide 1: Title & Problem**
   - Project title, student information, and academic metadata.
   - Interactive diagonal before/after split viewer comparing raw low-light capture against enhanced output.

2. **Slide 2: Algorithm & Architecture**
   - **Theoretical Foundation:** Retinex Theory (decomposition into reflectance and illumination via guided filter tone mapping) and Dual-Tree Complex Wavelet Transform (DT-CWT for directional selectivity and shift-invariance with soft threshold denoising).
   - **Interactive Paper Reader:** Flippable 3D booklet summarizing the reference paper (*Yang et al., 2018*).
   - **Pipeline Architecture:** Complete flowchart from RGB to HSV conversion, V-channel DT-CWT decomposition, high/low frequency processing, IDT-CWT reconstruction, white balance adjustment, and HSV to RGB output.
   - **Technology Stack:** JavaFX 21 (UI), JDK 21+ ForkJoinPool (Engine), OpenCV 4.9 (Vision), and JVM Off-heap NIO buffers (Memory).

3. **Slide 3: Tiling Engine**
   - Step-by-step interactive demonstration of the $4 \times 4$ tile parallelization pipeline.
   - Six distinct processing phases:
     1. Monolithic raw image input ($4096 \times 3072$ px).
     2. Matrix segmentation into 16 independent tiles ($1024 \times 768$ px each).
     3. Halo buffer extension ($\pm 14$ px overlap per tile) to eliminate seam artifacts.
     4. Concurrent worker execution across Java `ForkJoinPool`.
     5. Enhanced tile synthesis with halo margins trimmed.
     6. Seamless image assembly and global reconstruction.

4. **Slide 4: Interactive Workspace & GUI**
   - JavaFX desktop application mockup with async processing controls.
   - Interactive before-and-after **wipe slider** supporting manual drag, pause/play, and automatic continuous sweep.
   - Monolithic vs. Tiled benchmark latency chart across multiple resolutions ($512 \times 512$ up to $4096 \times 3072$).

5. **Slide 5: Expected Timeline & Project Scope**
   - Milestone Gantt chart spanning September through December across core tasks (Setup, Core Algorithm, JavaFX GUI, Tiling Engine, and Benchmarking).
   - Key learning outcomes and concluding remarks.

---

## Tech Stack & Tooling

- **Framework:** React 19, React DOM 19
- **Build Tool:** Vite 8, TypeScript 5.7
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), Vanilla CSS keyframe animations
- **Typography:** Inter (body/headings), Roboto Mono (code, captions, metrics)
- **Formatting:** oxfmt

---

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- `pnpm` (or `npm` / `yarn`)

### Installation & Run

```bash
# Navigate to the presentation folder
cd presentation

# Install dependencies
pnpm install

# Start Vite development server
pnpm dev
```

The application will be accessible at `http://localhost:5173` (or the configured `$PORT`).

### Production Build

```bash
# Build optimized static assets
pnpm build

# Preview production build locally
pnpm preview
```

---

## Controls & Navigation

- **Next Slide:** `→` (Right Arrow), `↓` (Down Arrow), Scroll Down, or click **NEXT →**
- **Previous Slide:** `←` (Left Arrow), `↑` (Up Arrow), Scroll Up, or click **← PREV**
- **Interactive Widgets:**
  - **Slide 2 Paper Book:** Click `‹` / `›` to turn spreads.
  - **Slide 3 Tiling:** Click numbered phase badges ($1$–$6$) to inspect parallelization steps.
  - **Slide 4 Wipe Slider:** Click and drag the handle horizontally, or toggle **Pause / Resume**.

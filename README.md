# Implementation and Tiled Parallelization of Retinex and DT-CWT Based Low-Light Image Enhancement

## Student Details

- **Name:** Md. Rakinuzzaman Talukder
- **Roll:** BSSE 1728

## Course Details

- **Course:** SE 2105: Software Project Lab 1
- **Course Instructor:** Prof. Dr. B M Mainul Hossain
- **Supervisor:** Dr. Zerina Begum

---

## Problem Statement

Low-light digital imagery suffers from narrow dynamic range, high-density sensor noise, and color degradation. Conventional methods often generate severe boundary halo artifacts and amplify high-frequency noise during luminance boosting. This project implements the framework proposed by Yang et al. (*Optoelectronics Letters*, 2018), which isolates noise from illumination via Dual-Tree Complex Wavelet Transform (DT-CWT), suppresses halo artifacts through edge-preserving guided filters, and preserves chromaticity by operating exclusively on the HSV V-channel.

While theoretical baselines exist in MATLAB for offline benchmarks, production edge environments (smartphones, action cameras, embedded vision DSPs) cannot stream massive, uncompressed frames into limited on-chip L2/scratchpad memory without severe cache thrashing and memory bottlenecks. To address these hardware realities, this project ports the mathematical pipeline into an object-oriented Java/OpenCV architecture and introduces a halo-padded spatial tiling engine to evaluate memory-efficient, concurrent block processing.

---

## Proposed Solution

The system translates the matrix operations of Yang et al. into an optimized Java desktop application using OpenCV:
1. **Luminance Isolation:** Converts input images from BGR to HSV, isolating the $V$ (luminance) channel while preserving $H$ (hue) and $S$ (saturation).
2. **2D DT-CWT Decomposition:** Decomposes the luminance channel into low-frequency and directional high-frequency sub-bands.
3. **Dual-Domain Enhancement:**
   - *Low-pass components:* Retinex-based adaptive local tone mapping via edge-preserving Guided Filtering to lift shadows without halo artifacts.
   - *High-pass components:* Soft-threshold wavelet shrinkage to strip sensor noise.
4. **Reconstruction & Color Balancing:** Reconstructs the enhanced luminance via inverse DT-CWT, applies percentile-based auto-contrast balancing, and converts back to RGB.
5. **Spatial Tiling Engine (Upcoming):** Partitions frames into uniform tiles with halo padding for multithreaded, cache-conscious parallel execution.

---

## Project Status & Progress

Detailed mathematical derivations, code walkthroughs, and quantitative diff metrics are documented in [**`JOURNAL.md`**](JOURNAL.md).

| Phase | Milestone | Status | Key Deliverables / Observations |
| :---: | :--- | :---: | :--- |
| **Phase 0** | **Environment & Build Setup** | Completed | Java 21, OpenCV 4.9.0 native bindings, Maven Wrapper, smoke tests. |
| **Phase 1** | **Color Space Decomposition** | Completed | BGR $\rightarrow$ HSV separation; empirical demonstration of hue stability vs. direct RGB scaling (`ColorSpaceExperiment.java`, `DiffInspector.java`). |
| **Phase 2** | **Retinex Physical Model** | Completed | Gaussian SSR/MSR in log-domain, global logarithmic tone mapping (Stockham/Drago Eq. 4–5), empirical analysis of Gaussian edge halos (`RetinexExperiment.java`). |
| **Phase 3** | **Guided Filter & Local Tone Mapping** | Completed | $O(N)$ linear-time Guided Filter (`GuidedFilter.java`), halo elimination verified via difference mapping, local adaptive tone mapping (Eq. 10–12). |
| **Phase 4** | **2D DT-CWT & Wavelet Denoising** | Completed | Near-symmetric 5/7 Hilbert filter pairs (`DualTreeCWT.java`), perfect reconstruction ($\text{MAE} \approx 10^{-8}$), soft-threshold denoising across 6 directional sub-bands. |
| **Phase 5** | **Complete End-to-End Pipeline** | Completed | Full integration in `EnhancementPipeline.java` and CLI `Main.java`. Calibrated against MATLAB author benchmark ($0.24$ levels MAE), zero downsampling blur, zero shadow crushing. |
| **Phase 6** | **Spatial Tiling & Parallel Engine** | In Progress | Cache-friendly spatial image partitioning with halo padding using `ForkJoinPool`. |
| **Phase 7** | **Interactive JavaFX GUI** | Planned | Desktop GUI featuring an interactive asynchronous before/after split slider. |

---

## How to Run the Pipeline

### Prerequisites
- **JDK 21** or later installed.
- Internet connection on first run to automatically fetch dependencies via Maven.
- Native OpenCV binaries are bundled automatically via `org.openpnp:opencv:4.9.0-0` (no manual C++ OpenCV install required).

### 1. Run Default Pipeline (CLI)
Executes the full Phase 5 low-light enhancement pipeline on the default test image (`assets/test_images/raw-image.jpg`) and saves the result to `assets/results/phase5/enhanced_pipeline_output.jpg`:

```bash
# Windows (PowerShell / Command Prompt)
.\mvnw compile exec:java

# Linux / macOS
./mvnw compile exec:java
```

### 2. Run Pipeline with Custom Input & Output
Pass custom image paths using `-Dexec.args`:

```bash
# Windows
.\mvnw compile exec:java -Dexec.args="path/to/your-input.jpg path/to/output.jpg"

# Linux / macOS
./mvnw compile exec:java -Dexec.args="path/to/your-input.jpg path/to/output.jpg"
```

### 3. Run Individual Phase Experiments
Each phase includes an independent standalone runner to inspect intermediate mathematical stages:

```bash
# Phase 1: HSV Decomposition & RGB vs HSV Analysis
.\mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.ColorSpaceExperiment"

# Phase 2: Gaussian Retinex (SSR/MSR) & Global Tone Mapping
.\mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.RetinexExperiment"

# Phase 3: Guided Filter Retinex & Halo Comparison
.\mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.GuidedFilterExperiment"

# Phase 4: 2D DT-CWT Decomposition & Wavelet Denoising
.\mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.DtCwtExperiment"
```

---

## Tech Stack

- **Language:** Java (JDK 21+)
- **Computer Vision & Matrix Math:** OpenCV Java API (`org.opencv.core.Mat`) via OpenPnP 4.9.0
- **GUI:** JavaFX 21 (`javafx-controls`, `javafx-fxml`, `javafx-swing`)
- **Concurrency:** `java.util.concurrent.ForkJoinPool`
- **Build System:** Apache Maven (with bundled Maven Wrapper `mvnw`)

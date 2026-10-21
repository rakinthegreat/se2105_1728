# Development Journal & Phase Reports

This document tracks progress, technical details, architectural decisions, mathematical foundations, and experimental observations for each phase of the **Retinex and DT-CWT Based Low-Light Image Enhancement** project.

## Phase 0 

### Overview
- **Goal:** Establish a cross-platform Maven build system supporting modern Java (JDK 21), native OpenCV image processing bindings, and JavaFX for future GUI development.
- **Status:** Completed

### Technical Details & Implementation
1. **Build Configuration ([`pom.xml`](file:///d:/0Repositories/se2105_1728/pom.xml)):**
   - Configured `maven-compiler-plugin` targeting Java 21 (`<maven.compiler.release>21</maven.compiler.release>`).
   - Integrated `org.openpnp:opencv:4.9.0-0` which embeds cross-platform native binaries (`.dll`, `.so`, `.dylib`), eliminating the need for manual C++ native OpenCV installation.
   - Configured JavaFX 21 (`javafx-controls`, `javafx-fxml`, `javafx-swing`) and `javafx-maven-plugin`.
   - Set project coordinates to `com.rakin.se2105:lowlight-enhancer`.
2. **Environment & Tooling:**
   - Bundled Maven Wrapper (`mvnw`, `mvnw.cmd`, `.mvn/`) for zero-prerequisite builds.
   - Configured [`.vscode/settings.json`](file:///d:/0Repositories/se2105_1728/.vscode/settings.json) to explicitly bind to JDK 21 (`LibericaJDK-21`) to prevent JVM bytecode version conflicts (`UnsupportedClassVersionError`).
3. **Smoke Test ([`Main.java`](file:///d:/0Repositories/se2105_1728/src/main/java/com/rakin/se2105/Main.java)):**
   - Verified OpenCV native library extraction and loading via `OpenCV.loadLocally()`.
   - Allocated a sample 3-channel matrix: `Mat mat = new Mat(100, 100, CvType.CV_8UC3)`.

### Verification Output
```
=== Phase 0: OpenCV & Environment Smoke Test ===
OpenCV loaded successfully!
Allocated Mat: Mat [ 100*100*CV_8UC3, isCont=true, isSubmat=false, nativeObj=0x193d487b1e0, dataAddr=0x193d2602800 ]
Mat dimensions: 100x100, channels=3
=== Checkpoint Passed ===
BUILD SUCCESS
```

---

## Phase 1

### Overview
- **Goal:** Implement image loading and format conversion, decompose an image into Hue-Saturation-Value (HSV) representations, and empirically demonstrate why the paper isolates low-light enhancement to the $V$ (luminance) channel instead of operating directly in RGB space.
- **Status:** Completed

### Concepts & Mathematical Context
1. **RGB vs. HSV Color Models:**
   - **RGB** represents colors as additive mixtures of Red, Green, and Blue. Luminance (brightness) and chromaticity (color tone/saturation) are tightly coupled across all three channels. Changing brightness in RGB alters individual color ratios unless done with exact balance, frequently causing severe color tinting or saturation blowout.
   - **HSV** decouples the visual signal into:
     - **$H$ (Hue):** The dominant wavelength/color tone ($0^\circ$ to $360^\circ$, scaled to $0-180$ in 8-bit OpenCV).
     - **$S$ (Saturation):** Color purity/vibrancy ($0-255$).
     - **$V$ (Value):** Perceived luminance/intensity ($0-255$).
2. **Paper Motivation (§1, ¶5):**
   - Low-light degradation is primarily a lack of illumination. Operating purely on the $V$ channel preserves chromatic information ($H$ and $S$), preventing unnatural color shifts while recovering scene details.

### Implementation ([`ColorSpaceExperiment.java`](file:///d:/0Repositories/se2105_1728/src/main/java/com/rakin/se2105/ColorSpaceExperiment.java))
1. **Loading:** Read [`assets/test_images/raw-image.jpg`](file:///d:/0Repositories/se2105_1728/assets/test_images/raw-image.jpg) ($864 \times 566$, 3 channels BGR) via `Imgcodecs.imread()`.
2. **Color Space Conversion:** Converted BGR $\rightarrow$ HSV using `Imgproc.cvtColor(..., Imgproc.COLOR_BGR2HSV)`.
3. **Channel Decomposition:** Separated channels using `Core.split()`.
   - Exported individual grayscale channels:
     - `channel_H_hue.jpg`
     - `channel_S_saturation.jpg`
     - `channel_V_value.jpg`
4. **Luminance Modification:**
   - Scaled the $V$ channel by $1.5\times$ using `Core.multiply(vChannel, new Scalar(1.5), brightenedV)`.
   - Re-merged with original $H$ and $S$ channels and transformed back to RGB via `Imgproc.COLOR_HSV2BGR`.
   - Exported to `assets/results/phase1/enhanced_hsv_V_only.jpg`.
5. **Comparative Mini-Experiment (Direct RGB Scaling):**
   - Scaled raw RGB channels directly by $1.5\times$ via `Core.multiply(bgrImage, new Scalar(1.5, 1.5, 1.5), directBgrBrightened)`.
   - Exported to `assets/results/phase1/enhanced_direct_rgb.jpg`.

### Detailed Analysis of Output Images & Observations

#### 1. Hue Channel (`channel_H_hue.jpg`)
- **Visual Appearance:** Appears as a patchwork of distinct grayscale regions with coarse, discrete boundaries rather than smooth photorealistic gradations.
- **Why it looks this way:** In OpenCV, Hue represents color angles ($0^\circ \text{ to } 360^\circ$) mapped to an 8-bit integer range ($0 \text{ to } 180$). Pixels with similar colors share near-identical Hue values regardless of shadow or light intensity.
- **Key Observation:** Notice the white columns of the portico and the deep foliage of the trees. Even where deep shadows fall over the building facade, the Hue channel maintains consistent intensity across contiguous material surfaces. However, in regions where brightness and saturation approach zero (pitch black shadows on the road and under the porch), Hue becomes noisy and unstable because color angle is mathematically indeterminate when $R \approx G \approx B \approx 0$.

#### 2. Saturation Channel (`channel_S_saturation.jpg`)
- **Visual Appearance:** High-frequency, grainy appearance with striking high-contrast inverted patterns. Areas like the tree leaves and grass glow intensely white, while the sky, road, and white architecture are dark grey to black.
- **Why it looks this way:** Saturation reflects chromatic purity. The natural greens of the foliage and deep reds of the brickwork have high color purity relative to their luminance, resulting in high pixel values (bright in grayscale). The white pillars, paved street, and cloudy sky have balanced RGB components (achromatic), resulting in near-zero saturation (dark in grayscale).
- **Key Observation:** The saturation channel confirms that the underexposed foliage and shadowy shrubs actually contain rich color information that is obscured simply because luminance is too low to stimulate human visual perception.

#### 3. Value / Luminance Channel (`channel_V_value.jpg`)
- **Visual Appearance:** Resembles a classic monochrome black-and-white photograph of the scene, carrying the primary spatial geometry, structural edges, textures, and lighting gradients.
- **Why it looks this way:** $V = \max(R, G, B)$. It encapsulates the radiant energy and perceptual brightness of every surface.
- **Key Observation:** All shadow gradients, lighting falloff, and exposure deficiencies reside squarely in this channel. The dark areas underneath the portico and within the shrubbery lose discernible texture here. This directly validates the paper's core hypothesis: **enhancing low-light images fundamentally requires redistributing and expanding dynamic range in the $V$ channel**, while leaving $H$ and $S$ intact to prevent chromatic distortion.

#### 4. V-Channel Boosted Result (`enhanced_hsv_V_only.jpg`)
- **Visual Appearance:** The scene exhibits a natural lift in illumination. Details under the porch, in the windows, and across the foliage become clearly visible.
- **Color Fidelity:** Crucially, the brick red retains its exact architectural warmth, the evergreen shrubs remain a deep natural green, and the blue sky does not wash out into cyan or gray.
- **Artifacts:** Because this simple test utilized linear multiplication ($V \times 1.5$) rather than adaptive tone mapping, some highlight regions (such as the top surface of the white colonnade) clip slightly against the upper bound of 255. This demonstrates why simple linear scaling is insufficient and motivates the logarithmic adaptive tone mapping (Drago) and Retinex filtering planned for Phase 2.

#### 5. Direct RGB Boosted Result (`enhanced_direct_rgb.jpg`)
- **Visual Appearance:** At casual glance, this image appears virtually identical to `enhanced_hsv_V_only.jpg`.
- **Why they look identical in midtones:** In HSV, $V = \max(R, G, B)$. When transforming back to RGB, the channel values scale proportionally to $V$. Consequently, for any pixel where multiplying by $1.5$ does not exceed $255$ (i.e. $\max(R,G,B) \le 170$), $(V \times 1.5) \rightarrow \text{RGB}$ and $(R,G,B) \times 1.5$ are **mathematically identical**.

---

### Quantitative Inspection: The Diff Inspector Script

To determine precisely where and how much the two images differ, we developed [`DiffInspector.java`](file:///d:/0Repositories/se2105_1728/src/main/java/com/rakin/se2105/DiffInspector.java).

#### How `DiffInspector` Works:
1. **Pixel-wise Absolute Difference:** Computes the difference matrix $D(x, y) = |I_{\text{RGB}}(x, y) - I_{\text{HSV}}(x, y)|$ across all three color channels using OpenCV's `Core.absdiff()`.
2. **Channel Accumulation & Peak Error:**
   - Computes total cumulative intensity error per channel via `Core.sumElems(diff)`.
   - Locates maximum single-pixel deviation using `Core.minMaxLoc()`.
3. **Difference Amplification ($\times 10$):** Multiplies the raw difference image by 10 to make sub-visual discrepancies glaringly visible to the human eye, saving it to `assets/results/phase1/diff_rgb_vs_hsv_x10.jpg`.

#### Quantitative Findings:
- **Max Single-Pixel Channel Discrepancy:** **63 intensity units** (out of 255).
- **Cumulative Channel Discrepancy:**
  - Blue channel: $\approx 1,077,773$
  - Green channel: $\approx 547,335$
  - Red channel: $\approx 1,067,494$
- **Spatial Distribution in `diff_rgb_vs_hsv_x10.jpg`:**
  - **Over 90% of the image (trees, lawn, road, shadow regions) is pure black:** In all unclipped regions, both methods produce the exact same pixel values.
  - **The white pillars, portico balustrade, and roof trim glow magenta/purple:** These are high-luminance highlights where $V \times 1.5 > 255$. In direct RGB, whichever channel exceeds 255 is truncated at 255 while lower channels continue growing, distorting the $R:G:B$ proportion and shifting the color hue. In HSV, hue is preserved even as luminance saturates.

### Summary & Takeaways for Phase 2
1. **Linear vs. Non-linear Operators:** A simple uniform multiplier ($1.5\times$) produces little perceptible difference between RGB and HSV in midtones because linear scalar multiplication is distributive.
2. **Why HSV is Mandatory for Retinex (Phase 2+):** Retinex tone mapping and wavelet decomposition are complex, non-linear logarithmic operations ($I = L \times R$). If applied independently to $R$, $G$, and $B$, each channel receives completely different local scaling factors, causing catastrophic color shifting, edge halos, and unnatural hue inversions. Restricting non-linear processing strictly to the $V$ channel in HSV guarantees that color balance ($H, S$) remains untouched.

---


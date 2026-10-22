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

## Phase 2

### Overview
- **Goal:** Implement the physical model of Retinex theory (separating illumination from reflectance via Gaussian surround filtering in log domain) and global logarithmic tone mapping (Stockham formulation per paper Eq. 4–5) on the $V$ (luminance) channel.
- **Status:** Completed

### Concepts & Mathematical Context
1. **Retinex Physical Model:**
   - Any image $I(x, y)$ can be modeled as the point-wise product of scene reflectance $R(x, y)$ (the physical properties of objects) and ambient illumination $L(x, y)$ (the light falling on them):
     $$I(x, y) = L(x, y) \times R(x, y)$$
   - When working within the HSV color space, this physical decomposition is applied specifically to the intensity/luminance channel $I(x, y) \equiv V(x, y)$ (the Value channel), isolating luminance while holding Hue ($H$) and Saturation ($S$) invariant:
     $$V(x, y) = L(x, y) \times R(x, y)$$
   - The goal is to isolate and enhance the true reflectance $R$ while compressing dynamic illumination variations $L$.
2. **Log-Domain Subtraction:**
   - In the logarithmic domain, multiplication converts to addition:
     $$\log V(x, y) = \log L(x, y) + \log R(x, y)$$
     $$\log R(x, y) = \log V(x, y) - \log L(x, y)$$
3. **Single-Scale Retinex (SSR) (Paper Eq. 1–2):**
   - The illumination component $L(x, y)$ is estimated by convolving the luminance input $V(x, y)$ with a normalized 2D Gaussian surround filter $F(x, y)$:
     $$F(x, y) = K \cdot \exp\left(-\frac{x^2 + y^2}{\sigma^2}\right)$$
     $$R_{\text{SSR}}(x, y) = \log V(x, y) - \log [F(x, y) * V(x, y)]$$
   - **Scale Tradeoff:**
     - Small $\sigma$ (e.g., 15): Strong dynamic range compression, captures fine edge details, but produces a washed-out, grayish "flat" appearance with noticeable edge halos.
     - Large $\sigma$ (e.g., 250): Preserves overall tonal rendering and natural color rendition, but provides weaker dynamic range compression in deep shadows.
4. **Multi-Scale Retinex (MSR) (Paper Eq. 3):**
   - Combines multiple SSR estimates at different scales using weighted summation ($w_k = \frac{1}{3}$):
     $$R_{\text{MSR}}(x, y) = \sum_{k=1}^{3} w_k R_{\text{SSR}, \sigma_k}(x, y), \quad \sigma \in \{15, 80, 250\}$$
5. **Global Logarithmic Tone Mapping (Paper Eq. 4–5 vs. True Drago Operator):**
   - **Paper's Formulation (Stockham Global Log Mapping):**
     The paper references Drago et al. [6] but actually utilizes the classic logarithmic tone mapping formulation (historically attributed to Stockham/Tumblin):
     - Computes the scene's logarithmic geometric mean (log-average luminance) $L_{wa}$:
       $$L_{wa} = \exp\left(\frac{1}{N} \sum_{x, y} \log(\delta + V(x, y))\right)$$
     - Compresses dynamic range via a constant-base logarithm:
       $$L_g(x, y) = \frac{\log\left(\frac{V(x, y)}{L_{wa}} + 1\right)}{\log\left(\frac{L_{\max}}{L_{wa}} + 1\right)}$$
   - **Distinction from True Drago Adaptive Logarithmic Operator:**
     - In Frédéric Drago's true adaptive logarithmic tone mapping algorithm (*"Adaptive Logarithmic Mapping for Displaying High Contrast Scenes"*, Eurographics 2003), the base of the logarithm is **spatially adaptive**:
       $$L_d(x, y) = \frac{L_d^{\max} \cdot 0.01}{\log_{10}(L_{\max} + 1)} \cdot \frac{\log\left(V'(x, y) + 1\right)}{\log\left(2 + 8 \cdot \left(\frac{V'(x,y)}{L_{\max}}\right)^{\frac{\log(b)}{\log(0.5)}}\right)}$$
       where the logarithmic base smoothly varies from base 2 for dark pixels (yielding high contrast in shadows) to base 10 for bright highlights (compressing glare).
     - **Implementation Note:** Following the paper's exact formulation (Eq. 4–5), we implemented the constant-base log operator specified in the paper text, while recognizing that this represents classic Stockham-style global logarithmic compression rather than the fully variable-base Drago operator.

### Implementation ([`RetinexExperiment.java`](file:///d:/0Repositories/se2105_1728/src/main/java/com/rakin/se2105/RetinexExperiment.java))
1. **Luminance Channel Float Conversion:**
   - Converted the 8-bit $V$ channel to 32-bit floating point with offset $+1.0$ (avoiding $\log(0)$ division singularities).
2. **SSR Pipeline:**
   - Applied `Imgproc.GaussianBlur` with $\sigma \in \{15, 80, 250\}$.
   - Calculated `Core.log()` on both original and blurred matrices, followed by `Core.subtract()`.
   - Normalized results to $[0, 255]$ via `Core.NORM_MINMAX` and merged back with $H$ and $S$ channels.
3. **MSR Pipeline:**
   - Accumulated the 3 SSR float matrices with weights $\frac{1}{3}$ using `Core.scaleAdd()`.
4. **Global Tone Mapping:**
   - Evaluated Eq. 4–5 directly on normalized luminance floats $[0, 1.0]$.

### Detailed Analysis of Output Images & Observations

#### 1. Small Scale SSR (`ssr_sigma_15.jpg`)
- **Visual Appearance:** Incredible detail revelation in shadows — every brick texture, window muntin, and dark foliage cluster is sharply carved out.
- **Artifacts:** High-contrast boundaries exhibit glaring **halo artifacts** (a glowing band around the roofline and pillars against the sky). Global contrast feels flattened and desaturated.

#### 2. Large Scale SSR (`ssr_sigma_250.jpg`)
- **Visual Appearance:** Tonal balance is much more natural and photographic. Global contrast and lighting directionality are preserved.
- **Trade-off:** Deep shadowed alcoves (under the portico) remain somewhat murky compared to $\sigma=15$. Halo artifacts around building edges are broader but softer.

#### 3. Multi-Scale Retinex (`msr_output.jpg`)
- **Visual Appearance:** Successfully bridges the gap between $\sigma=15$ and $\sigma=250$. It maintains good local contrast in shadow regions while preserving natural broad illumination gradients.
- **The Core Problem Observed:** Despite combining scales, **Gaussian-based Retinex cannot avoid halo artifacts** at sharp structural edges (such as the white balustrade and pillars against the dark interior). Because Gaussian blur blurs across edges indiscriminately, the illumination estimate $L$ bleeds across high-contrast boundaries.

#### 4. Global Logarithmic Tone Mapping (`stockham_global_log_mapped.jpg`)
- **Visual Appearance:** Produces smooth, halo-free global luminance lifting. The dark foreground and building facade are lifted cleanly without any artificial edge glow.
- **Limitation:** As a purely global operator, it treats all pixels with the same luminance value identically, meaning it cannot provide local contrast enhancement in deeply shadowed sub-regions.

### Key Takeaway Motivating Phase 3
Gaussian blur in Retinex blurs across sharp object edges, producing bright halos and dark fringing. To achieve halo-free local adaptation, **Phase 3 replaces the Gaussian surround filter with He et al.'s edge-preserving Guided Filter**.

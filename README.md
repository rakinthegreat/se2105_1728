# Implementation and Tiled Parallelization of Retinex and DT-CWT Based Low-Light Image Enhancement

## Student Details

- Md. Rakinuzzaman Talukder
- Roll: BSSE 1728

## Course Details

- **SE 2105: Software Project Lab 1**
- Course Instructor: Prof. Dr. B M Mainul Hossain
- Supervisor: Dr. Zerina Begum

## Problem Statement

Low-light digital imagery suffers from narrow dynamic range, high-density sensor noise, and color degradation. Conventional methods often generate severe boundary halo artifacts and amplify high-frequency noise during luminance boosting. This project implements the framework proposed by Yang et al. (Optoelectronics Letters, 2018), which isolates noise from illumination via Dual-Tree Complex Wavelet Transform (DT-CWT), suppresses halo artifacts through edge-preserving guided filters, and preserves chromaticity by operating exclusively on the HSV V-channel.

While theoretical baselines exist in MATLAB for offline benchmarks, production edge environments (smartphones, action cameras, embedded vision DSPs) cannot stream massive, uncompressed frames into limited on-chip L2/scratchpad memory without severe cache thrashing and memory bottlenecks. To address these hardware realities, this project ports the mathematical pipeline into an object-oriented Java/OpenCV architecture and introduces a halo-padded spatial tiling engine to evaluate memory-efficient, concurrent block processing.

## Proposed Solution

The system translates the matrix operations of Yang et al. into an optimized Java desktop application using OpenCV. The pipeline isolates luminance by converting RGB images to HSV, transforming only the V-channel. 2D DT-CWT filter banks decompose the channel into high- and low-frequency sub-bands. Low-frequency components receive Retinex-based adaptive local tone mapping via guided filtering, while high-frequency coefficients undergo soft-threshold denoising. The channel is reconstructed using inverse DT-CWT, balanced, and converted back to RGB.

To emulate cache-constrained hardware architectures, a spatial tiling engine partitions the image into uniform square blocks padded with overlapping halo regions equal to the filter radii. These blocks execute concurrently across CPU threads via Java concurrency utilities. Halo regions absorb boundary convolution artifacts and are trimmed prior to seamless, zero-artifact final frame reassembly.

## Key Features

- Java translation of the Retinex and DT-CWT pipeline, benchmarked against MATLAB.
- Isolates luminance enhancement to the HSV V-channel to prevent color distortion.
- Uses 2D DT-CWT decomposition with soft-threshold denoising for high-frequency bands.
- Applies guided-filter Retinex tone mapping to low-frequency bands.
- Multithreaded tiling engine using overlapping, halo-padded blocks for seamless processing.
- Interactive JavaFX GUI with an asynchronous before/after comparison slider.

## Target Users

- Researchers analyzing cache-conscious and multithreaded image pipeline designs.
- Photographers needing an offline tool to restore underexposed, noisy photographs.
- Embedded developers prototyping parallel scheduling for memory-restricted edge hardware.

## Tech Stack

- Language/UI: Java (JDK 21+), JavaFX
- Vision/Math: OpenCV Java API (org.opencv.core.Mat)
- Concurrency: java.util.concurrent.ForkJoinPool
- Verification: MATLAB
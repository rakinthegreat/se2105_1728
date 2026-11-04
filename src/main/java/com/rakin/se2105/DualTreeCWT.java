package com.rakin.se2105;

import org.opencv.core.CvType;
import org.opencv.core.Mat;

/**
 * 2D Dual-Tree Complex Wavelet Transform (DT-CWT) implementation based on:
 * - Kingsbury (1998, 2001)
 * - Selesnick, Baraniuk, Kingsbury (IEEE SPM 2005) [Ref 10 in paper]
 *
 * Architecture:
 * Two parallel filter banks (Tree A and Tree B):
 * - Tree A filters: Real part of complex analytic wavelet
 * - Tree B filters: Imaginary part (Hilbert transform of Tree A)
 *
 * For a 2D image, applying 1D dual-tree to rows then columns generates 4 sub-quadrants:
 * (Tree A, Tree A), (Tree A, Tree B), (Tree B, Tree A), (Tree B, Tree B).
 *
 * Combining these via sum and difference (1/sqrt(2)) produces:
 * - 2 Low-pass sub-bands (real & imaginary approximations)
 * - 6 High-pass directional sub-bands oriented at approximately:
 *   +15 deg, +45 deg, +75 deg, -15 deg, -45 deg, -75 deg.
 *
 * Uses standard Near-Symmetric 5/7 filter pair for level 1 (or Antonini 9/7 and Q-shift filters).
 * Here we use the classic orthogonal / near-symmetric biorthogonal filters designed for DT-CWT.
 */
public class DualTreeCWT {

    // First stage filters (Near-Symmetric 5, 7 tap filters from Selesnick/Kingsbury)
    // Tree A: Analysis Low-pass (h0a) and High-pass (h1a)
    // Tree B: Analysis Low-pass (h0b) and High-pass (h1b)
    
    // Low-pass Tree A (5-tap symmetric):
    private static final double[] H0A = {
        -0.08838834764832, 0.08838834764832, 0.69587998903400, 0.69587998903400, 0.08838834764832, -0.08838834764832
    };
    // High-pass Tree A:
    private static final double[] H1A = {
        -0.08838834764832, -0.08838834764832, 0.69587998903400, -0.69587998903400, 0.08838834764832, 0.08838834764832
    };

    // Low-pass Tree B (shifted by half-sample to form Hilbert pair):
    private static final double[] H0B = {
        0.01122679215254, 0.01122679215254, -0.08838834764832, 0.08838834764832,
        0.69587998903400, 0.69587998903400, -0.08838834764832, -0.08838834764832,
        0.01122679215254, 0.01122679215254
    };
    // High-pass Tree B:
    private static final double[] H1B = {
        0.01122679215254, -0.01122679215254, -0.08838834764832, -0.08838834764832,
        0.69587998903400, -0.69587998903400, -0.08838834764832, 0.08838834764832,
        0.01122679215254, -0.01122679215254
    };

    // Synthesis filters (time-reversed for perfect reconstruction)
    private static final double[] G0A = H0A;
    private static final double[] G1A = H1A;
    private static final double[] G0B = H0B;
    private static final double[] G1B = H1B;

    public static class Subbands {
        // 2 Low-pass sub-bands (Tree A and Tree B approximations)
        public Mat lowReal;
        public Mat lowImag;

        // 6 High-pass directional sub-bands
        // Formed by linear combinations: (TreeA_High, TreeB_High), etc.
        public Mat[] highPass; // 6 sub-bands

        public Subbands(Mat lowReal, Mat lowImag, Mat[] highPass) {
            this.lowReal = lowReal;
            this.lowImag = lowImag;
            this.highPass = highPass;
        }
    }

    /**
     * 1D Filtering along rows with downsampling by 2 (Analysis)
     */
    private static Mat filterRows(Mat src, double[] filter, boolean downsample) {
        int rows = src.rows();
        int cols = src.cols();
        int outCols = downsample ? (cols + 1) / 2 : cols;
        Mat dst = new Mat(rows, outCols, CvType.CV_32F);

        float[] inData = new float[cols];
        float[] outData = new float[outCols];
        int flen = filter.length;
        int halfF = flen / 2;

        for (int r = 0; r < rows; r++) {
            src.get(r, 0, inData);
            for (int c = 0; c < outCols; c++) {
                int inIdx = downsample ? c * 2 : c;
                double sum = 0.0;
                for (int k = 0; k < flen; k++) {
                    int p = inIdx - halfF + k;
                    // Symmetric reflection boundary
                    if (p < 0) p = -p - 1;
                    if (p >= cols) p = 2 * cols - p - 1;
                    if (p >= 0 && p < cols) {
                        sum += inData[p] * filter[k];
                    }
                }
                outData[c] = (float) sum;
            }
            dst.put(r, 0, outData);
        }
        return dst;
    }

    /**
     * 1D Filtering along cols with downsampling by 2 (Analysis)
     */
    private static Mat filterCols(Mat src, double[] filter, boolean downsample) {
        int rows = src.rows();
        int cols = src.cols();
        int outRows = downsample ? (rows + 1) / 2 : rows;
        Mat dst = new Mat(outRows, cols, CvType.CV_32F);

        float[][] inGrid = new float[rows][cols];
        for (int r = 0; r < rows; r++) {
            src.get(r, 0, inGrid[r]);
        }

        float[] outRow = new float[cols];
        int flen = filter.length;
        int halfF = flen / 2;

        for (int r = 0; r < outRows; r++) {
            int inR = downsample ? r * 2 : r;
            for (int c = 0; c < cols; c++) {
                double sum = 0.0;
                for (int k = 0; k < flen; k++) {
                    int p = inR - halfF + k;
                    if (p < 0) p = -p - 1;
                    if (p >= rows) p = 2 * rows - p - 1;
                    if (p >= 0 && p < rows) {
                        sum += inGrid[p][c] * filter[k];
                    }
                }
                outRow[c] = (float) sum;
            }
            dst.put(r, 0, outRow);
        }
        return dst;
    }

    /**
     * 1D Synthesis along cols with upsampling by 2
     */
    private static Mat synthCols(Mat low, double[] f0, Mat high, double[] f1, int targetRows) {
        int inRows = low.rows();
        int cols = low.cols();
        Mat dst = new Mat(targetRows, cols, CvType.CV_32F);

        float[][] lowGrid = new float[inRows][cols];
        float[][] highGrid = new float[inRows][cols];
        for (int r = 0; r < inRows; r++) {
            low.get(r, 0, lowGrid[r]);
            high.get(r, 0, highGrid[r]);
        }

        int flen0 = f0.length;
        int flen1 = f1.length;
        int half0 = flen0 / 2;
        int half1 = flen1 / 2;
        float[] outRow = new float[cols];

        for (int r = 0; r < targetRows; r++) {
            for (int c = 0; c < cols; c++) {
                double sum = 0.0;
                // Low-pass branch upsampled
                for (int k = 0; k < flen0; k++) {
                    int p = r - k + half0;
                    if (p % 2 == 0) {
                        int idx = p / 2;
                        if (idx >= 0 && idx < inRows) {
                            sum += lowGrid[idx][c] * f0[k];
                        }
                    }
                }
                // High-pass branch upsampled
                for (int k = 0; k < flen1; k++) {
                    int p = r - k + half1;
                    if (p % 2 == 0) {
                        int idx = p / 2;
                        if (idx >= 0 && idx < inRows) {
                            sum += highGrid[idx][c] * f1[k];
                        }
                    }
                }
                outRow[c] = (float) sum;
            }
            dst.put(r, 0, outRow);
        }
        return dst;
    }

    /**
     * 1D Synthesis along rows with upsampling by 2
     */
    private static Mat synthRows(Mat low, double[] f0, Mat high, double[] f1, int targetCols) {
        int rows = low.rows();
        int inCols = low.cols();
        Mat dst = new Mat(rows, targetCols, CvType.CV_32F);

        float[] lowRow = new float[inCols];
        float[] highRow = new float[inCols];
        float[] outRow = new float[targetCols];

        int flen0 = f0.length;
        int flen1 = f1.length;
        int half0 = flen0 / 2;
        int half1 = flen1 / 2;

        for (int r = 0; r < rows; r++) {
            low.get(r, 0, lowRow);
            high.get(r, 0, highRow);
            for (int c = 0; c < targetCols; c++) {
                double sum = 0.0;
                for (int k = 0; k < flen0; k++) {
                    int p = c - k + half0;
                    if (p % 2 == 0) {
                        int idx = p / 2;
                        if (idx >= 0 && idx < inCols) {
                            sum += lowRow[idx] * f0[k];
                        }
                    }
                }
                for (int k = 0; k < flen1; k++) {
                    int p = c - k + half1;
                    if (p % 2 == 0) {
                        int idx = p / 2;
                        if (idx >= 0 && idx < inCols) {
                            sum += highRow[idx] * f1[k];
                        }
                    }
                }
                outRow[c] = (float) sum;
            }
            dst.put(r, 0, outRow);
        }
        return dst;
    }

    /**
     * Forward 2D Dual-Tree Complex Wavelet Transform
     * Decomposes input into:
     * - 2 Low-pass sub-bands
     * - 6 Directional High-pass sub-bands (oriented at +-15, +-45, +-75 degrees)
     */
    public Subbands forward(Mat input) {
        // Tree A (Real):
        Mat lA_row = filterRows(input, H0A, true);
        Mat hA_row = filterRows(input, H1A, true);
        Mat ll_AA = filterCols(lA_row, H0A, true); // Low-pass Tree A
        Mat lh_AA = filterCols(lA_row, H1A, true);
        Mat hl_AA = filterCols(hA_row, H0A, true);
        Mat hh_AA = filterCols(hA_row, H1A, true);

        // Tree B (Imag):
        Mat lB_row = filterRows(input, H0B, true);
        Mat hB_row = filterRows(input, H1B, true);
        Mat ll_BB = filterCols(lB_row, H0B, true); // Low-pass Tree B
        Mat lh_BB = filterCols(lB_row, H1B, true);
        Mat hl_BB = filterCols(hB_row, H0B, true);
        Mat hh_BB = filterCols(hB_row, H1B, true);

        // Cross trees for directional selectivity:
        Mat lh_AB = filterCols(lA_row, H1B, true);
        Mat hl_AB = filterCols(hA_row, H0B, true);
        Mat hh_AB = filterCols(hA_row, H1B, true);

        Mat lh_BA = filterCols(lB_row, H1A, true);
        Mat hl_BA = filterCols(hB_row, H0A, true);
        Mat hh_BA = filterCols(hB_row, H1A, true);

        // Combine high-pass pairs to get 6 strongly oriented sub-bands:
        // Oriented at +-15 deg, +-45 deg, +-75 deg
        double invSqrt2 = 1.0 / Math.sqrt(2.0);
        Mat[] hp = new Mat[6];

        // 1. +15 deg & -15 deg:
        hp[0] = combine(lh_AA, lh_BA, invSqrt2, invSqrt2);
        hp[1] = combine(lh_AA, lh_BA, invSqrt2, -invSqrt2);

        // 2. +45 deg & -45 deg:
        hp[2] = combine(hh_AA, hh_BB, invSqrt2, invSqrt2);
        hp[3] = combine(hh_AA, hh_BB, invSqrt2, -invSqrt2);

        // 3. +75 deg & -75 deg:
        hp[4] = combine(hl_AA, hl_AB, invSqrt2, invSqrt2);
        hp[5] = combine(hl_AA, hl_AB, invSqrt2, -invSqrt2);

        return new Subbands(ll_AA, ll_BB, hp);
    }

    private static Mat combine(Mat m1, Mat m2, double c1, double c2) {
        Mat res = new Mat(m1.size(), CvType.CV_32F);
        org.opencv.core.Core.addWeighted(m1, c1, m2, c2, 0.0, res);
        return res;
    }

    /**
     * Inverse 2D Dual-Tree Complex Wavelet Transform
     */
    public Mat inverse(Subbands sb, int origRows, int origCols) {
        double invSqrt2 = 1.0 / Math.sqrt(2.0);

        // Invert the 6 high-pass directional combinations back to tree components:
        Mat lh_AA = combine(sb.highPass[0], sb.highPass[1], invSqrt2, invSqrt2);
        Mat lh_BA = combine(sb.highPass[0], sb.highPass[1], invSqrt2, -invSqrt2);

        Mat hh_AA = combine(sb.highPass[2], sb.highPass[3], invSqrt2, invSqrt2);
        Mat hh_BB = combine(sb.highPass[2], sb.highPass[3], invSqrt2, -invSqrt2);

        Mat hl_AA = combine(sb.highPass[4], sb.highPass[5], invSqrt2, invSqrt2);
        Mat hl_AB = combine(sb.highPass[4], sb.highPass[5], invSqrt2, -invSqrt2);

        // Synthesize Tree A:
        int midCols = (origCols + 1) / 2;
        Mat recLA = synthCols(sb.lowReal, G0A, lh_AA, G1A, origRows);
        Mat recHA = synthCols(hl_AA, G0A, hh_AA, G1A, origRows);
        Mat treeA = synthRows(recLA, G0A, recHA, G1A, origCols);

        // Synthesize Tree B:
        Mat recLB = synthCols(sb.lowImag, G0B, lh_BA, G1B, origRows);
        Mat recHB = synthCols(hl_AB, G0B, hh_BB, G1B, origRows);
        Mat treeB = synthRows(recLB, G0B, recHB, G1B, origCols);

        // Average the real and imaginary trees:
        Mat result = new Mat(origRows, origCols, CvType.CV_32F);
        org.opencv.core.Core.addWeighted(treeA, 0.5, treeB, 0.5, 0.0, result);
        return result;
    }
}


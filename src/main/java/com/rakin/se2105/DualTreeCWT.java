package com.rakin.se2105;

import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;

/**
 * 2D Dual-Tree Complex Wavelet Transform (DT-CWT) implementation based on:
 * - Kingsbury (1998, 2001)
 * - Selesnick, Baraniuk, Kingsbury (IEEE SPM 2005) [Paper Ref 10]
 *
 * Uses standard orthogonal Q-Shift Hilbert filter pairs (10 taps) satisfying exact
 * PR condition H0(z)H0(z^-1) + H1(z)H1(z^-1) = 2 with machine-precision perfect reconstruction.
 *
 * Employs symmetric boundary reflection padding (BORDER_REFLECT) before circular convolution
 * to prevent boundary wrap-around lines and ensure perfectly clean subband edges.
 */
public class DualTreeCWT {

    public static final int BOUNDARY_PAD = 16; // Even padding width > filter length (10)

    // Tree A Analysis Filters (10 taps):
    public static final double[] H0A = {
        0.051130405283831656, -0.013975370246888838, -0.10983605166597087, 0.26383956105893763,
        0.7666284677930372, 0.5636557101270515, 0.0008736226952170968, -0.1002312195074762,
        -0.0016896812725281543, -0.006181881892116438
    };
    public static final double[] H1A = {
        -0.006181881892116438, 0.0016896812725281543, -0.1002312195074762, -0.0008736226952170968,
        0.5636557101270515, -0.7666284677930372, 0.26383956105893763, 0.10983605166597087,
        -0.013975370246888838, -0.051130405283831656
    };

    // Tree B Analysis Filters (Hilbert partner: time-reversed Q-shift):
    public static final double[] H0B = {
        -0.006181881892116438, -0.0016896812725281543, -0.1002312195074762, 0.0008736226952170968,
        0.5636557101270515, 0.7666284677930372, 0.26383956105893763, -0.10983605166597087,
        -0.013975370246888838, 0.051130405283831656
    };
    public static final double[] H1B = {
        -0.051130405283831656, -0.013975370246888838, 0.10983605166597087, 0.26383956105893763,
        -0.7666284677930372, 0.5636557101270515, -0.0008736226952170968, -0.1002312195074762,
        0.0016896812725281543, -0.006181881892116438
    };

    public static class Subbands {
        public Mat lowReal;    // LL_A
        public Mat lowImag;    // LL_B
        public Mat[] highPass; // 6 directional sub-bands (+-15, +-45, +-75)
        public int origRows;
        public int origCols;
        public int padTop;
        public int padBottom;
        public int padLeft;
        public int padRight;

        public Subbands(Mat lowReal, Mat lowImag, Mat[] highPass,
                        int origRows, int origCols,
                        int padTop, int padBottom, int padLeft, int padRight) {
            this.lowReal = lowReal;
            this.lowImag = lowImag;
            this.highPass = highPass;
            this.origRows = origRows;
            this.origCols = origCols;
            this.padTop = padTop;
            this.padBottom = padBottom;
            this.padLeft = padLeft;
            this.padRight = padRight;
        }

        public Subbands withModified(Mat newLowReal, Mat newLowImag, Mat[] newHighPass) {
            return new Subbands(newLowReal, newLowImag, newHighPass,
                    origRows, origCols, padTop, padBottom, padLeft, padRight);
        }
    }

    /**
     * 1D Analysis filtering along rows with downsampling by 2 (circular convolution)
     */
    private static Mat filterRows(Mat src, double[] filter) {
        int rows = src.rows();
        int cols = src.cols();
        int outCols = cols / 2;
        Mat dst = new Mat(rows, outCols, CvType.CV_32F);

        float[] inData = new float[cols];
        float[] outData = new float[outCols];
        int flen = filter.length;

        for (int r = 0; r < rows; r++) {
            src.get(r, 0, inData);
            for (int c = 0; c < outCols; c++) {
                double sum = 0.0;
                int base = 2 * c;
                for (int k = 0; k < flen; k++) {
                    int p = (base + k) % cols;
                    sum += inData[p] * filter[k];
                }
                outData[c] = (float) sum;
            }
            dst.put(r, 0, outData);
        }
        return dst;
    }

    /**
     * 1D Analysis filtering along cols with downsampling by 2 (circular convolution)
     */
    private static Mat filterCols(Mat src, double[] filter) {
        int rows = src.rows();
        int cols = src.cols();
        int outRows = rows / 2;
        Mat dst = new Mat(outRows, cols, CvType.CV_32F);

        float[][] inGrid = new float[rows][cols];
        for (int r = 0; r < rows; r++) {
            src.get(r, 0, inGrid[r]);
        }

        float[] outRow = new float[cols];
        int flen = filter.length;

        for (int r = 0; r < outRows; r++) {
            int base = 2 * r;
            for (int c = 0; c < cols; c++) {
                double sum = 0.0;
                for (int k = 0; k < flen; k++) {
                    int p = (base + k) % rows;
                    sum += inGrid[p][c] * filter[k];
                }
                outRow[c] = (float) sum;
            }
            dst.put(r, 0, outRow);
        }
        return dst;
    }

    /**
     * 1D Synthesis along cols with upsampling by 2 (adjoint circular synthesis)
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

        float[][] outGrid = new float[targetRows][cols];
        int flen = f0.length;

        for (int r = 0; r < inRows; r++) {
            for (int k = 0; k < flen; k++) {
                int rowIdx = (2 * r + k) % targetRows;
                double w0 = f0[k];
                double w1 = f1[k];
                float[] outRow = outGrid[rowIdx];
                float[] lRow = lowGrid[r];
                float[] hRow = highGrid[r];
                for (int c = 0; c < cols; c++) {
                    outRow[c] += (float) (lRow[c] * w0 + hRow[c] * w1);
                }
            }
        }

        for (int r = 0; r < targetRows; r++) {
            dst.put(r, 0, outGrid[r]);
        }
        return dst;
    }

    /**
     * 1D Synthesis along rows with upsampling by 2 (adjoint circular synthesis)
     */
    private static Mat synthRows(Mat low, double[] f0, Mat high, double[] f1, int targetCols) {
        int rows = low.rows();
        int inCols = low.cols();
        Mat dst = new Mat(rows, targetCols, CvType.CV_32F);

        float[] lowRow = new float[inCols];
        float[] highRow = new float[inCols];
        float[] outRow = new float[targetCols];
        int flen = f0.length;

        for (int r = 0; r < rows; r++) {
            low.get(r, 0, lowRow);
            high.get(r, 0, highRow);
            java.util.Arrays.fill(outRow, 0.0f);

            for (int c = 0; c < inCols; c++) {
                float lVal = lowRow[c];
                float hVal = highRow[c];
                for (int k = 0; k < flen; k++) {
                    int colIdx = (2 * c + k) % targetCols;
                    outRow[colIdx] += (float) (lVal * f0[k] + hVal * f1[k]);
                }
            }
            dst.put(r, 0, outRow);
        }
        return dst;
    }

    /**
     * Forward 2D DT-CWT Decomposition with symmetric boundary reflection padding
     */
    public Subbands forward(Mat input) {
        int origRows = input.rows();
        int origCols = input.cols();

        // Symmetric boundary reflection padding (BOUNDARY_PAD = 16)
        // Ensures total dimensions are even
        int padTop = BOUNDARY_PAD;
        int padBottom = BOUNDARY_PAD + ((origRows % 2 != 0) ? 1 : 0);
        int padLeft = BOUNDARY_PAD;
        int padRight = BOUNDARY_PAD + ((origCols % 2 != 0) ? 1 : 0);

        Mat padded = new Mat();
        Core.copyMakeBorder(input, padded, padTop, padBottom, padLeft, padRight, Core.BORDER_REFLECT);

        // Tree A (Real):
        Mat lA_row = filterRows(padded, H0A);
        Mat hA_row = filterRows(padded, H1A);
        Mat ll_AA = filterCols(lA_row, H0A);
        Mat lh_AA = filterCols(lA_row, H1A);
        Mat hl_AA = filterCols(hA_row, H0A);
        Mat hh_AA = filterCols(hA_row, H1A);

        // Tree B (Imaginary):
        Mat lB_row = filterRows(padded, H0B);
        Mat hB_row = filterRows(padded, H1B);
        Mat ll_BB = filterCols(lB_row, H0B);
        Mat lh_BB = filterCols(lB_row, H1B);
        Mat hl_BB = filterCols(hB_row, H0B);
        Mat hh_BB = filterCols(hB_row, H1B);

        // Directional linear combinations:
        // LH pair -> +-15 deg
        // HH pair -> +-45 deg
        // HL pair -> +-75 deg
        double invSqrt2 = 1.0 / Math.sqrt(2.0);
        Mat[] hp = new Mat[6];

        hp[0] = combine(lh_AA, lh_BB, invSqrt2, invSqrt2);
        hp[1] = combine(lh_AA, lh_BB, invSqrt2, -invSqrt2);

        hp[2] = combine(hh_AA, hh_BB, invSqrt2, invSqrt2);
        hp[3] = combine(hh_AA, hh_BB, invSqrt2, -invSqrt2);

        hp[4] = combine(hl_AA, hl_BB, invSqrt2, invSqrt2);
        hp[5] = combine(hl_AA, hl_BB, invSqrt2, -invSqrt2);

        return new Subbands(ll_AA, ll_BB, hp, origRows, origCols, padTop, padBottom, padLeft, padRight);
    }

    private static Mat combine(Mat m1, Mat m2, double c1, double c2) {
        Mat res = new Mat(m1.size(), CvType.CV_32F);
        Core.addWeighted(m1, c1, m2, c2, 0.0, res);
        return res;
    }

    /**
     * Inverse 2D DT-CWT Reconstruction, unpadding to exact original dimensions
     */
    public Mat inverse(Subbands sb, int origRows, int origCols) {
        int workRows = sb.padTop + origRows + sb.padBottom;
        int workCols = sb.padLeft + origCols + sb.padRight;

        double invSqrt2 = 1.0 / Math.sqrt(2.0);

        // Unmix directional subbands back to Tree A and Tree B subbands
        Mat lh_AA = combine(sb.highPass[0], sb.highPass[1], invSqrt2, invSqrt2);
        Mat lh_BB = combine(sb.highPass[0], sb.highPass[1], invSqrt2, -invSqrt2);

        Mat hh_AA = combine(sb.highPass[2], sb.highPass[3], invSqrt2, invSqrt2);
        Mat hh_BB = combine(sb.highPass[2], sb.highPass[3], invSqrt2, -invSqrt2);

        Mat hl_AA = combine(sb.highPass[4], sb.highPass[5], invSqrt2, invSqrt2);
        Mat hl_BB = combine(sb.highPass[4], sb.highPass[5], invSqrt2, -invSqrt2);

        // Synthesize Tree A:
        Mat recLA = synthCols(sb.lowReal, H0A, lh_AA, H1A, workRows);
        Mat recHA = synthCols(hl_AA, H0A, hh_AA, H1A, workRows);
        Mat treeA = synthRows(recLA, H0A, recHA, H1A, workCols);

        // Synthesize Tree B:
        Mat recLB = synthCols(sb.lowImag, H0B, lh_BB, H1B, workRows);
        Mat recHB = synthCols(hl_BB, H0B, hh_BB, H1B, workRows);
        Mat treeB = synthRows(recLB, H0B, recHB, H1B, workCols);

        // Average Tree A and Tree B
        Mat combined = new Mat(workRows, workCols, CvType.CV_32F);
        Core.addWeighted(treeA, 0.5, treeB, 0.5, 0.0, combined);

        // Unpad / crop back to exact original dimensions
        return combined.submat(sb.padTop, sb.padTop + origRows, sb.padLeft, sb.padLeft + origCols).clone();
    }
}

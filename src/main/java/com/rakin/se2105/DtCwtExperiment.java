package com.rakin.se2105;

import nu.pattern.OpenCV;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Phase 4: DT-CWT Decomposition & Denoising Experiment
 *
 * Implements:
 * 1. 2D DT-CWT Decomposition of the V channel into:
 *    - 2 Low-pass sub-bands
 *    - 6 Directional High-pass sub-bands
 * 2. Visual inspection of each sub-band (subband images saved).
 * 3. Soft-thresholding denoising per Paper Eq. 13:
 *    T = sigma * sqrt(2 * log(length))
 *    Y = sign(X) * (|X| - T) for |X| >= T, else 0
 * 4. Inverse DT-CWT reconstruction.
 */
public class DtCwtExperiment {

    public static void main(String[] args) {
        OpenCV.loadLocally();
        System.out.println("=== Phase 4: DT-CWT Decomposition & Denoising ===");

        String inputPath = "assets/test_images/raw-image.jpg";
        String outputDir = "assets/results/phase4";
        new File(outputDir).mkdirs();

        Mat bgrImage = Imgcodecs.imread(inputPath);
        if (bgrImage.empty()) {
            System.err.println("Error: Failed to load " + inputPath);
            return;
        }

        // Convert to HSV and extract V channel
        Mat hsvImage = new Mat();
        Imgproc.cvtColor(bgrImage, hsvImage, Imgproc.COLOR_BGR2HSV);
        List<Mat> hsvChannels = new ArrayList<>();
        Core.split(hsvImage, hsvChannels);

        Mat hChannel = hsvChannels.get(0);
        Mat sChannel = hsvChannels.get(1);
        Mat vChannel8U = hsvChannels.get(2);

        int rows = vChannel8U.rows();
        int cols = vChannel8U.cols();

        Mat vFloat = new Mat();
        vChannel8U.convertTo(vFloat, CvType.CV_32F, 1.0 / 255.0);

        // =========================================================================
        // Step 1: Forward 2D DT-CWT
        // =========================================================================
        DualTreeCWT dtcwt = new DualTreeCWT();
        DualTreeCWT.Subbands subbands = dtcwt.forward(vFloat);

        System.out.println("Forward DT-CWT successful!");
        System.out.println("Low-pass real size: " + subbands.lowReal.size());
        System.out.println("Low-pass imag size: " + subbands.lowImag.size());
        System.out.println("Number of directional high-pass bands: " + subbands.highPass.length);

        // Save normalized sub-band visualizations (cropped to actual image subband dimensions without boundary padding)
        int subRows = rows / 2;
        int subCols = cols / 2;
        int pTop = subbands.padTop / 2;
        int pLeft = subbands.padLeft / 2;

        Mat cropLowReal = subbands.lowReal.submat(pTop, pTop + subRows, pLeft, pLeft + subCols);
        Mat cropLowImag = subbands.lowImag.submat(pTop, pTop + subRows, pLeft, pLeft + subCols);

        Imgcodecs.imwrite(outputDir + "/subband_low_real.jpg", normalizeTo8U(cropLowReal));
        Imgcodecs.imwrite(outputDir + "/subband_low_imag.jpg", normalizeTo8U(cropLowImag));

        String[] orientations = {"+15deg", "-15deg", "+45deg", "-45deg", "+75deg", "-75deg"};
        for (int i = 0; i < 6; i++) {
            Mat cropHigh = subbands.highPass[i].submat(pTop, pTop + subRows, pLeft, pLeft + subCols);
            Imgcodecs.imwrite(outputDir + "/subband_high_" + (i + 1) + "_" + orientations[i] + ".jpg",
                    normalizeTo8U(cropHigh));
        }
        System.out.println("Saved all 8 sub-band images to: " + outputDir);

        // =========================================================================
        // Step 2: Round-Trip Verification: inverse(forward(V))
        // =========================================================================
        Mat reconstructedNoFilter = dtcwt.inverse(subbands, rows, cols);
        Mat diffNoFilter = new Mat();
        Core.absdiff(vFloat, reconstructedNoFilter, diffNoFilter);
        Scalar meanDiff = Core.mean(diffNoFilter);
        System.out.println("Round-trip mean absolute error (unmodified): " + meanDiff.val[0]);

        // =========================================================================
        // Step 3: Soft-Threshold Denoising on High-Pass Sub-bands (Paper Eq. 13)
        // =========================================================================
        // Paper Eq. 13:
        // T = sigma_noise * sqrt(2 * log(l))
        // Estimate noise sigma via Median Absolute Deviation (MAD) of the finest sub-band (diagonal +45):
        // sigma = median(|X|) / 0.6745
        // In image processing, thresholding with full-image pixel count (VisuShrink)
        // wipes out sharp edge details. Following standard wavelet denoising for subbands,
        // the effective signal length l corresponds to the subband spatial dimension,
        // or BayesShrink T = sigma^2 / sigma_x.
        // Paper Eq. 13: T = sigma * sqrt(2 * ln(l))
        double noiseSigma = estimateNoiseSigma(subbands.highPass[2]);
        int subbandLength = subbands.highPass[2].rows() * subbands.highPass[2].cols();
        double T = noiseSigma * Math.sqrt(2.0 * Math.log(subbandLength)) * 0.3; // Calibrated for detail preservation
        System.out.println(String.format("Estimated noise sigma: %.5f, Adaptive threshold T: %.5f", noiseSigma, T));

        // Apply soft thresholding to all 6 high-pass directional sub-bands
        Mat[] denoisedHighPass = new Mat[6];
        for (int i = 0; i < 6; i++) {
            denoisedHighPass[i] = applySoftThreshold(subbands.highPass[i], T);
        }

        DualTreeCWT.Subbands denoisedSubbands = subbands.withModified(
                subbands.lowReal, subbands.lowImag, denoisedHighPass
        );

        // =========================================================================
        // Step 4: Inverse DT-CWT Reconstruction with Denoised Sub-bands
        // =========================================================================
        Mat denoisedVFloat = dtcwt.inverse(denoisedSubbands, rows, cols);

        // Clip to [0.0, 1.0] and convert back to 8U
        Mat denoisedV8U = new Mat();
        Mat clippedV = new Mat();
        Core.min(denoisedVFloat, new Scalar(1.0), clippedV);
        Core.max(clippedV, new Scalar(0.0), clippedV);
        clippedV.convertTo(denoisedV8U, CvType.CV_8U, 255.0);

        // Reconstruct BGR image
        List<Mat> denoisedChannels = new ArrayList<>();
        denoisedChannels.add(hChannel);
        denoisedChannels.add(sChannel);
        denoisedChannels.add(denoisedV8U);

        Mat denoisedHsv = new Mat();
        Core.merge(denoisedChannels, denoisedHsv);
        Mat denoisedBgr = new Mat();
        Imgproc.cvtColor(denoisedHsv, denoisedBgr, Imgproc.COLOR_HSV2BGR);

        Imgcodecs.imwrite(outputDir + "/denoised_reconstructed.jpg", denoisedBgr);
        System.out.println("Saved denoised output to: " + outputDir + "/denoised_reconstructed.jpg");

        // Save difference map showing stripped high-frequency noise
        Mat noiseDiff = new Mat();
        Core.absdiff(vChannel8U, denoisedV8U, noiseDiff);
        Mat noiseDiffAmp = new Mat();
        Core.multiply(noiseDiff, new Scalar(10), noiseDiffAmp);
        Imgcodecs.imwrite(outputDir + "/stripped_noise_x10.jpg", noiseDiffAmp);
        System.out.println("Saved stripped noise visualization to: " + outputDir + "/stripped_noise_x10.jpg");

        System.out.println("=== Phase 4 Experiment Completed Successfully! ===");
    }

    /**
     * Soft-thresholding operator per Paper Eq. 13:
     * Y = sign(X) * (|X| - T) for |X| >= T, else 0
     */
    private static Mat applySoftThreshold(Mat src, double T) {
        Mat dst = new Mat(src.size(), CvType.CV_32F);
        int rows = src.rows();
        int cols = src.cols();

        float[] inData = new float[cols];
        float[] outData = new float[cols];

        for (int r = 0; r < rows; r++) {
            src.get(r, 0, inData);
            for (int c = 0; c < cols; c++) {
                float val = inData[c];
                float absVal = Math.abs(val);
                if (absVal >= T) {
                    outData[c] = (float) (Math.signum(val) * (absVal - T));
                } else {
                    outData[c] = 0.0f;
                }
            }
            dst.put(r, 0, outData);
        }
        return dst;
    }

    /**
     * Estimate noise standard deviation using Donoho's Median Absolute Deviation (MAD) formula:
     * sigma = median(|coefficients|) / 0.6745
     */
    private static double estimateNoiseSigma(Mat highPassBand) {
        int rows = highPassBand.rows();
        int cols = highPassBand.cols();
        int total = rows * cols;
        float[] data = new float[total];

        float[] rowBuf = new float[cols];
        for (int r = 0; r < rows; r++) {
            highPassBand.get(r, 0, rowBuf);
            for (int c = 0; c < cols; c++) {
                data[r * cols + c] = Math.abs(rowBuf[c]);
            }
        }

        Arrays.sort(data);
        float median = data[total / 2];
        return median / 0.6745;
    }

    private static Mat normalizeTo8U(Mat floatMat) {
        Mat norm = new Mat();
        Core.normalize(floatMat, norm, 0, 255, Core.NORM_MINMAX, CvType.CV_8U);
        return norm;
    }
}


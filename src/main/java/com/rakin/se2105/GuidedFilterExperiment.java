package com.rakin.se2105;

import nu.pattern.OpenCV;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Phase 3: Guided Filters & Local Adaptation
 *
 * Implements:
 * 1. Self-Guided Filtering for edge-preserving surround illumination estimation (Eq. 6-9).
 * 2. Guided-Retinex: Swapping Gaussian surround with Guided Filter to eliminate halo artifacts.
 * 3. Complete Local Adaptive Tone Mapping (Paper Eq. 10-12):
 *    - Global Logarithmic Luminance Lg (Eq. 4-5)
 *    - Edge-preserving Guided Surround Hg (Eq. 6-9)
 *    - Contrast Enhancement Factor a(x, y) with eta = 36 (Eq. 10)
 *    - Adaptive Nonlinear Offset beta with lambda = 10 (Eq. 11)
 *    - Final locally adapted luminance Lout = a(x,y) * [Lg - log(Hg)] + beta (Eq. 12)
 */
public class GuidedFilterExperiment {

    public static void main(String[] args) {
        OpenCV.loadLocally();
        System.out.println("=== Phase 3: Guided Filters & Local Adaptation ===");

        String inputPath = "assets/test_images/raw-image.jpg";
        String outputDir = "assets/results/phase3";
        new File(outputDir).mkdirs();

        Mat bgrImage = Imgcodecs.imread(inputPath);
        if (bgrImage.empty()) {
            System.err.println("Error: Failed to load " + inputPath);
            return;
        }

        // Convert to HSV and extract H, S, V channels
        Mat hsvImage = new Mat();
        Imgproc.cvtColor(bgrImage, hsvImage, Imgproc.COLOR_BGR2HSV);
        List<Mat> hsvChannels = new ArrayList<>();
        Core.split(hsvImage, hsvChannels);

        Mat hChannel = hsvChannels.get(0);
        Mat sChannel = hsvChannels.get(1);
        Mat vChannel8U = hsvChannels.get(2);

        // Normalize V to [0.0, 1.0] in CV_32F
        Mat vFloat = new Mat();
        vChannel8U.convertTo(vFloat, CvType.CV_32F, 1.0 / 255.0);

        // =========================================================================
        // Step 1: Guided-Retinex (Replacing Gaussian blur in SSR with Guided Filter)
        // =========================================================================
        // Guided Filter parameters: radius r = 16, eps = 0.01 (standard edge-preserving values)
        int r = 16;
        double eps = 0.01;
        GuidedFilter gf = new GuidedFilter(r, eps);

        // Compute self-guided illumination estimate Hg
        Mat hg = gf.filter(vFloat, vFloat);

        // Offset slightly to prevent log(0)
        double delta = 1e-4;
        Mat vOffset = new Mat();
        Core.add(vFloat, new Scalar(delta), vOffset);
        Mat hgOffset = new Mat();
        Core.add(hg, new Scalar(delta), hgOffset);

        Mat logV = new Mat();
        Mat logHg = new Mat();
        Core.log(vOffset, logV);
        Core.log(hgOffset, logHg);

        // Reflectance estimate using Guided Filter: R_guided = log(V) - log(Hg)
        Mat guidedRetinexReflectance = new Mat();
        Core.subtract(logV, logHg, guidedRetinexReflectance);

        Mat guidedRetinex8U = normalizeTo8U(guidedRetinexReflectance);
        Mat colorGuidedRetinex = reconstructBgr(hChannel, sChannel, guidedRetinex8U);
        Imgcodecs.imwrite(outputDir + "/guided_retinex.jpg", colorGuidedRetinex);
        System.out.println("Saved Guided-Retinex output to: " + outputDir + "/guided_retinex.jpg");

        // Also save side-by-side / diff against Gaussian SSR (sigma=15) to demonstrate halo suppression
        Mat gaussianBlurred = new Mat();
        Imgproc.GaussianBlur(vOffset, gaussianBlurred, new Size(0, 0), 15.0);
        Mat logGaussian = new Mat();
        Core.log(gaussianBlurred, logGaussian);
        Mat gaussianSSR = new Mat();
        Core.subtract(logV, logGaussian, gaussianSSR);
        Mat gaussianSSR8U = normalizeTo8U(gaussianSSR);

        Mat haloDiff = new Mat();
        Core.absdiff(gaussianSSR8U, guidedRetinex8U, haloDiff);
        Mat haloDiffAmplified = new Mat();
        Core.multiply(haloDiff, new Scalar(5), haloDiffAmplified);
        Imgcodecs.imwrite(outputDir + "/halo_comparison_diff_x5.jpg", haloDiffAmplified);
        System.out.println("Saved halo comparison diff to: " + outputDir + "/halo_comparison_diff_x5.jpg");

        // =========================================================================
        // Step 2: Full Local Adaptive Tone Mapping (Paper Eq. 10 - 12)
        // =========================================================================
        // 1. Compute Global Logarithmic Luminance Lg per Paper Eq. 4-5
        Mat lgFloat = computeLg(vFloat);

        // 2. Contrast Enhancement Factor a(x, y) per Paper Eq. 10:
        //    a(x, y) = 1 + eta * (V(x, y) / Lmax) where eta = 36
        Core.MinMaxLocResult minMax = Core.minMaxLoc(vFloat);
        double lmax = Math.max(minMax.maxVal, 1e-4);
        double eta = 36.0;

        Mat aFactor = new Mat();
        // a = 1.0 + (eta / lmax) * V
        Core.multiply(vFloat, new Scalar(eta / lmax), aFactor);
        Core.add(aFactor, new Scalar(1.0), aFactor);

        // 3. Adaptive Nonlinear Offset beta per Paper Eq. 11:
        //    beta = 1 / (1 + exp(-lambda * (Lwa - 0.5))) where lambda = 10
        double lwa = computeLwa(vFloat);
        double lambda = 10.0;
        double beta = 1.0 / (1.0 + Math.exp(-lambda * (lwa - 0.5)));
        System.out.println(String.format("Calculated parameters: Lwa=%.4f, Lmax=%.4f, beta=%.4f", lwa, lmax, beta));

        // 4. Combine into final locally adapted luminance Lout per Eq. 12:
        //    Lout(x, y) = a(x, y) * [Lg(x, y) - log(Hg(x, y))] + beta
        Mat lgMinusLogHg = new Mat();
        Core.subtract(lgFloat, logHg, lgMinusLogHg);

        Mat localAdapted = new Mat();
        Core.multiply(aFactor, lgMinusLogHg, localAdapted);
        Core.add(localAdapted, new Scalar(beta), localAdapted);

        // Normalize and convert to 8-bit unsigned
        Mat lout8U = normalizeTo8U(localAdapted);

        // Reconstruct full color image
        Mat colorFullLocalAdapted = reconstructBgr(hChannel, sChannel, lout8U);
        Imgcodecs.imwrite(outputDir + "/local_adaptive_tone_mapped.jpg", colorFullLocalAdapted);
        System.out.println("Saved Full Local Adaptive Tone Mapped image to: " + outputDir + "/local_adaptive_tone_mapped.jpg");

        System.out.println("=== Phase 3 Experiment Completed Successfully! ===");
    }

    /**
     * Compute Global Logarithmic Luminance Lg (Paper Eq. 4):
     * Lg = log(V / Lwa + 1) / log(Lmax / Lwa + 1)
     */
    private static Mat computeLg(Mat vFloat) {
        double lwa = computeLwa(vFloat);
        Core.MinMaxLocResult minMax = Core.minMaxLoc(vFloat);
        double lmax = Math.max(minMax.maxVal, 1e-4);

        double denom = Math.log(lmax / lwa + 1.0);

        Mat vDivLwa = new Mat();
        Core.divide(vFloat, new Scalar(lwa), vDivLwa);

        Mat vDivLwaPlus1 = new Mat();
        Core.add(vDivLwa, new Scalar(1.0), vDivLwaPlus1);

        Mat numLog = new Mat();
        Core.log(vDivLwaPlus1, numLog);

        Mat lg = new Mat();
        Core.divide(numLog, new Scalar(denom), lg);
        return lg;
    }

    /**
     * Compute log-average luminance Lwa (Paper Eq. 5):
     * Lwa = exp( (1/N) * sum(log(delta + V)) )
     */
    private static double computeLwa(Mat vFloat) {
        int totalPixels = vFloat.rows() * vFloat.cols();
        double delta = 1e-4;

        Mat vOffset = new Mat();
        Core.add(vFloat, new Scalar(delta), vOffset);

        Mat logV = new Mat();
        Core.log(vOffset, logV);

        Scalar sumLog = Core.sumElems(logV);
        return Math.exp(sumLog.val[0] / totalPixels);
    }

    /**
     * Normalize a float matrix to [0, 255] CV_8U
     */
    private static Mat normalizeTo8U(Mat floatMat) {
        Mat norm = new Mat();
        Core.normalize(floatMat, norm, 0, 255, Core.NORM_MINMAX, CvType.CV_8U);
        return norm;
    }

    /**
     * Reconstruct BGR image from H, S channels and an 8U luminance (V) channel
     */
    private static Mat reconstructBgr(Mat hChannel, Mat sChannel, Mat vChannel8U) {
        List<Mat> channels = new ArrayList<>();
        channels.add(hChannel);
        channels.add(sChannel);
        channels.add(vChannel8U);

        Mat hsv = new Mat();
        Core.merge(channels, hsv);

        Mat bgr = new Mat();
        Imgproc.cvtColor(hsv, bgr, Imgproc.COLOR_HSV2BGR);
        return bgr;
    }
}

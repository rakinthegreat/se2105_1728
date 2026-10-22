package com.rakin.se2105;

import nu.pattern.OpenCV;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Phase 2: Retinex Theory & Global Tone Mapping
 * Implements:
 * 1. Single-Scale Retinex (SSR) with Gaussian surround at varying sigmas (15, 80, 250)
 *    operating on the HSV Value/Luminance channel V(x, y) = max(R, G, B) to preserve chromaticity.
 * 2. Multi-Scale Retinex (MSR) averaging 3 scales (w_k = 1/3) per Jobson et al. / Paper Eq. 3.
 * 3. Global Logarithmic Tone Mapping per Paper Eq. 4-5 (referenced as Drago in paper,
 *    mathematically following Stockham's constant-base logarithmic mapping).
 */
public class RetinexExperiment {

    public static void main(String[] args) {
        OpenCV.loadLocally();
        System.out.println("=== Phase 2: Retinex Theory & Global Tone Mapping ===");

        String inputPath = "assets/test_images/raw-image.jpg";
        String outputDir = "assets/results/phase2";
        new File(outputDir).mkdirs();

        Mat bgrImage = Imgcodecs.imread(inputPath);
        if (bgrImage.empty()) {
            System.err.println("Error: Failed to load " + inputPath);
            return;
        }

        // Convert to HSV and extract H, S, V
        Mat hsvImage = new Mat();
        Imgproc.cvtColor(bgrImage, hsvImage, Imgproc.COLOR_BGR2HSV);
        List<Mat> hsvChannels = new ArrayList<>();
        Core.split(hsvImage, hsvChannels);

        Mat hChannel = hsvChannels.get(0);
        Mat sChannel = hsvChannels.get(1);
        Mat vChannel = hsvChannels.get(2);

        // Convert V to 32-bit float normalized to [0, 1] or [0, 255]
        // Using float in [1.0, 256.0] avoids log(0)
        Mat vFloat = new Mat();
        vChannel.convertTo(vFloat, CvType.CV_32F, 1.0, 1.0); // v in [1.0, 256.0]

        // 1. Single-Scale Retinex (SSR) at sigma = 15, 80, 250
        double[] sigmas = {15.0, 80.0, 250.0};
        Mat[] ssrResults = new Mat[sigmas.length];

        for (int i = 0; i < sigmas.length; i++) {
            double sigma = sigmas[i];
            Mat ssr = computeSSR(vFloat, sigma);
            ssrResults[i] = ssr;

            // Reconstruct color image using normalized SSR as V channel
            Mat normSSR = normalizeTo8U(ssr);
            Mat colorSSR = reconstructBgr(hChannel, sChannel, normSSR);
            Imgcodecs.imwrite(outputDir + "/ssr_sigma_" + (int)sigma + ".jpg", colorSSR);
            System.out.println("Saved SSR (sigma=" + (int)sigma + ") to: " + outputDir + "/ssr_sigma_" + (int)sigma + ".jpg");
        }

        // 2. Multi-Scale Retinex (MSR) - Paper Eq. (3)
        // Weight each scale equally: w_k = 1/3
        Mat msr = new Mat(vFloat.size(), CvType.CV_32F, new Scalar(0.0));
        for (Mat ssr : ssrResults) {
            Core.scaleAdd(ssr, 1.0 / ssrResults.length, msr, msr);
        }
        Mat normMSR = normalizeTo8U(msr);
        Mat colorMSR = reconstructBgr(hChannel, sChannel, normMSR);
        Imgcodecs.imwrite(outputDir + "/msr_output.jpg", colorMSR);
        System.out.println("Saved MSR output to: " + outputDir + "/msr_output.jpg");

        // 3. Global Logarithmic Tone Mapping (Paper Eq. 4-5, cited as Drago; Stockham constant-base formulation)
        Mat globalLuminance = computeGlobalLogToneMapping(vChannel);
        Mat colorToneMapped = reconstructBgr(hChannel, sChannel, globalLuminance);
        Imgcodecs.imwrite(outputDir + "/stockham_global_log_mapped.jpg", colorToneMapped);
        System.out.println("Saved Global Log Tone Mapped output to: " + outputDir + "/stockham_global_log_mapped.jpg");

        System.out.println("=== Phase 2 Experiment Completed Successfully! ===");
    }

    /**
     * Compute Single-Scale Retinex (SSR) on luminance channel V(x, y):
     * R_SSR(x, y) = log(V(x, y)) - log(GaussianBlur(V(x, y), sigma))
     *
     * where I(x, y) = L(x, y) * R(x, y) is mapped directly to the HSV Value channel V(x, y).
     */
    private static Mat computeSSR(Mat vFloat, double sigma) {
        // Gaussian blur with kernel size automatically computed from sigma (Size(0,0))
        Mat blurred = new Mat();
        Imgproc.GaussianBlur(vFloat, blurred, new Size(0, 0), sigma);

        // Compute natural logarithm: log(V) and log(blurred)
        Mat logV = new Mat();
        Mat logBlurred = new Mat();
        Core.log(vFloat, logV);
        Core.log(blurred, logBlurred);

        Mat ssr = new Mat();
        Core.subtract(logV, logBlurred, ssr);
        return ssr;
    }

    /**
     * Normalize a float matrix to standard 8-bit unsigned integer [0, 255]
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

    /**
     * Global Logarithmic Tone Mapping (Paper Eq. 4 - 5):
     * Lwa = exp( (1/N) * sum(log(delta + V(x,y))) )   [Eq. 5, log-average luminance]
     * Lg(x, y) = [log(V(x,y)/Lwa + 1)] / [log(Lmax/Lwa + 1)]  [Eq. 4]
     *
     * Note: While referenced as Drago in the paper text, this implements the classic
     * Stockham constant-base logarithmic mapping specified by Eq. 4-5.
     */
    private static Mat computeGlobalLogToneMapping(Mat vChannel8U) {
        Mat vFloat = new Mat();
        // Normalize V to [0.0, 1.0]
        vChannel8U.convertTo(vFloat, CvType.CV_32F, 1.0 / 255.0);

        int totalPixels = vFloat.rows() * vFloat.cols();
        double delta = 1e-4; // Small offset to avoid log(0)

        // delta + V(x, y)
        Mat vOffset = new Mat();
        Core.add(vFloat, new Scalar(delta), vOffset);

        // log(delta + V)
        Mat logV = new Mat();
        Core.log(vOffset, logV);

        // (1/N) * sum(log(delta + V))
        Scalar sumLog = Core.sumElems(logV);
        double lwa = Math.exp(sumLog.val[0] / totalPixels);

        // Find Lmax
        Core.MinMaxLocResult minMax = Core.minMaxLoc(vFloat);
        double lmax = Math.max(minMax.maxVal, 1e-4);

        // Compute denominator: log(Lmax / Lwa + 1)
        double denom = Math.log(lmax / lwa + 1.0);

        // Compute numerator: log(V / Lwa + 1)
        Mat vDivLwa = new Mat();
        Core.divide(vFloat, new Scalar(lwa), vDivLwa);

        Mat vDivLwaPlus1 = new Mat();
        Core.add(vDivLwa, new Scalar(1.0), vDivLwaPlus1);

        Mat numLog = new Mat();
        Core.log(vDivLwaPlus1, numLog);

        // Lg = numLog / denom
        Mat lgFloat = new Mat();
        Core.divide(numLog, new Scalar(denom), lgFloat);

        // Scale to 8U [0, 255]
        Mat result8U = new Mat();
        lgFloat.convertTo(result8U, CvType.CV_8U, 255.0);
        return result8U;
    }
}

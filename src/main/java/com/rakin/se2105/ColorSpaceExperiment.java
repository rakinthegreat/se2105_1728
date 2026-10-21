package com.rakin.se2105;

import nu.pattern.OpenCV;
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Phase 1: Image I/O, Color Space Conversions (RGB <-> HSV),
 * and Luminance vs RGB Brightness experiments.
 */
public class ColorSpaceExperiment {

    public static void main(String[] args) {
        // Step 1: Initialize OpenCV native bindings
        OpenCV.loadLocally();
        System.out.println("=== Phase 1: Image I/O & Color Spaces Experiment ===");

        // Step 2: Define paths
        String inputPath = "assets/test_images/raw-image.jpg";
        String outputDir = "assets/results/phase1";
        new File(outputDir).mkdirs();

        // Step 3: Load the input low-light image
        Mat bgrImage = Imgcodecs.imread(inputPath);
        if (bgrImage.empty()) {
            System.err.println("Error: Failed to load image from: " + inputPath);
            return;
        }
        System.out.println("Loaded input image: " + inputPath + " [" + bgrImage.cols() + "x" + bgrImage.rows() + ", channels=" + bgrImage.channels() + "]");

        // Step 4: Convert BGR -> HSV
        // Note: OpenCV loads standard color images as BGR by default
        Mat hsvImage = new Mat();
        Imgproc.cvtColor(bgrImage, hsvImage, Imgproc.COLOR_BGR2HSV);

        // Step 5: Split HSV channels: H (Hue), S (Saturation), V (Value / Luminance)
        List<Mat> hsvChannels = new ArrayList<>();
        Core.split(hsvImage, hsvChannels);

        Mat hChannel = hsvChannels.get(0);
        Mat sChannel = hsvChannels.get(1);
        Mat vChannel = hsvChannels.get(2);

        // Step 6: Save each channel as a standalone grayscale image to inspect visually
        Imgcodecs.imwrite(outputDir + "/channel_H_hue.jpg", hChannel);
        Imgcodecs.imwrite(outputDir + "/channel_S_saturation.jpg", sChannel);
        Imgcodecs.imwrite(outputDir + "/channel_V_value.jpg", vChannel);
        System.out.println("Saved individual H, S, V channel images to: " + outputDir);

        // Step 7: Brighten only the V (luminance) channel by 1.5x (saturating at 255)
        Mat brightenedV = new Mat();
        Core.multiply(vChannel, new org.opencv.core.Scalar(1.5), brightenedV);

        List<Mat> modifiedHsvChannels = new ArrayList<>();
        modifiedHsvChannels.add(hChannel);
        modifiedHsvChannels.add(sChannel);
        modifiedHsvChannels.add(brightenedV);

        Mat modifiedHsv = new Mat();
        Core.merge(modifiedHsvChannels, modifiedHsv);

        Mat hsvBrightenedBgr = new Mat();
        Imgproc.cvtColor(modifiedHsv, hsvBrightenedBgr, Imgproc.COLOR_HSV2BGR);
        Imgcodecs.imwrite(outputDir + "/enhanced_hsv_V_only.jpg", hsvBrightenedBgr);
        System.out.println("Saved HSV (V-channel boosted) image to: " + outputDir + "/enhanced_hsv_V_only.jpg");

        // Step 8: Mini-experiment: Brighten directly in RGB/BGR by 1.5x for comparison
        Mat directBgrBrightened = new Mat();
        Core.multiply(bgrImage, new org.opencv.core.Scalar(1.5, 1.5, 1.5), directBgrBrightened);
        Imgcodecs.imwrite(outputDir + "/enhanced_direct_rgb.jpg", directBgrBrightened);
        System.out.println("Saved direct RGB scaled image to: " + outputDir + "/enhanced_direct_rgb.jpg");

        System.out.println("=== Phase 1 Experiment Complete! ===");
        System.out.println("Check the generated images in: " + outputDir);
    }
}

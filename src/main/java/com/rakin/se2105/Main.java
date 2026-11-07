package com.rakin.se2105;

import nu.pattern.OpenCV;
import org.opencv.core.Mat;
import org.opencv.imgcodecs.Imgcodecs;

import java.io.File;

/**
 * Phase 5 CLI & Test Runner for EnhancementPipeline.
 *
 * Usage:
 * java -cp ... com.rakin.se2105.Main [inputImage] [outputImage]
 * Or run directly without arguments to enhance test_images/raw-image.jpg into assets/results/phase5/
 */
public class Main {

    public static void main(String[] args) {
        OpenCV.loadLocally();
        System.out.println("=== Phase 5: Complete Low-Light Enhancement Pipeline ===");

        String inputPath = (args.length > 0) ? args[0] : "assets/test_images/raw-image.jpg";
        String outputPath = (args.length > 1) ? args[1] : "assets/results/phase5/enhanced_pipeline_output.jpg";

        File inputFile = new File(inputPath);
        if (!inputFile.exists()) {
            System.err.println("Error: Input image file does not exist: " + inputPath);
            System.exit(1);
        }

        File outputDir = new File(outputPath).getParentFile();
        if (outputDir != null) {
            outputDir.mkdirs();
        }

        System.out.println("Loading input image: " + inputPath);
        Mat inputBgr = Imgcodecs.imread(inputPath);
        if (inputBgr.empty()) {
            System.err.println("Error: Failed to decode image from: " + inputPath);
            System.exit(1);
        }
        System.out.println(String.format("Input dimensions: %dx%d, channels: %d",
                inputBgr.cols(), inputBgr.rows(), inputBgr.channels()));

        long startTime = System.currentTimeMillis();

        EnhancementPipeline pipeline = new EnhancementPipeline();
        Mat enhancedBgr = pipeline.enhance(inputBgr);

        long elapsed = System.currentTimeMillis() - startTime;
        System.out.println("Enhancement finished in " + elapsed + " ms");

        boolean success = Imgcodecs.imwrite(outputPath, enhancedBgr);
        if (success) {
            System.out.println("Enhanced image successfully written to: " + outputPath);
        } else {
            System.err.println("Error: Failed to write output image to: " + outputPath);
            System.exit(1);
        }

        System.out.println("=== Phase 5 Execution Complete ===");
    }
}

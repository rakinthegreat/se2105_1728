package com.rakin.se2105;

import nu.pattern.OpenCV;
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.Scalar;
import org.opencv.imgcodecs.Imgcodecs;

public class DiffInspector {
    public static void main(String[] args) {
        OpenCV.loadLocally();
        Mat rgb = Imgcodecs.imread("assets/results/phase1/enhanced_direct_rgb.jpg");
        Mat hsv = Imgcodecs.imread("assets/results/phase1/enhanced_hsv_V_only.jpg");

        Mat diff = new Mat();
        Core.absdiff(rgb, hsv, diff);

        Scalar sumDiff = Core.sumElems(diff);
        Core.MinMaxLocResult mm = Core.minMaxLoc(diff.reshape(1));

        System.out.println("Absolute Difference Sum (B, G, R): " + sumDiff);
        System.out.println("Max pixel difference: " + mm.maxVal);

        // Save amplified difference map so user can see where they differ (amplified by 10x)
        Mat amplifiedDiff = new Mat();
        Core.multiply(diff, new Scalar(10, 10, 10), amplifiedDiff);
        Imgcodecs.imwrite("assets/results/phase1/diff_rgb_vs_hsv_x10.jpg", amplifiedDiff);

        // Also check with non-linear boost or extreme boost (e.g. 2.5x or gamma)
        System.out.println("Saved amplified diff image to assets/results/phase1/diff_rgb_vs_hsv_x10.jpg");
    }
}

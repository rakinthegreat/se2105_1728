package com.rakin.se2105;

import nu.pattern.OpenCV;
import org.opencv.core.CvType;
import org.opencv.core.Mat;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Phase 0: OpenCV & Environment Smoke Test ===");

        // Load OpenCV native libraries bundled within openpnp jar
        OpenCV.loadLocally();

        // Create a blank 100x100 3-channel (e.g. BGR) matrix
        Mat mat = new Mat(100, 100, CvType.CV_8UC3);

        System.out.println("OpenCV loaded successfully!");
        System.out.println("Allocated Mat: " + mat);
        System.out.println("Mat dimensions: " + mat.rows() + "x" + mat.cols() + ", channels=" + mat.channels());
        System.out.println("=== Checkpoint Passed ===");
    }
}

package com.rakin.se2105;

import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.imgproc.Imgproc;

/**
 * Pure Java + OpenCV implementation of Kaiming He et al.'s Guided Filter (ECCV 2010 / TPAMI 2013).
 *
 * Linear-time edge-preserving smoothing filter:
 * Output q = a_k * I + b_k
 * where:
 * a_k = (cov(I, p) / (var(I) + eps))
 * b_k = mean(p) - a_k * mean(I)
 *
 * For self-guided filtering (used in Retinex surround estimation):
 * Guidance image I == Input image p.
 */
public class GuidedFilter {

    private final int radius;
    private final double eps;

    public GuidedFilter(int radius, double eps) {
        this.radius = radius;
        this.eps = eps;
    }

    /**
     * Filters input image p using guide image I.
     * Both I and p must be 32-bit float (CV_32F), single channel.
     *
     * @param I Guide image (CV_32F)
     * @param p Input image to filter (CV_32F)
     * @return Edge-preserved smoothed image q (CV_32F)
     */
    public Mat filter(Mat I, Mat p) {
        Size ksize = new Size(2 * radius + 1, 2 * radius + 1);

        // mean_I = boxfilter(I, r)
        Mat meanI = new Mat();
        Imgproc.boxFilter(I, meanI, CvType.CV_32F, ksize);

        // mean_p = boxfilter(p, r)
        Mat meanP = new Mat();
        Imgproc.boxFilter(p, meanP, CvType.CV_32F, ksize);

        // mean_Ip = boxfilter(I .* p, r)
        Mat Ip = new Mat();
        Core.multiply(I, p, Ip);
        Mat meanIp = new Mat();
        Imgproc.boxFilter(Ip, meanIp, CvType.CV_32F, ksize);

        // cov_Ip = mean_Ip - mean_I .* mean_p
        Mat meanIMeanP = new Mat();
        Core.multiply(meanI, meanP, meanIMeanP);
        Mat covIp = new Mat();
        Core.subtract(meanIp, meanIMeanP, covIp);

        // mean_II = boxfilter(I .* I, r)
        Mat II = new Mat();
        Core.multiply(I, I, II);
        Mat meanII = new Mat();
        Imgproc.boxFilter(II, meanII, CvType.CV_32F, ksize);

        // var_I = mean_II - mean_I .* mean_I
        Mat meanIMeanI = new Mat();
        Core.multiply(meanI, meanI, meanIMeanI);
        Mat varI = new Mat();
        Core.subtract(meanII, meanIMeanI, varI);

        // a = cov_Ip ./ (var_I + eps)
        Mat varIEps = new Mat();
        Core.add(varI, new Scalar(eps), varIEps);
        Mat a = new Mat();
        Core.divide(covIp, varIEps, a);

        // b = mean_p - a .* mean_I
        Mat aMeanI = new Mat();
        Core.multiply(a, meanI, aMeanI);
        Mat b = new Mat();
        Core.subtract(meanP, aMeanI, b);

        // mean_a = boxfilter(a, r)
        Mat meanA = new Mat();
        Imgproc.boxFilter(a, meanA, CvType.CV_32F, ksize);

        // mean_b = boxfilter(b, r)
        Mat meanB = new Mat();
        Imgproc.boxFilter(b, meanB, CvType.CV_32F, ksize);

        // q = mean_a .* I + mean_b
        Mat meanAI = new Mat();
        Core.multiply(meanA, I, meanAI);
        Mat q = new Mat();
        Core.add(meanAI, meanB, q);

        return q;
    }
}

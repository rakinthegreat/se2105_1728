import React, { useState, useEffect, useRef } from "react"
import rawImage from "./assets/raw-image.jpg"
import enhancedImage from "./assets/enhanced-image.jpg"

// ── color tokens ──────────────────────────────────────────────
const C = {
  charcoal: "#171c18", // forest-green tinted dark
  charcoalLight: "#1f2620",
  charcoalMid: "#2c3530",
  sage: "#9dcc80", // vivid lime-sage accent (inspired by references)
  sageDim: "#5a8a52",
  sageFaint: "rgba(157,204,128,0.12)",
  ocean: "#4a6b7c",
  oceanLight: "#6a8b9c",
  oceanDim: "#2e4450",
  oceanFaint: "rgba(74,107,124,0.18)",
  slate: "#d4d9dF5",
  slateDim: "#7a8c80",
  mono: "Roboto Mono, monospace",
  sans: "Inter, system-ui, sans-serif",
}

// ── DiagonalSplit ─────────────────────────────────────────────
function DiagonalSplit() {
  const bg = (src: string) => ({
    position: "absolute" as const,
    inset: 0,
    backgroundImage: `url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: "left center",
    backgroundRepeat: "no-repeat",
  })
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${C.oceanDim}`,
      }}
    >
      {/* raw — fills entire container, anchored left */}
      <div style={bg(rawImage)} />
      {/* enhanced — same exact crop, clipped to right of diagonal */}
      <div
        style={{
          ...bg(enhancedImage),
          clipPath: "polygon(52% 0%, 100% 0%, 100% 100%, 42% 100%)",
        }}
      />
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        preserveAspectRatio="none"
      >
        <line
          x1="52%"
          y1="0%"
          x2="42%"
          y2="100%"
          stroke={C.sage}
          strokeWidth="2"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 14,
          fontFamily: C.mono,
          fontSize: 10,
          color: "#fff",
          background: "rgba(0,0,0,0.55)",
          padding: "2px 8px",
          borderRadius: 3,
        }}
      >
        RAW INPUT
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 14,
          fontFamily: C.mono,
          fontSize: 10,
          color: C.sage,
          background: "rgba(0,0,0,0.55)",
          padding: "2px 8px",
          borderRadius: 3,
        }}
      >
        ENHANCED
      </div>
    </div>
  )
}

// ── Slide 1 ───────────────────────────────────────────────────
function Slide1() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* main two-col */}
      <div style={{ flex: 1, display: "flex", gap: 36, minHeight: 0 }}>
        {/* left: title + student info, centered vertically as a group */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              fontSize: "clamp(26px, 4.2vw, 60px)",
              color: "#e8ede9",
            }}
          >
            Implementation
            <br />& Tiled
            <br />
            Parallelization
            <br />
            of{" "}
            <span style={{ color: C.sage }}>
              Retinex and
              <br />
              DT-CWT
            </span>{" "}
            Based
            <br />
            Low-Light
            <br />
            Image Enhancement
          </h1>

          {/* student particulars — directly below title */}
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[
              { label: "Prepared by", value: "Md. Rakinuzzaman Talukder" },
              { label: "Roll", value: "1728" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 10,
                    color: C.slateDim,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.slate }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right: diagonal split image */}
        <div
          style={{
            width: "55%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <DiagonalSplit />
          </div>
        </div>
      </div>

      {/* bottom meta bar — supervisor / course / institution only */}
      <div
        style={{
          marginTop: 20,
          background: C.charcoalLight,
          border: `1px solid ${C.charcoalMid}`,
          borderRadius: 10,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 40,
        }}
      >
        {[
          { label: "Supervised by", value: "Dr. Zerina Begum" },
          { label: "Course", value: "SE 2105 — Software Project Lab 1" },
          {
            label: "Institution",
            value:
              "Institute of Information Technology (IIT), University of Dhaka",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{ display: "flex", gap: 12, alignItems: "baseline" }}
          >
            <span
              style={{
                fontFamily: C.mono,
                fontSize: 10,
                color: C.slateDim,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              {label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.slate }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Slide 2 ───────────────────────────────────────────────────
function Flowchart() {
  const nodes = [
    {
      id: "rgb",
      label: "RGB Input",
      sub: "Raw frame",
      x: 50,
      y: 50,
      color: C.ocean,
    },
    {
      id: "hsv",
      label: "HSV Convert",
      sub: "Separate H, S, V",
      x: 50,
      y: 160,
      color: C.ocean,
    },
    {
      id: "vchan",
      label: "V-Channel",
      sub: "Luminance only",
      x: 50,
      y: 270,
      color: C.sage,
    },
    {
      id: "dtcwt",
      label: "DT-CWT",
      sub: "Dual-tree decomp",
      x: 200,
      y: 350,
      color: C.ocean,
    },
    {
      id: "retinex",
      label: "Retinex",
      sub: "Guided-filter TM",
      x: -100,
      y: 350,
      color: C.ocean,
    },
    {
      id: "thresh",
      label: "Soft Threshold",
      sub: "High-pass denoise",
      x: 200,
      y: 450,
      color: C.sageDim,
    },
    {
      id: "merge",
      label: "Merge",
      sub: "Inverse DT-CWT",
      x: 50,
      y: 540,
      color: C.sage,
    },
    {
      id: "out",
      label: "Enhanced V",
      sub: "Recombine H,S,V→RGB",
      x: 50,
      y: 630,
      color: C.sage,
    },
  ]
  return (
    <svg
      viewBox="-160 20 480 660"
      style={{ width: "100%", height: "100%" }}
      fontFamily={C.sans}
    >
      {/* connections */}
      {[
        ["rgb", "hsv"],
        ["hsv", "vchan"],
      ].map(([a, b]) => {
        const na = nodes.find((n) => n.id === a)!
        const nb = nodes.find((n) => n.id === b)!
        return (
          <line
            key={a + b}
            x1={na.x}
            y1={na.y + 28}
            x2={nb.x}
            y2={nb.y - 14}
            stroke={C.sage}
            strokeWidth="1.5"
            strokeDasharray="4 3"
            markerEnd="url(#arr)"
          />
        )
      })}
      {/* v-channel forks */}
      <line
        x1="50"
        y1="298"
        x2="200"
        y2="336"
        stroke={C.sage}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arr)"
      />
      <line
        x1="50"
        y1="298"
        x2="-100"
        y2="336"
        stroke={C.sage}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arr)"
      />
      {/* thresh */}
      <line
        x1="200"
        y1="378"
        x2="200"
        y2="436"
        stroke={C.sage}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arr)"
      />
      {/* merge */}
      <line
        x1="200"
        y1="464"
        x2="50"
        y2="526"
        stroke={C.sage}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arr)"
      />
      <line
        x1="-100"
        y1="378"
        x2="50"
        y2="526"
        stroke={C.sage}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arr)"
      />
      <line
        x1="50"
        y1="554"
        x2="50"
        y2="616"
        stroke={C.sage}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arr)"
      />

      <defs>
        <marker
          id="arr"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill={C.sage} />
        </marker>
      </defs>

      {/* nodes */}
      {nodes.map(({ id, label, sub, x, y, color }) => (
        <g key={id} transform={`translate(${x},${y})`}>
          <rect
            x="-75"
            y="-14"
            width="150"
            height="42"
            rx="6"
            fill={color === C.sage ? C.sageFaint : C.oceanFaint}
            stroke={color}
            strokeWidth="1.2"
          />
          <text
            y="6"
            textAnchor="middle"
            fill={color}
            fontSize="13"
            fontWeight="600"
          >
            {label}
          </text>
          <text y="20" textAnchor="middle" fill={C.slateDim} fontSize="10">
            {sub}
          </text>
        </g>
      ))}

      {/* low/high pass labels */}
      <text
        x="200"
        y="320"
        textAnchor="middle"
        fill={C.slateDim}
        fontSize="9"
        fontFamily={C.mono}
      >
        HIGH-PASS
      </text>
      <text
        x="-100"
        y="320"
        textAnchor="middle"
        fill={C.slateDim}
        fontSize="9"
        fontFamily={C.mono}
      >
        LOW-PASS
      </text>
    </svg>
  )
}

// ── Paper Book ───────────────────────────────────────────────
const PAGE_W = 160
const PAGE_H = 218
// Inner content area after padding: 218 - 24 = 194px tall, 160 - 22 = 138px wide
// All page content is designed to fit within that box.

const P = {
  head: {
    fontSize: 6.5,
    letterSpacing: "0.12em",
    color: "#8a9099",
    textTransform: "uppercase" as const,
    fontFamily: "Roboto Mono,monospace",
    marginBottom: 6,
    borderBottom: "0.5px solid #dedad4",
    paddingBottom: 4,
  },
  h1: { fontSize: 8.5, fontWeight: 800, color: "#1a1c1e", lineHeight: 1.3 },
  h2: { fontSize: 7.5, fontWeight: 700, color: "#222", marginBottom: 5 },
  body: {
    fontSize: 7,
    color: "#3a3a3a",
    lineHeight: 1.55,
    textAlign: "justify" as const,
  },
  small: { fontSize: 6.5, color: "#888", fontFamily: "Roboto Mono,monospace" },
  code: {
    fontSize: 7,
    fontFamily: "Roboto Mono,monospace",
    background: "#f0ede6",
    borderRadius: 2,
    padding: "3px 6px",
    color: "#2a2a2a",
    lineHeight: 1.6,
    display: "block" as const,
  },
  pg: {
    fontSize: 6,
    color: "#ccc",
    textAlign: "center" as const,
    fontFamily: "Roboto Mono,monospace",
    marginTop: "auto" as const,
    paddingTop: 4,
  },
  rule: { width: "100%", height: 0.5, background: "#e0dcd6", margin: "5px 0" },
}

const paperSpreads = [
  {
    left: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 0,
        }}
      >
        <div style={P.head}>Optoelectronics Letters · Vol.14 No.6 · 2018</div>
        <div style={P.h1}>
          Low-light Image Enhancement Based on Retinex Theory and Dual-Tree
          Complex Wavelet Transform
        </div>
        <div
          style={{ ...P.small, marginTop: 8, lineHeight: 1.5, color: "#555" }}
        >
          Yang M., Tang G., Liu X., Wang L.,
          <br />
          Cui Z., Luo S.
        </div>
        <div
          style={{
            ...P.small,
            marginTop: 4,
            fontStyle: "italic",
            color: "#999",
          }}
        >
          Nanjing U. Posts & Telecom. /<br />
          U. of Newcastle, Australia
        </div>
        <div style={P.rule} />
        <div style={{ ...P.small, color: "#aaa" }}>
          Received: 28 Mar 2018 · Revised: 28 Apr 2018
        </div>
        <div style={{ ...P.small, color: "#7d9e8c", marginTop: 4 }}>
          DOI 10.1007/s11801-018-8046-5
        </div>
        <div style={P.pg}>— p. 470 —</div>
      </div>
    ),
    right: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 0,
        }}
      >
        <div style={P.h2}>Abstract</div>
        <div style={P.body}>
          In order to enhance the contrast of low-light images and reduce noise
          in them, we propose an image enhancement method based on{" "}
          <em>Retinex theory</em> and{" "}
          <em>dual-tree complex wavelet transform (DT-CWT)</em>. The method
          first converts an image from the RGB color space to the HSV color
          space and decomposes the V-channel by dual-tree complex wavelet
          transform. Next, an improved local adaptive tone mapping method is
          applied to process the low frequency components of the image, and a
          soft threshold denoising algorithm is used to denoise the high
          frequency components. Then, the V-channel is rebuilt and the contrast
          is adjusted using white balance method. Finally, the processed image
          is converted back into the RGB color space as the enhanced result.
          Experimental results show that the proposed method can effectively
          improve the performance in terms of contrast enhancement, noise
          reduction and color reproduction.
        </div>
        <div
          style={{
            marginTop: 8,
            padding: "5px 7px",
            background: "#f0f6f2",
            borderLeft: "2px solid #7d9e8c",
            borderRadius: "0 2px 2px 0",
          }}
        >
          <div style={{ ...P.small, color: "#5a7a68", fontWeight: 600 }}>
            Doc code A · 1673-1905(2018)06-0470-6
          </div>
        </div>
        <div style={P.pg}>— p. 470 —</div>
      </div>
    ),
  },
  {
    left: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 0,
        }}
      >
        <div style={{ ...P.small, color: "#444", lineHeight: 1.6 }}>
          Image enhancement is an important branch of digital image processing.
          Images taken under low-light conditions often result in a narrower
          dynamic range and lower contrast. Although the above algorithms have
          improved the visual effect of low light images to some extent, it is
          difficult to achieve color reproduction in low-light images.
        </div>
        <div
          style={{ ...P.small, color: "#444", lineHeight: 1.6, marginTop: 5 }}
        >
          Retinex theory is a common method of image enhancement. Jobson et al
          proposed single-scale Retinex (SSR)
          <sup style={{ fontSize: 5 }}>[7]</sup> and multi-scale Retinex (MSR)
          <sup style={{ fontSize: 5 }}>[8]</sup>. SSR is described as follows:
        </div>
        <div style={{ ...P.code, marginTop: 5 }}>
          <em>R</em>
          <sub>i</sub>(<em>x</em>,<em>y</em>) = log <em>I</em>
          <sub>i</sub>(<em>x</em>,<em>y</em>) − log[<em>F</em>(<em>x</em>,
          <em>y</em>) ∗ <em>I</em>
          <sub>i</sub>(<em>x</em>,<em>y</em>)]{"  (1)"}
        </div>
        <div
          style={{ ...P.small, color: "#666", marginTop: 4, lineHeight: 1.5 }}
        >
          where <em>x</em> and <em>y</em> are pixel coordinates, <em>I</em>(
          <em>x</em>,<em>y</em>) is the input image,{" "}
          <em>
            R<sub>i</sub>
          </em>{" "}
          denotes the reflectivity image of the <em>i</em>-th color channel, ∗
          denotes convolution, and <em>F</em>(<em>x</em>,<em>y</em>) is the
          Gaussian surrounding function:
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>F</em>(<em>x</em>,<em>y</em>) = <em>K</em>e
          <sup>
            −(<em>x</em>²+<em>y</em>²)/<em>c</em>²
          </sup>
          {"  (2)"}
        </div>
        <div
          style={{ ...P.small, color: "#666", marginTop: 4, lineHeight: 1.5 }}
        >
          where <em>K</em> is a constant matrix and <em>c</em> is a scale
          constant. A small scale constant produces good dynamic range
          compression but poor color reproducibility.
        </div>
        <div style={P.pg}>— p. 471 —</div>
      </div>
    ),
    right: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 0,
        }}
      >
        <div style={{ ...P.small, color: "#444", lineHeight: 1.6 }}>
          The MSR algorithm is described as follows:
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>R</em>
          <sup>MSR</sup>
          <sub>i</sub>(<em>x</em>,<em>y</em>) = Σ
          <sup>
            <em>N</em>
          </sup>
          <sub>
            <em>n</em>=1
          </sub>{" "}
          <em>
            w<sub>n</sub> R<sup>n</sup>
            <sub>i</sub>
          </em>
          (<em>x</em>,<em>y</em>){"  (3)"}
        </div>
        <div
          style={{ ...P.small, color: "#666", marginTop: 4, lineHeight: 1.5 }}
        >
          where <em>N</em> is the total number of scale parameters, and{" "}
          <em>
            w<sub>n</sub>
          </em>{" "}
          is the weight parameter. MSR reduces halo artifacts on high-contrast
          edges but still suffers from halo artifact.
        </div>
        <div
          style={{ ...P.small, color: "#444", lineHeight: 1.6, marginTop: 5 }}
        >
          In Eq.(1), the input image <em>I</em>(<em>x</em>,<em>y</em>) is not
          smooth at the edge, causing halo artifacts. We use guided filtering
          <sup style={{ fontSize: 5 }}>[9]</sup> instead of the Gaussian filter,
          which has the function of smoothing and preserving edge details.
        </div>
        <div
          style={{ ...P.small, color: "#444", lineHeight: 1.6, marginTop: 5 }}
        >
          We convert low-light images from RGB to HSV. Since the HSV color space
          is closer to the perception of color in the human visual system, we
          process the image in the V-channel of the HSV color space.
        </div>
        <div style={P.pg}>— p. 471 —</div>
      </div>
    ),
  },
  {
    left: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 0,
        }}
      >
        <div style={{ ...P.small, color: "#444", lineHeight: 1.6 }}>
          DT-CWT decomposes an image into low-pass and high-pass sub-bands.
          Since noise mainly appears in the high-pass coefficients, we perform
          contrast enhancement in low-pass sub-bands and denoising in high-pass
          sub-bands.
        </div>
        <div
          style={{ ...P.small, color: "#444", lineHeight: 1.6, marginTop: 5 }}
        >
          We use improved local adaptive tone mapping for contrast enhancement.
          According to the Weber-Fechner law, we use:
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>
            L<sub>g</sub>
          </em>
          (<em>x</em>,<em>y</em>) = log(
          <em>
            L<sub>w</sub>
          </em>
          /<em style={{ textDecoration: "overline" }}>L</em>
          <sub>w</sub>+1) / log(<em>L</em>
          <sub>wmax</sub>/<em style={{ textDecoration: "overline" }}>L</em>
          <sub>w</sub>+1){"  (4)"}
        </div>
        <div
          style={{ ...P.small, color: "#666", marginTop: 4, lineHeight: 1.5 }}
        >
          <em style={{ textDecoration: "overline" }}>L</em>
          <sub>w</sub> = exp(1/<em>N</em> · Σ
          <sub>
            <em>xy</em>
          </sub>{" "}
          log(δ +{" "}
          <em>
            L<sub>w</sub>
          </em>
          (<em>x</em>,<em>y</em>))){"  (5)"}
        </div>
        <div
          style={{ ...P.small, color: "#444", lineHeight: 1.6, marginTop: 5 }}
        >
          The local adaptation equation (guided filter replaces Gaussian):
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>
            L<sub>l</sub>
          </em>
          (<em>x</em>,<em>y</em>) = log{" "}
          <em>
            L<sub>g</sub>
          </em>
          (<em>x</em>,<em>y</em>) − log{" "}
          <em>
            H<sub>g</sub>
          </em>
          (<em>x</em>,<em>y</em>){"  (6)"}
        </div>
        <div style={P.pg}>— p. 472 —</div>
      </div>
    ),
    right: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 0,
        }}
      >
        <div style={{ ...P.small, color: "#444", lineHeight: 1.6 }}>
          The contrast enhancement factor and adaptive nonlinear offset are
          introduced to prevent the flat appearance of the guided filter:
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>a</em>(<em>x</em>,<em>y</em>) = 1 + η ·{" "}
          <em>
            L<sub>g</sub>
          </em>
          (<em>x</em>,<em>y</em>) / <em>L</em>
          <sub>gmax</sub>
          {"  (10)"}
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          β = λ<em style={{ textDecoration: "overline" }}>L</em>
          <sub>g</sub>
          {"  (11)"}
        </div>
        <div
          style={{ ...P.small, color: "#666", marginTop: 3, lineHeight: 1.5 }}
        >
          η = 36, λ = 10 (empirically set). The final local adaptive output:
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>L</em>
          <sub>out</sub> = <em>a</em>(<em>x</em>,<em>y</em>) log(
          <em>
            L<sub>g</sub>
          </em>
          (<em>x</em>,<em>y</em>)/
          <em>
            H<sub>g</sub>
          </em>
          (<em>x</em>,<em>y</em>)) + β{"  (12)"}
        </div>
        <div
          style={{ ...P.small, color: "#444", lineHeight: 1.6, marginTop: 5 }}
        >
          This paper uses soft threshold filtering on high-pass coefficients:
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>Y</em> = {"{"} sign(<em>X</em>)(|<em>X</em>|−<em>T</em>), |
          <em>X</em>| {">"} <em>T</em>
          <br />
          {"     {"} <em>X</em>,{"                        "}|<em>X</em>| ≤{" "}
          <em>T</em>
          {"  (13)"}
        </div>
        <div
          style={{ ...P.small, color: "#666", marginTop: 3, lineHeight: 1.5 }}
        >
          <em>T</em> = √(2 log<sub>2</sub>(<em>l</em>)) · ∂, where <em>l</em> is
          signal length and ∂ is noise variance.
        </div>
        <div style={P.pg}>— p. 472 —</div>
      </div>
    ),
  },
  {
    left: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 0,
        }}
      >
        <div style={{ ...P.small, color: "#444", lineHeight: 1.6 }}>
          After noise reduction and contrast enhancement in the wavelet domain,
          we perform an inverse DT-CWT to reconstruct the V-channel, and use a
          method similar to automatic contrast adjustment to perform white
          balance correction<sup style={{ fontSize: 5 }}>[13]</sup> on the
          V-channel. After the execution of the algorithm, the image is
          converted from the HSV space to the RGB color space, and the final
          enhanced image is obtained.
        </div>
        <div
          style={{ ...P.small, color: "#444", lineHeight: 1.6, marginTop: 6 }}
        >
          Three evaluation criteria are adopted: Entropy <em>H</em>(<em>p</em>),
          Clarity <em>Q</em>, and Contrast <em>C</em>:
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>H</em>(<em>p</em>) = −Σ
          <sup>
            <em>L</em>−1
          </sup>
          <sub>
            <em>i</em>=0
          </sub>{" "}
          <em>p</em>(<em>i</em>) log<sub>2</sub> <em>p</em>(<em>i</em>)
          {"  (14)"}
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>Q</em> = √(<em>RF</em>² + <em>CF</em>²){"  (15)"}
        </div>
        <div style={{ ...P.code, marginTop: 4 }}>
          <em>C</em> = Σ<sub>δ</sub> δ(<em>i</em>,<em>j</em>)² <em>P</em>
          <sub>δ</sub>(<em>i</em>,<em>j</em>){"  (18)"}
        </div>
        <div style={P.pg}>— p. 473 —</div>
      </div>
    ),
    right: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 0,
        }}
      >
        <div style={{ ...P.small, color: "#444", lineHeight: 1.6 }}>
          In order to verify the effectiveness of our proposed algorithm, we
          collect a large number of images taken at night and low-light images
          for testing. We use MATLAB 2014a for programming, and use a computer
          with a four-core 2.50 GHz CPU, 8 GB RAM, running on Windows 7.
        </div>
        <div
          style={{ ...P.small, color: "#444", lineHeight: 1.6, marginTop: 5 }}
        >
          The compared algorithms are the traditional MSR algorithm
          <sup style={{ fontSize: 5 }}>[7]</sup>, Fu et al.
          <sup style={{ fontSize: 5 }}>[14]</sup> (Retinex-based variational
          model), Dong et al.<sup style={{ fontSize: 5 }}>[15]</sup> (dark
          primary color theory) and Wang et al.
          <sup style={{ fontSize: 5 }}>[16]</sup> (adaptive contrast
          improvement). Test images: Barrel, Horse, Toys, Hallway, Desk, Frame,
          Street, Bridge.
        </div>
        <div
          style={{ ...P.small, color: "#444", lineHeight: 1.6, marginTop: 5 }}
        >
          Experimental results show that the proposed method can effectively
          improve the performance in terms of contrast enhancement, noise
          reduction and color reproduction, and outperforms some existing
          methods in both subjective and objective evaluation.
        </div>
        <div style={P.pg}>— p. 473 —</div>
      </div>
    ),
  },
]

function PaperBook() {
  const [spread, setSpread] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const [flipDir, setFlipDir] = useState<"fwd" | "back">("fwd")
  const [pending, setPending] = useState(spread)
  const [autoPlay, setAutoPlay] = useState(true)

  const goTo = (next: number, dir: "fwd" | "back") => {
    if (flipping || next < 0 || next >= paperSpreads.length) return
    setFlipDir(dir)
    setPending(next)
    setFlipping(true)
    setTimeout(() => {
      setSpread(next)
      setFlipping(false)
    }, 420)
  }

  // Auto-scroll: bounce between spread 0 and 1
  const spreadRef = React.useRef(spread)
  spreadRef.current = spread
  const flippingRef = React.useRef(flipping)
  flippingRef.current = flipping

  React.useEffect(() => {
    if (!autoPlay) return
    const id = setInterval(() => {
      if (flippingRef.current) return
      const next = spreadRef.current === 0 ? 1 : 0
      const dir = next > spreadRef.current ? "fwd" : "back"
      setFlipDir(dir)
      setPending(next)
      setFlipping(true)
      setTimeout(() => {
        setSpread(next)
        setFlipping(false)
      }, 420)
    }, 3200)
    return () => clearInterval(id)
  }, [autoPlay])

  const cur = paperSpreads[spread]

  const pageBase: React.CSSProperties = {
    width: PAGE_W,
    height: PAGE_H,
    flexShrink: 0,
    padding: "12px 11px",
    boxSizing: "border-box",
    overflow: "hidden",
    fontFamily: "Georgia, serif",
    position: "relative",
  }

  // Rendered page — content fills height exactly, bottom fade prevents any cut-off look
  const Page = ({
    content,
    side,
  }: {
    content: React.ReactNode
    side: "left" | "right"
  }) => (
    <div
      style={{
        ...pageBase,
        background:
          side === "left"
            ? "linear-gradient(to right, #f0ede4, #faf8f2)"
            : "linear-gradient(to left,  #f0ede4, #faf8f2)",
        borderRadius: side === "left" ? "4px 0 0 4px" : "0 4px 4px 0",
        boxShadow:
          side === "left"
            ? "inset -18px 0 22px rgba(0,0,0,0.13), -1px 0 3px rgba(0,0,0,0.1)"
            : "inset  18px 0 22px rgba(0,0,0,0.10),  2px 2px 10px rgba(0,0,0,0.18)",
      }}
    >
      {content}
      {/* soft fade at bottom — hides any overflow gracefully */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 28,
          background:
            side === "left"
              ? "linear-gradient(to bottom, transparent, #f4f1e8)"
              : "linear-gradient(to bottom, transparent, #f4f1e8)",
          pointerEvents: "none",
        }}
      />
    </div>
  )

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        transform: "scale(0.86)",
        transformOrigin: "top center",
        marginBottom: -26,
      }}
    >
      {/* book block */}
      <div style={{ position: "relative", perspective: 1000 }}>
        {/* ambient shadow beneath */}
        <div
          style={{
            position: "absolute",
            bottom: -10,
            left: 16,
            right: 16,
            height: 14,
            background: "rgba(0,0,0,0.35)",
            filter: "blur(8px)",
            borderRadius: "50%",
          }}
        />
        {/* page stack depth illusion */}
        {[3, 2, 1].map((d) => (
          <div
            key={d}
            style={{
              position: "absolute",
              top: d,
              left: -d / 2,
              right: -d / 2,
              height: PAGE_H,
              background: "#e8e4d8",
              borderRadius: 4,
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          />
        ))}

        <div style={{ display: "flex", position: "relative" }}>
          {/* left page */}
          <Page content={cur.left} side="left" />

          {/* right page + flip */}
          <div style={{ position: "relative", width: PAGE_W, height: PAGE_H }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <Page content={cur.right} side="right" />
            </div>

            {flipping && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10,
                  transformStyle: "preserve-3d",
                  transformOrigin: "left center",
                  animation:
                    "page-turn-fwd 0.45s cubic-bezier(0.4,0,0.2,1) forwards",
                }}
              >
                {/* front: outgoing right */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <Page content={cur.right} side="right" />
                </div>
                {/* back: incoming next left */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <Page
                    content={(paperSpreads[pending] ?? cur).left}
                    side="left"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* nav controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => setAutoPlay((p) => !p)}
          title={autoPlay ? "Pause auto-flip" : "Resume auto-flip"}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background: C.sageFaint,
            border: `1px solid ${C.sageDim}`,
            color: C.sage,
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {autoPlay ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => goTo(spread - 1, "back")}
          disabled={spread === 0 || flipping}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background: spread === 0 ? "transparent" : C.sageFaint,
            border: `1px solid ${spread === 0 ? C.charcoalMid : C.sageDim}`,
            color: spread === 0 ? C.charcoalMid : C.sage,
            fontSize: 13,
            cursor: spread === 0 ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ‹
        </button>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {paperSpreads.map((_, i) => (
            <div
              key={i}
              onClick={() => !flipping && goTo(i, i > spread ? "fwd" : "back")}
              style={{
                width: i === spread ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === spread ? C.sage : C.charcoalMid,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => goTo(spread + 1, "fwd")}
          disabled={spread === paperSpreads.length - 1 || flipping}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background:
              spread === paperSpreads.length - 1 ? "transparent" : C.sageFaint,
            border: `1px solid ${spread === paperSpreads.length - 1 ? C.charcoalMid : C.sageDim
              }`,
            color: spread === paperSpreads.length - 1 ? C.charcoalMid : C.sage,
            fontSize: 13,
            cursor: spread === paperSpreads.length - 1 ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ›
        </button>
      </div>
    </div>
  )
}

// ── Horizontal Flowchart ──────────────────────────────────────
function HorizontalFlowchart() {
  // 6-step pipeline: RGB→HSV→DT-CWT (fork) → TM/Soft-Thr → iDT-CWT → WB → RGB
  const NODE_W = 68,
    NODE_H = 30,
    ARROW = 16,
    GAP_Y = 14

  type Node = {
    id: string
    label: string
    sub: string
    col: number
    row: number
    color: string
  }
  const nodes: Node[] = [
    { id: "rgb", label: "RGB", sub: "input", col: 0, row: 1, color: C.ocean },
    { id: "hsv", label: "HSV", sub: "convert", col: 1, row: 1, color: C.ocean },
    {
      id: "dtwt",
      label: "DT-CWT",
      sub: "decompose",
      col: 2,
      row: 1,
      color: C.sage,
    },
    {
      id: "tm",
      label: "Tone Map",
      sub: "low-pass",
      col: 3,
      row: 0,
      color: C.ocean,
    },
    {
      id: "thr",
      label: "Soft-Thr.",
      sub: "high-pass",
      col: 3,
      row: 2,
      color: C.ocean,
    },
    {
      id: "idtwt",
      label: "iDT-CWT",
      sub: "reconstruct",
      col: 4,
      row: 1,
      color: C.sage,
    },
    {
      id: "wb",
      label: "White Bal.",
      sub: "correction",
      col: 5,
      row: 1,
      color: C.ocean,
    },
    { id: "out", label: "RGB", sub: "enhanced", col: 6, row: 1, color: C.sage },
  ]

  const COL_W = NODE_W + ARROW
  const ROW_H = NODE_H + GAP_Y
  const W = 7 * COL_W + NODE_W
  const H = 3 * ROW_H - GAP_Y

  const cx = (col: number) => col * COL_W + NODE_W / 2
  const cy = (row: number) => row * ROW_H + NODE_H / 2

  const arrow = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    key: string,
  ) => {
    const mid = (x1 + x2) / 2
    const path =
      y1 === y2
        ? `M${x1},${y1} L${x2},${y2}`
        : `M${x1},${y1} L${mid},${y1} L${mid},${y2} L${x2},${y2}`
    return (
      <path
        key={key}
        d={path}
        stroke={C.sage}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 3"
        markerEnd="url(#harr)"
      />
    )
  }

  return (
    <div
      style={{
        background: C.charcoalLight,
        borderRadius: 8,
        border: `1px solid ${C.oceanDim}`,
        padding: "14px 10px",
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", overflow: "visible" }}
        fontFamily={C.sans}
      >
        <defs>
          <marker
            id="harr"
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L7,3 z" fill={C.sage} />
          </marker>
        </defs>

        {/* rgb → hsv → dtwt */}
        {arrow(cx(0) + NODE_W / 2, cy(1), cx(1) - NODE_W / 2, cy(1), "e0")}
        {arrow(cx(1) + NODE_W / 2, cy(1), cx(2) - NODE_W / 2, cy(1), "e1")}

        {/* dtwt forks to tm (top) and thr (bottom) */}
        {arrow(cx(2) + NODE_W / 2, cy(1), cx(3) - NODE_W / 2, cy(0), "e2")}
        {arrow(cx(2) + NODE_W / 2, cy(1), cx(3) - NODE_W / 2, cy(2), "e3")}

        {/* tm + thr merge → idtwt */}
        {arrow(cx(3) + NODE_W / 2, cy(0), cx(4) - NODE_W / 2, cy(1), "e4")}
        {arrow(cx(3) + NODE_W / 2, cy(2), cx(4) - NODE_W / 2, cy(1), "e5")}

        {/* idtwt → wb → out */}
        {arrow(cx(4) + NODE_W / 2, cy(1), cx(5) - NODE_W / 2, cy(1), "e6")}
        {arrow(cx(5) + NODE_W / 2, cy(1), cx(6) - NODE_W / 2, cy(1), "e7")}

        {/* nodes */}
        {nodes.map(({ id, label, sub, col, row, color }) => (
          <g
            key={id}
            transform={`translate(${cx(col) - NODE_W / 2},${cy(row) - NODE_H / 2})`}
          >
            <rect
              width={NODE_W}
              height={NODE_H}
              rx="4"
              fill={color === C.sage ? C.sageFaint : C.oceanFaint}
              stroke={color}
              strokeWidth="1.2"
            />
            <text
              x={NODE_W / 2}
              y={NODE_H * 0.44}
              textAnchor="middle"
              fill={color}
              fontSize="10"
              fontWeight="600"
            >
              {label}
            </text>
            <text
              x={NODE_W / 2}
              y={NODE_H * 0.82}
              textAnchor="middle"
              fill={C.slateDim}
              fontSize="7.5"
            >
              {sub}
            </text>
          </g>
        ))}

        {/* track labels */}
        <text
          x={cx(3)}
          y={cy(0) - NODE_H / 2 - 4}
          textAnchor="middle"
          fontSize="7.5"
          fill={C.slateDim}
          fontFamily={C.mono}
        >
          LOW-PASS
        </text>
        <text
          x={cx(3)}
          y={cy(2) + NODE_H / 2 + 10}
          textAnchor="middle"
          fontSize="7.5"
          fill={C.slateDim}
          fontFamily={C.mono}
        >
          HIGH-PASS
        </text>
      </svg>
    </div>
  )
}

// ── Slide 2 (merged: Algorithm + Architecture) ────────────────
function PipelineDiagram() {
  const ar = '#4a5c50';
  const bg = C.charcoalLight;
  const st = C.charcoalMid;
  const tx = '#e0e5e1';
  const dm = C.slateDim;
  const sg = C.sage;
  const ch = C.charcoal;
  const ds = C.sageDim;
  const ff = 'Inter, system-ui, sans-serif';
  const fm = 'Roboto Mono, monospace';
  const BH = 26;

  const VW = 1060, VH = 262;
  const cy1 = 30;   // top-level row center y
  const cy2 = 58;   // H,S row center y
  const cy3 = 155;  // V row center y
  const HI = 113;  // high-freq branch center y
  const LO = 197;  // low-freq branch center y
  const EX = 200, EY = 6, EW = 700, EH = 250;

  type RectProps = { x: number; y: number; w: number; text: string; sub?: string; accent?: boolean };
  const Box = ({ x, y, w, text, sub, accent }: RectProps) => (
    <g>
      <rect x={x} y={y} width={w} height={BH} rx={3}
        fill={accent ? sg : bg} stroke={accent ? sg : st} strokeWidth={1} />
      <text x={x + w / 2} y={y + (sub ? BH / 2 - 3 : BH / 2 + 4)}
        textAnchor="middle" fontSize={11} fontWeight={700}
        fill={accent ? ch : tx} fontFamily={ff}>{text}</text>
      {sub && <text x={x + w / 2} y={y + BH / 2 + 10}
        textAnchor="middle" fontSize={9} fontStyle="italic"
        fill={accent ? '#2a3a2a' : dm} fontFamily={fm}>{sub}</text>}
    </g>
  );

  const Arr = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={ar} strokeWidth={1.5} markerEnd="url(#pd-arr)" />
  );
  const Seg = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ar} strokeWidth={1.5} />
  );

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain' }}>
      <defs>
        <marker id="pd-arr" viewBox="0 0 10 10" refX={9} refY={5}
          markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9z" fill={ar} />
        </marker>
      </defs>

      {/* Enhancement dashed box */}
      <rect x={EX} y={EY} width={EW} height={EH} rx={6}
        fill="rgba(157,204,128,0.025)" stroke={ds}
        strokeWidth={1.5} strokeDasharray="6,4" />
      <text x={EX + EW - 8} y={EY + EH - 7} textAnchor="end" fontSize={9}
        fontStyle="italic" fill={ds} fontFamily={fm}>Image Enhancement</text>

      {/* ── TOP-LEVEL NODES ── */}
      <ellipse cx={48} cy={cy1} rx={44} ry={14} fill={bg} stroke={st} strokeWidth={1} />
      <text x={48} y={cy1 - 3} textAnchor="middle" fontSize={10} fontWeight={600} fill={tx} fontFamily={ff}>Original</text>
      <text x={48} y={cy1 + 8} textAnchor="middle" fontSize={10} fontWeight={600} fill={tx} fontFamily={ff}>Image</text>

      <Arr x1={92} y1={cy1} x2={105} y2={cy1} />
      <Box x={107} y={cy1 - BH / 2} w={82} text="RGB → HSV" />
      <Arr x1={189} y1={cy1} x2={EX} y2={cy1} />

      {/* Entry fork inside box */}
      <Seg x1={EX} y1={cy1} x2={214} y2={cy1} />
      <Seg x1={214} y1={cy2} x2={214} y2={cy3} />
      <Arr x1={214} y1={cy2} x2={226} y2={cy2} />
      <Arr x1={214} y1={cy3} x2={226} y2={cy3} />

      {/* ── H,S PASS-THROUGH ROW ── */}
      <Box x={228} y={cy2 - BH / 2} w={115} text="H and S channel" sub="pass-through" />
      <Arr x1={343} y1={cy2} x2={718} y2={cy2} />
      <Box x={720} y={cy2 - BH / 2} w={100} text="Keep invariant" />

      {/* ── V CHANNEL ROW ── */}
      <Box x={228} y={cy3 - BH / 2} w={94} text="Get V channel" />
      <Arr x1={322} y1={cy3} x2={336} y2={cy3} />
      <Box x={338} y={cy3 - BH / 2} w={70} text="DT-CWT" />

      {/* Fork from DT-CWT */}
      <Seg x1={408} y1={cy3} x2={422} y2={cy3} />
      <Seg x1={422} y1={HI} x2={422} y2={LO} />
      <Arr x1={422} y1={HI} x2={434} y2={HI} />
      <Arr x1={422} y1={LO} x2={434} y2={LO} />

      {/* High-frequency branch */}
      <Box x={436} y={HI - BH / 2} w={108} text="High-frequency" sub="component" />
      <Arr x1={544} y1={HI} x2={556} y2={HI} />
      <Box x={558} y={HI - BH / 2} w={116} text="Soft threshold" sub="denoising" />
      <Seg x1={674} y1={HI} x2={688} y2={HI} />

      {/* Low-frequency branch */}
      <Box x={436} y={LO - BH / 2} w={108} text="Low-frequency" sub="component" />
      <Arr x1={544} y1={LO} x2={556} y2={LO} />
      <Box x={558} y={LO - BH / 2} w={116} text="Adaptive local" sub="tone mapping" />
      <Seg x1={674} y1={LO} x2={688} y2={LO} />

      {/* Merge */}
      <Seg x1={688} y1={HI} x2={688} y2={LO} />
      <Arr x1={688} y1={cy3} x2={702} y2={cy3} />

      {/* IDT-CWT */}
      <Box x={704} y={cy3 - BH / 2} w={78} text="IDT-CWT" />
      <Arr x1={782} y1={cy3} x2={796} y2={cy3} />

      {/* White balance */}
      <Box x={798} y={cy3 - BH / 2} w={90} text="White balance" />

      {/* Exit: white balance → up → out of box → HSV→RGB */}
      <Seg x1={888} y1={cy3} x2={EX + EW} y2={cy3} />
      <Seg x1={EX + EW} y1={cy3} x2={EX + EW} y2={cy1} />
      <Arr x1={EX + EW} y1={cy1} x2={EX + EW + 13} y2={cy1} />

      <Box x={EX + EW + 15} y={cy1 - BH / 2} w={84} text="HSV → RGB" />
      <Arr x1={EX + EW + 99} y1={cy1} x2={EX + EW + 112} y2={cy1} />

      {/* Result oval */}
      <ellipse cx={EX + EW + 136} cy={cy1} rx={22} ry={14} fill={sg} stroke={sg} strokeWidth={1} />
      <text x={EX + EW + 136} y={cy1 + 4} textAnchor="middle"
        fontSize={11} fontWeight={700} fill={ch} fontFamily={ff}>Result</text>
    </svg>
  );
}

function Slide2() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        justifyContent: "space-between",
        gap: "clamp(6px, 1.2vh, 12px)",
        boxSizing: "border-box",
      }}
    >
      {/* ── TOP ROW: Yellow | Book | Green (Retinex) | Blue (DT-CWT) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr auto 1.15fr 1.15fr",
          gap: "clamp(10px, 1.4vw, 18px)",
          alignItems: "stretch",
          minHeight: 0,
        }}
      >
        {/* YELLOW: heading + blurb */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingTop: 4 }}>
          <h2
            style={{
              margin: "0 0 6px",
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#e8ede9",
              letterSpacing: "-0.04em",
              fontSize: "clamp(20px, 2.2vw, 36px)",
            }}
          >
            The Proposed<br /><span style={{ color: C.sage }}>Algorithm</span>
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(10.5px, 0.82vw, 12px)",
              color: C.slateDim,
              lineHeight: 1.55,
            }}
          >
            Porting Yang et al. (2018) from MATLAB to Java — replacing the Gaussian surround
            with a guided filter and parallelising across a{" "}
            <span style={{ fontFamily: C.mono, color: C.sage }}>4×4 ForkJoinPool</span>{" "}
            tile grid for edge-compute deployment.
          </p>
        </div>

        {/* BOOK column */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", flexShrink: 0 }}>
          <PaperBook />
        </div>

        {/* GREEN: Retinex Theory */}
        <div
          style={{
            background: C.charcoalLight,
            border: `1px solid ${C.charcoalMid}`,
            borderTop: `3px solid ${C.sage}`,
            borderRadius: 8,
            padding: "10px clamp(10px, 1vw, 14px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 6,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: "clamp(13px, 1.15vw, 17px)",
                letterSpacing: "-0.02em",
                color: "#e8ede9",
                lineHeight: 1.15,
              }}
            >
              Retinex Theory
            </h3>
          </div>
          <div style={{ height: 1, background: C.charcoalMid }} />
          <p style={{ margin: 0, fontSize: "clamp(10px, 0.78vw, 11.5px)", color: C.slateDim, lineHeight: 1.5 }}>
            A computational model of human vision that separates an image into{" "}
            <span style={{ color: C.slate, fontWeight: 600 }}>reflectance</span> (true colour & detail) and{" "}
            <span style={{ color: C.slate, fontWeight: 600 }}>illumination</span> (ambient light).
          </p>
          <p style={{ margin: 0, fontSize: "clamp(10px, 0.78vw, 11.5px)", color: C.slateDim, lineHeight: 1.5 }}>
            We apply adaptive local tone mapping to the low-frequency DT-CWT sub-band using a guided filter in place of the Gaussian surround, lifting dark regions via the Weber-Fechner log model while preserving edges.
          </p>
        </div>

        {/* BLUE: DT-CWT */}
        <div
          style={{
            background: C.charcoalLight,
            border: `1px solid ${C.charcoalMid}`,
            borderTop: `3px solid ${C.ocean}`,
            borderRadius: 8,
            padding: "10px clamp(10px, 1vw, 14px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 6,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: "clamp(13px, 1.15vw, 17px)",
                letterSpacing: "-0.02em",
                color: "#e8ede9",
                lineHeight: 1.15,
              }}
            >
              Dual-Tree Complex Wavelet Transform
            </h3>
          </div>
          <div style={{ height: 1, background: C.charcoalMid }} />
          <p style={{ margin: 0, fontSize: "clamp(10px, 0.78vw, 11.5px)", color: C.slateDim, lineHeight: 1.5 }}>
            Uses <span style={{ color: C.slate, fontWeight: 600 }}>two parallel filter trees</span> for approximate shift invariance and enhanced directional selectivity — overcoming the aliasing limitations of the standard DWT.
          </p>
          <p style={{ margin: 0, fontSize: "clamp(10px, 0.78vw, 11.5px)", color: C.slateDim, lineHeight: 1.5 }}>
            Applied to the V-channel, it produces one low-pass sub-band and six directional high-pass sub-bands. Soft thresholding (T&nbsp;=&nbsp;√(2log₂l)·σ) attenuates noise while preserving edge coefficients.
          </p>
        </div>
      </div>

      {/* ── PIPELINE DIAGRAM (faithful to Yang et al. 2018) ── */}
      <div
        style={{
          background: C.charcoal,
          borderRadius: 8,
          padding: "6px 12px",
          border: `1px solid ${C.charcoalMid}`,
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <PipelineDiagram />
      </div>

      {/* ── TECH STACK (1 row, 4 columns) ── */}
      <div style={{ display: "flex", gap: "clamp(10px, 1.2vw, 16px)", alignItems: "center", flexShrink: 0 }}>
        {/* Left: title */}
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: "clamp(13px, 1.1vw, 16px)", fontWeight: 800, color: "#e8ede9", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            Tech <span style={{ color: C.sage }}>Stack</span>
          </div>
        </div>
        <div style={{ width: 1, height: 28, background: C.charcoalMid, flexShrink: 0 }} />
        {/* Right: 1×4 grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "clamp(6px, 0.8vw, 10px)" }}>
          {[
            { layer: "UI", tech: "JavaFX 21", detail: "Async GUI · wipe slider", color: C.sage },
            { layer: "Engine", tech: "JDK 21+", detail: "ForkJoinPool · threads", color: C.ocean },
            { layer: "Vision", tech: "OpenCV 4.9", detail: "UMat · guided filter", color: C.oceanLight },
            { layer: "Memory", tech: "JVM + Off-heap", detail: "Tile cache · NIO buffers", color: C.sageDim },
          ].map(({ layer, tech, detail, color }) => (
            <div
              key={layer}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: C.charcoalLight,
                border: `1px solid ${C.charcoalMid}`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 6,
                padding: "6px 10px",
              }}
            >
              <div>
                <div style={{ fontFamily: C.mono, fontSize: "clamp(8px, 0.6vw, 9.5px)", color: C.slateDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {layer}
                </div>
                <div style={{ fontSize: "clamp(11.5px, 0.9vw, 13.5px)", fontWeight: 800, color, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                  {tech}
                </div>
                <div style={{ fontFamily: C.mono, fontSize: "clamp(7.5px, 0.58vw, 9px)", color: C.slateDim, marginTop: 1, whiteSpace: "nowrap" }}>
                  {detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Slide 3 ───────────────────────────────────────────────────
const COLS = 4
const ROWS = 4
const TW = 128 // tile width  px — enlarged
const TH = 96 // tile height px — 4:3, matches landscape photo
const HALO_PX = 14

function TileGrid({ phase }: { phase: number }) {
  const tiles = Array.from({ length: ROWS * COLS }, (_, i) => ({
    row: Math.floor(i / COLS),
    col: i % COLS,
  }))

  const gap = phase >= 1 && phase < 5 ? 5 : 0
  const showHalo = phase === 2
  const spinning = phase === 3
  const showResult = phase === 4 // enhanced image, split state
  const assembled = phase >= 5
  const src = phase >= 4 ? enhancedImage : rawImage

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, ${TW}px)`,
        gridTemplateRows: `repeat(${ROWS}, ${TH}px)`,
        gap: assembled ? 0 : gap,
        borderRadius: assembled ? 8 : 0,
        overflow: assembled ? "hidden" : "visible",
        flexShrink: 0,
        transition: "gap 0.5s ease, border-radius 0.4s ease",
      }}
    >
      {tiles.map(({ row, col }, i) => {
        // background-position as % selects the correct image slice per tile
        const bpx = (col / (COLS - 1)) * 100
        const bpy = (row / (ROWS - 1)) * 100
        const haloShadow = showHalo
          ? `0 0 0 ${HALO_PX}px ${C.sage}cc, 0 0 ${HALO_PX * 2}px ${C.sage}55`
          : showResult
            ? `0 0 0 1px ${C.sage}66, 0 0 6px ${C.sage}33`
            : "none"

        return (
          <div
            key={i}
            style={{
              position: "relative",
              borderRadius: assembled ? 0 : 2,
              // background-image tiling: no <img> element, no overflow/position bugs
              backgroundImage: `url(${src})`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: `${bpx}% ${bpy}%`,
              backgroundRepeat: "no-repeat",
              boxShadow: haloShadow,
              transition: "box-shadow 0.4s ease, background-image 0.5s ease",
            }}
          >
            {/* Sage tint during halo phase */}
            {showHalo && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `${C.sage}22`,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Processing spinner */}
            {spinning && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: `2px solid ${C.sage}`,
                    borderTopColor: "transparent",
                    animation: "spin-slow 0.7s linear infinite",
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Halo annotation overlay rendered outside the grid (avoids z-index fights)
function HaloAnnotation({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div
      style={{
        position: "absolute",
        top: -36,
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
    >
    </div>
  )
}

function Slide4() {
  const [phase, setPhase] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const phases = [
    {
      label: "Full matrix",
      desc: "Single large image loaded into contiguous memory — cache-hostile access patterns at scale.",
    },
    {
      label: "Spatial partition",
      desc: "Image decomposed into a 4×4 tile grid. Each tile fits within L2 cache (typically 256–512 KB).",
    },
    {
      label: "Boundary expansion",
      desc: "Halo pixels (sage border) overlap adjacent tiles to supply context for guided-filter kernels.",
    },
    {
      label: "Parallel processing",
      desc: "ForkJoinPool dispatches one task per tile. Work-stealing ensures no thread idles while tasks remain.",
    },
    {
      label: "Enhanced result",
      desc: "Retinex + DT-CWT applied per tile. Each block now holds the enhanced luminance values — halo trimmed, gaps still visible.",
    },
    {
      label: "Seamless assembly",
      desc: "Tiles snap together into a single contiguous output frame.",
    },
  ]

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setPhase((p) => (p + 1) % phases.length)
    }, 3500)
    return () => clearTimeout(timerRef.current)
  }, [phase])

  return (
    <div
      style={{
        display: "flex",
        gap: "clamp(32px, 4.5vw, 64px)",
        height: "100%",
        width: "100%",
        alignItems: "center",
      }}
    >
      {/* ── left: enlarged title + phase description list ── */}
      <div
        style={{
          flex: "1 1 45%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "clamp(16px, 2.4vh, 28px)",
          minWidth: 0,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: C.mono,
              fontSize: "clamp(10px, 0.85vw, 13px)",
              color: C.sageDim,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Efficient Design
          </span>
          <h2
            style={{
              margin: "8px 0 0",
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#e8ede9",
              letterSpacing: "-0.04em",
              fontSize: "clamp(34px, 4.2vw, 56px)",
            }}
          >
            Multithreaded Spatial
            <br />
            <span style={{ color: C.sage }}>Tiling</span>
          </h2>
        </div>
        <div style={{ width: 48, height: 2, background: C.sage }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 1.8vh, 20px)" }}>
          {phases.map(({ label, desc }, i) => (
            <div
              key={i}
              onClick={() => setPhase(i)}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                opacity: i === phase ? 1 : 0.35,
                transition: "opacity 0.4s",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  flexShrink: 0,
                  marginTop: 2,
                  background: i === phase ? C.sage : "transparent",
                  border: `1.5px solid ${i === phase ? C.sage : C.slateDim}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: C.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  color: i === phase ? C.charcoal : C.slateDim,
                  transition: "all 0.4s",
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "clamp(14px, 1.15vw, 17px)",
                    fontWeight: 700,
                    color: i === phase ? C.slate : C.slateDim,
                    transition: "color 0.4s",
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </div>
                {i === phase && (
                  <div
                    style={{
                      fontSize: "clamp(12px, 0.92vw, 14px)",
                      color: C.slateDim,
                      lineHeight: 1.6,
                      marginTop: 4,
                    }}
                  >
                    {desc}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── right: focused tile grid presentation card ── */}
      <div
        style={{
          flex: "1 1 55%",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          alignItems: "center",
          justifyContent: "center",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 620,
            padding: "36px 32px",
            background: C.charcoalLight,
            borderRadius: 16,
            border: `1px solid ${C.oceanDim}`,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
          }}
        >
          <HaloAnnotation show={phase === 2} />
          <TileGrid phase={phase} />
        </div>

        {/* status pill footer */}
        <div
          style={{
            fontFamily: C.mono,
            fontSize: "clamp(11px, 0.88vw, 13px)",
            color: C.slateDim,
            letterSpacing: "0.06em",
            padding: "6px 20px",
            background: C.charcoalLight,
            borderRadius: 24,
            border: `1px solid ${C.charcoalMid}`,
          }}
        >
          {phase === 0 && "4096 × 3072 px · single matrix"}
          {phase === 1 && "16 tiles · 1024 × 768 px each"}
          {phase === 2 && (
            <span style={{ color: C.sage }}>
              halo boundary = ±{HALO_PX}px overlap per tile
            </span>
          )}
          {phase === 3 && "ForkJoinPool · 16 concurrent tasks"}
          {phase === 4 && (
            <span style={{ color: C.sage }}>
              16 enhanced tiles · halo trimmed · awaiting merge
            </span>
          )}
          {phase === 5 && (
            <span style={{ color: C.sage }}>seamless reconstruction ✓</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Slide 4 ───────────────────────────────────────────────────
function WipeSlider() {
  const [pos, setPos] = useState(50)
  const [paused, setPaused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const animRef = useRef<number | undefined>(undefined)
  const dirRef = useRef(1)
  const posRef = useRef(50)

  useEffect(() => {
    if (paused) {
      cancelAnimationFrame(animRef.current!)
      return
    }
    const step = () => {
      posRef.current += dirRef.current * 0.18
      if (posRef.current >= 92) dirRef.current = -1
      if (posRef.current <= 8) dirRef.current = 1
      setPos(posRef.current)
      animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current!)
  }, [paused])

  const handleMove = (clientX: number) => {
    if (!ref.current || !dragging.current) return
    const { left, width } = ref.current.getBoundingClientRect()
    const p = Math.max(5, Math.min(95, ((clientX - left) / width) * 100))
    posRef.current = p
    setPos(p)
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* pause button */}
      <button
        onClick={() => setPaused((p) => !p)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 20,
          padding: "4px 10px",
          borderRadius: 4,
          fontSize: 11,
          background: "rgba(0,0,0,0.55)",
          border: `1px solid ${C.sageDim}`,
          color: C.sage,
          cursor: "pointer",
        }}
      >
        {paused ? "▶ Resume" : "⏸ Pause"}
      </button>
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          cursor: "ew-resize",
          userSelect: "none",
          overflow: "hidden",
          borderRadius: 8,
        }}
        onMouseDown={() => {
          dragging.current = true
          setPaused(true)
        }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={() => {
          dragging.current = false
        }}
        onMouseLeave={() => {
          dragging.current = false
        }}
      >
        {/* raw — background-image anchored left so crops match exactly */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${rawImage})`,
            backgroundSize: "cover",
            backgroundPosition: "left center",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            fontFamily: C.mono,
            fontSize: 9,
            color: "#fff",
            background: "rgba(0,0,0,0.55)",
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          BEFORE · Raw capture
        </div>
        {/* enhanced — identical crop, clipped to right of slider */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 0 0 ${pos}%)`,
            backgroundImage: `url(${enhancedImage})`,
            backgroundSize: "cover",
            backgroundPosition: "left center",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            fontFamily: C.mono,
            fontSize: 9,
            color: C.sage,
            background: "rgba(0,0,0,0.55)",
            padding: "2px 6px",
            borderRadius: 3,
            zIndex: 2,
          }}
        >
          AFTER · Enhanced
        </div>
        {/* slider handle */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${pos}%`,
            width: 2,
            background: C.sage,
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: C.charcoal,
              border: `2px solid ${C.sage}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 12px ${C.sage}66`,
            }}
          >
            <span style={{ fontSize: 10, color: C.sage }}>⟺</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Slide5() {
  return (
    <div style={{ display: "flex", gap: 36, height: "100%" }}>
      <div
        style={{
          flex: "0 0 240px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: C.mono,
              fontSize: 11,
              color: C.sageDim,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Minimalist
          </span>
          <h2
            style={{
              margin: "8px 0 0",
              fontWeight: 800,
              lineHeight: 1.0,
              color: "#e8ede9",
              letterSpacing: "-0.04em",
              fontSize: "clamp(36px, 4.5vw, 64px)",
            }}
          >
            <span style={{ color: C.sage }}>Graphical</span>
            <br />
            User <br />
            Interface
          </h2>
        </div>
        <div style={{ height: 2, width: 48, background: C.sage }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {[
            {
              label: "JavaFX",
              body: "Upgraded over Java Swing for modern systems.",
            },
            {
              label: "Async Pipeline",
              body: "Background executor keeps UI fully responsive.",
            },
            {
              label: "Wipe Comparison",
              body: "Drag to compare raw vs enhanced pixel-exact.",
            },
            {
              label: "Tile Debug",
              body: "Toggle tile boundaries and halo extents.",
            },
          ].map(({ label, body }) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 12,
                  color: C.sage,
                  letterSpacing: "0.06em",
                  marginBottom: 5,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 15, color: C.slateDim, lineHeight: 1.5 }}>
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* app mockup */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          background: C.charcoalMid,
          borderRadius: 12,
          border: `1px solid ${C.oceanDim}`,
          overflow: "hidden",
        }}
      >
        {/* titlebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: C.charcoal,
            borderBottom: `1px solid ${C.oceanDim}`,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#cc5555",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#cc9933",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.sageDim,
            }}
          />
          <span
            style={{
              marginLeft: 12,
              fontFamily: C.mono,
              fontSize: 10,
              color: C.slateDim,
            }}
          >
            SPL1 1728
          </span>
        </div>
        {/* toolbar */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "8px 16px",
            background: C.charcoalLight,
            borderBottom: `1px solid ${C.oceanDim}`,
          }}
        >
          {["Open Image", "Process", "Export"].map((t, i) => (
            <div
              key={t}
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                background: i === 1 ? C.sageDim : C.charcoalMid,
                border: `1px solid ${i === 1 ? C.sage : C.oceanDim}`,
                fontFamily: C.mono,
                fontSize: 10,
                color: i === 1 ? C.sage : C.slateDim,
                cursor: "pointer",
              }}
            >
              {t}
            </div>
          ))}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.sage,
              }}
            />
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.sage }}>
              READY
            </span>
          </div>
        </div>
        {/* main viewport */}
        <div style={{ flex: 1, padding: 16, display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <WipeSlider />
          </div>
          {/* sidebar */}
          <div
            style={{
              width: 120,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {["Tiles: 4×4", "Halo: 32px", "Threads: 16", "Time: 84ms"].map(
              (s, i) => (
                <div
                  key={s}
                  style={{
                    padding: "6px 10px",
                    background: C.charcoal,
                    borderRadius: 4,
                    border: `1px solid ${C.oceanDim}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: C.mono,
                      fontSize: 9,
                      color: i === 3 ? C.sage : C.slateDim,
                    }}
                  >
                    {s}
                  </div>
                </div>
              ),
            )}
            {/* mini histogram */}
            <div
              style={{
                marginTop: 4,
                background: C.charcoal,
                borderRadius: 4,
                border: `1px solid ${C.oceanDim}`,
                padding: "6px 8px",
              }}
            >
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 9,
                  color: C.slateDim,
                  marginBottom: 4,
                }}
              >
                Luminance
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 1,
                  height: 32,
                }}
              >
                {[0.3, 0.5, 0.8, 1, 0.9, 0.75, 0.6, 0.4, 0.3, 0.2].map(
                  (h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h * 100}%`,
                        background: C.sage,
                        opacity: 0.6,
                        borderRadius: 1,
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Slide 5 ───────────────────────────────────────────────────
function BarChart() {
  const data = [
    { label: "Mono\n512×512", mono: 42, tiled: 28 },
    { label: "Mono\n1024×768", mono: 118, tiled: 68 },
    { label: "Mono\n2048×1536", mono: 410, tiled: 184 },
    { label: "Mono\n4096×3072", mono: 1820, tiled: 612 },
  ]
  const max = 1820

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: C.oceanDim,
            }}
          />
          <span style={{ fontFamily: C.mono, fontSize: 10, color: C.slateDim }}>
            Monolithic OpenCV
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: C.sage,
            }}
          />
          <span style={{ fontFamily: C.mono, fontSize: 10, color: C.slateDim }}>
            JVM Tiled (4×4)
          </span>
        </div>
      </div>
      {data.map(({ label, mono, tiled }) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <div
            style={{
              width: 80,
              fontFamily: C.mono,
              fontSize: 9,
              color: C.slateDim,
              flexShrink: 0,
              lineHeight: 1.3,
            }}
          >
            {label.split("\n").map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* mono bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: `${(mono / max) * 100}%`,
                  height: 14,
                  background: C.oceanDim,
                  borderRadius: 2,
                  transition: "width 0.8s ease",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 4,
                    top: 1,
                    fontFamily: C.mono,
                    fontSize: 9,
                    color: C.slate,
                    whiteSpace: "nowrap",
                  }}
                >
                  {mono}ms
                </div>
              </div>
            </div>
            {/* tiled bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: `${(tiled / max) * 100}%`,
                  height: 14,
                  background: C.sage,
                  borderRadius: 2,
                  transition: "width 0.8s ease",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 4,
                    top: 1,
                    fontFamily: C.mono,
                    fontSize: 9,
                    color: C.charcoal,
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                  }}
                >
                  {tiled}ms
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              width: 44,
              fontFamily: C.mono,
              fontSize: 10,
              color: C.sage,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {Math.round((mono / tiled) * 10) / 10}×
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: 4,
          borderTop: `1px solid ${C.oceanDim}`,
          paddingTop: 8,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {[0, 500, 1000, 1500, "1820ms"].map((v, i) => (
            <span
              key={i}
              style={{ fontFamily: C.mono, fontSize: 9, color: C.slateDim }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Slide6() {
  // Gantt data: each row has a label, description, and [start, end] as fractions of the 5-column grid
  // Columns: Sep | Oct (early) | Oct (mid) | Nov | Dec
  // col indices 0-4 → 5 equal segments
  const ganttRows = [
    {
      label: "Setup & Pre-reqs",
      desc: "Repository, DT-CWT, Retinex, OpenCV",
      start: 0,
      end: 1,
      done: true,
    },
    {
      label: "Core Algorithm",
      desc: "Java impl + Terminal usability",
      start: 0,
      end: 2,
      done: false,
    },
    {
      label: "GUI",
      desc: "JavaFX interface + wipe-slider view",
      start: 1,
      end: 3,
      done: false,
    },
    {
      label: "Tiling Engine",
      desc: "4×4 ForkJoinPool parallelisation",
      start: 2,
      end: 4,
      done: false,
    },
    {
      label: "Tests & Bench.",
      desc: "Performance review",
      start: 1,
      end: 5,
      done: false,
    },
  ]
  const colHeaders = [
    "Sep",
    "Oct (mid)",
    "Nov (early)",
    "Nov (late)",
    "December",
  ]
  const statCards = [
    { num: "5", label: "Milestones" },
    { num: "3", label: "Months" },
    { num: "4×4", label: "Tile Grid" },
    { num: "Java", label: "OpenCV" },
  ]

  return (
    <div style={{ height: "100%", display: "flex", gap: 40, minHeight: 0 }}>
      {/* LEFT: Gantt chart */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* heading */}
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              margin: "6px 0 0",
              fontWeight: 800,
              fontSize: "clamp(30px, 4vw, 56px)",
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              color: "#e8ede9",
            }}
          >
            Expected
            <br />
            <span style={{ color: C.sage }}>Timeline</span>
          </h2>
        </div>

        {/* column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: 0,
            marginBottom: 6,
          }}
        >
          <div />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 3,
            }}
          >
            {colHeaders.map((h) => (
              <div
                key={h}
                style={{
                  fontFamily: C.mono,
                  fontSize: 11,
                  color: C.slateDim,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  paddingBottom: 6,
                }}
              >
                {h}
              </div>
            ))}
          </div>
        </div>

        {/* divider */}
        <div
          style={{ height: 1, background: C.charcoalMid, marginBottom: 8 }}
        />

        {/* rows */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            justifyContent: "space-evenly",
          }}
        >
          {ganttRows.map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 0,
                alignItems: "center",
              }}
            >
              {/* label */}
              <div style={{ paddingRight: 12 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: row.done ? C.sage : C.slate,
                    lineHeight: 1.2,
                  }}
                >
                  {row.label}
                </div>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 10,
                    color: C.slateDim,
                    marginTop: 2,
                    lineHeight: 1.3,
                  }}
                >
                  {row.desc}
                </div>
              </div>
              {/* bar track */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 3,
                  height: 32,
                }}
              >
                {Array.from({ length: 5 }, (_, ci) => {
                  const active = ci >= row.start && ci < row.end
                  return (
                    <div
                      key={ci}
                      style={{
                        borderRadius: 4,
                        background: active
                          ? row.done
                            ? C.sage
                            : C.sageDim
                          : C.charcoalMid,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {active && row.done && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
                          }}
                        />
                      )}
                      {active && !row.done && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: `linear-gradient(90deg, ${C.sageDim} 0%, rgba(90,138,82,0.6) 100%)`,
                            borderRadius: 4,
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* divider */}
        <div
          style={{ height: 1, background: C.charcoalMid, margin: "12px 0" }}
        />

        {/* learning outcomes */}
        <div>
          <div
            style={{
              fontFamily: C.mono,
              fontSize: 10,
              color: C.sageDim,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Learning Outcomes
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {["OpenCV", "JavaFX", "ForkJoinPool"].map((tech, i) => (
              <div
                key={tech}
                style={{
                  background: i === 2 ? C.sageFaint : C.charcoalLight,
                  border: `1px solid ${i === 2 ? C.sageDim : C.charcoalMid}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "clamp(16px, 2vw, 24px)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: i === 2 ? C.sage : "#e8ede9",
                  }}
                >
                  {tech}
                </div>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 11,
                    color: C.slateDim,
                    marginTop: 4,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {i === 0
                    ? "Image Processing"
                    : i === 1
                      ? "GUI Framework"
                      : "Parallel Tiles"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: thank you */}
      <div
        style={{
          width: "32%",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            background: C.charcoalLight,
            border: `1px solid ${C.charcoalMid}`,
            borderRadius: 14,
            padding: "40px 32px",
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              fontWeight: 800,
              fontSize: "clamp(40px, 5vw, 68px)",
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              color: C.sage,
            }}
          >
            Thank
            <br />
            You.
          </h2>
          <div
            style={{
              fontFamily: C.sans,
              fontSize: 15,
              color: C.slateDim,
              marginBottom: 16,
              letterSpacing: "-0.01em",
            }}
          >
            Questions welcome.
          </div>
          <div
            style={{
              height: 1,
              background: C.charcoalMid,
              width: "100%",
              margin: "16px 0",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Student", value: "Md. Rakinuzzaman Talukder" },
              { label: "Roll", value: "1728" },
              { label: "Supervisor", value: "Dr. Zerina Begum" },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    fontFamily: C.mono,
                    fontSize: 10,
                    color: C.slateDim,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    minWidth: 76,
                    paddingTop: 2,
                  }}
                >
                  {label}
                </span>
                <span style={{ fontSize: 13, color: C.slate, lineHeight: 1.4 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shell ─────────────────────────────────────────────────────
const slides = [
  { component: Slide1, title: "Title & Problem" },
  { component: Slide2, title: "Algorithm & Architecture" },
  { component: Slide4, title: "Tiling Engine" },
  { component: Slide5, title: "Interactive Workspace" },
  { component: Slide6, title: "Timeline & Thank You" },
]

export default function App() {
  const [current, setCurrent] = useState(0)
  const SlideComponent = slides[current].component
  const wheelCooldown = useRef(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setCurrent((p) => Math.min(p + 1, slides.length - 1))
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setCurrent((p) => Math.max(p - 1, 0))
    }
    const onWheel = (e: WheelEvent) => {
      if (wheelCooldown.current) return
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(delta) < 20) return
      wheelCooldown.current = true
      setTimeout(() => { wheelCooldown.current = false }, 600)
      if (delta > 0) setCurrent((p) => Math.min(p + 1, slides.length - 1))
      else setCurrent((p) => Math.max(p - 1, 0))
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("wheel", onWheel, { passive: true })
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("wheel", onWheel)
    }
  }, [])

  return (
    <div
      style={{
        height: "100vh",
        background: C.charcoal,
        display: "flex",
        fontFamily: C.sans,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes fadeInUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* slide content — full viewport, paddingBottom reserves space for buttons */}
      <div
        key={current}
        style={{
          flex: 1,
          padding: "36px 56px 80px",
          display: "flex",
          flexDirection: "column",
          animation: "fadeInUp 0.35s ease forwards",
        }}
      >
        <SlideComponent />
      </div>

      {/* prev / next — bottom right, editorial style */}
      <div
        style={{
          position: "fixed",
          bottom: 28,
          right: 56,
          display: "flex",
          gap: 10,
          zIndex: 50,
          alignItems: "center",
        }}
      >
        {/* slide counter */}
        <span
          style={{
            fontFamily: C.mono,
            fontSize: 10,
            color: C.slateDim,
            letterSpacing: "0.1em",
            marginRight: 6,
          }}
        >
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </span>

        <button
          onClick={() => setCurrent((p) => Math.max(p - 1, 0))}
          disabled={current === 0}
          style={{
            padding: "8px 20px",
            borderRadius: 6,
            border: `1px solid ${current === 0 ? C.charcoalMid : C.charcoalMid
              }`,
            background: current === 0 ? "transparent" : C.charcoalLight,
            color: current === 0 ? C.charcoalMid : C.slateDim,
            fontFamily: C.mono,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.06em",
            cursor: current === 0 ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          ← PREV
        </button>

        <button
          onClick={() => setCurrent((p) => Math.min(p + 1, slides.length - 1))}
          disabled={current === slides.length - 1}
          style={{
            padding: "8px 20px",
            borderRadius: 6,
            border: `1px solid ${current === slides.length - 1 ? C.charcoalMid : C.sage
              }`,
            background: current === slides.length - 1 ? "transparent" : C.sage,
            color: current === slides.length - 1 ? C.charcoalMid : C.charcoal,
            fontFamily: C.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: current === slides.length - 1 ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          NEXT →
        </button>
      </div>
    </div>
  )
}

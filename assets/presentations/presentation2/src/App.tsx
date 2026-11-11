import React, { useState, useEffect, useRef } from "react"

// ── Images ──────────────────────────────────────────────────
import rawImage from "./assets/raw-image.jpg"
import benchmarkAuthor from "./assets/benchmark-author.jpg"
import channelH from "./assets/channel_H_hue.jpg"
import channelS from "./assets/channel_S_saturation.jpg"
import channelV from "./assets/channel_V_value.jpg"
import diffRgbHsv from "./assets/diff_rgb_vs_hsv_x10.jpg"
import enhancedDirectRgb from "./assets/enhanced_direct_rgb.jpg"
import enhancedHsvV from "./assets/enhanced_hsv_V_only.jpg"

import ssr15 from "./assets/ssr_sigma_15.jpg"
import ssr80 from "./assets/ssr_sigma_80.jpg"
import ssr250 from "./assets/ssr_sigma_250.jpg"
import msrOutput from "./assets/msr_output.jpg"
import stockhamLog from "./assets/stockham_global_log_mapped.jpg"

import guidedRetinex from "./assets/guided_retinex.jpg"
import haloDiff from "./assets/halo_comparison_diff_x5.jpg"
import localAdaptive from "./assets/local_adaptive_tone_mapped.jpg"

import subbandH1 from "./assets/subband_high_1_+15deg.jpg"
import subbandH2 from "./assets/subband_high_2_-15deg.jpg"
import subbandH3 from "./assets/subband_high_3_+45deg.jpg"
import subbandH4 from "./assets/subband_high_4_-45deg.jpg"
import subbandH5 from "./assets/subband_high_5_+75deg.jpg"
import subbandH6 from "./assets/subband_high_6_-75deg.jpg"
import subbandLReal from "./assets/subband_low_real.jpg"
import subbandLImag from "./assets/subband_low_imag.jpg"
import denoisedRecon from "./assets/denoised_reconstructed.jpg"
import strippedNoise from "./assets/stripped_noise_x10.jpg"

import pipelineOutput from "./assets/enhanced_pipeline_output.jpg"

// ── Design Tokens ─────────────────────────────────────────────
const C = {
  charcoal: "#171c18",
  charcoalLight: "#1f2620",
  charcoalMid: "#2c3530",
  charcoalCard: "#1b221c",
  sage: "#9dcc80",
  sageLight: "#bfe6a3",
  sageDim: "#5a8a52",
  sageFaint: "rgba(157,204,128,0.12)",
  ocean: "#4a6b7c",
  oceanLight: "#6a8b9c",
  oceanDim: "#2e4450",
  oceanFaint: "rgba(74,107,124,0.18)",
  amber: "#e5c07b",
  amberFaint: "rgba(229,192,123,0.15)",
  ruby: "#e06c75",
  rubyFaint: "rgba(224,108,117,0.15)",
  cyan: "#56b6c2",
  slate: "#d4d9d5",
  slateDim: "#7a8c80",
  mono: "Roboto Mono, monospace",
  sans: "Inter, system-ui, sans-serif",
}

// ── Interactive Split Slider ──────────────────────────────────
function SplitSlider({
  leftImage,
  rightImage,
  leftLabel = "RAW INPUT",
  rightLabel = "ENHANCED OUTPUT",
}: {
  leftImage: string
  rightImage: string
  leftLabel?: string
  rightLabel?: string
}) {
  const [pos, setPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasInteracted) return
    let animFrame: number
    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000 // seconds
      // Smooth sinusoidal oscillation between 20% and 80% (period ~4s)
      const newPos = 50 + 28 * Math.sin((elapsed * 2 * Math.PI) / 4)
      setPos(newPos)
      animFrame = requestAnimationFrame(animate)
    }

    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [hasInteracted])

  const updatePos = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPos((x / rect.width) * 100)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setHasInteracted(true)
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    updatePos(e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    updatePos(e.clientX)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${C.oceanDim}`,
        cursor: "ew-resize",
        touchAction: "none",
        backgroundColor: "#000",
        userSelect: "none",
      }}
    >
      {/* Right Image (Enhanced / Result) */}
      <img
        src={rightImage}
        alt={rightLabel}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

      {/* Left Image (Raw / Baseline clipped with pure CSS clip-path) */}
      <img
        src={leftImage}
        alt={leftLabel}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          clipPath: `inset(0 ${100 - pos}% 0 0)`,
          pointerEvents: "none",
        }}
      />

      {/* Divider Vertical Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          width: 2,
          background: C.sage,
          boxShadow: "0 0 10px rgba(0,0,0,0.85)",
          pointerEvents: "none",
          zIndex: 6,
        }}
      />

      {/* Divider Handle */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${pos}%`,
          transform: "translate(-50%, -50%)",
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: C.charcoal,
          border: `2px solid ${C.sage}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.sage,
          boxShadow: "0 0 12px rgba(0,0,0,0.8)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: "bold" }}>↔</span>
      </div>

      {/* Labels */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 14,
          fontFamily: C.mono,
          fontSize: 10,
          color: "#fff",
          background: "rgba(0,0,0,0.7)",
          padding: "3px 8px",
          borderRadius: 4,
          border: `1px solid ${C.charcoalMid}`,
          zIndex: 5,
        }}
      >
        {leftLabel}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 14,
          fontFamily: C.mono,
          fontSize: 10,
          color: C.sage,
          background: "rgba(0,0,0,0.7)",
          padding: "3px 8px",
          borderRadius: 4,
          border: `1px solid ${C.sageDim}`,
          zIndex: 5,
        }}
      >
        {rightLabel}
      </div>
    </div>
  )
}

// ── Slide 1: Introduction ─────────────────────────────────────
function Slide1() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Main two-column content */}
      <div style={{ flex: 1, display: "flex", gap: 36, minHeight: 0 }}>
        {/* Left: Project title & presentation context */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              fontSize: "clamp(24px, 3.8vw, 54px)",
              color: "#e8ede9",
            }}
          >
            Implementation
            <br />& Tiled Parallelization
            <br />
            of{" "}
            <span style={{ color: C.sage }}>
              Retinex and
              <br />
              DT-CWT
            </span>{" "}
            Based
            <br />
            Low-Light Image
            <br />
            Enhancement
          </h1>

          {/* Subtitle / Focus */}
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.5,
              color: C.slateDim,
              maxWidth: 480,
            }}
          >
            Mid-Term Presentation
          </p>

          {/* Student particulars */}
          <div style={{ display: "flex", gap: 36, alignItems: "center", marginTop: 4 }}>
            {[
              { label: "Prepared by", value: "Md. Rakinuzzaman Talukder" },
              { label: "Roll", value: "BSSE 1728" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 10,
                    color: C.slateDim,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.slate }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Interactive Split Viewer showing Phase 5 vs Raw */}
        <div
          style={{
            width: "55%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <SplitSlider
              leftImage={rawImage}
              rightImage={pipelineOutput}
              leftLabel="RAW INPUT"
              rightLabel="ENHANCED OUTPUT"
            />
          </div>
        </div>
      </div>

      {/* Bottom meta banner */}
      <div
        style={{
          marginTop: 18,
          background: C.charcoalLight,
          border: `1px solid ${C.charcoalMid}`,
          borderRadius: 10,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 36, alignItems: "baseline" }}>
          <div>
            <span
              style={{
                fontFamily: C.mono,
                fontSize: 10,
                color: C.slateDim,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginRight: 8,
              }}
            >
              Supervised by
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.slate }}>
              Dr. Zerina Begum
            </span>
          </div>
          <div>
            <span
              style={{
                fontFamily: C.mono,
                fontSize: 10,
                color: C.slateDim,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginRight: 8,
              }}
            >
              Course
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.slate }}>
              SE 2105 — Software Project Lab 1
            </span>
          </div>
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 11, color: C.sageDim }}>
          IIT, University of Dhaka
        </div>
      </div>
    </div>
  )
}

// ── Slide 2: Timeline & Evolution of Plans ────────────────────
function Slide2() {
  const months = [
    { name: "September", sub: "" },
    { name: "October", sub: "" },
    { name: "November (Early)", sub: "" },
    { name: "November (Late)", sub: "" },
    { name: "December", sub: "" },
  ]

  const ganttRows = [
    {
      label: "Environment & Setup",
      desc: "Java 21, OpenCV 4.9.0 native extraction, Maven wrapper & smoke test",
      start: 0,
      end: 1,
      type: "done",
      tag: "",
    },
    {
      label: "Core Algorithm (Retinex + DT-CWT)",
      desc: "Decomposed into 5 mathematical proofs • Calibrated to 0.24 MAE",
      start: 0,
      end: 3,
      type: "done",
      tag: "COMPLETED (5 PHASES)",
    },
    {
      label: "GUI (JavaFX Desktop Application)",
      desc: "Async wipe-slider viewer • Shifted after Tiling Engine to avoid UI freeze",
      start: 1,
      end: 3,
      rescheduledStart: 3,
      rescheduledEnd: 5,
      type: "rescheduled",
      tag: "RE-SCHEDULED",
    },
    {
      label: "Spatial Tiling Engine",
      desc: "4×4 block partitioning, ±16px halo overlap, ForkJoinPool CPU concurrency",
      start: 2,
      end: 4,
      type: "active",
      tag: "IN PROGRESS",
    },
    {
      label: "Tests & Benchmarking",
      desc: "Monolithic vs tiled RAM profile, latency benchmarking from 512px to 4K",
      start: 3,
      end: 5,
      type: "planned",
      tag: "PLANNED",
    },
  ]

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Slide Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(20px, 2.4vw, 30px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#e8ede9",
            }}
          >
            Roadmap & <span style={{ color: C.sage }}>Progress</span>
          </h2>
          
        </div>
      </div>

      {/* Main Full-Width Gantt Chart */}
      <div
        style={{
          flex: 1,
          background: C.charcoalLight,
          border: `1px solid ${C.charcoalMid}`,
          borderRadius: 10,
          padding: "18px 24px",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* Column Headers (Months) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 16,
            alignItems: "flex-end",
            paddingBottom: 10,
            borderBottom: `1px solid ${C.charcoalMid}`,
            marginBottom: 12,
          }}
        >
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.slateDim, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Milestones & Deliverables
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {months.map((m, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: idx >= 3 ? "#f59e0b" : C.slate,
                    letterSpacing: "0.02em",
                  }}
                >
                  {m.name}
                </div>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 9.5,
                    color: idx >= 3 ? "rgba(245,158,11,0.8)" : C.slateDim,
                    marginTop: 2,
                  }}
                >
                  {m.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Rows */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 0,
          }}
        >
          {ganttRows.map((r, i) => {
            const isGuiRow = r.type === "rescheduled"

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "260px 1fr",
                  gap: 16,
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {/* Milestone Details (Left) */}
                <div style={{ paddingRight: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color:
                          r.type === "done"
                            ? C.sage
                            : isGuiRow
                            ? "#f59e0b"
                            : r.type === "active"
                            ? C.amber
                            : C.slate,
                      }}
                    >
                      {r.label}
                    </span>
                  </div>
                  
                </div>

                {/* Milestone Track (Right) */}
                <div
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 6,
                    height: 34,
                  }}
                >
                  {/* SVG Arc Arrow specifically overlaying the JavaFX row */}
                  {isGuiRow && (
                    <div
                      style={{
                        position: "absolute",
                        top: -30,
                        left: 0,
                        right: 0,
                        height: 34,
                        pointerEvents: "none",
                        zIndex: 25,
                      }}
                    >
                      <svg
                        style={{
                          width: "100%",
                          height: "100%",
                          overflow: "visible",
                        }}
                      >
                        <defs>
                          <marker
                            id="orange-arrowhead"
                            viewBox="0 0 10 10"
                            refX="6"
                            refY="5"
                            markerWidth="5"
                            markerHeight="5"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
                          </marker>
                        </defs>
                        {/* Curved Arc Arrow from Red Lagging region (~30%) to Orange Rescheduled region (~78%) */}
                        <path
                          d="M 30% 30 Q 55% -8 78% 24"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="5,3"
                          fill="none"
                          markerEnd="url(#orange-arrowhead)"
                        />
                      </svg>
                  
                    </div>
                  )}

                  {/* 5 Month Blocks */}
                  {Array.from({ length: 5 }).map((_, c) => {
                    if (isGuiRow) {
                      const isRedLag = c === 1 || c === 2
                      const isOrangeRescheduled = c === 3 || c === 4

                      return (
                        <div
                          key={c}
                          style={{
                            borderRadius: 4,
                            background: isRedLag
                              ? "rgba(224, 108, 117, 0.85)"
                              : isOrangeRescheduled
                              ? "rgba(245, 158, 11, 0.9)"
                              : C.charcoalMid,
                            border: isRedLag
                              ? "1.5px solid #ff7b72"
                              : isOrangeRescheduled
                              ? "1.5px solid #fbbf24"
                              : `1px solid ${C.charcoalMid}`,
                            boxShadow: isRedLag
                              ? "0 0 10px rgba(224,108,117,0.4)"
                              : isOrangeRescheduled
                              ? "0 0 12px rgba(245,158,11,0.45)"
                              : "none",
                            opacity: isRedLag || isOrangeRescheduled ? 1 : 0.2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {isRedLag && (
                            <>
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background:
                                    "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.2) 5px, rgba(0,0,0,0.2) 10px)",
                                }}
                              />
                              <span
                                style={{
                                  position: "relative",
                                  fontFamily: C.mono,
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  color: "#fff",
                                  letterSpacing: "0.04em",
                                }}
                              >
                        
                              </span>
                            </>
                          )}
                          {isOrangeRescheduled && (
                            <span
                              style={{
                                position: "relative",
                                fontFamily: C.mono,
                                fontSize: 9.5,
                                fontWeight: 800,
                                color: "#000",
                                letterSpacing: "0.03em",
                              }}
                            >
                              
                            </span>
                          )}
                        </div>
                      )
                    }

                    // Standard Rows
                    const active = c >= r.start && c < r.end
                    return (
                      <div
                        key={c}
                        style={{
                          borderRadius: 4,
                          background: active
                            ? r.type === "done"
                              ? "linear-gradient(135deg, #7aab60 0%, #5a8a52 100%)"
                              : r.type === "active"
                              ? "linear-gradient(135deg, #d99a26 0%, #a46d14 100%)"
                              : C.oceanDim
                            : C.charcoalMid,
                          border: active
                            ? r.type === "done"
                              ? `1px solid ${C.sage}`
                              : r.type === "active"
                              ? `1px solid ${C.amber}`
                              : `1px solid ${C.ocean}`
                            : `1px solid ${C.charcoalMid}`,
                          boxShadow:
                            active && r.type === "done"
                              ? "0 0 10px rgba(157,204,128,0.25)"
                              : active && r.type === "active"
                              ? "0 0 10px rgba(229,192,123,0.3)"
                              : "none",
                          opacity: active ? 1 : 0.2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        {active && r.type === "done" && (
                          <span
                            style={{
                              fontFamily: C.mono,
                              fontSize: 9.5,
                              fontWeight: 800,
                              color: "#fff",
                              letterSpacing: "0.04em",
                            }}
                          >
  
                          </span>
                        )}
                        {active && r.type === "active" && (
                          <span
                            style={{
                              fontFamily: C.mono,
                              fontSize: 9.5,
                              fontWeight: 800,
                              color: "#fff",
                              letterSpacing: "0.04em",
                            }}
                          >
                            
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

     
    </div>
  )
}

// ── Slide 3: Engineering Architecture & Usage Guide ───────────
function Slide3() {
  const [activeTab, setActiveTab] = useState<"directory" | "cli">("directory")
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string>("ColorSpaceExperiment.java")
  const [userSelected, setUserSelected] = useState<boolean>(false)

  const fileList = [
    "ColorSpaceExperiment.java",
    "DiffInspector.java",
    "RetinexExperiment.java",
    "GuidedFilter.java",
    "GuidedFilterExperiment.java",
    "DualTreeCWT.java",
    "DtCwtExperiment.java",
    "EnhancementPipeline.java",
    "Main.java",
  ]

  useEffect(() => {
    if (userSelected || activeTab !== "directory") return
    const timer = setInterval(() => {
      setSelectedFile((prev) => {
        const nextIdx = (fileList.indexOf(prev) + 1) % fileList.length
        return fileList[nextIdx]
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [userSelected, activeTab])

  // Directory Tree
  const fileDetails: Record<string, { role: string; loc: number; desc: string; phase: string }> = {
    "EnhancementPipeline.java": {
      phase: "Phase 5",
      role: "Core Pipeline Engine",
      loc: 185,
      desc: "Encapsulates end-to-end low-light enhancement, full-res gain map modulation, and auto-contrast floor clamping.",
    },
    "DualTreeCWT.java": {
      phase: "Phase 4",
      role: "Wavelet Filter Banks",
      loc: 240,
      desc: "Kingsbury 5/7 Hilbert tap pairs, row-column separable 2D decomposition into 2 low-pass and 6 directional high-pass bands.",
    },
    "GuidedFilter.java": {
      phase: "Phase 3",
      role: "Edge-Preserving Filter",
      loc: 110,
      desc: "Pure Java/OpenCV O(N) linear-time box-filter Guided Filter eliminating halo artifacts across contrast boundaries.",
    },
    "Main.java": {
      phase: "Phase 5",
      role: "CLI Application Entry",
      loc: 60,
      desc: "Standard command line entry point supporting custom input/output image paths with timing diagnostics.",
    },
    "ColorSpaceExperiment.java": {
      phase: "Phase 1",
      role: "HSV Decomposition Harness",
      loc: 75,
      desc: "Extracts H, S, V channels and demonstrates color distortion of direct RGB scaling vs V-channel modulation.",
    },
    "RetinexExperiment.java": {
      phase: "Phase 2",
      role: "Gaussian Retinex & Tone Map",
      loc: 130,
      desc: "Implements SSR (15, 80, 250), MSR, and Stockham global log tone mapping, demonstrating Gaussian edge halos.",
    },
    "GuidedFilterExperiment.java": {
      phase: "Phase 3",
      role: "Halo Elimination Benchmark",
      loc: 105,
      desc: "Executes guided Retinex and generates amplified halo difference comparison against Gaussian blur.",
    },
    "DtCwtExperiment.java": {
      phase: "Phase 4",
      role: "Wavelet Denoising Runner",
      loc: 145,
      desc: "Validates perfect reconstruction (MAE ~10^-8), soft-thresholding on 6 subbands, and strips high-frequency sensor noise.",
    },
    "DiffInspector.java": {
      phase: "Phase 1",
      role: "Diagnostic Matrix Inspector",
      loc: 65,
      desc: "Computes pixel-wise absolute difference maps (x10 amplified) and cumulative channel discrepancies.",
    },
    "JOURNAL.md": {
      phase: "Phases 0–5",
      role: "Comprehensive Research Log",
      loc: 405,
      desc: "400+ lines of mathematical derivations, error diagnoses, empirical observations, and benchmark comparisons.",
    },
    "README.md": {
      phase: "Project",
      role: "Documentation & Progress Table",
      loc: 108,
      desc: "Project overview, milestone status table, system requirements, and comprehensive Maven execution commands.",
    },
  }

  // CLI Commands
  const cliGuides = [
    {
      title: "1. Run Default Production Pipeline (Phase 5)",
      desc: "Processes assets/test_images/raw-image.jpg into assets/results/phase5/enhanced_pipeline_output.jpg",
      cmd: ".\\mvnw compile exec:java",
      bashCmd: "./mvnw compile exec:java",
    },
    {
      title: "2. Run Pipeline with Custom Input & Output Paths",
      desc: "Pass arbitrary input image and destination target via -Dexec.args",
      cmd: '.\\mvnw compile exec:java -Dexec.args="path/to/raw.jpg path/to/output.jpg"',
      bashCmd: './mvnw compile exec:java -Dexec.args="path/to/raw.jpg path/to/output.jpg"',
    },
    {
      title: "3. Run Phase 4 DT-CWT Decomposition & Denoising",
      desc: "Exports all 8 subbands, stripped noise map (x10), and validates reconstruction",
      cmd: '.\\mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.DtCwtExperiment"',
      bashCmd: './mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.DtCwtExperiment"',
    },
    {
      title: "4. Run Phase 3 Guided Filter & Halo Comparison",
      desc: "Generates Guided Retinex and computes x5 halo discrepancy against Gaussian SSR",
      cmd: '.\\mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.GuidedFilterExperiment"',
      bashCmd: './mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.GuidedFilterExperiment"',
    },
    {
      title: "5. Run Phase 2 Gaussian Retinex (SSR/MSR) & Tone Map",
      desc: "Executes multi-scale Retinex (σ=15,80,250) and Stockham global logarithmic mapping",
      cmd: '.\\mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.RetinexExperiment"',
      bashCmd: './mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.RetinexExperiment"',
    },
    {
      title: "6. Run Phase 1 HSV vs RGB Color Space Analysis",
      desc: "Separates H, S, V channels and demonstrates highlight clipping on direct RGB",
      cmd: '.\\mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.ColorSpaceExperiment"',
      bashCmd: './mvnw compile exec:java -Dexec.mainClass="com.rakin.se2105.ColorSpaceExperiment"',
    },
  ]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCmd(text)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  const handleSlide3DoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("input") || target.closest("code")) return
    setActiveTab((prev) => (prev === "directory" ? "cli" : "directory"))
  }

  return (
    <div onDoubleClick={handleSlide3DoubleClick} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(20px, 2.5vw, 32px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#e8ede9",
            }}
          >
            Directory Architecture &amp; Usage Guide
          </h2>
        </div>

        {/* Top Feature Tabs */}
        <div style={{ display: "flex", gap: 6, background: C.charcoalLight, padding: 3, borderRadius: 6, border: `1px solid ${C.charcoalMid}` }}>
          {[
            { id: "directory", label: "Interactive Directory" },
            { id: "cli", label: "CLI Usage Guide" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: "6px 14px",
                borderRadius: 4,
                border: "none",
                background: activeTab === t.id ? C.sage : "transparent",
                color: activeTab === t.id ? C.charcoal : C.slateDim,
                fontFamily: C.mono,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feature Container */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {/* ── TAB 1: Animated Directory Tree ─────────────────── */}
        {activeTab === "directory" && (
          <div style={{ height: "100%", display: "flex", gap: 24 }}>
            {/* Left: Tree View */}
            <div
              style={{
                width: 360,
                flexShrink: 0,
                background: C.charcoalLight,
                border: `1px solid ${C.charcoalMid}`,
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 700, color: C.slate }}>
                  PROJECT TREE
                </span>
                {userSelected ? (
                  <button
                    onClick={() => setUserSelected(false)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: 3,
                      border: `1px solid ${C.sage}`,
                      background: C.sageFaint,
                      color: C.sage,
                      fontFamily: C.mono,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>▶</span> RESUME
                  </button>
                ) : (
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.sageDim, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sage, display: "inline-block" }} />
                    
                  </span>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  fontFamily: C.mono,
                  fontSize: 11,
                  lineHeight: 1.6,
                }}
              >
                {/* Root Folders */}
                <div style={{ color: C.slateDim, marginBottom: 4 }}>▾ src/main/java/com/rakin/se2105/</div>
                <div style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    ["ColorSpaceExperiment.java", "DiffInspector.java"],
                    ["RetinexExperiment.java"],
                    ["GuidedFilter.java", "GuidedFilterExperiment.java"],
                    ["DualTreeCWT.java", "DtCwtExperiment.java"],
                    ["EnhancementPipeline.java"],
                    ["Main.java"],
                  ].map((group, gIdx) => (
                    <div
                      key={gIdx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        background: group.length > 1 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                        borderLeft: group.length > 1 ? `2px solid ${C.oceanDim}` : "none",
                        paddingLeft: group.length > 1 ? 6 : 0,
                      }}
                    >
                      {group.map((f) => {
                        const isSel = selectedFile === f
                        return (
                          <div
                            key={f}
                            onClick={() => {
                              setSelectedFile(f)
                              setUserSelected(true)
                            }}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 4,
                              cursor: "pointer",
                              background: isSel ? C.sageFaint : "transparent",
                              color: isSel ? C.sage : C.slate,
                              border: `1px solid ${isSel ? C.sageDim : "transparent"}`,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              transition: "all 0.15s",
                            }}
                          >
                            <span style={{ color: isSel ? C.sage : C.oceanLight, fontSize: 10 }}>☕</span>
                            <span>{f}</span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>

                <div style={{ color: C.slateDim, marginTop: 10, marginBottom: 4 }}>▾ assets/</div>
                <div style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ color: C.slateDim, fontSize: 10 }}>▸ results/ (phase1 – phase5)</div>
                  <div style={{ color: C.slateDim, fontSize: 10 }}>▸ test_images/ (raw-image.jpg)</div>
                  <div style={{ color: C.slateDim, fontSize: 10 }}>▸ docs/Matlab/ (author ref)</div>
                </div>

                <div style={{ color: C.slateDim, marginTop: 10, marginBottom: 4 }}>▾ documentation & build</div>
                <div style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 2 }}>
                  {["JOURNAL.md", "README.md"].map((f) => (
                    <div
                      key={f}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        color: C.slateDim,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        userSelect: "none",
                      }}
                    >
                      <span style={{ color: C.slateDim, fontSize: 10 }}>📄</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  <div style={{ padding: "3px 8px", color: C.slateDim, display: "flex", alignItems: "center", gap: 6, userSelect: "none" }}>
                    <span style={{ color: C.oceanLight, fontSize: 10 }}>⚙</span>
                    <span>pom.xml (JDK 21 + OpenCV 4.9.0)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: File Details Inspector */}
            <div
              style={{
                flex: 1,
                background: C.charcoalLight,
                border: `1px solid ${C.charcoalMid}`,
                borderRadius: 10,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>
                  {selectedFile}
                </h3>
              </div>

              <div>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: C.sageDim, textTransform: "uppercase", marginBottom: 6 }}>
                  Technical Responsibility & Purpose:
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: C.slate }}>
                  {fileDetails[selectedFile]?.desc}
                </p>
              </div>

              {/* UML Class Diagram */}
              <div
                style={{
                  flex: 1,
                  marginTop: 16,
                  background: C.charcoalCard,
                  border: `1px solid ${C.charcoalMid}`,
                  borderRadius: 8,
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 700, color: C.oceanLight, letterSpacing: "0.06em" }}>
                    UML CLASS DIAGRAM
                  </span>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, width: "100%", height: "100%" }}>
                  <svg viewBox="0 0 920 360" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%" }}>
                    <defs>
                      <marker id="uml-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 9 5 L 0 9 z" fill={C.oceanLight} />
                      </marker>
                      <marker id="uml-nest" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <polygon points="1 6, 6 1, 11 6, 6 11" fill="none" stroke={C.sage} strokeWidth="1.5" />
                      </marker>
                    </defs>

                    {/* ColorSpaceExperiment.java */}
                    {selectedFile === "ColorSpaceExperiment.java" && (
                      <g transform="translate(240, 80)">
                        <rect width="440" height="200" rx="6" fill="#171c18" stroke={C.sage} strokeWidth={2} />
                        <line x1="0" y1="42" x2="440" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                        <text x="220" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">ColorSpaceExperiment</text>
                        <text x="20" y="70" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>-INPUT_PATH: String = &quot;assets/...&quot;</text>
                        <line x1="0" y1="90" x2="440" y2="90" stroke={C.charcoalMid} strokeWidth="1.5" />
                        <text x="20" y="120" fill={C.slate} fontSize="13" fontFamily={C.mono}>+main(args: String[]): void</text>
                        <text x="20" y="148" fill={C.slate} fontSize="13" fontFamily={C.mono}>-runRgbScale(img: Mat): Mat</text>
                        <text x="20" y="176" fill={C.slate} fontSize="13" fontFamily={C.mono}>-runHsvVChannel(img: Mat): Mat</text>
                      </g>
                    )}

                    {/* DiffInspector.java */}
                    {selectedFile === "DiffInspector.java" && (
                      <g>
                        <g transform="translate(30, 80)">
                          <rect width="380" height="200" rx="6" fill="#171c18" stroke={C.sage} strokeWidth={2} />
                          <line x1="0" y1="42" x2="380" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="190" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">DiffInspector</text>
                          <line x1="0" y1="64" x2="380" y2="64" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="20" y="100" fill={C.slate} fontSize="13" fontFamily={C.mono}>+main(args: String[]): void</text>
                          <text x="20" y="132" fill={C.slate} fontSize="13" fontFamily={C.mono}>-computeMae(m1: Mat, m2: Mat): double</text>
                          <text x="20" y="164" fill={C.slate} fontSize="13" fontFamily={C.mono}>-saveHeatmap(diff: Mat, path: String): void</text>
                        </g>
                        <path d="M 410 180 L 510 180" stroke={C.oceanLight} strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#uml-arrow)" />
                        <g transform="translate(510, 95)">
                          <rect width="380" height="170" rx="6" fill="#171c18" stroke={C.charcoalMid} strokeWidth={1.5} />
                          <line x1="0" y1="42" x2="380" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="190" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">ColorSpaceExperiment</text>
                          <line x1="0" y1="64" x2="380" y2="64" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="20" y="98" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>«inspects experiment output»</text>
                          <text x="20" y="132" fill={C.slate} fontSize="13" fontFamily={C.mono}>+main(args: String[]): void</text>
                        </g>
                      </g>
                    )}

                    {/* RetinexExperiment.java */}
                    {selectedFile === "RetinexExperiment.java" && (
                      <g transform="translate(200, 55)">
                        <rect width="520" height="250" rx="6" fill="#171c18" stroke={C.sage} strokeWidth={2} />
                        <line x1="0" y1="42" x2="520" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                        <text x="260" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">RetinexExperiment</text>
                        <text x="20" y="70" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>-SIGMAS: double[] = &#123;15, 80, 250&#125;</text>
                        <line x1="0" y1="90" x2="520" y2="90" stroke={C.charcoalMid} strokeWidth="1.5" />
                        <text x="20" y="122" fill={C.slate} fontSize="13" fontFamily={C.mono}>+main(args: String[]): void</text>
                        <text x="20" y="152" fill={C.slate} fontSize="13" fontFamily={C.mono}>+computeLg(vChannel: Mat): Mat</text>
                        <text x="20" y="182" fill={C.slate} fontSize="13" fontFamily={C.mono}>+singleScaleRetinex(img: Mat, s: double): Mat</text>
                        <text x="20" y="212" fill={C.slate} fontSize="13" fontFamily={C.mono}>+multiScaleRetinex(img: Mat): Mat</text>
                      </g>
                    )}

                    {/* GuidedFilter.java */}
                    {selectedFile === "GuidedFilter.java" && (
                      <g transform="translate(250, 75)">
                        <rect width="420" height="210" rx="6" fill="#171c18" stroke={C.sage} strokeWidth={2} />
                        <line x1="0" y1="42" x2="420" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                        <text x="210" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">GuidedFilter</text>
                        <text x="20" y="72" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>-radius: int</text>
                        <text x="20" y="98" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>-eps: double</text>
                        <line x1="0" y1="116" x2="420" y2="116" stroke={C.charcoalMid} strokeWidth="1.5" />
                        <text x="20" y="150" fill={C.slate} fontSize="13" fontFamily={C.mono}>+GuidedFilter(radius: int, eps: double)</text>
                        <text x="20" y="180" fill={C.slate} fontSize="13" fontFamily={C.mono}>+filter(I: Mat, p: Mat): Mat</text>
                      </g>
                    )}

                    {/* GuidedFilterExperiment.java */}
                    {selectedFile === "GuidedFilterExperiment.java" && (
                      <g>
                        <g transform="translate(30, 85)">
                          <rect width="380" height="190" rx="6" fill="#171c18" stroke={C.sage} strokeWidth={2} />
                          <line x1="0" y1="42" x2="380" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="190" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">GuidedFilterExperiment</text>
                          <line x1="0" y1="64" x2="380" y2="64" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="20" y="100" fill={C.slate} fontSize="13" fontFamily={C.mono}>+main(args: String[]): void</text>
                          <text x="20" y="134" fill={C.slate} fontSize="13" fontFamily={C.mono}>-evaluateHaloSuppression(): void</text>
                        </g>
                        <path d="M 410 180 L 510 180" stroke={C.oceanLight} strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#uml-arrow)" />
                        <g transform="translate(510, 75)">
                          <rect width="380" height="210" rx="6" fill="#171c18" stroke={C.charcoalMid} strokeWidth={1.5} />
                          <line x1="0" y1="42" x2="380" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="190" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">GuidedFilter</text>
                          <text x="20" y="72" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>-radius: int</text>
                          <text x="20" y="98" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>-eps: double</text>
                          <line x1="0" y1="116" x2="380" y2="116" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="20" y="150" fill={C.slate} fontSize="13" fontFamily={C.mono}>+GuidedFilter(radius: int, eps: double)</text>
                          <text x="20" y="180" fill={C.slate} fontSize="13" fontFamily={C.mono}>+filter(I: Mat, p: Mat): Mat</text>
                        </g>
                      </g>
                    )}

                    {/* DualTreeCWT.java */}
                    {selectedFile === "DualTreeCWT.java" && (
                      <g>
                        <g transform="translate(40, 50)">
                          <rect width="450" height="260" rx="6" fill="#171c18" stroke={C.sage} strokeWidth={2} />
                          <line x1="0" y1="42" x2="450" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="225" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">DualTreeCWT</text>
                          <text x="20" y="72" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>+BOUNDARY_PAD: int = 16</text>
                          <text x="20" y="98" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>-H0A, H1A, H0B, H1B: double[]</text>
                          <line x1="0" y1="116" x2="450" y2="116" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="20" y="148" fill={C.slate} fontSize="13" fontFamily={C.mono}>+decompose(v: Mat): Subbands</text>
                          <text x="20" y="178" fill={C.slate} fontSize="13" fontFamily={C.mono}>+synthesize(s: Subbands): Mat</text>
                          <text x="20" y="208" fill={C.slate} fontSize="13" fontFamily={C.mono}>+denoiseSubbands(s: Subbands): Subbands</text>
                        </g>
                        <path d="M 490 180 L 570 180" stroke={C.sage} strokeWidth="2" markerEnd="url(#uml-nest)" />
                        <g transform="translate(570, 85)">
                          <rect width="310" height="190" rx="6" fill="#171c18" stroke={C.charcoalMid} strokeWidth={1.5} />
                          <line x1="0" y1="42" x2="310" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="155" y="27" fill="#fff" fontSize="15" fontWeight="700" fontFamily={C.mono} textAnchor="middle">DualTreeCWT.Subbands</text>
                          <text x="20" y="74" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>+lowpass: Mat</text>
                          <text x="20" y="102" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>+highpass: Mat[]</text>
                          <line x1="0" y1="120" x2="310" y2="120" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="20" y="156" fill={C.slate} fontSize="12" fontFamily={C.mono}>«inner data class»</text>
                        </g>
                      </g>
                    )}

                    {/* DtCwtExperiment.java */}
                    {selectedFile === "DtCwtExperiment.java" && (
                      <g>
                        <g transform="translate(30, 80)">
                          <rect width="370" height="200" rx="6" fill="#171c18" stroke={C.sage} strokeWidth={2} />
                          <line x1="0" y1="42" x2="370" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="185" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">DtCwtExperiment</text>
                          <line x1="0" y1="64" x2="370" y2="64" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="20" y="100" fill={C.slate} fontSize="13" fontFamily={C.mono}>+main(args: String[]): void</text>
                          <text x="20" y="134" fill={C.slate} fontSize="13" fontFamily={C.mono}>-verifyReconstruction(): void</text>
                        </g>
                        <path d="M 400 180 L 490 180" stroke={C.oceanLight} strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#uml-arrow)" />
                        <g transform="translate(490, 60)">
                          <rect width="400" height="240" rx="6" fill="#171c18" stroke={C.charcoalMid} strokeWidth={1.5} />
                          <line x1="0" y1="42" x2="400" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="200" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">DualTreeCWT</text>
                          <text x="20" y="74" fill={C.slateDim} fontSize="13" fontFamily={C.mono}>+BOUNDARY_PAD: int = 16</text>
                          <line x1="0" y1="92" x2="400" y2="92" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="20" y="124" fill={C.slate} fontSize="13" fontFamily={C.mono}>+decompose(v: Mat): Subbands</text>
                          <text x="20" y="154" fill={C.slate} fontSize="13" fontFamily={C.mono}>+synthesize(s: Subbands): Mat</text>
                          <text x="20" y="184" fill={C.slate} fontSize="13" fontFamily={C.mono}>+denoiseSubbands(s: Subbands): Subbands</text>
                        </g>
                      </g>
                    )}

                    {/* EnhancementPipeline.java */}
                    {selectedFile === "EnhancementPipeline.java" && (
                      <g>
                        <g transform="translate(20, 40)">
                          <rect width="410" height="280" rx="6" fill="#171c18" stroke={C.sage} strokeWidth={2} />
                          <line x1="0" y1="40" x2="410" y2="40" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="205" y="26" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">EnhancementPipeline</text>
                          <text x="16" y="66" fill={C.slateDim} fontSize="12" fontFamily={C.mono}>-guidedRadius: int</text>
                          <text x="16" y="86" fill={C.slateDim} fontSize="12" fontFamily={C.mono}>-guidedEps: double</text>
                          <text x="16" y="106" fill={C.slateDim} fontSize="12" fontFamily={C.mono}>-eta: double, -lambda: double</text>
                          <line x1="0" y1="120" x2="410" y2="120" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="16" y="148" fill={C.slate} fontSize="12" fontFamily={C.mono}>+enhance(bgrImage: Mat): Mat</text>
                          <text x="16" y="172" fill={C.slate} fontSize="12" fontFamily={C.mono}>-computeLw(vChannel: Mat): Mat</text>
                          <text x="16" y="196" fill={C.slate} fontSize="12" fontFamily={C.mono}>-applyWhiteBalance(v: Mat): void</text>
                          <text x="16" y="220" fill={C.slate} fontSize="12" fontFamily={C.mono}>-adjustContrast(mat: Mat): Mat</text>
                        </g>
                        <path d="M 430 115 L 530 85" stroke={C.oceanLight} strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#uml-arrow)" />
                        <path d="M 430 245 L 530 275" stroke={C.oceanLight} strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#uml-arrow)" />
                        <g transform="translate(530, 25)">
                          <rect width="360" height="120" rx="6" fill="#171c18" stroke={C.charcoalMid} strokeWidth={1.5} />
                          <line x1="0" y1="36" x2="360" y2="36" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="180" y="24" fill="#fff" fontSize="15" fontWeight="700" fontFamily={C.mono} textAnchor="middle">GuidedFilter</text>
                          <text x="16" y="60" fill={C.slateDim} fontSize="12" fontFamily={C.mono}>-radius: int, -eps: double</text>
                          <line x1="0" y1="74" x2="360" y2="74" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="16" y="98" fill={C.slate} fontSize="12" fontFamily={C.mono}>+filter(I: Mat, p: Mat): Mat</text>
                        </g>
                        <g transform="translate(530, 215)">
                          <rect width="360" height="120" rx="6" fill="#171c18" stroke={C.charcoalMid} strokeWidth={1.5} />
                          <line x1="0" y1="36" x2="360" y2="36" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="180" y="24" fill="#fff" fontSize="15" fontWeight="700" fontFamily={C.mono} textAnchor="middle">DualTreeCWT</text>
                          <text x="16" y="60" fill={C.slateDim} fontSize="12" fontFamily={C.mono}>+BOUNDARY_PAD: int = 16</text>
                          <line x1="0" y1="74" x2="360" y2="74" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="16" y="98" fill={C.slate} fontSize="12" fontFamily={C.mono}>+decompose / synthesize / denoise</text>
                        </g>
                      </g>
                    )}

                    {/* Main.java */}
                    {selectedFile === "Main.java" && (
                      <g>
                        <g transform="translate(40, 95)">
                          <rect width="280" height="170" rx="6" fill="#171c18" stroke={C.sage} strokeWidth={2} />
                          <line x1="0" y1="42" x2="280" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="140" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">Main</text>
                          <line x1="0" y1="64" x2="280" y2="64" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="18" y="100" fill={C.slate} fontSize="13" fontFamily={C.mono}>+main(args: String[]): void</text>
                          <text x="18" y="130" fill={C.slateDim} fontSize="12" fontFamily={C.mono}>«CLI Entry Point»</text>
                        </g>
                        <path d="M 320 180 L 450 180" stroke={C.oceanLight} strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#uml-arrow)" />
                        <g transform="translate(450, 50)">
                          <rect width="440" height="260" rx="6" fill="#171c18" stroke={C.charcoalMid} strokeWidth={1.5} />
                          <line x1="0" y1="42" x2="440" y2="42" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="220" y="27" fill="#fff" fontSize="16" fontWeight="700" fontFamily={C.mono} textAnchor="middle">EnhancementPipeline</text>
                          <text x="20" y="72" fill={C.slateDim} fontSize="12" fontFamily={C.mono}>-guidedRadius: int, -guidedEps: double, -eta, -lambda</text>
                          <line x1="0" y1="90" x2="440" y2="90" stroke={C.charcoalMid} strokeWidth="1.5" />
                          <text x="20" y="122" fill={C.slate} fontSize="12" fontFamily={C.mono}>+enhance(bgrImage: Mat): Mat</text>
                          <text x="20" y="148" fill={C.slate} fontSize="12" fontFamily={C.mono}>-computeLw(vChannel: Mat): Mat</text>
                          <text x="20" y="174" fill={C.slate} fontSize="12" fontFamily={C.mono}>-applyWhiteBalance(v: Mat): void</text>
                          <text x="20" y="200" fill={C.slate} fontSize="12" fontFamily={C.mono}>-adjustContrast(mat: Mat): Mat</text>
                          <text x="20" y="226" fill={C.slateDim} fontSize="12" fontFamily={C.mono}>«invokes GuidedFilter &amp; DualTreeCWT»</text>
                        </g>
                      </g>
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: CLI Usage Guide ─────────────────────────── */}
        {activeTab === "cli" && (
          <div style={{ height: "100%", display: "flex", gap: 20 }}>
            {/* Left: Command Cards (50%) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {cliGuides.map((g, idx) => (
                <div
                  key={idx}
                  style={{
                    background: C.charcoalLight,
                    border: `1px solid ${C.charcoalMid}`,
                    borderRadius: 8,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    {g.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.slate }}>
                    {g.desc}
                  </div>
                  <div
                    style={{
                      background: C.charcoalCard,
                      border: `1px solid ${C.charcoalMid}`,
                      borderRadius: 4,
                      padding: "9px 15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: C.mono,
                      fontSize: 11,
                      color: C.sage,
                    }}
                  >
                    <code style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {g.cmd}
                    </code>
                    <button
                      onClick={() => handleCopy(g.cmd)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 3,
                        border: `1px solid ${copiedCmd === g.cmd ? C.sage : C.oceanDim}`,
                        background: copiedCmd === g.cmd ? C.sage : C.charcoalMid,
                        color: copiedCmd === g.cmd ? C.charcoal : C.slate,
                        fontFamily: C.mono,
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      {copiedCmd === g.cmd ? "COPIED!" : "COPY"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Live Interactive Terminal Preview (50%) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                background: "#0d1117",
                border: `1px solid ${C.charcoalMid}`,
                borderRadius: 10,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                fontFamily: C.mono,
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              {/* Terminal Window Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, borderBottom: `1px solid #21262d`, paddingBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
                <span style={{ marginLeft: 8, color: "#8b949e", fontSize: 10 }}>PowerShell — se2105_1728</span>
              </div>

              {/* Console Output Simulation */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ color: "#8b949e" }}># Executing full enhancement pipeline with zero-install wrapper</div>
                <div style={{ color: C.sage }}>
                  PS D:\0Repositories\se2105_1728&gt; .\mvnw compile exec:java
                </div>
                <div style={{ color: "#8b949e", marginTop: 4 }}>[INFO] Scanning for projects...</div>
                <div style={{ color: "#8b949e" }}>[INFO] Building lowlight-enhancer 1.0-SNAPSHOT (Java 21)</div>
                <div style={{ color: C.oceanLight }}>=== Low-Light Image Enhancement Pipeline (Yang et al. 2018) ===</div>
                <div style={{ color: "#d4d9d5" }}>Loading input image: assets/test_images/raw-image.jpg</div>
                <div style={{ color: "#d4d9d5" }}>Image loaded: 864x566, 3 channels (BGR)</div>
                <div style={{ color: C.amber }}>Executing EnhancementPipeline...</div>
                <div style={{ color: "#8b949e" }}>  [1/5] Converting BGR -&gt; HSV and isolating V channel...</div>
                <div style={{ color: "#8b949e" }}>  [2/5] Performing 2D DT-CWT 1-level decomposition...</div>
                <div style={{ color: "#8b949e" }}>  [3/5] Computing adaptive local illumination &amp; gain map...</div>
                <div style={{ color: "#8b949e" }}>  [4/5] Soft-threshold wavelet shrinkage across 6 sub-bands...</div>
                <div style={{ color: "#8b949e" }}>  [5/5] Reconstructing image and anchoring shadow baseline...</div>
                <div style={{ color: C.sage }}>Enhancement complete in 242 ms.</div>
                <div style={{ color: "#d4d9d5" }}>Saved enhanced image to: assets/results/phase5/enhanced_pipeline_output.jpg</div>
                <div style={{ color: C.sage }}>[INFO] ------------------------------------------------------------------------</div>
                <div style={{ color: C.sage, fontWeight: 700 }}>[INFO] BUILD SUCCESS</div>
                <div style={{ color: C.sage }}>[INFO] ------------------------------------------------------------------------</div>
                <div style={{ color: C.sage, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <span>PS D:\0Repositories\se2105_1728&gt;</span>
                  <span className="animate-blink" style={{ width: 8, height: 14, background: C.sage, display: "inline-block" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Slide 4: Phase-by-Phase Results & What We Learned ─────────
function Slide4() {
  const [activePhase, setActivePhase] = useState<number>(1)
  const [activeImageKey, setActiveImageKey] = useState<string>("channelH")
  const [userInteractedImages, setUserInteractedImages] = useState<boolean>(false)

  // Phase data with all images, technical descriptions, and learnings
  const phasesData: Record<
    number,
    {
      title: string
      date: string
      status: string
      goal: string
      whatWeDid: string[]
      whatWeLearned: string[]
      mathPill: string
      images: { key: string; label: string; src: string; caption: string }[]
    }
  > = {
    1: {
      title: "Phase 1: HSV Color Space Decomposition",
      date: "Oct 22, 2026",
      status: "Verified",
      goal: "Isolate luminance from chromaticity and empirically demonstrate why low-light operations must target the V channel.",
      whatWeDid: [
        "Read raw low-light image (864×566, BGR) and converted to HSV using Imgproc.cvtColor.",
        "Split into separate H, S, V grayscale channels to study signal distribution.",
        "Tested 1.5× linear scaling on V-channel vs. direct RGB channels.",
        "Built DiffInspector.java to compute absolute difference maps and pixel error distributions.",
      ],
      whatWeLearned: [
        "In unclipped midtones, direct RGB and HSV V-scaling are mathematically identical.",
        "In highlight regions, direct RGB scaling clips individual channels unevenly, causing severe color skew (up to 63 intensity levels error on pillars).",
        "HSV preserves hue and saturation fidelity during non-linear dynamic range expansion.",
        "Pitch black shadows contain high intrinsic saturation that must not be blindly amplified.",
      ],
      mathPill: "V = max(R, G, B) • HSV preserves H & S invariant to luminance modifications",
      images: [
        { key: "channelH", label: "Hue (H)", src: channelH, caption: "Hue angle (0-180). Notice noise in pitch-black shadow where RGB ~ 0." },
        { key: "channelS", label: "Saturation (S)", src: channelS, caption: "Chromatic purity. Foliage and bricks possess rich color hidden in dark." },
        { key: "channelV", label: "Luminance (V)", src: channelV, caption: "Monochrome radiant energy carrying all scene geometry and exposure loss." },
        { key: "enhancedHsvV", label: "V-Boosted", src: enhancedHsvV, caption: "V channel boosted by 1.5x with intact natural color reproduction." },
        { key: "enhancedDirectRgb", label: "Direct RGB", src: enhancedDirectRgb, caption: "Direct RGB multiplication resulting in highlight color saturation clipping." },
        { key: "diffRgbHsv", label: "Diff Map (x10)", src: diffRgbHsv, caption: "Amplified difference between direct RGB vs HSV V-boost (column highlights clip)." },
      ],
    },
    2: {
      title: "Phase 2: Retinex Physical Model & Gaussian Baseline",
      date: "Oct 23, 2026",
      status: "Verified",
      goal: "Implement Retinex decomposition (I = L × R) in log-domain and global logarithmic tone mapping.",
      whatWeDid: [
        "Converted 8-bit V-channel to 32-bit float with +1.0 offset to eliminate log(0) singularity.",
        "Implemented Single-Scale Retinex (SSR) at scales σ = 15, 80, 250 using Gaussian surround.",
        "Synthesized Multi-Scale Retinex (MSR) with uniform weighting (w = 1/3).",
        "Implemented Stockham global logarithmic tone mapping (Paper Eq. 4–5).",
      ],
      whatWeLearned: [
        "Small σ (15) extracts incredible shadow details but creates massive edge halos and washed-out contrast.",
        "Large σ (250) preserves broad tonal rendition but fails to lift deep shadows.",
        "Gaussian filters blur indiscriminately across high-contrast structural edges, bleeding light into dark zones.",
        "Gaussian-based Retinex cannot eliminate halos regardless of scale combination; edge-preserving filtering is mandatory.",
      ],
      mathPill: "log(R) = log(V) - log(F * V) • Multi-scale: R_MSR = (1/3) Σ R_SSR(σ_k)",
      images: [
        { key: "ssr15", label: "SSR (σ=15)", src: ssr15, caption: "Small scale: high shadow detail but strong halo bands around roofline & pillars." },
        { key: "ssr80", label: "SSR (σ=80)", src: ssr80, caption: "Medium scale: intermediate dynamic range compression with moderate edge ringing." },
        { key: "ssr250", label: "SSR (σ=250)", src: ssr250, caption: "Large scale: natural contrast rendition but weak shadow lifting under porch." },
        { key: "msrOutput", label: "MSR Output", src: msrOutput, caption: "Weighted composite of 3 scales; edge halos remain prominent around colonnade." },
        { key: "stockhamLog", label: "Global Log Map", src: stockhamLog, caption: "Smooth, halo-free global tone compression but lacks local adaptive contrast." },
      ],
    },
    3: {
      title: "Phase 3: Guided Filter Tone Mapping & Halo Elimination",
      date: "Oct 30, 2026",
      status: "Verified",
      goal: "Replace Gaussian surround with Kaiming He's Guided Filter and implement local adaptive tone mapping.",
      whatWeDid: [
        "Built pure Java/OpenCV O(N) linear-time box-filter Guided Filter (GuidedFilter.java).",
        "Applied self-guided filter (r = 16, ε = 0.01) to compute halo-free surround estimate Hg.",
        "Computed halo difference map against Gaussian SSR, proving halo concentration at boundaries.",
        "Implemented local adaptive tone mapping combining global log Lg with contrast factor a(x,y) and sigmoid β (Eq. 10–12).",
      ],
      whatWeLearned: [
        "Guided Filter preserves sharp edges where variance σ² >> ε (a_k ≈ 1), completely eliminating halos.",
        "Raw log-reflectance (log V - log Hg) is highly skewed and cannot be directly stretched to RGB without severe fluorescent color distortion ('radioactive' effect).",
        "Anchoring dynamic range through the local adaptation equation (Eq. 12) restores natural contrast.",
        "High-frequency local boost inherently magnifies sensor noise in shadows, necessitating wavelet denoising.",
      ],
      mathPill: "q_i = a_k I_i + b_k • L_out = a(x,y) [L_g - log H_g] + β (Halo-Free)",
      images: [
        { key: "guidedRetinex", label: "Raw Guided Retinex", src: guidedRetinex, caption: "Naive min-max stretched log-reflectance showing extreme skew & fluorescent tone." },
        { key: "haloDiff", label: "Halo Diff (x5)", src: haloDiff, caption: "|R_Gaussian - R_Guided| x 5: Glowing column silhouettes confirm halo elimination." },
        { key: "localAdaptive", label: "Tone Mapped (Eq. 12)", src: localAdaptive, caption: "Final local adaptive tone-mapped output: crisp contrast, zero halos, balanced tones." },
      ],
    },
    4: {
      title: "Phase 4: 2D DT-CWT Decomposition & Wavelet Denoising",
      date: "Nov 04, 2026",
      status: "Verified",
      goal: "Decompose luminance into directional subbands using Kingsbury DT-CWT and strip shadow noise.",
      whatWeDid: [
        "Implemented dual-tree analysis/synthesis filter banks using Near-Symmetric 5/7 Hilbert tap pairs.",
        "Achieved row-column separable 2D decomposition into 2 low-pass and 6 directional high-pass bands.",
        "Validated Perfect Reconstruction with machine precision (MAE ≈ 1.1 × 10⁻⁸).",
        "Implemented soft-threshold shrinkage (Eq. 13) driven by Donoho MAD noise estimation.",
      ],
      whatWeLearned: [
        "Standard DWT suffers from shift variance and directional blur; DT-CWT isolates ±15°, ±45°, ±75° edges crisply.",
        "Correct boundary reflection padding and dual-tree phase alignment are critical to prevent checkerboard grid artifacts.",
        "Gentle noise thresholding (T = 0.5σ) cleanly extracts high-frequency sensor speckle from shadows without eroding fine textures.",
        "Separating low-pass illumination from high-pass noise enables independent enhancement and denoising.",
      ],
      mathPill: "6 Directional Bands (±15°, ±45°, ±75°) • T = σ √(2 log N) • PR Error: 1.1 × 10⁻⁸",
      images: [
        { key: "subbandLReal", label: "Low-Pass Real", src: subbandLReal, caption: "Coarse ambient illumination carrier free of sensor grain (432x283)." },
        { key: "subbandH1", label: "+15° Subband", src: subbandH1, caption: "High-pass directional subband isolating horizontal balustrades and rooflines." },
        { key: "subbandH3", label: "+45° Subband", src: subbandH3, caption: "High-pass directional subband isolating diagonal architectural & branch angles." },
        { key: "subbandH5", label: "+75° Subband", src: subbandH5, caption: "High-pass directional subband isolating vertical columns and tree trunks." },
        { key: "strippedNoise", label: "Stripped Noise (x10)", src: strippedNoise, caption: "Amplified noise extracted from shadow foliage without structural edge loss." },
        { key: "denoisedRecon", label: "Denoised V", src: denoisedRecon, caption: "Reconstructed luminance: smooth shadow gradients with sharp preserved edges." },
      ],
    },
    5: {
      title: "Phase 5: Complete Pipeline & Author Benchmark Parity",
      date: "Nov 07, 2026",
      status: "Completed & Calibrated",
      goal: "Integrate end-to-end pipeline, calibrate against author's MATLAB benchmark, and eliminate downsampling blur.",
      whatWeDid: [
        "Integrated complete end-to-end architecture (EnhancementPipeline.java) matching Paper Fig. 1.",
        "Calibrated against author's reference MATLAB codebase (Proposed_Retinex.m, adjustment.m).",
        "Implemented full-resolution Retinex gain map modulation (I_out = gain × I_in).",
        "Clamped auto-contrast white balance floor (v_min ≤ 0) to completely eliminate shadow crushing.",
      ],
      whatWeLearned: [
        "Full-Resolution Fidelity: Applying the gain map directly to native input channels preserves 100% optical sharpness with zero downsampling blur.",
        "Monotonic Retinex: Formulating luminance gain as L_out = L_g · (V / H_g)^γ guarantees monotonic column brightness, eliminating dark halos.",
        "Shadow Floor Anchoring: Clamping v_min ≤ 0 prevents auto-contrast from re-crushing lifted shadow details back to black.",
        "Achieved 0.24 levels MAE across the entire image against the author's benchmark ground truth!",
      ],
      mathPill: "gain(x,y) = L_out / L_w • I_out = gain · I_in • MAE: 0.24 levels vs MATLAB",
      images: [
        { key: "rawImage", label: "Raw Low-Light", src: rawImage, caption: "Original underexposed sensor capture before enhancement." },
        { key: "benchmarkAuthor", label: "Author Benchmark", src: benchmarkAuthor, caption: "Author's reference MATLAB output (0.24 levels MAE difference across 864x566)." },
        { key: "pipelineOutput", label: "Our Java Output", src: pipelineOutput, caption: "Full-resolution enhanced output: radiant white columns, tack-sharp foliage, zero halos." },
      ],
    },
  }

  const currentPhaseData = phasesData[activePhase]
  const currentImage =
    currentPhaseData.images.find((img) => img.key === activeImageKey) || currentPhaseData.images[0]

  useEffect(() => {
    if (userInteractedImages) return
    const timer = setInterval(() => {
      setActiveImageKey((prevKey) => {
        const imgs = currentPhaseData.images
        const curIdx = imgs.findIndex((img) => img.key === prevKey)
        const nextIdx = (curIdx + 1) % imgs.length
        return imgs[nextIdx].key
      })
    }, 3500)
    return () => clearInterval(timer)
  }, [userInteractedImages, activePhase, currentPhaseData.images])

  const handleSlide4DoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("input")) return
    setUserInteractedImages(false)
    setActivePhase((prev) => {
      const nextPhase = prev >= 5 ? 1 : prev + 1
      setActiveImageKey(phasesData[nextPhase].images[0].key)
      return nextPhase
    })
  }

  return (
    <div onDoubleClick={handleSlide4DoubleClick} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(20px, 2.5vw, 32px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#e8ede9",
            }}
          >
            Phase-by-Phase <span style={{ color: C.sage }}>Results & Learnings</span>
          </h2>
        </div>

        {/* Phase Selector Tabs */}
        <div style={{ display: "flex", gap: 5, background: C.charcoalLight, padding: 3, borderRadius: 6, border: `1px solid ${C.charcoalMid}` }}>
          {[1, 2, 3, 4, 5].map((pNum) => (
            <button
              key={pNum}
              onClick={() => {
                setActivePhase(pNum)
                setActiveImageKey(phasesData[pNum].images[0].key)
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 4,
                border: "none",
                background: activePhase === pNum ? C.sage : "transparent",
                color: activePhase === pNum ? C.charcoal : C.slateDim,
                fontFamily: C.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              PHASE {pNum}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", gap: 20, minHeight: 0 }}>
        {/* Left: What We Did & What We Learned */}
        <div
          style={{
            flex: 1.15,
            background: C.charcoalLight,
            border: `1px solid ${C.charcoalMid}`,
            borderRadius: 10,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          <div>
            {/* Phase Title & Date */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
                {currentPhaseData.title.split(": ")[1]}
              </span>
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.slateDim }}>
                {currentPhaseData.date}
              </span>
            </div>

            {/* Goal Banner */}
            <div
              style={{
                background: C.charcoalCard,
                border: `1px solid ${C.charcoalMid}`,
                borderRadius: 6,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 13.5,
                color: C.slate,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: C.amber, fontFamily: C.mono, fontSize: 11, textTransform: "uppercase" }}>
                Goal:{" "}
              </strong>
              {currentPhaseData.goal}
            </div>

            {/* What We Did Section */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 11,
                  color: C.oceanLight,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                What We Did (Implementation):
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, lineHeight: 1.55, color: C.slate }}>
                {currentPhaseData.whatWeDid.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: C.oceanLight, fontSize: 13, lineHeight: "20px", flexShrink: 0 }}>•</span>
                    <div>{item}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* What We Learned Section */}
            <div>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 11,
                  color: C.sage,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                What We Learned & Critical Insights:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, lineHeight: 1.55, color: C.slate }}>
                {currentPhaseData.whatWeLearned.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: C.sage, fontSize: 13, lineHeight: "20px", flexShrink: 0 }}>•</span>
                    <div>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Image Carousel / Inspector */}
        <div
          style={{
            flex: "0 0 715px",
            background: C.charcoalLight,
            border: `1px solid ${C.charcoalMid}`,
            borderRadius: 10,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {/* Image Sub-selector Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 8,
              borderBottom: `1px solid ${C.charcoalMid}`,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", gap: 5, overflowX: "auto" }}>
              {currentPhaseData.images.map((img) => {
                const isSelected = img.key === currentImage.key
                return (
                  <button
                    key={img.key}
                    onClick={() => {
                      setActiveImageKey(img.key)
                      setUserInteractedImages(true)
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: `1px solid ${isSelected ? C.sage : C.charcoalMid}`,
                      background: isSelected ? C.sageFaint : C.charcoalCard,
                      color: isSelected ? C.sage : C.slateDim,
                      fontFamily: C.mono,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s",
                    }}
                  >
                    {img.label}
                  </button>
                )
              })}
            </div>
            {userInteractedImages && (
              <button
                onClick={() => setUserInteractedImages(false)}
                style={{
                  padding: "2px 6px",
                  borderRadius: 3,
                  border: `1px solid ${C.sage}`,
                  background: C.sageFaint,
                  color: C.sage,
                  fontFamily: C.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  marginLeft: 6,
                }}
              >
                ▶ AUTO
              </button>
            )}
          </div>

          {/* Large Image Display */}
          <div
            style={{
              flex: 1,
              position: "relative",
              borderRadius: 8,
              overflow: "hidden",
              border: `1px solid ${C.charcoalMid}`,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,
            }}
          >
            <img
              src={currentImage.src}
              alt={currentImage.label}
              style={{
                width: "auto",
                height: "100%",
                maxWidth: "100%",
                aspectRatio: "864 / 566",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Caption / Description below image */}
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: C.charcoalCard,
              borderRadius: 6,
              border: `1px solid ${C.charcoalMid}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: C.sage, fontSize: 13 }}>ℹ</span>
            <div style={{ fontSize: 11, color: C.slate, lineHeight: 1.4 }}>
              {currentImage.caption}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Slide 5: Upcoming Milestones & Next Steps ─────────────────
function Slide5() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(20px, 2.5vw, 32px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#e8ede9",
          }}
        >
          Next Steps &amp; <span style={{ color: C.sage }}>Roadmap Completion</span>
        </h2>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ flex: 1, display: "flex", gap: 24, minHeight: 0 }}>
        {/* Left Column: Next Goals in Two Rows */}
        <div style={{ flex: 1.15, display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }}>
          {/* Row 1: Phase 6 Card */}
          <div
            style={{
              flex: 1,
              background: C.charcoalLight,
              border: `1px solid ${C.amber}`,
              borderRadius: 10,
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 0,
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span
                  style={{
                    fontFamily: C.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.amber,
                    background: C.amberFaint,
                    padding: "3px 9px",
                    borderRadius: 4,
                  }}
                >
                  PHASE 6
                </span>
                
              </div>

              <h3 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                Spatial Tiling &amp; Parallel Processing Engine
              </h3>

              {/* Graphic Flow for Tiling */}
              <div
                style={{
                  background: C.charcoalCard,
                  borderRadius: 8,
                  border: `1px solid ${C.charcoalMid}`,
                  padding: "22px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                {[
                  {
                    title: "Gigapixel Image",
                    sub: "Input Frame",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    ),
                  },
                  {
                    title: "4×4 Matrix",
                    sub: "16 Sub-Tiles",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="15" y1="3" x2="15" y2="21" />
                      </svg>
                    ),
                  },
                  {
                    title: "±16px Halo",
                    sub: "Overlap Seam",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    ),
                  },
                  {
                    title: "ForkJoinPool",
                    sub: "Multi-threading",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    ),
                  },
                ].map((step, idx, arr) => (
                  <React.Fragment key={idx}>
                    <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                        {step.icon}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{step.title}</div>
                      <div style={{ fontSize: 10.5, color: C.slateDim, fontFamily: C.mono, marginTop: 3 }}>{step.sub}</div>
                    </div>
                    {idx < arr.length - 1 && (
                      <span style={{ color: C.amber, fontSize: 16, fontWeight: 800 }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 12, color: C.slate }}>
                Eliminates edge-device memory bottlenecks while guaranteeing seamless tile re-assembly.
              </span>
            </div>
          </div>

          {/* Row 2: Phase 7 Card */}
          <div
            style={{
              flex: 1,
              background: C.charcoalLight,
              border: `1px solid ${C.ocean}`,
              borderRadius: 10,
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 0,
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span
                  style={{
                    fontFamily: C.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.oceanLight,
                    background: C.oceanFaint,
                    padding: "3px 9px",
                    borderRadius: 4,
                  }}
                >
                  PHASE 7
                </span>
                
              </div>

              <h3 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                Interactive JavaFX GUI &amp; Benchmark Suite
              </h3>

              {/* Graphic Flow for GUI */}
              <div
                style={{
                  background: C.charcoalCard,
                  borderRadius: 8,
                  border: `1px solid ${C.charcoalMid}`,
                  padding: "22px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                {[
                  {
                    title: "Split Slider",
                    sub: "Interactive Wipe",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.oceanLight} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="7 8 3 12 7 16" />
                        <polyline points="17 8 21 12 17 16" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                      </svg>
                    ),
                  },
                  {
                    title: "Async Task",
                    sub: "Non-blocking UI",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.oceanLight} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ),
                  },
                  {
                    title: "Param Sliders",
                    sub: "Live Tuning",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.oceanLight} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                      </svg>
                    ),
                  },
                  {
                    title: "Benchmark",
                    sub: "Latency vs RAM",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.oceanLight} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    ),
                  },
                ].map((step, idx, arr) => (
                  <React.Fragment key={idx}>
                    <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                        {step.icon}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{step.title}</div>
                      <div style={{ fontSize: 10.5, color: C.slateDim, fontFamily: C.mono, marginTop: 3 }}>{step.sub}</div>
                    </div>
                    {idx < arr.length - 1 && (
                      <span style={{ color: C.oceanLight, fontSize: 16, fontWeight: 800 }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 12, color: C.slate }}>
                Desktop application with before/after comparison and performance telemetry up to 4K resolutions.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Big Thank You & Questions */}
        <div
          style={{
            flex: 1,
            background: C.charcoalLight,
            border: `1px solid ${C.sage}`,
            borderRadius: 10,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(94, 219, 140, 0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* GitHub Icon Link */}
          <a
            href="https://github.com/rakinthegreat/se2105_1728"
            target="_blank"
            rel="noopener noreferrer"
            title="Open GitHub Repository"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: C.charcoalCard,
              border: `1.5px solid ${C.sage}`,
              color: "#fff",
              marginBottom: 20,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 0 20px rgba(94, 219, 140, 0.2)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)"
              e.currentTarget.style.borderColor = "#fff"
              e.currentTarget.style.boxShadow = "0 0 28px rgba(94, 219, 140, 0.45)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.borderColor = C.sage
              e.currentTarget.style.boxShadow = "0 0 20px rgba(94, 219, 140, 0.2)"
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "clamp(38px, 4.2vw, 56px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#fff",
              lineHeight: 1.05,
            }}
          >
            Thank You!
          </h1>

          <p
            style={{
              margin: "0 0 28px",
              fontSize: 18,
              color: C.slate,
              maxWidth: 440,
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Questions, comments, and suggestions are welcome.
          </p>

          
        </div>
      </div>
    </div>
  )
}

// ── Presentation Shell ────────────────────────────────────────
const slides = [
  { component: Slide1, title: "Title & Overview" },
  { component: Slide2, title: "Timeline & Plans Evolution" },
  { component: Slide3, title: "Directory, Git & Usage" },
  { component: Slide4, title: "Results & Learnings" },
  { component: Slide5, title: "Upcoming Milestones" },
]

export default function App() {
  const [current, setCurrent] = useState(0)
  const SlideComponent = slides[current].component
  const wheelCooldown = useRef(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault()
        setCurrent((p) => Math.min(p + 1, slides.length - 1))
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        setCurrent((p) => Math.max(p - 1, 0))
      }
    }
    const onWheel = (e: WheelEvent) => {
      if (wheelCooldown.current) return
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(delta) < 25) return
      wheelCooldown.current = true
      setTimeout(() => {
        wheelCooldown.current = false
      }, 500)
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
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Slide Content */}
      <div
        key={current}
        style={{
          flex: 1,
          padding: "28px 48px 72px",
          display: "flex",
          flexDirection: "column",
          animation: "fadeInUp 0.3s ease forwards",
        }}
      >
        <SlideComponent />
      </div>

      {/* Navigation Footer (Bottom Right) */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 48,
          display: "flex",
          gap: 12,
          zIndex: 50,
          alignItems: "center",
        }}
      >
        {/* Slide Dots / Pill */}
        <div style={{ display: "flex", gap: 6, marginRight: 10, alignItems: "center" }}>
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              title={s.title}
              style={{
                width: current === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: current === idx ? C.sage : C.charcoalMid,
                cursor: "pointer",
                padding: 0,
                transition: "all 0.25s",
              }}
            />
          ))}
        </div>

        {/* Counter */}
        <span
          style={{
            fontFamily: C.mono,
            fontSize: 10,
            color: C.slateDim,
            letterSpacing: "0.1em",
            marginRight: 6,
          }}
        >
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>

        {/* Prev Button */}
        <button
          onClick={() => setCurrent((p) => Math.max(p - 1, 0))}
          disabled={current === 0}
          style={{
            padding: "7px 18px",
            borderRadius: 6,
            border: `1px solid ${current === 0 ? C.charcoalMid : C.charcoalMid}`,
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

        {/* Next Button */}
        <button
          onClick={() => setCurrent((p) => Math.min(p + 1, slides.length - 1))}
          disabled={current === slides.length - 1}
          style={{
            padding: "7px 18px",
            borderRadius: 6,
            border: `1px solid ${current === slides.length - 1 ? C.charcoalMid : C.sage}`,
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

"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";

/* ─── palette ─── */
const C = {
  navy: "#0B1F3A",
  blue: "#1E6BFF",
  orange: "#FF8A00",
  grey: "#2F3A45",
  light: "#F4F6F8",
  white: "#FFFFFF",
} as const;

/* ─── section metadata (for nav dots) ─── */
const SECTIONS = [
  "Title",
  "The Problem",
  "Opportunity",
  "What Are NFMs?",
  "Why Now?",
  "Architecture",
  "Data Layer",
  "Representation",
  "Foundation Models",
  "Simulation",
  "Agentic Discovery",
  "Decision Biology",
  "Use Cases",
  "Long-Term Vision",
  "Closing",
] as const;

/* ─── reusable wrapper ─── */
function Slide({
  id,
  bg,
  children,
  className = "",
}: {
  id: string;
  bg: "dark" | "light" | "accent";
  children: ReactNode;
  className?: string;
}) {
  const bgMap = {
    dark: `background:${C.navy}`,
    light: `background:${C.light}`,
    accent: `background:linear-gradient(135deg,${C.navy} 0%,#122a4d 100%)`,
  };
  const textColor = bg === "light" ? C.grey : C.white;
  return (
    <section
      id={id}
      data-slide
      className={`slide-section relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-20 md:px-16 lg:px-24 ${className}`}
      style={{ ...cssToObj(bgMap[bg]), color: textColor }}
    >
      {children}
    </section>
  );
}

function cssToObj(s: string): Record<string, string> {
  const o: Record<string, string> = {};
  s.split(";").forEach((p) => {
    const [k, v] = p.split(":");
    if (k && v) o[k.trim()] = v.trim();
  });
  return o;
}

function Badge({ text }: { text: string }) {
  return (
    <span
      className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]"
      style={{ background: `${C.blue}22`, color: C.blue, border: `1px solid ${C.blue}44` }}
    >
      {text}
    </span>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-6 text-center text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight">
      {children}
    </h2>
  );
}

function Bullets({ items, color }: { items: string[]; color?: string }) {
  return (
    <ul className="mx-auto mt-4 max-w-2xl space-y-3 text-lg leading-relaxed" style={{ color: color ?? "inherit" }}>
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: C.orange }} />
          <span style={{ opacity: 0.88 }}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/* ━━━━━━━━━━━━━━━ SVG DIAGRAMS ━━━━━━━━━━━━━━━ */

function DiagramTitle() {
  const domains = [
    { label: "Biology", x: 200, y: 100, r: 60, color: "#22C55E" },
    { label: "Chemistry", x: 400, y: 100, r: 60, color: "#A855F7" },
    { label: "Physics", x: 300, y: 260, r: 60, color: "#3B82F6" },
    { label: "Environment", x: 500, y: 260, r: 60, color: "#14B8A6" },
  ];
  return (
    <svg viewBox="0 0 700 400" className="mx-auto mt-8 w-full max-w-2xl">
      {/* connecting lines to center AI hub */}
      {domains.map((d, i) => (
        <line key={i} x1={d.x} y1={d.y} x2={350} y2={190} stroke={C.blue} strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
      ))}
      {/* center hub */}
      <circle cx={350} cy={190} r={44} fill={C.blue} opacity="0.15" />
      <circle cx={350} cy={190} r={30} fill={C.blue} />
      <text x={350} y={195} textAnchor="middle" fill={C.white} fontSize="11" fontWeight="700">AI</text>
      {/* domain circles */}
      {domains.map((d, i) => (
        <g key={i}>
          <circle cx={d.x} cy={d.y} r={d.r} fill={d.color} opacity="0.15" />
          <circle cx={d.x} cy={d.y} r={d.r - 12} fill={d.color} opacity="0.8" />
          <text x={d.x} y={d.y + 5} textAnchor="middle" fill={C.white} fontSize="12" fontWeight="600">
            {d.label}
          </text>
        </g>
      ))}
      {/* outer ring */}
      <circle cx={350} cy={190} r={180} fill="none" stroke={C.blue} strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />
    </svg>
  );
}

function DiagramIslands() {
  const islands = [
    { label: "Biology", x: 90, y: 120, w: 110, color: "#22C55E" },
    { label: "Chemistry", x: 260, y: 80, w: 110, color: "#A855F7" },
    { label: "Physics", x: 430, y: 130, w: 110, color: "#3B82F6" },
    { label: "Environment", x: 590, y: 90, w: 120, color: "#14B8A6" },
  ];
  return (
    <svg viewBox="0 0 800 260" className="mx-auto mt-8 w-full max-w-3xl">
      {islands.map((isl, i) => (
        <g key={i}>
          <ellipse cx={isl.x + isl.w / 2} cy={isl.y + 50} rx={isl.w / 2 + 10} ry={38} fill={isl.color} opacity="0.12" />
          <rect x={isl.x} y={isl.y} width={isl.w} height={60} rx={12} fill={isl.color} opacity="0.85" />
          <text x={isl.x + isl.w / 2} y={isl.y + 35} textAnchor="middle" fill={C.white} fontSize="13" fontWeight="600">
            {isl.label}
          </text>
          {i < islands.length - 1 && (
            <text x={isl.x + isl.w + 25} y={isl.y + 35} fill="#EF4444" fontSize="26" fontWeight="700" opacity="0.6">
              ✕
            </text>
          )}
        </g>
      ))}
      <text x={400} y={230} textAnchor="middle" fill={C.orange} fontSize="14" fontWeight="600" opacity="0.9">
        Fragmented • Observational • Hard to Predict
      </text>
    </svg>
  );
}

function DiagramSignalFlow() {
  const steps = ["Input", "Noisy System", "Decision", "Response"];
  const xs = [80, 250, 420, 590];
  return (
    <svg viewBox="0 0 720 180" className="mx-auto mt-8 w-full max-w-3xl">
      {steps.map((s, i) => (
        <g key={i}>
          <rect x={xs[i]} y={50} width={120} height={54} rx={10} fill={i === 1 ? C.orange : C.blue} opacity={0.85} />
          <text x={xs[i] + 60} y={82} textAnchor="middle" fill={C.white} fontSize="13" fontWeight="600">
            {s}
          </text>
          {i < steps.length - 1 && (
            <>
              <line x1={xs[i] + 120} y1={77} x2={xs[i + 1]} y2={77} stroke={C.white} strokeWidth="2" markerEnd="url(#arrowW)" />
            </>
          )}
        </g>
      ))}
      <defs>
        <marker id="arrowW" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={C.white} />
        </marker>
      </defs>
      <text x={360} y={150} textAnchor="middle" fill={C.white} fontSize="12" opacity="0.6" fontStyle="italic">
        Uncertainty → Constraints → Feedback → Adaptation
      </text>
    </svg>
  );
}

function DiagramNFMHub() {
  const spokes = [
    { label: "Molecules", angle: 0, color: "#A855F7" },
    { label: "Cells", angle: 60, color: "#22C55E" },
    { label: "Organisms", angle: 120, color: "#14B8A6" },
    { label: "Materials", angle: 180, color: "#F59E0B" },
    { label: "Climate", angle: 240, color: "#3B82F6" },
    { label: "Robotics", angle: 300, color: "#EF4444" },
  ];
  const cx = 300,
    cy = 200,
    R = 140;
  return (
    <svg viewBox="0 0 600 400" className="mx-auto mt-8 w-full max-w-xl">
      {spokes.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const sx = cx + R * Math.cos(rad);
        const sy = cy + R * Math.sin(rad);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={sx} y2={sy} stroke={s.color} strokeWidth="2" opacity="0.5" />
            <circle cx={sx} cy={sy} r={36} fill={s.color} opacity="0.18" />
            <circle cx={sx} cy={sy} r={26} fill={s.color} opacity="0.85" />
            <text x={sx} y={sy + 4} textAnchor="middle" fill={C.white} fontSize="9" fontWeight="600">
              {s.label}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={50} fill={C.blue} opacity="0.15" />
      <circle cx={cx} cy={cy} r={38} fill={C.blue} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={C.white} fontSize="11" fontWeight="700">
        Nature FM
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.8">
        Core Model
      </text>
    </svg>
  );
}

function DiagramConvergence() {
  const forces = [
    { label: "Foundation Models", y: 30 },
    { label: "Scientific Datasets", y: 80 },
    { label: "Simulation Engines", y: 130 },
    { label: "GPU Infrastructure", y: 180 },
    { label: "Multimodal Learning", y: 230 },
  ];
  return (
    <svg viewBox="0 0 700 300" className="mx-auto mt-8 w-full max-w-2xl">
      <defs>
        <marker id="arrowB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={C.blue} />
        </marker>
      </defs>
      {forces.map((f, i) => (
        <g key={i}>
          <rect x={40} y={f.y} width={200} height={36} rx={8} fill={C.blue} opacity={0.15 + i * 0.05} />
          <text x={140} y={f.y + 23} textAnchor="middle" fill={C.white} fontSize="12" fontWeight="500">
            {f.label}
          </text>
          <line x1={250} y1={f.y + 18} x2={430} y2={140} stroke={C.blue} strokeWidth="2" markerEnd="url(#arrowB)" opacity="0.5" />
        </g>
      ))}
      <circle cx={460} cy={140} r={52} fill={C.orange} opacity="0.15" />
      <circle cx={460} cy={140} r={38} fill={C.orange} />
      <text x={460} y={137} textAnchor="middle" fill={C.white} fontSize="11" fontWeight="700">
        Nature
      </text>
      <text x={460} y={151} textAnchor="middle" fill={C.white} fontSize="11" fontWeight="700">
        FMs
      </text>
      <rect x={540} y={118} width={130} height={44} rx={10} fill={C.blue} opacity="0.85" />
      <text x={605} y={145} textAnchor="middle" fill={C.white} fontSize="12" fontWeight="600">
        Breakthrough →
      </text>
    </svg>
  );
}

function DiagramArchitecture() {
  const layers = [
    { label: "Application Layer", color: C.orange, sub: "Drug design · Materials · Climate · Robotics" },
    { label: "Agentic Reasoning Layer", color: "#A855F7", sub: "Planning · Hypotheses · Interventions" },
    { label: "Simulation Layer", color: "#14B8A6", sub: "Digital twins · Perturbations · Counterfactuals" },
    { label: "Foundation Model Layer", color: C.blue, sub: "BioFM · ChemFM · PhysicsFM · EnvFM" },
    { label: "Representation Layer", color: "#3B82F6", sub: "Graphs · Embeddings · Dynamics · Constraints" },
    { label: "Scientific Data Layer", color: "#22C55E", sub: "Omics · Sensors · Simulations · Literature" },
  ];
  return (
    <svg viewBox="0 0 700 420" className="mx-auto mt-8 w-full max-w-2xl">
      {layers.map((l, i) => {
        const y = i * 64 + 20;
        return (
          <g key={i}>
            <rect x={60} y={y} width={580} height={50} rx={12} fill={l.color} opacity="0.85" />
            <text x={350} y={y + 22} textAnchor="middle" fill={C.white} fontSize="14" fontWeight="700">
              {l.label}
            </text>
            <text x={350} y={y + 40} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.75">
              {l.sub}
            </text>
            {i < layers.length - 1 && (
              <line x1={350} y1={y + 50} x2={350} y2={y + 64} stroke={C.white} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DiagramDataLake() {
  const types = [
    { label: "Structured", icon: "⊞", color: "#3B82F6" },
    { label: "Unstructured", icon: "☰", color: "#A855F7" },
    { label: "Simulation", icon: "⟳", color: "#14B8A6" },
    { label: "Sensor / IoT", icon: "◉", color: C.orange },
    { label: "Omics", icon: "🧬", color: "#22C55E" },
  ];
  return (
    <svg viewBox="0 0 700 280" className="mx-auto mt-8 w-full max-w-2xl">
      <ellipse cx={350} cy={220} rx={300} ry={40} fill={C.blue} opacity="0.08" />
      <ellipse cx={350} cy={210} rx={280} ry={30} fill={C.blue} opacity="0.12" />
      <text x={350} y={260} textAnchor="middle" fill={C.blue} fontSize="13" fontWeight="600" opacity="0.7">
        Scientific Data Lake
      </text>
      {types.map((t, i) => {
        const x = 80 + i * 130;
        return (
          <g key={i}>
            <rect x={x} y={60} width={100} height={100} rx={14} fill={t.color} opacity="0.15" />
            <rect x={x + 8} y={68} width={84} height={84} rx={10} fill={t.color} opacity="0.75" />
            <text x={x + 50} y={105} textAnchor="middle" fill={C.white} fontSize="22">
              {t.icon}
            </text>
            <text x={x + 50} y={135} textAnchor="middle" fill={C.white} fontSize="10" fontWeight="600">
              {t.label}
            </text>
            <line x1={x + 50} y1={160} x2={x + 50} y2={195} stroke={t.color} strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
          </g>
        );
      })}
    </svg>
  );
}

function DiagramRepresentation() {
  return (
    <svg viewBox="0 0 700 260" className="mx-auto mt-8 w-full max-w-2xl">
      {/* graph section */}
      <rect x={20} y={30} width={160} height={200} rx={14} fill={C.blue} opacity="0.08" />
      <text x={100} y={55} textAnchor="middle" fill={C.blue} fontSize="11" fontWeight="700">Graph</text>
      {[[60, 100], [140, 90], [100, 160], [60, 180], [140, 170]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={8} fill={C.blue} opacity="0.7" />
      ))}
      {[[60, 100, 140, 90], [140, 90, 100, 160], [100, 160, 60, 180], [60, 180, 140, 170], [60, 100, 100, 160]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.blue} strokeWidth="1.5" opacity="0.4" />
      ))}

      {/* embedding section */}
      <rect x={200} y={30} width={160} height={200} rx={14} fill="#A855F7" opacity="0.08" />
      <text x={280} y={55} textAnchor="middle" fill="#A855F7" fontSize="11" fontWeight="700">Embeddings</text>
      {[
        [230, 100, 6], [260, 130, 8], [290, 90, 5], [250, 170, 7], [310, 150, 6],
        [240, 140, 4], [300, 120, 5], [270, 180, 6],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#A855F7" opacity={0.3 + (i % 3) * 0.2} />
      ))}

      {/* equations */}
      <rect x={380} y={30} width={140} height={200} rx={14} fill="#14B8A6" opacity="0.08" />
      <text x={450} y={55} textAnchor="middle" fill="#14B8A6" fontSize="11" fontWeight="700">Dynamics</text>
      <text x={450} y={110} textAnchor="middle" fill="#14B8A6" fontSize="16" fontFamily="serif" opacity="0.8">
        dx/dt = f(x, u)
      </text>
      <text x={450} y={160} textAnchor="middle" fill="#14B8A6" fontSize="14" fontFamily="serif" opacity="0.6">
        ∂ψ/∂t = Hψ
      </text>

      {/* time-series */}
      <rect x={540} y={30} width={140} height={200} rx={14} fill={C.orange} opacity="0.08" />
      <text x={610} y={55} textAnchor="middle" fill={C.orange} fontSize="11" fontWeight="700">Time-series</text>
      <polyline
        points="560,130 575,110 590,140 605,100 620,125 635,105 650,135 665,115"
        fill="none" stroke={C.orange} strokeWidth="2.5" strokeLinejoin="round" opacity="0.7"
      />
      <line x1={555} y1={180} x2={670} y2={180} stroke={C.orange} strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function DiagramFMLayer() {
  const models = [
    { label: "BioFM", color: "#22C55E", x: 50 },
    { label: "ChemFM", color: "#A855F7", x: 200 },
    { label: "PhysicsFM", color: "#3B82F6", x: 350 },
    { label: "EnvFM", color: "#14B8A6", x: 500 },
  ];
  return (
    <svg viewBox="0 0 700 280" className="mx-auto mt-8 w-full max-w-2xl">
      {models.map((m, i) => (
        <g key={i}>
          <rect x={m.x} y={40} width={130} height={70} rx={12} fill={m.color} opacity="0.85" />
          <text x={m.x + 65} y={80} textAnchor="middle" fill={C.white} fontSize="14" fontWeight="700">
            {m.label}
          </text>
          <line x1={m.x + 65} y1={110} x2={m.x + 65} y2={155} stroke={m.color} strokeWidth="2" strokeDasharray="5 3" opacity="0.5" />
        </g>
      ))}
      <rect x={100} y={160} width={500} height={60} rx={14} fill={C.blue} opacity="0.85" />
      <text x={350} y={192} textAnchor="middle" fill={C.white} fontSize="15" fontWeight="700">
        Cross-Domain Nature Foundation Model
      </text>
      <text x={350} y={210} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.7">
        Unified representations across scales and domains
      </text>
      {models.map((m, i) => (
        <line key={`conn-${i}`} x1={m.x + 65} y1={155} x2={350} y2={160} stroke={C.white} strokeWidth="1" opacity="0.3" />
      ))}
    </svg>
  );
}

function DiagramSimLoop() {
  const steps = ["Real System", "Observe", "Simulate", "Predict", "Perturb"];
  const n = steps.length;
  const cx = 300, cy = 150, R = 110;
  return (
    <svg viewBox="0 0 600 320" className="mx-auto mt-8 w-full max-w-xl">
      <defs>
        <marker id="arrowO" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={C.orange} />
        </marker>
      </defs>
      <circle cx={cx} cy={cy} r={R + 30} fill={C.blue} opacity="0.05" />
      {steps.map((s, i) => {
        const angle = (i * 360) / n - 90;
        const rad = (angle * Math.PI) / 180;
        const sx = cx + R * Math.cos(rad);
        const sy = cy + R * Math.sin(rad);
        const nextAngle = ((i + 1) * 360) / n - 90;
        const nRad = (nextAngle * Math.PI) / 180;
        const nx = cx + R * Math.cos(nRad);
        const ny = cy + R * Math.sin(nRad);
        const midRad = (((angle + nextAngle) / 2) * Math.PI) / 180;
        const mx = cx + (R + 12) * Math.cos(midRad);
        const my = cy + (R + 12) * Math.sin(midRad);
        return (
          <g key={i}>
            <circle cx={sx} cy={sy} r={32} fill={i === 0 ? C.orange : C.blue} opacity="0.85" />
            <text x={sx} y={sy + 4} textAnchor="middle" fill={C.white} fontSize="10" fontWeight="600">
              {s}
            </text>
            <path
              d={`M ${sx + 28 * Math.cos(midRad - 0.2)} ${sy + 28 * Math.sin(midRad - 0.2)} Q ${mx} ${my} ${nx - 28 * Math.cos(nRad - midRad)} ${ny - 28 * Math.sin(nRad - midRad)}`}
              fill="none" stroke={C.orange} strokeWidth="2" markerEnd="url(#arrowO)" opacity="0.6"
            />
          </g>
        );
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" fill={C.white} fontSize="11" fontWeight="600" opacity="0.7">
        Digital Twin
      </text>
      <text x={cx} y={290} textAnchor="middle" fill={C.orange} fontSize="12" fontWeight="600" opacity="0.8">
        Continuous simulation → validation → refinement loop
      </text>
    </svg>
  );
}

function DiagramAgentLoop() {
  const steps = ["Observe", "Reason", "Simulate", "Evaluate", "Design"];
  return (
    <svg viewBox="0 0 700 200" className="mx-auto mt-8 w-full max-w-2xl">
      <defs>
        <marker id="arrowG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#A855F7" />
        </marker>
      </defs>
      {steps.map((s, i) => {
        const x = 60 + i * 130;
        return (
          <g key={i}>
            <rect x={x} y={50} width={100} height={56} rx={12} fill="#A855F7" opacity={0.6 + i * 0.08} />
            <text x={x + 50} y={83} textAnchor="middle" fill={C.white} fontSize="13" fontWeight="600">
              {s}
            </text>
            {i < steps.length - 1 && (
              <line x1={x + 100} y1={78} x2={x + 130} y2={78} stroke="#A855F7" strokeWidth="2" markerEnd="url(#arrowG)" opacity="0.6" />
            )}
          </g>
        );
      })}
      {/* loop-back arrow */}
      <path d="M 640 106 C 640 160 60 160 60 106" fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrowG)" opacity="0.4" />
      <text x={350} y={172} textAnchor="middle" fill="#A855F7" fontSize="11" opacity="0.7">
        Continuous autonomous discovery cycle
      </text>
    </svg>
  );
}

function DiagramCellSignaling() {
  const nodes = ["Signal", "Receptor", "Cascade", "Transcription", "Decision"];
  return (
    <svg viewBox="0 0 700 220" className="mx-auto mt-8 w-full max-w-2xl">
      <defs>
        <marker id="arrowGr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#22C55E" />
        </marker>
      </defs>
      <rect x={30} y={20} width={640} height={160} rx={18} fill="#22C55E" opacity="0.06" />
      <text x={350} y={195} textAnchor="middle" fill="#22C55E" fontSize="11" opacity="0.7">
        Cell boundary — information flow from input to phenotypic decision
      </text>
      {nodes.map((n, i) => {
        const x = 60 + i * 130;
        return (
          <g key={i}>
            <rect x={x} y={55} width={100} height={54} rx={10} fill={i === 4 ? C.orange : "#22C55E"} opacity="0.85" />
            <text x={x + 50} y={87} textAnchor="middle" fill={C.white} fontSize="11" fontWeight="600">
              {n}
            </text>
            {i < nodes.length - 1 && (
              <line x1={x + 100} y1={82} x2={x + 130} y2={82} stroke="#22C55E" strokeWidth="2" markerEnd="url(#arrowGr)" opacity="0.5" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DiagramPlatformMap() {
  const domains = [
    { label: "Programmable\nBiology", x: 60, y: 40, color: "#22C55E" },
    { label: "Advanced\nMaterials", x: 240, y: 40, color: "#A855F7" },
    { label: "Climate\nModeling", x: 420, y: 40, color: "#3B82F6" },
    { label: "Autonomous\nRobotics", x: 60, y: 180, color: C.orange },
    { label: "Environmental\nSystems", x: 240, y: 180, color: "#14B8A6" },
    { label: "Scientific\nDiscovery", x: 420, y: 180, color: "#EF4444" },
  ];
  return (
    <svg viewBox="0 0 600 340" className="mx-auto mt-8 w-full max-w-2xl">
      <rect x={170} y={110} width={260} height={60} rx={14} fill={C.blue} opacity="0.85" />
      <text x={300} y={140} textAnchor="middle" fill={C.white} fontSize="13" fontWeight="700">
        Nature FM Platform
      </text>
      <text x={300} y={158} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.7">
        Scientific Intelligence Infrastructure
      </text>
      {domains.map((d, i) => (
        <g key={i}>
          <rect x={d.x} y={d.y} width={140} height={70} rx={12} fill={d.color} opacity="0.8" />
          {d.label.split("\n").map((line, li) => (
            <text key={li} x={d.x + 70} y={d.y + 30 + li * 16} textAnchor="middle" fill={C.white} fontSize="11" fontWeight="600">
              {line}
            </text>
          ))}
          <line
            x1={d.x + 70}
            y1={d.y < 100 ? d.y + 70 : d.y}
            x2={300}
            y2={d.y < 100 ? 110 : 170}
            stroke={d.color} strokeWidth="1.5" strokeDasharray="5 3" opacity="0.4"
          />
        </g>
      ))}
    </svg>
  );
}

/* ━━━━━━━━━━━━━━━ NAVIGATION DOTS ━━━━━━━━━━━━━━━ */

function NavDots({
  active,
  onJump,
}: {
  active: number;
  onJump: (idx: number) => void;
}) {
  return (
    <nav
      className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
      aria-label="Slide navigation"
    >
      {SECTIONS.map((label, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          aria-label={`Go to: ${label}`}
          className="group relative flex items-center"
        >
          <span
            className="block rounded-full transition-all duration-200"
            style={{
              width: active === i ? 12 : 8,
              height: active === i ? 12 : 8,
              background: active === i ? C.orange : "rgba(255,255,255,0.25)",
              boxShadow: active === i ? `0 0 8px ${C.orange}88` : "none",
            }}
          />
          <span
            className="pointer-events-none absolute left-6 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
            style={{ background: C.grey, color: C.white }}
          >
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}

/* ━━━━━━━━━━━━━━━ SLIDE NUMBER ━━━━━━━━━━━━━━━ */

function SlideCounter({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md"
      style={{ background: "rgba(11,31,58,0.8)", color: C.white, border: `1px solid rgba(255,255,255,0.1)` }}
    >
      <span style={{ color: C.orange }}>{String(current + 1).padStart(2, "0")}</span>
      <span style={{ opacity: 0.4 }}>/</span>
      <span style={{ opacity: 0.5 }}>{String(total).padStart(2, "0")}</span>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━━━━━ */

export default function NatureFoundationModelsPage() {
  const [active, setActive] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const jumpTo = useCallback((idx: number) => {
    const el = document.querySelectorAll("[data-slide]")[idx];
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const slides = document.querySelectorAll("[data-slide]");
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Array.from(slides).indexOf(e.target as Element);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { threshold: 0.45 },
    );
    slides.forEach((s) => observerRef.current!.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  /* fade-in on scroll */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("slide-visible");
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll(".slide-animate").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="nfm-presentation relative w-full overflow-x-hidden font-sans"
      style={{ background: C.navy, color: C.white, scrollBehavior: "smooth" }}
    >
      {/* global styles for this presentation */}
      <style>{`
        .nfm-presentation a { color: ${C.blue}; text-decoration: none; }
        .nfm-presentation a:hover { text-decoration: underline; }
        .slide-animate { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .slide-visible { opacity: 1 !important; transform: translateY(0) !important; }
        .nfm-presentation ::selection { background: ${C.blue}33; }
      `}</style>

      <NavDots active={active} onJump={jumpTo} />
      <SlideCounter current={active} total={15} />

      {/* ── 1  TITLE ── */}
      <Slide id="s1" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Technical Presentation" />
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
            Nature Foundation Models
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            AI infrastructure for understanding, simulating, and designing natural systems
          </p>
          <DiagramTitle />
        </div>
      </Slide>

      {/* ── 2  THE PROBLEM ── */}
      <Slide id="s2" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="The Core Problem" />
          <Heading>Science Is Still Fragmented</Heading>
          <Bullets
            items={[
              "Biological, chemical, physical, and environmental systems are studied in isolated silos.",
              "Most scientific understanding remains observational — not predictive or designable.",
              "Cross-domain transfer is rare; insights in one field don't propagate to others.",
              "No unified computational framework connects natural systems at scale.",
            ]}
          />
          <DiagramIslands />
        </div>
      </Slide>

      {/* ── 3  OPPORTUNITY ── */}
      <Slide id="s3" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="The Opportunity" />
          <Heading>Natural Systems Are Information Processors</Heading>
          <Bullets
            items={[
              "Every natural system processes signals under uncertainty, constraints, feedback, and adaptation.",
              "These are exactly the dynamics foundation models are designed to learn.",
              "The opportunity: treat nature as a learnable computational system.",
            ]}
          />
          <DiagramSignalFlow />
        </div>
      </Slide>

      {/* ── 4  WHAT ARE NFMs ── */}
      <Slide id="s4" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Definition" />
          <Heading>What Are Nature Foundation Models?</Heading>
          <Bullets
            items={[
              "Foundation models trained to understand and simulate natural systems across scales.",
              "Combine domain-specific learning with cross-domain transfer.",
              "Agentic systems that plan experiments, run simulations, and propose interventions.",
            ]}
          />
          <DiagramNFMHub />
        </div>
      </Slide>

      {/* ── 5  WHY NOW ── */}
      <Slide id="s5" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Timing" />
          <Heading>Why Now?</Heading>
          <Bullets
            items={[
              "Foundation model architectures have proven transfer learning at unprecedented scale.",
              "Massive scientific datasets are newly available and machine-readable.",
              "GPU infrastructure makes training on petabyte-scale simulation data feasible.",
              "Multimodal learning enables joint reasoning over sequences, graphs, images, and dynamics.",
            ]}
          />
          <DiagramConvergence />
        </div>
      </Slide>

      {/* ── 6  ARCHITECTURE ── */}
      <Slide id="s6" bg="light">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="System Architecture" />
          <h2 className="mb-6 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight" style={{ color: C.navy }}>
            Full Stack Architecture
          </h2>
          <p className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed" style={{ color: C.grey, opacity: 0.85 }}>
            Six layers — from raw scientific data to application-level interventions.
          </p>
          <DiagramArchitecture />
        </div>
      </Slide>

      {/* ── 7  DATA LAYER ── */}
      <Slide id="s7" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Layer 1" />
          <Heading>Scientific Data Layer</Heading>
          <Bullets
            items={[
              "Biological: genomics, proteomics, transcriptomics, metabolomics.",
              "Chemical: molecular structures, reaction databases, spectral data.",
              "Physical: simulation outputs, material properties, sensor readings.",
              "Environmental: satellite imagery, climate records, ecological surveys.",
            ]}
          />
          <DiagramDataLake />
        </div>
      </Slide>

      {/* ── 8  REPRESENTATION ── */}
      <Slide id="s8" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Layer 2" />
          <Heading>Representation Layer</Heading>
          <Bullets
            items={[
              "Graph representations capture relational structure of molecules, pathways, and networks.",
              "Learned embeddings encode latent patterns across modalities.",
              "Dynamical system representations preserve physical constraints and conservation laws.",
              "Multimodal fusion aligns sequences, structures, time-series, and experimental data.",
            ]}
          />
          <DiagramRepresentation />
        </div>
      </Slide>

      {/* ── 9  FM LAYER ── */}
      <Slide id="s9" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Layer 3" />
          <Heading>Foundation Model Layer</Heading>
          <Bullets
            items={[
              "Domain-specific models learn deep patterns within biology, chemistry, physics, and environment.",
              "Cross-domain NFM learns shared representations and enables transfer across domains.",
              "Architecture supports fine-tuning, few-shot adaptation, and zero-shot generalization.",
            ]}
          />
          <DiagramFMLayer />
        </div>
      </Slide>

      {/* ── 10  SIMULATION ── */}
      <Slide id="s10" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Layer 4" />
          <Heading>Simulation Layer</Heading>
          <Bullets
            items={[
              "Digital twin simulations predict system behavior under novel conditions.",
              "Perturbation modeling tests interventions before physical experiments.",
              "Counterfactual reasoning enables causal discovery from observational data.",
              "Calibrated uncertainty quantification prevents overconfident predictions.",
            ]}
          />
          <DiagramSimLoop />
        </div>
      </Slide>

      {/* ── 11  AGENTIC ── */}
      <Slide id="s11" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Layer 5" />
          <Heading>Agentic Discovery Layer</Heading>
          <Bullets
            items={[
              "Scientific agents autonomously plan experiments and analyze results.",
              "Agents run simulations, compare competing hypotheses, and rank evidence.",
              "Propose targeted interventions with uncertainty-aware decision making.",
              "Close the loop: observe → reason → simulate → evaluate → design.",
            ]}
          />
          <DiagramAgentLoop />
        </div>
      </Slide>

      {/* ── 12  DECISION BIOLOGY ── */}
      <Slide id="s12" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Phase 1 — Product Focus" />
          <Heading>Decision Biology</Heading>
          <Bullets
            items={[
              "First target: model how cells process signals and make decisions under uncertainty.",
              "Cells are information-processing systems with well-characterized molecular components.",
              "High-quality datasets exist: single-cell omics, perturbation screens, pathway databases.",
              "Direct applications in drug response modeling, synthetic biology, and diagnostics.",
            ]}
          />
          <DiagramCellSignaling />
        </div>
      </Slide>

      {/* ── 13  USE CASES ── */}
      <Slide id="s13" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Applications" />
          <Heading>Example Use Cases</Heading>
          <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Predict Cellular Response", desc: "Forecast how cells respond to novel perturbations" },
              { title: "Design Perturbations", desc: "Engineer optimal interventions for desired outcomes" },
              { title: "Model Drug Response", desc: "Predict efficacy and resistance across cell types" },
              { title: "Synthetic Circuits", desc: "Design programmable genetic circuits in silico" },
              { title: "Environmental Adaptation", desc: "Simulate organism response to changing conditions" },
              { title: "Materials Design", desc: "Predict and optimize material properties computationally" },
            ].map((uc, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style={{ background: `${C.orange}22`, color: C.orange }}>
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold" style={{ color: C.white }}>
                  {uc.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {uc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* ── 14  VISION ── */}
      <Slide id="s14" bg="light">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Long-Term Vision" />
          <h2 className="mb-6 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight" style={{ color: C.navy }}>
            Scientific Intelligence Infrastructure
          </h2>
          <p className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed" style={{ color: C.grey, opacity: 0.85 }}>
            Nature Foundation Models become the computational backbone for programmable biology, advanced materials, climate modeling, autonomous robotics, and environmental systems.
          </p>
          <DiagramPlatformMap />
        </div>
      </Slide>

      {/* ── 15  CLOSING ── */}
      <Slide id="s15" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <div
              className="mx-auto mb-8 h-1 w-24 rounded-full"
              style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.orange})` }}
            />
            <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-bold leading-[1.15] tracking-tight">
              Nature Foundation Models move science from{" "}
              <span style={{ color: C.orange }}>observation</span> to{" "}
              <span style={{ color: C.blue }}>prediction</span>,{" "}
              <span style={{ color: "#A855F7" }}>simulation</span>, and{" "}
              <span style={{ color: "#22C55E" }}>design</span>.
            </h2>
          </div>
          <svg viewBox="0 0 600 120" className="mx-auto w-full max-w-lg">
            <rect x={50} y={30} width={500} height={60} rx={30} fill={C.blue} opacity="0.1" />
            {["Observe", "Predict", "Simulate", "Design"].map((s, i) => {
              const x = 120 + i * 120;
              const colors = [C.orange, C.blue, "#A855F7", "#22C55E"];
              return (
                <g key={i}>
                  <circle cx={x} cy={60} r={20} fill={colors[i]} opacity="0.85" />
                  <text x={x} y={64} textAnchor="middle" fill={C.white} fontSize="9" fontWeight="700">
                    {s}
                  </text>
                  {i < 3 && (
                    <line x1={x + 22} y1={60} x2={x + 98} y2={60} stroke={C.white} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3" />
                  )}
                </g>
              );
            })}
          </svg>
          <p className="mt-10 text-lg font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Thank you
          </p>
        </div>
      </Slide>
    </div>
  );
}

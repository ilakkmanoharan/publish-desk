/* SVG diagrams for ASRA — Adaptive Scientific Reasoning Architecture */

export const C = {
  deep: "#1a0f2e",
  navy: "#2d1b4e",
  purple: "#7C3AED",
  lavender: "#A78BFA",
  violet: "#8B5CF6",
  orange: "#F59E0B",
  light: "#F3F4F6",
  slate: "#64748b",
  white: "#FFFFFF",
} as const;

export function DiagramMemorizationVsAdaptation() {
  return (
    <svg viewBox="0 0 640 200" className="mx-auto mt-6 w-full max-w-2xl">
      <rect x={30} y={40} width={250} height={120} rx={14} fill={C.slate} opacity="0.15" stroke={C.slate} strokeWidth="1" />
      <text x={155} y={75} textAnchor="middle" fill={C.slate} fontSize="12" fontWeight="700">Memorization</text>
      <text x={155} y={100} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.7">Lookup · replay · benchmarks</text>
      <text x={155} y={130} textAnchor="middle" fill={C.slate} fontSize="9" opacity="0.8">Fails on novelty</text>

      <rect x={360} y={40} width={250} height={120} rx={14} fill={C.purple} opacity="0.2" stroke={C.purple} strokeWidth="1.5" />
      <text x={485} y={75} textAnchor="middle" fill={C.lavender} fontSize="12" fontWeight="700">Adaptation</text>
      <text x={485} y={100} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.85">Invent strategies · explore</text>
      <text x={485} y={130} textAnchor="middle" fill={C.lavender} fontSize="9">Thrives in unfamiliar envs</text>

      <text x={320} y={105} textAnchor="middle" fill={C.orange} fontSize="18" fontWeight="700">≠</text>
    </svg>
  );
}

export function DiagramLLMvsASRA() {
  return (
    <svg viewBox="0 0 700 220" className="mx-auto mt-6 w-full max-w-3xl">
      <text x={120} y={25} fill={C.slate} fontSize="10" fontWeight="700">LLM pipeline</text>
      {["Train", "Predict", "Respond"].map((s, i) => (
        <g key={i}>
          <rect x={40 + i * 90} y={35} width={75} height={40} rx={8} fill={C.slate} opacity="0.35" />
          <text x={77 + i * 90} y={60} textAnchor="middle" fill={C.white} fontSize="9">{s}</text>
        </g>
      ))}
      <text x={120} y={100} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.5">Fixed policy · distribution-bound</text>

      <text x={350} y={25} fill={C.lavender} fontSize="10" fontWeight="700">ASRA loop</text>
      {["Explore", "Hypothesize", "Test", "Abstract"].map((s, i) => (
        <g key={i}>
          <rect x={280 + i * 95} y={35} width={85} height={40} rx={8} fill={C.purple} opacity={0.75} />
          <text x={322 + i * 95} y={60} textAnchor="middle" fill={C.white} fontSize="8" fontWeight="600">{s}</text>
        </g>
      ))}
      <text x={485} y={100} textAnchor="middle" fill={C.lavender} fontSize="9" opacity="0.85">Active scientific discovery</text>
    </svg>
  );
}

export function DiagramAsraLoop() {
  const steps = ["Observe", "Hypothesize", "Experiment", "Learn", "Abstract", "Reuse"];
  const n = steps.length;
  const cx = 300;
  const cy = 130;
  const R = 95;
  return (
    <svg viewBox="0 0 600 260" className="mx-auto mt-6 w-full max-w-xl">
      {steps.map((s, i) => {
        const angle = (i * (360 / n) - 90) * (Math.PI / 180);
        const x = cx + R * Math.cos(angle);
        const y = cy + R * Math.sin(angle);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={C.purple} strokeWidth="1" opacity="0.35" />
            <circle cx={x} cy={y} r={32} fill={C.purple} opacity="0.85" />
            <text x={x} y={y + 4} textAnchor="middle" fill={C.white} fontSize="7" fontWeight="600">{s}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={28} fill={C.lavender} />
      <text x={cx} y={cy + 4} textAnchor="middle" fill={C.deep} fontSize="9" fontWeight="700">ASRA</text>
    </svg>
  );
}

export function DiagramArchitecture() {
  const layers = [
    { label: "Reflection & Self-Evaluation", sub: "Meta-reasoning · uncertainty" },
    { label: "Strategy Synthesizer", sub: "Dynamic policies · planning" },
    { label: "Abstraction Engine", sub: "Concepts · symbolic compression" },
    { label: "Exploration Engine", sub: "Curiosity · experimentation" },
    { label: "Hypothesis Generator", sub: "Candidate rules · world models" },
    { label: "Environment Interpreter", sub: "Perception · latent mechanics" },
  ];
  return (
    <svg viewBox="0 0 520 340" className="mx-auto mt-6 w-full max-w-lg">
      {layers.map((l, i) => {
        const y = i * 52 + 16;
        return (
          <g key={i}>
            <rect x={40} y={y} width={440} height={44} rx={10} fill={C.purple} opacity={0.75 - i * 0.06} />
            <text x={260} y={y + 20} textAnchor="middle" fill={C.white} fontSize="11" fontWeight="700">{l.label}</text>
            <text x={260} y={y + 36} textAnchor="middle" fill={C.white} fontSize="8" opacity="0.75">{l.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function DiagramMemoryGraph() {
  return (
    <svg viewBox="0 0 500 220" className="mx-auto mt-6 w-full max-w-lg">
      <circle cx={250} cy={110} r={40} fill={C.purple} />
      <text x={250} y={115} textAnchor="middle" fill={C.white} fontSize="10" fontWeight="700">Memory Graph</text>
      {[
        { label: "Episodic", x: 80, y: 50 },
        { label: "Semantic", x: 420, y: 50 },
        { label: "Procedural", x: 80, y: 170 },
        { label: "Causal", x: 420, y: 170 },
      ].map((n, i) => (
        <g key={i}>
          <line x1={250} y1={110} x2={n.x} y2={n.y} stroke={C.lavender} strokeWidth="1.5" opacity="0.5" />
          <circle cx={n.x} cy={n.y} r={28} fill={C.violet} opacity="0.8" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill={C.white} fontSize="8" fontWeight="600">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function DiagramScientificMethod() {
  const steps = ["Observe", "Hypothesize", "Experiment", "Learn", "Abstract", "Reuse"];
  const xs = [30, 120, 210, 300, 390, 480];
  return (
    <svg viewBox="0 0 540 100" className="mx-auto mt-6 w-full max-w-2xl">
      {steps.map((s, i) => (
        <g key={i}>
          <rect x={xs[i]} y={30} width={72} height={36} rx={8} fill={C.purple} opacity="0.8" />
          <text x={xs[i] + 36} y={52} textAnchor="middle" fill={C.white} fontSize="7" fontWeight="600">{s}</text>
          {i < steps.length - 1 && (
            <line x1={xs[i] + 74} y1={48} x2={xs[i + 1] - 2} y2={48} stroke={C.lavender} strokeWidth="2" opacity="0.6" />
          )}
        </g>
      ))}
    </svg>
  );
}

export function DiagramExplorationTree() {
  return (
    <svg viewBox="0 0 400 200" className="mx-auto mt-6 w-full max-w-md">
      <circle cx={200} cy={30} r={18} fill={C.orange} />
      <text x={200} y={35} textAnchor="middle" fill={C.white} fontSize="8" fontWeight="700">root</text>
      {[120, 200, 280].map((x, i) => (
        <g key={i}>
          <line x1={200} y1={48} x2={x} y2={80} stroke={C.lavender} strokeWidth="1.5" opacity="0.5" />
          <circle cx={x} cy={90} r={14} fill={C.purple} opacity="0.7" />
          <line x1={x} y1={104} x2={x - 25} y2={140} stroke={C.purple} strokeWidth="1" opacity="0.4" />
          <line x1={x} y1={104} x2={x + 25} y2={140} stroke={C.purple} strokeWidth="1" opacity="0.4" />
          <circle cx={x - 25} cy={150} r={10} fill={C.violet} opacity="0.6" />
          <circle cx={x + 25} cy={150} r={10} fill={C.violet} opacity="0.6" />
        </g>
      ))}
      <text x={200} y={185} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.55">Exploration before exploitation</text>
    </svg>
  );
}

export function DiagramComparisonMatrix() {
  const rows = ["Adaptation", "Exploration", "Abstraction", "Novel environments"];
  const cols = ["LLM", "RL agent", "ASRA"];
  const marks: boolean[][] = [
    [false, true, true],
    [false, true, true],
    [true, false, true],
    [false, false, true],
  ];
  return (
    <svg viewBox="0 0 360 180" className="mx-auto mt-6 w-full max-w-sm">
      {cols.map((c, i) => (
        <text key={c} x={120 + i * 70} y={22} textAnchor="middle" fill={C.lavender} fontSize="9" fontWeight="700">{c}</text>
      ))}
      {rows.map((r, ri) => (
        <g key={r}>
          <text x={8} y={52 + ri * 36} fill={C.white} fontSize="8" opacity="0.8">{r}</text>
          {marks[ri].map((ok, ci) => (
            <circle key={ci} cx={120 + ci * 70} cy={48 + ri * 36} r={10} fill={ok ? C.purple : C.slate} opacity={ok ? 0.9 : 0.25} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function DiagramResearchMap() {
  const nodes = [
    { label: "ARC / AGI", x: 250, y: 40 },
    { label: "World models", x: 80, y: 100 },
    { label: "Active inference", x: 420, y: 100 },
    { label: "Meta-learning", x: 150, y: 160 },
    { label: "Neuro-symbolic", x: 350, y: 160 },
  ];
  return (
    <svg viewBox="0 0 500 200" className="mx-auto mt-6 w-full max-w-lg">
      {nodes.map((n, i) => (
        <g key={i}>
          {i > 0 && (
            <line x1={250} y1={55} x2={n.x} y2={n.y - 14} stroke={C.lavender} strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
          )}
          <rect x={n.x - 50} y={n.y - 14} width={100} height={28} rx={8} fill={i === 0 ? C.purple : C.violet} opacity="0.75" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill={C.white} fontSize="8" fontWeight="600">{n.label}</text>
        </g>
      ))}
      <text x={250} y={195} textAnchor="middle" fill={C.lavender} fontSize="9" opacity="0.7">ASRA sits at the intersection</text>
    </svg>
  );
}

export function DiagramGeneralization() {
  return (
    <svg viewBox="0 0 560 160" className="mx-auto mt-6 w-full max-w-2xl">
      <rect x={30} y={50} width={140} height={70} rx={10} fill={C.slate} opacity="0.3" />
      <text x={100} y={80} textAnchor="middle" fill={C.white} fontSize="10">Training env A</text>
      <text x={100} y={100} textAnchor="middle" fill={C.white} fontSize="8" opacity="0.6">memorized</text>
      <rect x={210} y={50} width={140} height={70} rx={10} fill={C.orange} opacity="0.35" stroke={C.orange} strokeWidth="1" />
      <text x={280} y={80} textAnchor="middle" fill={C.white} fontSize="10">Novel env B</text>
      <text x={280} y={100} textAnchor="middle" fill={C.orange} fontSize="8">unseen rules</text>
      <rect x={390} y={50} width={140} height={70} rx={10} fill={C.purple} opacity="0.85" />
      <text x={460} y={80} textAnchor="middle" fill={C.white} fontSize="10" fontWeight="700">ASRA adapts</text>
      <text x={460} y={100} textAnchor="middle" fill={C.white} fontSize="8" opacity="0.85">new strategy</text>
      <text x={175} y={88} fill={C.white} fontSize="14" opacity="0.4">✕</text>
      <text x={355} y={88} fill={C.lavender} fontSize="14">→</text>
    </svg>
  );
}

/* SVG diagrams for "Inference in AI: From Tokens to Thinking" */

export const C = {
  navy: "#0a1628",
  deep: "#0f2744",
  blue: "#1E6BFF",
  cyan: "#22D3EE",
  orange: "#FF8A00",
  slate: "#64748b",
  light: "#e2e8f0",
  white: "#FFFFFF",
} as const;

function Arrow({ id = "arrowW" }: { id?: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill={C.white} />
    </marker>
  );
}

export function DiagramTrainingVsInference() {
  return (
    <svg viewBox="0 0 720 280" className="mx-auto mt-8 w-full max-w-3xl">
      <defs><Arrow /></defs>
      <rect x={20} y={30} width={300} height={200} rx={16} fill={C.orange} opacity="0.12" stroke={C.orange} strokeWidth="1.5" />
      <text x={170} y={65} textAnchor="middle" fill={C.orange} fontSize="14" fontWeight="700">Training</text>
      <text x={170} y={95} textAnchor="middle" fill={C.white} fontSize="11" opacity="0.75">Learn weights from data</text>
      <text x={170} y={115} textAnchor="middle" fill={C.white} fontSize="11" opacity="0.75">Batch-heavy · offline</text>
      <text x={170} y={135} textAnchor="middle" fill={C.white} fontSize="11" opacity="0.75">Backward pass + optimizers</text>
      <text x={170} y={195} textAnchor="middle" fill={C.orange} fontSize="10" fontWeight="600" opacity="0.9">Factory: build the brain</text>

      <rect x={400} y={30} width={300} height={200} rx={16} fill={C.cyan} opacity="0.12" stroke={C.cyan} strokeWidth="1.5" />
      <text x={550} y={65} textAnchor="middle" fill={C.cyan} fontSize="14" fontWeight="700">Inference</text>
      <text x={550} y={95} textAnchor="middle" fill={C.white} fontSize="11" opacity="0.75">Run frozen weights</text>
      <text x={550} y={115} textAnchor="middle" fill={C.white} fontSize="11" opacity="0.75">Request-driven · online</text>
      <text x={550} y={135} textAnchor="middle" fill={C.white} fontSize="11" opacity="0.75">Forward pass only</text>
      <text x={550} y={195} textAnchor="middle" fill={C.cyan} fontSize="10" fontWeight="600" opacity="0.9">Live brain: think now</text>

      <line x1={330} y1={130} x2={390} y2={130} stroke={C.white} strokeWidth="2" markerEnd="url(#arrowW)" opacity="0.5" />
      <text x={360} y={120} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.5">weights →</text>
    </svg>
  );
}

export function DiagramTokenFlow() {
  const steps = ["Prompt", "Tokenize", "Embed", "Transformer", "Logits", "Sample", "Token"];
  const xs = [30, 120, 210, 310, 420, 520, 620];
  return (
    <svg viewBox="0 0 700 140" className="mx-auto mt-6 w-full max-w-3xl">
      <defs><Arrow id="arrowC" /></defs>
      {steps.map((s, i) => (
        <g key={i}>
          <rect x={xs[i] - 38} y={40} width={76} height={44} rx={8} fill={i === steps.length - 1 ? C.orange : C.blue} opacity="0.85" />
          <text x={xs[i]} y={67} textAnchor="middle" fill={C.white} fontSize="9" fontWeight="600">{s}</text>
          {i < steps.length - 1 && (
            <line x1={xs[i] + 40} y1={62} x2={xs[i + 1] - 42} y2={62} stroke={C.cyan} strokeWidth="1.5" markerEnd="url(#arrowC)" opacity="0.6" />
          )}
        </g>
      ))}
      <text x={350} y={120} textAnchor="middle" fill={C.cyan} fontSize="10" opacity="0.7" fontStyle="italic">
        Autoregressive loop: append token → extend context → repeat
      </text>
    </svg>
  );
}

export function DiagramTransformerStack() {
  const layers = ["Output logits", "Layer N …", "Self-Attention + FFN", "Layer 2", "Embeddings + RoPE"];
  return (
    <svg viewBox="0 0 400 320" className="mx-auto mt-6 w-full max-w-md">
      {layers.map((l, i) => {
        const y = i * 58 + 20;
        const color = i === 0 ? C.orange : i === layers.length - 1 ? C.cyan : C.blue;
        return (
          <g key={i}>
            <rect x={40} y={y} width={320} height={46} rx={10} fill={color} opacity="0.8" />
            <text x={200} y={y + 28} textAnchor="middle" fill={C.white} fontSize="12" fontWeight="600">{l}</text>
            {i < layers.length - 1 && (
              <line x1={200} y1={y + 46} x2={200} y2={y + 58} stroke={C.white} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function DiagramKVCache() {
  return (
    <svg viewBox="0 0 640 240" className="mx-auto mt-6 w-full max-w-2xl">
      <rect x={40} y={40} width={200} height={160} rx={12} fill={C.blue} opacity="0.15" stroke={C.blue} strokeWidth="1" />
      <text x={140} y={70} textAnchor="middle" fill={C.blue} fontSize="12" fontWeight="700">New tokens</text>
      <text x={140} y={95} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.7">Q computed each step</text>

      <rect x={280} y={40} width={320} height={160} rx={12} fill={C.cyan} opacity="0.12" stroke={C.cyan} strokeWidth="1" />
      <text x={440} y={70} textAnchor="middle" fill={C.cyan} fontSize="12" fontWeight="700">KV cache (GPU HBM)</text>
      {["K₁ V₁", "K₂ V₂", "…", "Kₙ Vₙ"].map((label, i) => (
        <rect key={i} x={300 + i * 72} y={100} width={60} height={70} rx={6} fill={C.cyan} opacity={0.2 + i * 0.08} />
      ))}
      <text x={440} y={195} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.65">
        Reuse past keys/values — avoid recomputing attention over full history
      </text>
      <line x1={240} y1={120} x2={280} y2={120} stroke={C.orange} strokeWidth="2" strokeDasharray="4 3" />
    </svg>
  );
}

export function DiagramDecodingTree() {
  return (
    <svg viewBox="0 0 500 220" className="mx-auto mt-6 w-full max-w-lg">
      <circle cx={250} cy={30} r={22} fill={C.blue} />
      <text x={250} y={35} textAnchor="middle" fill={C.white} fontSize="10" fontWeight="700">logits</text>
      {[
        { x: 120, y: 100, label: "the", p: "0.31" },
        { x: 250, y: 100, label: "a", p: "0.22" },
        { x: 380, y: 100, label: "in", p: "0.18" },
      ].map((n, i) => (
        <g key={i}>
          <line x1={250} y1={52} x2={n.x} y2={n.y - 18} stroke={C.white} strokeWidth="1.5" opacity="0.35" />
          <circle cx={n.x} cy={n.y} r={20} fill={i === 0 ? C.orange : C.blue} opacity="0.85" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill={C.white} fontSize="9" fontWeight="600">{n.label}</text>
          <text x={n.x} y={n.y + 38} textAnchor="middle" fill={C.cyan} fontSize="9">{n.p}</text>
        </g>
      ))}
      <text x={250} y={200} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.55">
        Temperature widens/narrows the distribution · top-p prunes the tail
      </text>
    </svg>
  );
}

export function DiagramPrefillDecode() {
  return (
    <svg viewBox="0 0 700 160" className="mx-auto mt-6 w-full max-w-3xl">
      <text x={120} y={25} fill={C.cyan} fontSize="11" fontWeight="700">Prefill (parallel)</text>
      <rect x={40} y={35} width={160} height={50} rx={8} fill={C.cyan} opacity="0.25" />
      <rect x={55} y={45} width={130} height={30} rx={4} fill={C.cyan} opacity="0.7" />
      <text x={120} y={95} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.6">Process full prompt at once</text>

      <text x={420} y={25} fill={C.orange} fontSize="11" fontWeight="700">Decode (serial)</text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={320 + i * 56} y={35} width={44} height={50} rx={6} fill={C.orange} opacity={0.2 + i * 0.12} />
      ))}
      <text x={420} y={115} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.6">One token per forward pass — memory-bound</text>

      <line x1={210} y1={60} x2={310} y2={60} stroke={C.white} strokeWidth="2" opacity="0.4" />
      <text x={260} y={52} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.5">→</text>
    </svg>
  );
}

export function DiagramGPUCluster() {
  const gpus = [0, 1, 2, 3];
  return (
    <svg viewBox="0 0 600 260" className="mx-auto mt-6 w-full max-w-xl">
      <rect x={180} y={20} width={240} height={50} rx={10} fill={C.blue} opacity="0.85" />
      <text x={300} y={52} textAnchor="middle" fill={C.white} fontSize="12" fontWeight="700">Inference gateway</text>
      {gpus.map((i) => (
        <g key={i}>
          <line x1={300} y1={70} x2={100 + i * 130} y2={110} stroke={C.cyan} strokeWidth="1.5" opacity="0.4" />
          <rect x={60 + i * 130} y={110} width={100} height={80} rx={10} fill={C.deep} stroke={C.blue} strokeWidth="1" />
          <text x={110 + i * 130} y={150} textAnchor="middle" fill={C.cyan} fontSize="10" fontWeight="600">GPU {i + 1}</text>
          <text x={110 + i * 130} y={170} textAnchor="middle" fill={C.white} fontSize="8" opacity="0.6">tensor parallel</text>
        </g>
      ))}
      <text x={300} y={230} textAnchor="middle" fill={C.orange} fontSize="10" fontWeight="600" opacity="0.85">
        NCCL · continuous batching · KV-aware scheduling
      </text>
    </svg>
  );
}

export function DiagramQuantization() {
  const formats = [
    { label: "FP32", bits: 32, w: 280, color: C.slate },
    { label: "FP16/BF16", bits: 16, w: 200, color: C.blue },
    { label: "INT8", bits: 8, w: 120, color: C.cyan },
    { label: "INT4", bits: 4, w: 70, color: C.orange },
  ];
  return (
    <svg viewBox="0 0 400 200" className="mx-auto mt-6 w-full max-w-md">
      {formats.map((f, i) => (
        <g key={i}>
          <text x={10} y={35 + i * 42} fill={C.white} fontSize="11" fontWeight="600">{f.label}</text>
          <rect x={90} y={18 + i * 42} width={f.w} height={28} rx={6} fill={f.color} opacity="0.85" />
          <text x={95 + f.w} y={37 + i * 42} fill={C.white} fontSize="10" opacity="0.55">{f.bits}b</text>
        </g>
      ))}
    </svg>
  );
}

export function DiagramReasoningTree() {
  return (
    <svg viewBox="0 0 480 240" className="mx-auto mt-6 w-full max-w-lg">
      <circle cx={240} cy={28} r={20} fill={C.orange} />
      <text x={240} y={33} textAnchor="middle" fill={C.white} fontSize="9" fontWeight="700">query</text>
      {[
        { x: 100, y: 90, label: "path A" },
        { x: 240, y: 90, label: "path B" },
        { x: 380, y: 90, label: "path C" },
      ].map((n, i) => (
        <g key={i}>
          <line x1={240} y1={48} x2={n.x} y2={n.y - 16} stroke={C.cyan} strokeWidth="1.5" opacity="0.5" />
          <rect x={n.x - 40} y={n.y} width={80} height={36} rx={8} fill={C.blue} opacity="0.7" />
          <text x={n.x} y={n.y + 22} textAnchor="middle" fill={C.white} fontSize="9">{n.label}</text>
        </g>
      ))}
      <rect x={160} y={160} width={160} height={44} rx={10} fill={C.orange} opacity="0.85" />
      <text x={240} y={188} textAnchor="middle" fill={C.white} fontSize="10" fontWeight="700">best answer</text>
      <text x={240} y={225} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.55">test-time scaling · self-consistency</text>
    </svg>
  );
}

export function DiagramMultimodal() {
  const mods = [
    { label: "Text", icon: "T", color: C.blue },
    { label: "Image", icon: "▣", color: C.cyan },
    { label: "Audio", icon: "♪", color: C.orange },
  ];
  return (
    <svg viewBox="0 0 500 200" className="mx-auto mt-6 w-full max-w-lg">
      {mods.map((m, i) => (
        <g key={i}>
          <rect x={40 + i * 150} y={40} width={110} height={70} rx={12} fill={m.color} opacity="0.75" />
          <text x={95 + i * 150} y={72} textAnchor="middle" fill={C.white} fontSize="18">{m.icon}</text>
          <text x={95 + i * 150} y={95} textAnchor="middle" fill={C.white} fontSize="10" fontWeight="600">{m.label}</text>
          <line x1={95 + i * 150} y1={110} x2={250} y2={150} stroke={m.color} strokeWidth="2" opacity="0.5" />
        </g>
      ))}
      <circle cx={250} cy={165} r={36} fill={C.blue} />
      <text x={250} y={170} textAnchor="middle" fill={C.white} fontSize="10" fontWeight="700">Fusion</text>
    </svg>
  );
}

export function DiagramEdgeVsCloud() {
  return (
    <svg viewBox="0 0 640 200" className="mx-auto mt-6 w-full max-w-2xl">
      <rect x={30} y={30} width={250} height={140} rx={14} fill={C.cyan} opacity="0.1" stroke={C.cyan} strokeWidth="1" />
      <text x={155} y={60} textAnchor="middle" fill={C.cyan} fontSize="13" fontWeight="700">Edge / on-device</text>
      {["Low latency", "Privacy", "Offline", "Quantized SLMs"].map((t, i) => (
        <text key={i} x={155} y={88 + i * 22} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.75">{t}</text>
      ))}
      <rect x={360} y={30} width={250} height={140} rx={14} fill={C.blue} opacity="0.1" stroke={C.blue} strokeWidth="1" />
      <text x={485} y={60} textAnchor="middle" fill={C.blue} fontSize="13" fontWeight="700">Cloud inference</text>
      {["Largest models", "Elastic scale", "Shared GPUs", "Agent orchestration"].map((t, i) => (
        <text key={i} x={485} y={88 + i * 22} textAnchor="middle" fill={C.white} fontSize="10" opacity="0.75">{t}</text>
      ))}
    </svg>
  );
}

export function DiagramCostFlow() {
  return (
    <svg viewBox="0 0 600 180" className="mx-auto mt-6 w-full max-w-xl">
      {["GPU $/hr", "Utilization", "Tokens/sec", "Cost / token", "Margin"].map((s, i) => (
        <g key={i}>
          <rect x={30 + i * 112} y={50} width={96} height={50} rx={10} fill={i === 4 ? C.orange : C.blue} opacity="0.75" />
          <text x={78 + i * 112} y={80} textAnchor="middle" fill={C.white} fontSize="9" fontWeight="600">{s}</text>
          {i < 4 && <text x={126 + i * 112} y={78} fill={C.white} fontSize="14" opacity="0.4">→</text>}
        </g>
      ))}
    </svg>
  );
}

export function DiagramInferenceStack() {
  const stack = [
    { label: "User prompt", color: C.cyan },
    { label: "Tokenization & embeddings", color: C.blue },
    { label: "Transformer + KV cache", color: "#6366f1" },
    { label: "Decoding & sampling", color: C.orange },
    { label: "GPU / accelerator", color: "#14b8a6" },
    { label: "Cluster & gateway", color: C.blue },
    { label: "Agents & reasoning loops", color: "#a855f7" },
  ];
  return (
    <svg viewBox="0 0 500 380" className="mx-auto mt-8 w-full max-w-md">
      {stack.map((l, i) => {
        const y = i * 50 + 20;
        return (
          <g key={i}>
            <rect x={60} y={y} width={380} height={42} rx={10} fill={l.color} opacity="0.85" />
            <text x={250} y={y + 26} textAnchor="middle" fill={C.white} fontSize="12" fontWeight="600">{l.label}</text>
            {i < stack.length - 1 && (
              <polygon points={`250,${y + 44} 245,${y + 50} 255,${y + 50}`} fill={C.white} opacity="0.35" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function DiagramMemoryBandwidth() {
  return (
    <svg viewBox="0 0 520 200" className="mx-auto mt-6 w-full max-w-lg">
      <rect x={40} y={60} width={180} height={100} rx={12} fill={C.blue} opacity="0.2" stroke={C.blue} />
      <text x={130} y={95} textAnchor="middle" fill={C.blue} fontSize="11" fontWeight="700">Compute (tensor cores)</text>
      <text x={130} y={115} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.65">FLOPs-bound at large batch</text>

      <rect x={300} y={60} width={180} height={100} rx={12} fill={C.orange} opacity="0.2" stroke={C.orange} />
      <text x={390} y={95} textAnchor="middle" fill={C.orange} fontSize="11" fontWeight="700">Memory (HBM bandwidth)</text>
      <text x={390} y={115} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.65">Decode often memory-bound</text>

      <text x={260} y={185} textAnchor="middle" fill={C.cyan} fontSize="10" fontWeight="600">
        KV cache growth shifts the bottleneck
      </text>
    </svg>
  );
}

export function DiagramVLLMScheduling() {
  return (
    <svg viewBox="0 0 560 200" className="mx-auto mt-6 w-full max-w-2xl">
      <text x={80} y={25} fill={C.white} fontSize="10" fontWeight="600" opacity="0.7">Request queue</text>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={40 + i * 70} y={35} width={60} height={30} rx={6} fill={C.blue} opacity={0.4 + i * 0.15} />
      ))}
      <text x={280} y={25} textAnchor="middle" fill={C.cyan} fontSize="10" fontWeight="700">PagedAttention blocks</text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={180 + i * 52} y={70} width={44} height={80} rx={4} fill={C.cyan} opacity={0.15 + (i % 3) * 0.12} stroke={C.cyan} strokeWidth="0.5" />
      ))}
      <text x={280} y={175} textAnchor="middle" fill={C.white} fontSize="9" opacity="0.55">Non-contiguous KV pages · less fragmentation</text>
    </svg>
  );
}

export function DiagramAgentLoop() {
  return (
    <svg viewBox="0 0 320 320" className="mx-auto mt-6 w-full max-w-xs">
      {["Observe", "Plan", "Act", "Tool call", "Reflect"].map((s, i) => {
        const angle = (i * 72 - 90) * (Math.PI / 180);
        const cx = 160 + 100 * Math.cos(angle);
        const cy = 160 + 100 * Math.sin(angle);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={32} fill={i === 2 ? C.orange : C.blue} opacity="0.85" />
            <text x={cx} y={cy + 4} textAnchor="middle" fill={C.white} fontSize="8" fontWeight="600">{s}</text>
          </g>
        );
      })}
      <circle cx={160} cy={160} r={28} fill={C.cyan} opacity="0.3" />
      <text x={160} y={165} textAnchor="middle" fill={C.white} fontSize="9" fontWeight="700">Agent</text>
    </svg>
  );
}

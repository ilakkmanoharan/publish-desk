"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  C,
  DiagramAgentLoop,
  DiagramCostFlow,
  DiagramDecodingTree,
  DiagramEdgeVsCloud,
  DiagramGPUCluster,
  DiagramInferenceStack,
  DiagramKVCache,
  DiagramMemoryBandwidth,
  DiagramMultimodal,
  DiagramPrefillDecode,
  DiagramQuantization,
  DiagramReasoningTree,
  DiagramTokenFlow,
  DiagramTrainingVsInference,
  DiagramTransformerStack,
  DiagramVLLMScheduling,
} from "./diagrams";

const SECTIONS = [
  "Introduction",
  "The Big Idea",
  "LLM Inference",
  "Transformer",
  "Decoding",
  "Performance",
  "GPU & Hardware",
  "Optimization",
  "Distributed",
  "Reasoning",
  "Multimodal",
  "Edge",
  "Economics",
  "Future",
  "Inference Stack",
] as const;

const BG: Record<"dark" | "accent" | "deep", string> = {
  dark: C.navy,
  deep: `linear-gradient(160deg,${C.navy},${C.deep})`,
  accent: `linear-gradient(135deg,${C.deep},#0d3a5c,${C.navy})`,
};

function Slide({
  id,
  bg,
  children,
  className = "",
}: {
  id: string;
  bg: "dark" | "accent" | "deep";
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-slide
      className={`slide-section relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-24 md:px-16 lg:px-24 ${className}`}
      style={{ background: BG[bg], color: C.white }}
    >
      <SlideGlow />
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}

function SlideGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${C.cyan}18, transparent 70%)`,
      }}
    />
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]"
      style={{ background: `${C.cyan}22`, color: C.cyan, border: `1px solid ${C.cyan}44` }}
    >
      {text}
    </span>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-6 text-center text-[clamp(1.75rem,4.5vw,3rem)] font-bold leading-[1.1] tracking-tight">
      {children}
    </h2>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
      {children}
    </p>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mx-auto mt-4 max-w-2xl space-y-3 text-base leading-relaxed md:text-lg">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: C.orange }} />
          <span style={{ color: "rgba(255,255,255,0.88)" }}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="mx-auto mt-8 max-w-xl rounded-2xl p-5 text-left backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,211,238,0.2)" }}
    >
      <p className="text-sm font-bold uppercase tracking-wider" style={{ color: C.cyan }}>
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
        {body}
      </p>
    </div>
  );
}

function ToolGrid({ items }: { items: { name: string; role: string }[] }) {
  return (
    <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((t) => (
        <div
          key={t.name}
          className="rounded-xl p-4 text-left transition-transform duration-200 hover:-translate-y-0.5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="font-semibold" style={{ color: C.cyan }}>
            {t.name}
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            {t.role}
          </p>
        </div>
      ))}
    </div>
  );
}

function NavDots({ active, onJump }: { active: number; onJump: (idx: number) => void }) {
  return (
    <nav className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-2.5 lg:flex" aria-label="Section navigation">
      {SECTIONS.map((label, i) => (
        <button key={i} onClick={() => onJump(i)} aria-label={`Go to: ${label}`} className="group relative flex items-center">
          <span
            className="block rounded-full transition-all duration-200"
            style={{
              width: active === i ? 12 : 7,
              height: active === i ? 12 : 7,
              background: active === i ? C.orange : "rgba(255,255,255,0.22)",
              boxShadow: active === i ? `0 0 10px ${C.orange}88` : "none",
            }}
          />
          <span
            className="pointer-events-none absolute left-6 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
            style={{ background: C.deep, color: C.white }}
          >
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}

function Counter({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md"
      style={{ background: "rgba(10,22,40,0.85)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <span style={{ color: C.orange }}>{String(current + 1).padStart(2, "0")}</span>
      <span style={{ opacity: 0.35 }}> / </span>
      <span style={{ opacity: 0.5 }}>{String(total).padStart(2, "0")}</span>
    </div>
  );
}

export default function InferenceInAIPage() {
  const [active, setActive] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const jumpTo = useCallback((idx: number) => {
    document.querySelectorAll("[data-slide]")[idx]?.scrollIntoView({ behavior: "smooth" });
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
      { threshold: 0.42 },
    );
    slides.forEach((s) => observerRef.current!.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("slide-visible")),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".slide-animate").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="inference-article relative w-full overflow-x-hidden font-sans" style={{ background: C.navy, scrollBehavior: "smooth" }}>
      <style>{`
        .inference-article .slide-animate { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .inference-article .slide-visible { opacity: 1 !important; transform: translateY(0) !important; }
        .inference-article ::selection { background: ${C.cyan}33; }
        @keyframes token-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        .token-dot { animation: token-pulse 1.4s ease-in-out infinite; }
      `}</style>

      <NavDots active={active} onJump={jumpTo} />
      <Counter current={active} total={SECTIONS.length} />

      <Slide id="s0" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Visual systems guide" />
          <h1 className="text-[clamp(2.2rem,6vw,4.2rem)] font-bold leading-[1.05] tracking-tight">Inference in AI</h1>
          <p className="mt-2 text-[clamp(1.1rem,2.5vw,1.5rem)] font-medium" style={{ color: C.cyan }}>
            From Tokens to Thinking
          </p>
          <Lead>
            The runtime of intelligence — how frozen models turn prompts into predictions, how GPUs serve billions of tokens,
            and why inference is becoming the defining systems problem of the AI era.
          </Lead>
          <DiagramInferenceStack />
        </div>
      </Slide>

      <Slide id="s1" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 1" />
          <Heading>The Big Idea</Heading>
          <Lead>
            Training teaches a model; inference <em>uses</em> it. Every chat, agent, copilot, and multimodal app is inference —
            and its cost, latency, and quality now dominate product economics.
          </Lead>
          <Bullets
            items={[
              "Inference is forward-only execution of learned weights on new inputs.",
              "Unlike training, there is no gradient — only prediction under latency and memory constraints.",
              "Modern products ship intelligence as a service: inference is the runtime, not an afterthought.",
              "GPU-hours at inference scale often exceed one-time training spend for popular models.",
            ]}
          />
          <DiagramTrainingVsInference />
          <InsightCard
            title="Systems insight"
            body="Think of training as building a highway network and inference as rush-hour traffic management. The architecture is fixed; success is scheduling, capacity, and tail latency."
          />
        </div>
      </Slide>

      <Slide id="s2" bg="deep">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 2" />
          <Heading>How LLM Inference Actually Works</Heading>
          <Lead>
            A large language model does not think in paragraphs. It predicts one token at a time, conditioned on everything
            before it — prompt plus all generated tokens so far.
          </Lead>
          <Bullets
            items={[
              "Your prompt is tokenized into a sequence of subword IDs.",
              "Embeddings map tokens to vectors; positional encoding (often RoPE) encodes order.",
              "Each transformer layer applies causal self-attention — tokens may only attend to the past.",
              "The final layer emits logits; sampling picks the next token.",
              "That token is appended; the loop repeats until stop criteria or max length.",
            ]}
          />
          <DiagramTokenFlow />
        </div>
      </Slide>

      <Slide id="s3" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 3" />
          <Heading>The Transformer During Inference</Heading>
          <Lead>
            The same architecture that learned from the web must run thousands of times per second per GPU — with a growing
            memory footprint as context lengthens.
          </Lead>
          <Bullets
            items={[
              "Causal masking ensures autoregressive correctness: no peeking at future tokens.",
              "KV cache stores key/value projections for prior tokens so attention does not recompute history.",
              "Feed-forward blocks and residual paths dominate FLOPs; layernorm stabilizes activations.",
              "At decode time, batch size is often small — memory bandwidth, not raw FLOPs, becomes the bottleneck.",
            ]}
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <DiagramTransformerStack />
            <DiagramKVCache />
          </div>
          <DiagramMemoryBandwidth />
        </div>
      </Slide>

      <Slide id="s4" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Section 4" />
          <Heading>Token Generation &amp; Decoding</Heading>
          <Lead>
            Logits are a probability landscape over ~100k tokens. Decoding strategies shape creativity, factuality, and cost.
          </Lead>
          <Bullets
            items={[
              "Greedy decoding picks argmax — fast but repetitive.",
              "Temperature scales logits before softmax: low = deterministic, high = creative chaos.",
              "Top-k and top-p truncate unlikely mass to stabilize outputs.",
              "Speculative decoding drafts with a small model, verifies with the large one.",
            ]}
          />
          <DiagramDecodingTree />
        </div>
      </Slide>

      <Slide id="s5" bg="deep">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 5" />
          <Heading>Inference Performance</Heading>
          <Lead>
            Users feel time-to-first-token; operators optimize tokens/sec and GPU utilization. Prefill and decode are different
            phases with different bottlenecks.
          </Lead>
          <Bullets
            items={[
              "Prefill processes the prompt in parallel — compute-heavy, sets TTFT.",
              "Decode generates one or few tokens per step — memory-bandwidth-heavy.",
              "Continuous batching merges new requests without waiting for entire batches to finish.",
              "Tail latency spikes when queues saturate or KV memory fragments.",
            ]}
          />
          <DiagramPrefillDecode />
          <DiagramVLLMScheduling />
        </div>
      </Slide>

      <Slide id="s6" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 6" />
          <Heading>GPU &amp; Hardware Inference</Heading>
          <Lead>
            NVIDIA H100s, Google TPUs, Apple Neural Engine, and custom ASICs chase more useful tokens per watt per dollar.
          </Lead>
          <Bullets
            items={[
              "Tensor cores accelerate matrix multiplies in FP16/BF16/INT8.",
              "HBM bandwidth feeds weights and KV cache — often the decode bottleneck.",
              "FlashAttention fuses attention kernels to reduce memory traffic.",
              "Tensor and pipeline parallelism shard large models across devices.",
            ]}
          />
          <DiagramGPUCluster />
          <ToolGrid
            items={[
              { name: "CUDA / cuDNN", role: "Kernel execution on NVIDIA GPUs" },
              { name: "FlashAttention", role: "IO-aware attention fusion" },
              { name: "CUDA Graphs", role: "Reduce CPU launch overhead" },
              { name: "TensorRT-LLM", role: "Compiled inference graphs" },
            ]}
          />
        </div>
      </Slide>

      <Slide id="s7" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 7" />
          <Heading>Modern Inference Optimization</Heading>
          <Lead>
            Serving stacks squeeze latency and cost through precision, memory layout, and scheduling — not bigger models alone.
          </Lead>
          <Bullets
            items={[
              "Quantization (INT8/INT4) shrinks weights and activations with calibrated tradeoffs.",
              "PagedAttention (vLLM) stores KV in non-contiguous blocks — higher utilization.",
              "Distillation and pruning compress models for edge; MoE routes tokens to expert subsets.",
              "llama.cpp and TensorRT-LLM target deployment with graph fusion and custom kernels.",
            ]}
          />
          <DiagramQuantization />
          <ToolGrid
            items={[
              { name: "vLLM", role: "PagedAttention + continuous batching" },
              { name: "SGLang", role: "RadixAttention, structured generation" },
              { name: "DeepSpeed", role: "Multi-GPU inference" },
              { name: "Triton", role: "Model serving at scale" },
            ]}
          />
        </div>
      </Slide>

      <Slide id="s8" bg="deep">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Section 8" />
          <Heading>Distributed &amp; Cloud Inference</Heading>
          <Lead>
            Production inference is fleets of GPUs behind gateways, autoscalers, and regional routing — not a single process.
          </Lead>
          <Bullets
            items={[
              "Load balancers route by model, SLA tier, or geography.",
              "Disaggregated inference separates prefill and decode onto specialized pools.",
              "Serverless endpoints scale to zero; dedicated clusters optimize $/token.",
              "Ray Serve and Kubernetes orchestrate replicas, health checks, and rollouts.",
            ]}
          />
          <DiagramGPUCluster />
        </div>
      </Slide>

      <Slide id="s9" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 9" />
          <Heading>Reasoning-Time Compute</Heading>
          <Lead>
            Inference is no longer one forward pass. Agents chain tool calls, tree search, and reflection — multiplying tokens
            by design for higher-quality answers.
          </Lead>
          <Bullets
            items={[
              "Chain-of-thought elicits intermediate steps before the final answer.",
              "Test-time scaling runs multiple samples or search branches, then aggregates.",
              "Tool calling extends inference with retrieval, code execution, and APIs.",
              "Planning loops treat the LLM as a controller in a larger computation graph.",
            ]}
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <DiagramReasoningTree />
            <DiagramAgentLoop />
          </div>
        </div>
      </Slide>

      <Slide id="s10" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Section 10" />
          <Heading>Multimodal Inference</Heading>
          <Lead>
            Vision, audio, and video encoders produce token-like embeddings fused with text in shared transformer stacks.
          </Lead>
          <Bullets
            items={[
              "Images are patch-embedded and projected into the language model embedding space.",
              "Cross-attention layers align modalities when encoders stay separate.",
              "Speech pipelines chunk audio into streaming inference windows.",
              "Video stacks sample frames or use temporal encoders.",
            ]}
          />
          <DiagramMultimodal />
        </div>
      </Slide>

      <Slide id="s11" bg="deep">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 11" />
          <Heading>Edge &amp; On-Device Inference</Heading>
          <Lead>
            SLMs, aggressive quantization, and Apple Silicon NPUs bring inference local — for privacy, offline use, and fast loops.
          </Lead>
          <Bullets
            items={[
              "GGUF, MLX, and ONNX runtimes target laptop and mobile constraints.",
              "TinyML covers microcontrollers; cloud handles frontier-scale reasoning.",
              "Hybrid architectures route sensitive tasks on-device, hard problems to cloud.",
            ]}
          />
          <DiagramEdgeVsCloud />
        </div>
      </Slide>

      <Slide id="s12" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Section 12" />
          <Heading>The Economics of Inference</Heading>
          <Lead>
            Cost per token = GPU hourly cost ÷ (useful tokens/sec × utilization). Inference margin shapes every AI product.
          </Lead>
          <Bullets
            items={[
              "Underutilized GPUs destroy margin — scheduling and batching are business-critical.",
              "Premium APIs charge per million tokens; caching and distillation defend margin.",
              "Inference infrastructure is the new cloud layer.",
            ]}
          />
          <DiagramCostFlow />
        </div>
      </Slide>

      <Slide id="s13" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 13" />
          <Heading>The Future of Inference</Heading>
          <Lead>
            Sparse models, persistent agent memory, and inference-native OS schedulers will treat thinking as a first-class resource.
          </Lead>
          <Bullets
            items={[
              "Adaptive compute allocates more steps to hard queries, fewer to trivial ones.",
              "Memory-augmented inference externalizes long context into retrieval stores.",
              "Neuromorphic accelerators explore radically different energy profiles.",
              "Industrial copilots embed inference in closed-loop physical systems.",
            ]}
          />
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            {[
              "Real-time reasoning substrates",
              "Inference-native operating systems",
              "Persistent autonomous agents",
              "World-model simulation loops",
            ].map((label) => (
              <div
                key={label}
                className="rounded-xl px-5 py-4 text-center text-sm font-medium"
                style={{ background: `${C.blue}18`, border: `1px solid ${C.blue}33` }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </Slide>

      <Slide id="s14" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Final synthesis" />
          <Heading>The Inference Stack</Heading>
          <Lead>
            From your first keystroke to a reasoning agent orchestrating tools across a GPU cluster — inference is where AI meets the world.
          </Lead>
          <DiagramInferenceStack />
          <p className="mx-auto mt-10 max-w-2xl text-lg font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Training built the model. <span style={{ color: C.cyan }}>Inference delivers intelligence</span> — one token, one request, one decision at a time.
          </p>
        </div>
      </Slide>
    </div>
  );
}

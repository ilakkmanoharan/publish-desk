"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import heroQuote from "./intelligence-quote.png";
import {
  C,
  DiagramArchitecture,
  DiagramAsraLoop,
  DiagramComparisonMatrix,
  DiagramExplorationTree,
  DiagramGeneralization,
  DiagramLLMvsASRA,
  DiagramMemorizationVsAdaptation,
  DiagramMemoryGraph,
  DiagramResearchMap,
  DiagramScientificMethod,
} from "./diagrams";

const SECTIONS = [
  "Introduction",
  "Intelligence",
  "AI Limits",
  "What is ASRA",
  "Principles",
  "Architecture",
  "Comparison",
  "Research",
  "Scientific Method",
  "Generalization",
  "Advanced",
  "Future",
  "Why It Matters",
  "Conclusion",
] as const;

type Bg = "dark" | "accent" | "deep" | "light";

const BG: Record<Bg, string> = {
  dark: C.deep,
  deep: `linear-gradient(160deg,${C.deep},${C.navy})`,
  accent: `linear-gradient(135deg,${C.navy},#3b2667,${C.deep})`,
  light: C.light,
};

function Slide({ id, bg, children }: { id: string; bg: Bg; children: ReactNode }) {
  const isLight = bg === "light";
  return (
    <section
      id={id}
      data-slide
      className="slide-section relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-24 md:px-16 lg:px-24"
      style={{ background: BG[bg], color: isLight ? C.deep : C.white }}
    >
      {!isLight && <SlideGlow />}
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}

function SlideGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-50"
      style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${C.purple}22, transparent 70%)` }}
    />
  );
}

function Badge({ text, light }: { text: string; light?: boolean }) {
  return (
    <span
      className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]"
      style={{
        background: light ? `${C.purple}18` : `${C.lavender}22`,
        color: light ? C.purple : C.lavender,
        border: `1px solid ${light ? C.purple : C.lavender}44`,
      }}
    >
      {text}
    </span>
  );
}

function Heading({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <h2
      className="mb-6 text-center text-[clamp(1.75rem,4.5vw,3rem)] font-bold leading-[1.1] tracking-tight"
      style={{ color: light ? C.deep : C.white }}
    >
      {children}
    </h2>
  );
}

function Lead({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className="mx-auto mb-6 max-w-2xl text-center text-lg leading-relaxed"
      style={{ color: light ? C.slate : "rgba(255,255,255,0.72)" }}
    >
      {children}
    </p>
  );
}

function Bullets({ items, light }: { items: string[]; light?: boolean }) {
  return (
    <ul className="mx-auto mt-4 max-w-2xl space-y-3 text-base leading-relaxed md:text-lg">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: C.purple }} />
          <span style={{ color: light ? C.deep : "rgba(255,255,255,0.88)" }}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="mx-auto mt-8 max-w-xl rounded-2xl p-5 text-left backdrop-blur-md"
      style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(167,139,250,0.35)" }}
    >
      <p className="text-sm font-bold uppercase tracking-wider" style={{ color: C.lavender }}>
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
        {body}
      </p>
    </div>
  );
}

function PrincipleCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-xl p-4 text-left"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(167,139,250,0.2)" }}
    >
      <p className="font-semibold" style={{ color: C.lavender }}>
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
        {body}
      </p>
    </div>
  );
}

function NavDots({ active, onJump }: { active: number; onJump: (idx: number) => void }) {
  return (
    <nav className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex" aria-label="Section navigation">
      {SECTIONS.map((_, i) => (
        <button key={i} onClick={() => onJump(i)} aria-label={`Go to section ${i + 1}`} className="flex items-center">
          <span
            className="block rounded-full transition-all duration-200"
            style={{
              width: active === i ? 11 : 6,
              height: active === i ? 11 : 6,
              background: active === i ? C.lavender : "rgba(255,255,255,0.2)",
              boxShadow: active === i ? `0 0 10px ${C.purple}88` : "none",
            }}
          />
        </button>
      ))}
    </nav>
  );
}

function Counter({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md"
      style={{ background: "rgba(26,15,46,0.9)", border: "1px solid rgba(167,139,250,0.2)" }}
    >
      <span style={{ color: C.lavender }}>{String(current + 1).padStart(2, "0")}</span>
      <span style={{ opacity: 0.35 }}> / </span>
      <span style={{ opacity: 0.5 }}>{String(total).padStart(2, "0")}</span>
    </div>
  );
}

export default function AsraIntelligencePage() {
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
      { threshold: 0.4 },
    );
    slides.forEach((s) => observerRef.current!.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("slide-visible")),
      { threshold: 0.1 },
    );
    document.querySelectorAll(".slide-animate").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="asra-article relative w-full overflow-x-hidden font-sans" style={{ background: C.deep, scrollBehavior: "smooth" }}>
      <style>{`
        .asra-article .slide-animate { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .asra-article .slide-visible { opacity: 1 !important; transform: translateY(0) !important; }
        .asra-article ::selection { background: ${C.purple}44; }
      `}</style>

      <NavDots active={active} onJump={jumpTo} />
      <Counter current={active} total={SECTIONS.length} />

      <Slide id="s0" bg="light">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Adaptive intelligence" light />
          <h1 className="text-[clamp(2rem,5.5vw,3.8rem)] font-bold leading-[1.05] tracking-tight" style={{ color: C.deep }}>
            ASRA
          </h1>
          <p className="mt-1 text-[clamp(1rem,2.2vw,1.35rem)] font-medium" style={{ color: C.purple }}>
            Adaptive Scientific Reasoning Architecture
          </p>
          <p className="mx-auto mt-2 max-w-xl text-base" style={{ color: C.slate }}>
            Intelligence as adaptive strategy formation in unfamiliar environments
          </p>
          <div className="mx-auto mt-10 max-w-lg overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
            <Image
              src={heroQuote}
              alt="Intelligence is not the memorization of solutions. Intelligence is the adaptive invention of strategies in unfamiliar environments — in both artificial and biological minds."
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </Slide>

      <Slide id="s1" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 1" />
          <Heading>What Is Intelligence?</Heading>
          <Lead>
            IQ tests and benchmarks measure performance on known tasks — not the ability to invent new strategies when the rules change.
          </Lead>
          <Bullets
            items={[
              "Memorization is not intelligence: recalling solutions is not understanding environments.",
              "True intelligence emerges when an agent adapts, generalizes, and reasons in settings it has never seen.",
              "Children, scientists, and explorers share one pattern: hypothesis, experiment, abstraction, reuse.",
              "Evolution is adaptive strategy search under uncertainty — not a lookup table.",
            ]}
          />
          <DiagramMemorizationVsAdaptation />
          <InsightCard
            title="Key Insight"
            body="A lookup system can ace a benchmark. An intelligent system can walk into an unfamiliar room and figure out what to do."
          />
        </div>
      </Slide>

      <Slide id="s2" bg="deep">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 2" />
          <Heading>The Limitations of Modern AI</Heading>
          <Lead>
            Many systems appear intelligent yet fail under novelty — distribution shift, hidden rules, and tasks that require invention rather than recall.
          </Lead>
          <Bullets
            items={[
              "Next-token prediction optimizes plausible continuations, not causal understanding of environments.",
              "RLHF aligns outputs to preferences but does not grant exploration or world-model discovery.",
              "Benchmark overfitting rewards memorized patterns — brittle on ARC-style abstract reasoning.",
              "Hallucinations reveal missing grounding: the model never had to discover how the world works.",
            ]}
          />
          <DiagramLLMvsASRA />
        </div>
      </Slide>

      <Slide id="s3" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Section 3" />
          <Heading>What Is ASRA?</Heading>
          <Lead>
            <strong>Adaptive Scientific Reasoning Architecture</strong> — a cognitive architecture for active discovery, not passive prediction.
          </Lead>
          <Bullets
            items={[
              "Reasoning as scientific exploration: observe, hypothesize, experiment, learn.",
              "Environments as puzzles with hidden mechanics to reverse-engineer.",
              "Abstractions and strategies that transfer across tasks — not just tokens.",
            ]}
          />
          <DiagramAsraLoop />
        </div>
      </Slide>

      <Slide id="s4" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 4" />
          <Heading>The Core Principles of ASRA</Heading>
          <Lead>Five pillars that separate adaptive reasoning from static policies.</Lead>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            <PrincipleCard title="Exploration before exploitation" body="Curiosity, uncertainty reduction, intrinsic motivation — explore before committing." />
            <PrincipleCard title="Hidden mechanics discovery" body="Infer latent rules through experimentation, like a scientist in an unknown lab." />
            <PrincipleCard title="Rapid abstraction formation" body="Compress experience into reusable, compositional concepts." />
            <PrincipleCard title="Adaptive strategy synthesis" body="Invent policies via meta-reasoning — chess meets scientific method." />
            <PrincipleCard title="Structured scientific memory" body="Episodic, semantic, procedural, and causal memory in a reasoning graph." />
          </div>
          <DiagramExplorationTree />
        </div>
      </Slide>

      <Slide id="s5" bg="deep">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 5" />
          <Heading>ASRA System Architecture</Heading>
          <Lead>A layered stack from environment perception through exploration, abstraction, strategy synthesis, and self-evaluation.</Lead>
          <DiagramArchitecture />
          <DiagramMemoryGraph />
        </div>
      </Slide>

      <Slide id="s6" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Section 6" />
          <Heading>ASRA vs Current AI Systems</Heading>
          <Lead>LLMs excel at language; RL agents excel at fixed games; ASRA targets open-ended adaptation.</Lead>
          <DiagramComparisonMatrix />
        </div>
      </Slide>

      <Slide id="s7" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 7" />
          <Heading>Connections to Advanced AI Research</Heading>
          <Lead>ASRA intersects AGI benchmarks, world models, active inference, meta-learning, and neuro-symbolic reasoning.</Lead>
          <Bullets
            items={[
              "ARC Prize: measure generalization on novel tasks, not training-set recall.",
              "Active inference: minimize surprise through action and model updates.",
              "World models: simulate before acting.",
              "Program synthesis: compositional abstractions beyond vectors alone.",
            ]}
          />
          <DiagramResearchMap />
        </div>
      </Slide>

      <Slide id="s8" bg="deep">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Section 8" />
          <Heading>ASRA and the Scientific Method</Heading>
          <Lead>The same loop drives children, scientists, explorers, and evolution.</Lead>
          <DiagramScientificMethod />
          <InsightCard title="Key Insight" body="ASRA operationalizes the scientific method as a computational architecture." />
        </div>
      </Slide>

      <Slide id="s9" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 9" />
          <Heading>Multi-Environment Generalization</Heading>
          <Lead>True intelligence thrives when the training distribution ends.</Lead>
          <Bullets
            items={[
              "Few-shot adaptation from limited interaction.",
              "Domain transfer across superficially different tasks.",
              "Open-world intelligence without fixed episode boundaries.",
            ]}
          />
          <DiagramGeneralization />
        </div>
      </Slide>

      <Slide id="s10" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 10 · Advanced" />
          <Heading>Advanced Topics</Heading>
          <Lead>For researchers building the next generation of reasoning stacks.</Lead>
          <div className="mx-auto mt-6 grid max-w-3xl gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Meta-learning & online adaptation",
              "Causal inference & program induction",
              "Uncertainty & active inference",
              "Graph reasoning & symbolic abstraction",
              "Intrinsic rewards & hierarchical planning",
              "Continual learning & memory compression",
              "Self-reflection & recursive improvement",
              "Information-theoretic exploration",
              "Self-generated curricula",
            ].map((t) => (
              <div
                key={t}
                className="rounded-lg px-3 py-2.5 text-center text-xs font-medium"
                style={{ background: `${C.purple}22`, border: `1px solid ${C.purple}33`, color: "rgba(255,255,255,0.85)" }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </Slide>

      <Slide id="s11" bg="deep">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Section 11" />
          <Heading>The Future of AI</Heading>
          <Lead>Scaling alone may not yield AGI. The next wave may look more like scientists than chatbots.</Lead>
          <Bullets
            items={[
              "Autonomous scientific agents that design and run experiments.",
              "Robotic explorers discovering mechanics in physical worlds.",
              "Adaptive reasoning substrates that invent strategies.",
              "Self-improving cognition with reflection guardrails.",
            ]}
          />
        </div>
      </Slide>

      <Slide id="s12" bg="accent">
        <div className="slide-animate mx-auto max-w-4xl">
          <Badge text="Section 12" />
          <Heading>Why This Matters</Heading>
          <Lead>Adaptive intelligence changes what is possible across science, medicine, education, and civilization-scale systems.</Lead>
          <Bullets
            items={[
              "Science: hypothesis generation at unprecedented scale.",
              "Medicine: models that adapt to individual biology.",
              "Education: tutors that invent strategies per learner.",
              "Climate & engineering: discovery of interventions, not only prediction.",
            ]}
          />
        </div>
      </Slide>

      <Slide id="s13" bg="dark">
        <div className="slide-animate mx-auto max-w-4xl text-center">
          <Badge text="Conclusion" />
          <Heading>Intelligence as Invention</Heading>
          <blockquote className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-relaxed md:text-2xl" style={{ color: C.lavender }}>
            Intelligence is not the memorization of solutions. Intelligence is the adaptive invention of strategies in unfamiliar
            environments.
          </blockquote>
          <p className="mx-auto mt-10 max-w-xl text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            ASRA is a direction of travel: reasoning as exploration, abstraction as generalization, strategy synthesis as the
            signature of minds — artificial and biological alike.
          </p>
          <div className="mx-auto mt-10 max-w-sm overflow-hidden rounded-xl opacity-90 ring-1 ring-white/10">
            <Image src={heroQuote} alt="" className="h-auto w-full" aria-hidden />
          </div>
        </div>
      </Slide>
    </div>
  );
}

"use client";

type Props = {
  mode: "list" | "magazine2";
  onChange: (mode: "list" | "magazine2") => void;
  /** e.g. "Back to list" when showing magazine2 */
  magazine2Label?: string;
  /** SaaS header spec: gray track, white active chip + shadow */
  variant?: "default" | "saas";
};

export function MagazineViewToggle({ mode, onChange, magazine2Label, variant = "default" }: Props) {
  if (variant === "saas") {
    return (
      <div
        className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl bg-[#F3F4F6] p-1 text-sm"
        role="tablist"
        aria-label="Magazine layout"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "magazine2"}
          onClick={() => onChange("magazine2")}
          className={`h-8 rounded-lg px-4 text-sm font-medium transition-all ${
            mode === "magazine2"
              ? "bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              : "text-[#6B7280] hover:text-[#111827]"
          }`}
        >
          {magazine2Label ?? "Magazines"}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "list"}
          onClick={() => onChange("list")}
          className={`h-8 rounded-lg px-4 text-sm font-medium transition-all ${
            mode === "list"
              ? "bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              : "text-[#6B7280] hover:text-[#111827]"
          }`}
        >
          List
        </button>
      </div>
    );
  }

  return (
    <div
      className="inline-flex rounded-xl border border-border bg-card p-1 text-sm"
      role="tablist"
      aria-label="Magazine layout"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "magazine2"}
        onClick={() => onChange("magazine2")}
        className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
          mode === "magazine2" ? "bg-foreground text-background" : "text-muted hover:text-foreground"
        }`}
      >
        {magazine2Label ?? "Magazines"}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "list"}
        onClick={() => onChange("list")}
        className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
          mode === "list" ? "bg-foreground text-background" : "text-muted hover:text-foreground"
        }`}
      >
        List
      </button>
    </div>
  );
}

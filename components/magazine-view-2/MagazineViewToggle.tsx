"use client";

type Props = {
  mode: "list" | "magazine2";
  onChange: (mode: "list" | "magazine2") => void;
  /** e.g. "Back to list" when showing magazine2 */
  magazine2Label?: string;
};

export function MagazineViewToggle({ mode, onChange, magazine2Label }: Props) {
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
          mode === "magazine2"
            ? "bg-foreground text-background"
            : "text-muted hover:text-foreground"
        }`}
      >
        {magazine2Label ?? "Magazine View 2"}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "list"}
        onClick={() => onChange("list")}
        className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
          mode === "list"
            ? "bg-foreground text-background"
            : "text-muted hover:text-foreground"
        }`}
      >
        List
      </button>
    </div>
  );
}

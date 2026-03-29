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
      className="inline-flex gap-1 rounded-full bg-[#f4f4f4] p-1 font-sans text-sm font-medium shadow-inner shadow-black/[0.02]"
      role="tablist"
      aria-label="Magazine layout"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "magazine2"}
        onClick={() => onChange("magazine2")}
        className={`rounded-full px-3.5 py-1.5 transition-[color,box-shadow,background-color] ${
          mode === "magazine2"
            ? "bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            : "text-[#6B7280] hover:text-[#374151]"
        }`}
      >
        {magazine2Label ?? "Magazines"}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "list"}
        onClick={() => onChange("list")}
        className={`rounded-full px-3.5 py-1.5 transition-[color,box-shadow,background-color] ${
          mode === "list"
            ? "bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            : "text-[#6B7280] hover:text-[#374151]"
        }`}
      >
        List
      </button>
    </div>
  );
}

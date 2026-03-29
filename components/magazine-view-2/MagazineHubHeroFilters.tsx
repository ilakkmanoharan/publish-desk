"use client";

import { MagazineViewToggle } from "./MagazineViewToggle";

type Props = {
  view: "list" | "magazine2";
  onViewChange: (next: "list" | "magazine2") => void;
  description: string;
  category: string;
  tag: string;
  search: string;
  onCategoryChange: (v: string) => void;
  onTagChange: (v: string) => void;
  onSearchChange: (v: string) => void;
};

export function MagazineHubHeroFilters({
  view,
  onViewChange,
  description,
  category,
  tag,
  search,
  onCategoryChange,
  onTagChange,
  onSearchChange,
}: Props) {
  const fieldBase =
    "h-10 min-w-0 rounded-lg border border-[#DDDDDD] bg-[#FAFAFA] px-3 font-sans text-sm text-[#111827] shadow-none outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#999999] focus:bg-white focus:ring-1 focus:ring-[#999999]/30";
  const narrowField = `${fieldBase} w-full sm:w-[200px] sm:shrink-0`;

  return (
    <div className="magazine-hub-hero-filters pb-2">
      <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 max-w-[min(100%,640px)] flex-1">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#9CA3AF]">Publish Desk</p>
          <h1 className="mt-2 font-display text-[2rem] font-bold leading-tight tracking-tight text-[#111827] sm:text-4xl sm:leading-[1.15]">
            Magazines
          </h1>
          <p className="mt-2 max-w-[520px] font-sans text-base leading-relaxed text-[#555555] sm:text-lg">{description}</p>
        </div>
        <div className="shrink-0 sm:pt-1">
          <MagazineViewToggle mode={view} onChange={onViewChange} />
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-[#EEEEEE] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:mb-10 sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="sr-only" htmlFor="hub-filter-category">
            Filter by category
          </label>
          <input
            id="hub-filter-category"
            type="text"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="Category"
            className={narrowField}
            autoComplete="off"
          />
          <label className="sr-only" htmlFor="hub-filter-tag">
            Filter by tag
          </label>
          <input
            id="hub-filter-tag"
            type="text"
            value={tag}
            onChange={(e) => onTagChange(e.target.value)}
            placeholder="Tag"
            className={narrowField}
            autoComplete="off"
          />
          <label className="sr-only" htmlFor="hub-filter-search">
            Search magazines
          </label>
          <div className="relative min-w-0 w-full flex-1 sm:min-w-[200px]">
            <input
              id="hub-filter-search"
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search magazines…"
              className={`${fieldBase} w-full pr-10`}
            />
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

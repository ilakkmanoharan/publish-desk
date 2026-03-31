"use client";

import { useEffect, useRef, useState } from "react";
import {
  upsertPublication,
  addMagazineSlugsForPublish,
  updateContent,
} from "@/lib/firestore/collections";

type Magazine = { id: string; name: string; slug: string };

function dollarsToInput(usd: number | null | undefined): string {
  if (usd == null || Number.isNaN(usd)) return "";
  return usd.toFixed(2);
}

/** Upper bound for list price in USD (dollars). */
const MAX_PRICE_USD = 1_000_000;

/** Returns USD dollars, or null if empty. Throws if invalid or outside $0–$MAX_PRICE_USD. */
function parseUsdDollars(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseFloat(t);
  if (Number.isNaN(n)) throw new Error("invalid");
  if (n < 0 || n > MAX_PRICE_USD) throw new Error("range");
  return Math.round(n * 100) / 100;
}

/** Compare price inputs in a stable way (empty = no price). */
function normalizedPriceKey(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const n = Number.parseFloat(t);
  if (Number.isNaN(n)) return "__invalid__";
  return (Math.round(n * 100) / 100).toFixed(2);
}

export function AssignForm({
  userId,
  contentId,
  contentTitle,
  contentCategorySlug,
  contentTagNames,
  magazines,
  existingPublications,
  initialPremiumOnly,
  initialPremiumPriceUsd,
  initialReaderLayout,
  onAssigned,
}: {
  userId: string;
  contentId: string;
  contentTitle: string;
  contentCategorySlug: string;
  contentTagNames: string[];
  magazines: Magazine[];
  existingPublications: { magazineId: string }[];
  initialPremiumOnly?: boolean;
  initialPremiumPriceUsd?: number | null;
  /** Public article layout: magazine (default) or comic (numbered panels). */
  initialReaderLayout?: "magazine" | "comic";
  onAssigned: () => void;
}) {
  const [magazineId, setMagazineId] = useState("");
  const [displayTitle, setDisplayTitle] = useState("");
  const [status, setStatus] = useState<"Draft" | "Scheduled" | "Published">("Scheduled");
  const [scheduledAt, setScheduledAt] = useState("");
  const [accessTier, setAccessTier] = useState<"free" | "premium">("free");
  const [priceUsd, setPriceUsd] = useState("");
  const [readerLayout, setReaderLayout] = useState<"magazine" | "comic">(
    initialReaderLayout === "comic" ? "comic" : "magazine"
  );
  const [priceError, setPriceError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const savedFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAccessTier(initialPremiumOnly ? "premium" : "free");
    setPriceUsd(dollarsToInput(initialPremiumPriceUsd ?? null));
  }, [initialPremiumOnly, initialPremiumPriceUsd]);

  useEffect(() => {
    setReaderLayout(initialReaderLayout === "comic" ? "comic" : "magazine");
  }, [initialReaderLayout]);

  useEffect(
    () => () => {
      if (savedFlashTimerRef.current) clearTimeout(savedFlashTimerRef.current);
    },
    []
  );

  function clearSavedFlash() {
    if (savedFlashTimerRef.current) {
      clearTimeout(savedFlashTimerRef.current);
      savedFlashTimerRef.current = null;
    }
  }

  const availableMagazines = magazines.filter(
    (m) => !existingPublications.some((p) => p.magazineId === m.id)
  );

  async function persistAccess(): Promise<boolean> {
    setPriceError(null);
    const premiumOnly = accessTier === "premium";
    let premiumPriceUsd: number | null = null;
    if (premiumOnly) {
      try {
        premiumPriceUsd = parseUsdDollars(priceUsd);
      } catch (e) {
        const msg =
          e instanceof Error && e.message === "range"
            ? `Price must be between $0 and $${MAX_PRICE_USD.toLocaleString()} USD.`
            : "Enter a valid price in USD, or leave blank for no list price.";
        setPriceError(msg);
        return false;
      }
    }
    await updateContent(contentId, {
      premiumOnly,
      premiumPriceUsd: premiumOnly ? premiumPriceUsd : null,
      readerLayout,
    });
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (magazineId.trim() && status === "Scheduled" && !scheduledAt) {
        setFormError("Pick a scheduled date when status is Scheduled.");
        return;
      }

      const ok = await persistAccess();
      if (!ok) return;

      if (!magazineId.trim()) {
        await onAssigned();
        return;
      }

      const scheduled =
        status === "Scheduled" && scheduledAt ? new Date(scheduledAt) : null;
      const published = status === "Published" ? new Date() : null;

      await upsertPublication(userId, {
        contentId,
        magazineId,
        status,
        displayTitle: displayTitle.trim() || null,
        scheduledAt: scheduled,
        publishedAt: published,
      });
      if (status === "Published" && contentCategorySlug) {
        await addMagazineSlugsForPublish(magazineId, contentCategorySlug, contentTagNames);
      }
      await onAssigned();
      setDisplayTitle("");
      setMagazineId("");
    } finally {
      setSubmitting(false);
    }
  }

  const showAssignFields = availableMagazines.length > 0;
  const assignAction = Boolean(magazineId.trim());
  const buttonLabel = submitting
    ? "Saving..."
    : assignAction
      ? "Assign"
      : "Save";

  const savedAccessTier = initialPremiumOnly ? "premium" : "free";
  const savedPriceStr = dollarsToInput(initialPremiumPriceUsd ?? null);
  const accessPricingDirty =
    accessTier !== savedAccessTier ||
    normalizedPriceKey(priceUsd) !== normalizedPriceKey(savedPriceStr);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showAssignFields && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Display title (optional)
            </label>
            <input
              type="text"
              value={displayTitle}
              onChange={(e) => setDisplayTitle(e.target.value)}
              placeholder={contentTitle}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
            />
            <p className="text-xs text-muted mt-1">
              Override how this article appears in the magazine. If empty, the content title is used
              (first letter capitalized).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Magazine</label>
            <select
              value={magazineId}
              onChange={(e) => setMagazineId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
            >
              <option value="">— Optional: pick a magazine to assign —</option>
              {availableMagazines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "Draft" | "Scheduled" | "Published")
              }
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
            >
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Publish now</option>
            </select>
          </div>
          {status === "Scheduled" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Scheduled date (required when assigning as scheduled)
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
                required={assignAction && status === "Scheduled"}
              />
            </div>
          )}
        </>
      )}

      {!showAssignFields && magazines.length > 0 && (
        <p className="text-muted text-sm">
          This content is already assigned to all magazines. You can still update access and pricing
          below.
        </p>
      )}

      {magazines.length === 0 && (
        <p className="text-muted text-sm">
          No magazines yet. Add one in{" "}
          <a href="/dashboard/magazines" className="text-accent hover:underline">
            Magazines
          </a>
          . You can still save access and pricing for this article.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Access</label>
        <select
          value={accessTier}
          onChange={(e) => {
            clearSavedFlash();
            setAccessTier(e.target.value as "free" | "premium");
          }}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
        >
          <option value="free">Free</option>
          <option value="premium">Premium (paid)</option>
        </select>
        <p className="text-xs text-muted mt-1">
          {`Premium marks the article as paid content for your readers. List price is optional (USD, stored as dollars—e.g. 100 = $100, 100.55 = $100.55; max $${MAX_PRICE_USD.toLocaleString()}).`}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Article layout</label>
        <select
          value={readerLayout}
          onChange={(e) => setReaderLayout(e.target.value as "magazine" | "comic")}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
        >
          <option value="magazine">Magazine (default) — multi-column reading</option>
          <option value="comic">Comic book — one column, numbered panels in order</option>
        </select>
        <p className="text-xs text-muted mt-1">
          Comic layout shows each image as a numbered panel (Panel 1, 2, …) in top-to-bottom reading order with page-like side margins.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1" htmlFor="content-price-usd">
          List price (USD)
        </label>
        <input
          id="content-price-usd"
          type="number"
          min={0}
          max={MAX_PRICE_USD}
          step={0.01}
          value={priceUsd}
          onChange={(e) => {
            clearSavedFlash();
            setPriceUsd(e.target.value);
            setPriceError(null);
          }}
          disabled={accessTier !== "premium"}
          placeholder="0.00"
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow disabled:cursor-not-allowed disabled:opacity-60"
          aria-invalid={Boolean(priceError)}
        />
        {priceError && <p className="text-xs text-red-600 mt-1">{priceError}</p>}
        <p className="text-xs text-muted mt-1">
          {accessTier === "premium"
            ? `Enter $0–$${MAX_PRICE_USD.toLocaleString()}, or leave empty for premium with no list price.`
            : "Choose Premium (paid) above to set a list price."}
        </p>
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 rounded-xl border-2 border-transparent bg-accent px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-200 disabled:text-slate-900 disabled:opacity-100 disabled:shadow-none dark:disabled:border-zinc-500 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-50"
      >
        {buttonLabel}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getUserRepoUrl, setUserRepoUrl } from "@/lib/firestore/collections";

export function ProfileSourceTab({ userId }: { userId: string }) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    getUserRepoUrl(userId).then((url) => {
      setSavedUrl(url);
      setRepoUrl(url ?? "");
      setLoading(false);
    });
  }, [userId]);

  async function handleSave() {
    const url = repoUrl.trim() || null;
    setSaving(true);
    setMessage(null);
    try {
      await setUserRepoUrl(userId, url);
      setSavedUrl(url);
      setMessage({ type: "ok", text: url ? "Repo URL saved." : "Repo URL cleared." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSync() {
    const url = (repoUrl.trim() || savedUrl)?.trim();
    if (!url) {
      setMessage({ type: "err", text: "Enter a GitHub repo URL and save first." });
      return;
    }
    const auth = getFirebaseAuth();
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      setMessage({ type: "err", text: "You must be signed in to sync." });
      return;
    }
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync-github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ repoUrl: url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errText = data.error ?? data.details ?? `Sync failed (${res.status})`;
        const is503 = res.status === 503;
        const isCreds = /credentials|service account|misconfigured/i.test(String(errText));
        setMessage({
          type: "err",
          text:
            is503 && isCreds
              ? "Server setup required: add Firebase Admin credentials (FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in .env)."
              : errText,
        });
        return;
      }
      setMessage({
        type: "ok",
        text: `Synced: ${data.contentUpserted ?? 0} content items, ${data.categoriesCreated ?? 0} categories from ${data.filesScanned ?? 0} .md files.`,
      });
      await setUserRepoUrl(userId, url);
      setSavedUrl(url);
      router.refresh();
    } catch (e) {
      setMessage({
        type: "err",
        text: e instanceof Error ? e.message : "Sync failed",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#111827] md:text-2xl">Content source</h2>
        <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-[#6B7280]">
          Connect a GitHub repository to pull markdown into your dashboard. We use all{" "}
          <strong className="font-medium text-[#374151]">.md</strong> files; the first path segment is treated as
          category. .gitignore is not applied — every .md file in the repo is included.
        </p>
      </div>

      {loading ? (
        <p className="font-sans text-sm text-[#6B7280]">Loading…</p>
      ) : (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-6 ring-1 ring-black/[0.02]">
          <div className="space-y-4">
            <div>
              <label htmlFor="profile-repo-url" className="mb-1 block font-sans text-sm font-medium text-[#111827]">
                GitHub repository URL
              </label>
              <input
                id="profile-repo-url"
                name="github-repository-url"
                type="url"
                inputMode="url"
                autoComplete="url"
                data-1p-ignore
                data-lpignore="true"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] px-4 py-2.5 font-sans text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-sans text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save URL"}
              </button>
              <button
                type="button"
                onClick={() => void handleSync()}
                disabled={syncing}
                className="rounded-xl bg-[#111827] px-4 py-2.5 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {syncing ? "Syncing…" : "Sync from GitHub"}
              </button>
            </div>
            {message ? (
              <p
                className={
                  message.type === "ok" ? "font-sans text-sm text-emerald-700" : "font-sans text-sm text-red-600"
                }
                role="status"
              >
                {message.text}
              </p>
            ) : null}
            {savedUrl ? (
              <p className="font-sans text-sm text-[#6B7280]">
                Saved repo: <span className="text-[#111827]">{savedUrl}</span>
              </p>
            ) : null}
          </div>
        </div>
      )}

      <p className="font-sans text-xs text-[#9CA3AF]">
        Standalone page:{" "}
        <Link href="/dashboard/source" className="text-accent no-underline hover:underline">
          Dashboard → Content source
        </Link>
        .
      </p>
    </div>
  );
}

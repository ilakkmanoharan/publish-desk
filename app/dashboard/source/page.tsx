"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getUserRepoUrl, setUserRepoUrl } from "@/lib/firestore/collections";

export default function SourcePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [repoUrl, setRepoUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    getUserRepoUrl(user.uid).then((url) => {
      setSavedUrl(url);
      setRepoUrl(url ?? "");
      setLoading(false);
    });
  }, [user?.uid]);

  async function handleSave() {
    if (!user?.uid) return;
    const url = repoUrl.trim() || null;
    setSaving(true);
    setMessage(null);
    try {
      await setUserRepoUrl(user.uid, url);
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
          text: is503 && isCreds
            ? "Server setup required: add Firebase Admin credentials (FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in .env). See setup docs in private/."
            : errText,
        });
        return;
      }
      setMessage({
        type: "ok",
        text: `Synced: ${data.contentUpserted ?? 0} content items, ${data.categoriesCreated ?? 0} categories from ${data.filesScanned ?? 0} .md files.`,
      });
      if (user?.uid) {
        await setUserRepoUrl(user.uid, url);
        setSavedUrl(url);
      }
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

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Content source</h1>
      <p className="text-muted text-sm mb-6">
        Connect a GitHub repository to pull your content into the dashboard. We use all{" "}
        <strong>.md</strong> files and organize them by folder (first path segment = category).
        .gitignore is not applied — every .md file in the repo is included.
      </p>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div className="rounded-2xl bg-card border border-border shadow-md p-6 space-y-4">
          <div>
            <label htmlFor="dashboard-github-repo-url" className="block text-sm font-medium text-foreground mb-1">
              GitHub repository URL
            </label>
            <input
              id="dashboard-github-repo-url"
              name="github-repository-url"
              type="url"
              inputMode="url"
              autoComplete="url"
              data-1p-ignore
              data-lpignore="true"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-border text-foreground bg-background hover:bg-neutral-50 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save URL"}
            </button>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2.5 rounded-xl bg-accent text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {syncing ? "Syncing..." : "Sync from GitHub"}
            </button>
          </div>
          {message && (
            <p
              className={
                message.type === "ok"
                  ? "text-sm text-green-700"
                  : "text-sm text-red-600"
              }
            >
              {message.text}
            </p>
          )}
          {savedUrl && (
            <p className="text-muted text-sm">
              Saved repo: <span className="text-foreground">{savedUrl}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

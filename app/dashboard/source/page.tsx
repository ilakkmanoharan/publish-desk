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
        setMessage({
          type: "err",
          text: data.error ?? data.details ?? `Sync failed (${res.status})`,
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
    <div>
      <h1 className="text-2xl font-bold mb-6">Content source</h1>
      <p className="text-muted text-sm mb-6">
        Connect a GitHub repository to pull your content into the dashboard. We use all{" "}
        <strong>.md</strong> files and organize them by folder (first path segment = category).
        .gitignore is not applied — every .md file in the repo is included.
      </p>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm text-muted mb-1">GitHub repository URL</label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full px-3 py-2 rounded bg-card border border-border text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded bg-card border border-border text-foreground hover:bg-border disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save URL"}
            </button>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 rounded bg-accent text-background font-medium disabled:opacity-50"
            >
              {syncing ? "Syncing..." : "Sync from GitHub"}
            </button>
          </div>
          {message && (
            <p
              className={
                message.type === "ok"
                  ? "text-sm text-green-500"
                  : "text-sm text-red-400"
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

import { NextResponse } from "next/server";
import matter from "gray-matter";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import path from "path";
import { getAdminApp, getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import {
  deskPremiumOnly,
  getPublishDeskBlock,
  isPublishDeskFrontMatterActive,
  normalizeMagazineSlugs,
  normalizeTagNames,
} from "@/lib/publish-desk-front-matter";

const GITHUB_API = "https://api.github.com";

type GitHubTreeItem = { path: string; type: string; sha: string };

function rewriteRelativeMarkdownImageUrls(opts: {
  markdown: string;
  assetBaseUrl: string; // e.g. https://cdn.jsdelivr.net/gh/<owner>/<repo>@<sha>
  filePathInRepo: string; // e.g. planet-impossible/issue1/issue-1.md
}): { markdown: string; rewrittenCount: number; samples: Array<{ from: string; to: string }> } {
  const { markdown, assetBaseUrl, filePathInRepo } = opts;
  const baseDir = filePathInRepo.split("/").slice(0, -1).join("/");
  let rewrittenCount = 0;
  const samples: Array<{ from: string; to: string }> = [];

  // Match Markdown images: ![alt](url) including optional <...> wrapping.
  // We only rewrite relative paths (./, ../, or bare filenames).
  const next = markdown.replace(/!\[([^\]]*)\]\(([^)\r\n]+)\)/g, (full, alt, rawUrl) => {
    const trimmed = String(rawUrl).trim().replace(/^<|>$/g, "").replace(/^"(.*)"$/g, "$1").replace(/^'(.*)'$/g, "$1");

    // Leave absolute / special URLs untouched.
    if (/^(https?:)?\/\//i.test(trimmed) || /^data:/i.test(trimmed) || /^mailto:/i.test(trimmed)) return full;

    // Skip in-page anchors.
    if (trimmed.startsWith("#")) return full;

    // Only handle relative (including "./", "../") and bare file names.
    const joined = baseDir
      ? path.posix.normalize(path.posix.join(baseDir, trimmed))
      : path.posix.normalize(trimmed);

    // Guard: normalize can yield paths like "../x" — don't allow escape above repo root.
    if (joined.startsWith("..")) return full;

    const absolute = `${assetBaseUrl}/${joined}`;
    const from = `![${alt}](${trimmed})`;
    const to = `![${alt}](${absolute})`;
    rewrittenCount += 1;
    if (samples.length < 6) samples.push({ from, to });
    return to;
  });
  return { markdown: next, rewrittenCount, samples };
}

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const trimmed = url.trim().replace(/\.git$/, "");
  const match = trimmed.match(/github\.com[/:](\w[\w.-]*)\/([\w.-]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function upsertPublicationAdmin(
  db: Firestore,
  uid: string,
  contentId: string,
  magazineId: string
): Promise<string> {
  const pubs = db.collection("publications");
  const existing = await pubs
    .where("userId", "==", uid)
    .where("contentId", "==", contentId)
    .where("magazineId", "==", magazineId)
    .limit(1)
    .get();
  const publishedAt = new Date();
  const base = {
    userId: uid,
    contentId,
    magazineId,
    status: "Published",
    displayTitle: null,
    scheduledAt: null,
    publishedAt,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (!existing.empty) {
    await existing.docs[0].ref.update(base);
    return existing.docs[0].id;
  }
  const siblings = await pubs.where("userId", "==", uid).where("magazineId", "==", magazineId).get();
  let maxOrder = -1;
  siblings.forEach((d) => {
    const o = d.data().sortOrder;
    if (typeof o === "number" && !Number.isNaN(o)) maxOrder = Math.max(maxOrder, o);
  });
  const ref = await pubs.add({
    ...base,
    sortOrder: maxOrder + 1,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

async function mergeMagazineFilterSlugsAdmin(
  db: Firestore,
  magazineId: string,
  categorySlug: string,
  tagNames: string[]
): Promise<void> {
  const ref = db.collection("magazines").doc(magazineId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const data = snap.data()!;
  const currentSlugs = (data.categorySlugs as string[]) || [];
  const currentTags = (data.tagNames as string[]) || [];
  const newSlugs = currentSlugs.includes(categorySlug) ? currentSlugs : [...currentSlugs, categorySlug];
  const newTags = [...currentTags];
  for (const t of tagNames) {
    if (!newTags.includes(t)) newTags.push(t);
  }
  await ref.update({
    categorySlugs: newSlugs,
    tagNames: newTags,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function POST(request: Request) {
  try {
    getAdminApp();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("FIREBASE_SERVICE_ACCOUNT_JSON")) {
      return NextResponse.json(
        { error: "Server misconfigured: Firebase Admin credentials not set." },
        { status: 503 }
      );
    }
    throw e;
  }

  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    let uid: string;
    try {
      const app = getAdminApp();
      const auth = getAdminAuth();
      const decoded = await auth.verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const repoUrl = (body.repoUrl as string)?.trim();
    if (!repoUrl) {
      return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub repo URL" }, { status: 400 });
    }
    const { owner, repo } = parsed;

    // Get default branch and tree SHA
    const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!repoRes.ok) {
      const err = await repoRes.text();
      return NextResponse.json(
        { error: "Failed to fetch repo. Is it public?", details: err },
        { status: 400 }
      );
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch ?? "main";

    const branchRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/branches/${defaultBranch}`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    if (!branchRes.ok) {
      return NextResponse.json({ error: "Failed to fetch branch" }, { status: 400 });
    }
    const branchData = await branchRes.json();
    const commitSha = branchData.commit?.sha;
    if (!commitSha) {
      return NextResponse.json({ error: "Could not get commit SHA" }, { status: 400 });
    }

    const commitRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/commits/${commitSha}`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    if (!commitRes.ok) {
      return NextResponse.json({ error: "Failed to fetch commit" }, { status: 400 });
    }
    const commitJson = await commitRes.json();
    const treeSha = commitJson.tree?.sha;
    if (!treeSha) {
      return NextResponse.json({ error: "Could not get tree SHA" }, { status: 400 });
    }

    const treeRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    if (!treeRes.ok) {
      return NextResponse.json({ error: "Failed to fetch tree" }, { status: 400 });
    }
    const treeJson = await treeRes.json();
    const mdPaths = (treeJson.tree as GitHubTreeItem[]).filter(
      (item) => item.type === "blob" && item.path.toLowerCase().endsWith(".md")
    );

    const db = getAdminFirestore();
    const categoriesCol = db.collection("categories");
    const tagsCol = db.collection("tags");
    const contentCol = db.collection("content");

    const categoryIdsBySlug: Record<string, string> = {};
    const tagIdsByName: Record<string, string> = {};
    let categoriesCreated = 0;
    let contentUpserted = 0;
    let publicationsLinked = 0;
    let markdownImagesRewritten = 0;
    const markdownImageRewriteSamples: Array<{ path: string; from: string; to: string }> = [];
    const magazineSlugMisses: string[] = [];

    for (const item of mdPaths) {
      const path = item.path;
      const parts = path.split("/");
      const fileName = parts[parts.length - 1];
      const fileBase = fileName.replace(/\.md$/i, "");

      const contentRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${defaultBranch}`,
        { headers: { Accept: "application/vnd.github.v3+json" } }
      );
      if (!contentRes.ok) continue;
      const fileData = await contentRes.json();
      let raw = fileData.content;
      if (typeof raw === "string" && fileData.encoding === "base64") {
        raw = Buffer.from(raw, "base64").toString("utf-8");
      } else {
        continue;
      }

      const { data: frontMatter, content: body } = matter(raw);
      const fm = frontMatter as Record<string, unknown>;
      const deskActive = isPublishDeskFrontMatterActive(fm);
      const desk = deskActive ? getPublishDeskBlock(fm) : null;
      const useDesk = Boolean(desk);
      // Use an immutable, cached CDN URL pinned to commit SHA so images load reliably.
      const assetBaseUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${commitSha}`;
      const rewrite = rewriteRelativeMarkdownImageUrls({
        markdown: body,
        assetBaseUrl,
        filePathInRepo: path,
      });
      markdownImagesRewritten += rewrite.rewrittenCount;
      for (const s of rewrite.samples) {
        if (markdownImageRewriteSamples.length >= 8) break;
        markdownImageRewriteSamples.push({ path, from: s.from, to: s.to });
      }

      let title =
        (useDesk && typeof desk!.title === "string" && desk!.title.trim()) ||
        (typeof frontMatter.title === "string" && frontMatter.title.trim()) ||
        fileBase.replace(/-/g, " ");
      let slug =
        (useDesk && typeof desk!.slug === "string" && desk!.slug.trim() && slugify(desk!.slug.trim())) ||
        (frontMatter.slug && slugify(String(frontMatter.slug))) ||
        slugify(fileBase);
      let excerpt: string | null;
      if (useDesk && desk && "excerpt" in desk) {
        excerpt =
          desk.excerpt === null || desk.excerpt === undefined ? null : String(desk.excerpt);
      } else {
        excerpt =
          frontMatter.excerpt !== undefined && frontMatter.excerpt !== null
            ? String(frontMatter.excerpt)
            : null;
      }
      let tagNames: string[] = useDesk && "tags" in desk!
        ? normalizeTagNames(desk!.tags)
        : Array.isArray(frontMatter.tags)
          ? frontMatter.tags.map((t: string) => String(t).trim().toLowerCase()).filter(Boolean)
          : [];

      let categorySlug = parts.length > 1 ? slugify(parts[0]) : "uncategorized";
      if (useDesk && typeof desk!.category === "string" && desk!.category.trim()) {
        categorySlug = slugify(desk!.category.trim());
      }

      const premiumOnly = useDesk ? deskPremiumOnly(desk!) : false;
      const magazineSlugsFromDesk = useDesk ? normalizeMagazineSlugs(desk!.magazines) : [];

      if (!categoryIdsBySlug[categorySlug]) {
        const existing = await categoriesCol
          .where("userId", "==", uid)
          .where("slug", "==", categorySlug)
          .limit(1)
          .get();
        if (!existing.empty) {
          categoryIdsBySlug[categorySlug] = existing.docs[0].id;
        } else {
          const categoryName =
            useDesk && typeof desk!.category === "string" && desk!.category.trim()
              ? desk!.category.trim()
              : parts[0] ?? "Uncategorized";
          const ref = await categoriesCol.add({
            userId: uid,
            name: categoryName,
            slug: categorySlug,
          });
          categoryIdsBySlug[categorySlug] = ref.id;
          categoriesCreated++;
        }
      }
      const categoryId = categoryIdsBySlug[categorySlug];

      const tagIds: string[] = [];
      for (const name of tagNames) {
        if (!name) continue;
        if (!tagIdsByName[name]) {
          const existing = await tagsCol
            .where("userId", "==", uid)
            .where("name", "==", name)
            .limit(1)
            .get();
          if (!existing.empty) {
            tagIdsByName[name] = existing.docs[0].id;
          } else {
            const ref = await tagsCol.add({ userId: uid, name });
            tagIdsByName[name] = ref.id;
          }
        }
        tagIds.push(tagIdsByName[name]);
      }

      const existingContent = await contentCol
        .where("userId", "==", uid)
        .where("slug", "==", slug)
        .limit(1)
        .get();

      const contentData = {
        userId: uid,
        title,
        slug,
        body: rewrite.markdown.trim(),
        excerpt: excerpt || null,
        categoryId,
        categorySlug,
        tagIds,
        premiumOnly,
        updatedAt: new Date(),
      };

      let contentId: string;
      if (!existingContent.empty) {
        await existingContent.docs[0].ref.update(contentData);
        contentId = existingContent.docs[0].id;
      } else {
        const newRef = await contentCol.add({
          ...contentData,
          createdAt: new Date(),
        });
        contentId = newRef.id;
      }

      if (useDesk && magazineSlugsFromDesk.length > 0) {
        const magsCol = db.collection("magazines");
        for (const rawMagSlug of magazineSlugsFromDesk) {
          const magSlug = slugify(rawMagSlug);
          if (!magSlug) continue;
          const magSnap = await magsCol
            .where("userId", "==", uid)
            .where("slug", "==", magSlug)
            .limit(1)
            .get();
          if (magSnap.empty) {
            magazineSlugMisses.push(`${path} → magazine slug "${rawMagSlug}"`);
            continue;
          }
          const magazineId = magSnap.docs[0].id;
          await upsertPublicationAdmin(db, uid, contentId, magazineId);
          if (categorySlug) {
            await mergeMagazineFilterSlugsAdmin(db, magazineId, categorySlug, tagNames);
          }
          publicationsLinked++;
        }
      }

      contentUpserted++;
    }

    await db.collection("users").doc(uid).set(
      { githubRepoUrl: repoUrl, githubRepoLastSyncAt: new Date() },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      categoriesCreated,
      contentUpserted,
      markdownImagesRewritten,
      markdownImageRewriteSamples: markdownImageRewriteSamples.length ? markdownImageRewriteSamples : undefined,
      filesScanned: mdPaths.length,
      publicationsLinked,
      magazineSlugMisses: magazineSlugMisses.length ? magazineSlugMisses : undefined,
    });
  } catch (e) {
    console.error("sync-github error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    );
  }
}

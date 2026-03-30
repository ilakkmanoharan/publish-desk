---
# Optional Publish Desk block for GitHub sync — this file lives at docs/article-template.md (committed to git).
# Copy from Dashboard → Article template or /api/article-template; remove this fence for default sync behavior.

publish_desk_active: true

# Optional — editorial metadata in the repo (GitHub sync does not map these into Firestore yet; keep for your workflow / tooling).
author: "Your Name"
status: "published" # e.g. draft | published — informational in the file only today
createdAt: "2026-03-29"
updatedAt: "2026-03-29"

publish_desk:
  # Display title
  title: "Example article title"
  # URL slug (optional)
  slug: example-article-slug
  # Listing excerpt (optional)
  excerpt: "One-line summary for listings and SEO."
  # Category slug (sync creates category if needed)
  category: longform
  tags:
    - essay
    - culture
  # true = premium-only (`premiumOnly` on content). Omit or false = free.
  premium: false
  # Magazine slugs from your dashboard; one article can list many magazines.
  magazines:
    - my-magazine-slug
    - weekly-roundup
---

## Markdown body

Write below the closing `---`. **Default behavior (no Publish Desk block):** set
`publish_desk_active: false` or delete everything between the first and second
`---` lines — sync uses the repo folder name as category and the filename for
title/slug.

**When `publish_desk_active` is true:** include the `publish_desk` mapping above.
Sync applies `title`, `slug`, `excerpt`, `category`, `tags`, `premium`, and
creates **Published** placements in each listed magazine (magazine slugs must
already exist). Content `createdAt` / `updatedAt` in the database are set by the
sync run, not from YAML.

**Root-level fields** (`author`, `status`, `createdAt`, `updatedAt`) are optional
and documented here for a consistent editorial template; they are **ignored by
current GitHub sync** and remain available for humans, scripts, or future
product support.

---
# Optional Publish Desk block for GitHub sync — see the in-app Article template page in the dashboard.

publish_desk_active: true

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
already exist).

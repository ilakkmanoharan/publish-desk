# Editorial content (Markdown)

**Canonical repo for articles:** clone [publish-desk-editorial](https://github.com/ilakkmanoharan/publish-desk-editorial.git), add `.md` files with `publish_desk_active: true` and a `publish_desk` block (see `docs/article-template.md` in the Publish Desk app repo), then push. Sync from GitHub in the dashboard (or your webhook) imports them into Firestore.

Do **not** commit long-form articles only inside Publish Desk `private/` if you want them on the live site—**the editorial repo is the source of truth** for Git sync.

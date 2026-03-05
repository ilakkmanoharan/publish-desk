# Publish Desk

Content publishing platform: manage content by category and tags, assign to magazines, and schedule or publish. Public site for readers; private dashboard for you.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Database**

   Create a `.env` in the project root (see `.env.example`):

   ```
   DATABASE_URL="file:./dev.db"
   DASHBOARD_SECRET="your-secret-password"
   ```

   **`DASHBOARD_SECRET`** protects the dashboard and APIs. Set it to a password only you know. The public site (magazines and articles) stays open; only the dashboard and mutation APIs require this password. If you leave it unset, the dashboard is open (for local dev only).

   Then create the DB and generate the Prisma client:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Import content**

   Add Markdown files under `private/content-ready` by category (see `private/content-ready/README.md`). Then run:

   ```bash
   npm run import-content
   ```

4. **Run the app**

   ```bash
   npm run dev
   ```

   - **Public site:** http://localhost:3000 — magazines and published articles  
   - **Dashboard:** http://localhost:3000/dashboard — content library, tags, assign to magazine, schedule

## Magazine details

Maintain magazine names and details in **`private/magazines.md`**. Add magazines in the dashboard at **Dashboard → Magazines** (they are stored in the database).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run import-content` | Import content from `private/content-ready` into the database |
| `npm run db:studio` | Open Prisma Studio to inspect/edit data |
| `npm run db:push` | Push schema to the database |

## Docs

- **Specifications:** `private/specifications/product-specification.md`
- **Architecture:** `private/architecture/architecture.md` and `private/architecture/architecture-diagram.md`

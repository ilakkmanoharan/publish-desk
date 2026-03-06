# Deploy Publish Desk to Vercel

This app uses **PostgreSQL** (SQLite does not work on Vercel’s serverless environment). Use a hosted Postgres such as **Neon** (free tier) or Vercel Postgres.

---

## 1. Create a PostgreSQL database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up (free).
2. Create a new project and pick a region near you.
3. In the dashboard, copy the **connection string** (e.g. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).

---

## 2. Push your schema and seed data (local, one time)

From your project root, using the Neon connection string:

```bash
# Set your production DB URL (use the string from Neon)
export DATABASE_URL="postgresql://..."

# Generate Prisma client and push schema (creates tables)
npx prisma db push

# Optional: import your content into the new DB
npm run import-content
```

Add at least one magazine (e.g. in the dashboard after deploy, or via Prisma Studio).

---

## 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New…** → **Project** and **import** your GitHub repo (`publish-desk`).
3. Leave **Framework Preset** as Next.js and **Root Directory** as `.`.
4. **Environment Variables** — add these (required for build and runtime):

   | Name             | Value                    | Environments   |
   |------------------|--------------------------|----------------|
   | `DATABASE_URL`  | Your Neon connection string | Production, Preview |
   | `DASHBOARD_SECRET` | A strong password (dashboard login) | Production, Preview |

5. Click **Deploy**. Vercel will run `prisma generate` and `next build`.

---

## 4. After first deploy

- **Public site:** `https://your-project.vercel.app` — magazines and articles.
- **Dashboard:** `https://your-project.vercel.app/dashboard` — sign in with `DASHBOARD_SECRET`.

If you didn’t run `npm run import-content` (and add a magazine) before deploying, do it once with `DATABASE_URL` set to your Neon URL, or add a magazine from the deployed dashboard after the first login.

---

## 5. Local development with the same DB

Use the same Neon URL in `.env` for local dev so you share data with production:

```env
DATABASE_URL="postgresql://..."
DASHBOARD_SECRET="your-secret-password"
```

Then:

```bash
npm run dev
```

---

## Troubleshooting

- **Build fails on Prisma:** Ensure `DATABASE_URL` is set in Vercel (Project → Settings → Environment Variables).
- **“Dashboard login not configured”:** Set `DASHBOARD_SECRET` in Vercel for Production (and Preview if you use it).
- **Empty magazines/articles:** Run `npm run import-content` locally with `DATABASE_URL` pointing to your Neon DB, then add a magazine from the dashboard.

# Real Estate Platform — Phase 2 Setup

This is the project skeleton. I can't reach the internet from here, so you'll run these steps on your own machine — none of it requires writing code, just running commands and clicking through account setup.

## 1. Get the code onto your machine

Download this folder, then:

```bash
cd real-estate-platform
npm install
```

## 2. Create your Supabase project

1. Go to supabase.com → New project (free tier)
2. Once created, go to Project Settings → API
3. Copy the **Project URL**, **anon public key**, and **service_role key** (keep the service_role key secret — never share it, never commit it)

## 3. Set up environment variables

```bash
cp .env.example .env.local
```

Paste the three Supabase values into `.env.local`. Leave `AI_PROVIDER_API_KEY` blank for now — we'll fill it in Phase 5.

## 4. Create the single admin account

In the Supabase dashboard → Authentication → Users → Add user. Use your real email and a strong password. This is the only account that will ever exist.

## 5. Run it locally

```bash
npm run dev
```

Open http://localhost:3000 — you should see "Real Estate Platform — Phase 2 skeleton is running."

## 6. Push to GitHub

```bash
git init
git add .
git commit -m "Phase 2: project skeleton"
```

Create a new empty repo on GitHub, then follow GitHub's "push an existing repo" instructions it shows you.

## 7. Deploy to Vercel

1. vercel.com → New Project → import your GitHub repo
2. Add the same environment variables from `.env.local` in Vercel's project settings (Environment Variables section)
3. Deploy — you'll get a free `*.vercel.app` URL

---

## Phase 4: Database

Run these in order, in Supabase → **SQL Editor** → New query → paste → Run. One file at a time, in this order:

1. `supabase/migrations/001_schema.sql` — creates the tables
2. Create the storage bucket manually first: Storage → New bucket → name it exactly `property-images` → toggle **Public bucket** ON
3. `supabase/migrations/002_rls.sql` — locks the tables down
4. `supabase/migrations/003_storage.sql` — locks the bucket down
5. `supabase/migrations/004_seed.sql` — optional, adds 2 sample listings so there's something to see later

After each file runs, you should see "Success. No rows returned" (schema/RLS/storage) or "Success. 2 rows affected" (seed). If any file errors, stop and send me the exact error — don't run the next one.

To verify it worked: Supabase → Table Editor → you should see `properties`, `property_images`, and `audit_log` tables, and (if you ran the seed) 2 rows in `properties`.

---

---

## Phase 5a: Listings CRUD

No new setup — this is pure code. Restart `npm run dev` if it isn't already running, and:

1. Go to `/admin/listings` — you should see the 2 seed listings if you ran that migration, or an empty table if not
2. Click **+ Create Listing**, fill in the form (title EN/AR are required, price/governorate/wilayat/area are required), submit — it should land you back on the edit page for the new draft
3. On the listings table, try **Publish**, **Mark reserved**, **Duplicate**, and **Delete** (it'll ask you to confirm) on a test listing
4. Try the search box and the status filter dropdown

Every action here also writes a row to `audit_log` — you can check that in Supabase's Table Editor if you want to see it working.

---

**Confirm each step works before moving on.** If anything errors, paste the exact error back to me and I'll fix it before we move to the next phase.

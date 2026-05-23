# Denzarc — production deploy (Clerk + Supabase)

Follow this once so **sign-in and dashboard work permanently** on https://denzarc.com.

## 1. Vercel environment variables

Project → **Settings → Environment Variables** → add for **Production** (and Preview if you use it):

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys (`pk_live_...`) |
| `CLERK_SECRET_KEY` | Clerk → API Keys (`sk_live_...`) |
| `CLERK_WEBHOOK_SECRET` | Clerk → Webhooks (step 3 below) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (service_role, keep secret) |
| `NEXT_PUBLIC_APP_URL` | `https://denzarc.com` |

Redeploy after saving.

## 2. Clerk dashboard

1. **Domains**: add `denzarc.com` (and `www.denzarc.com` if you use it).
2. **Paths**: Sign-in URL `/sign-in`, Sign-up URL `/sign-up`.
3. **Account portal / Redirects**: after sign-in → `/dashboard`.

Use **live** keys on production (`pk_live_` / `sk_live_`).

## 3. Clerk webhook (automatic account creation)

1. Clerk → **Webhooks** → **Add endpoint**
2. URL: `https://denzarc.com/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`
4. Copy **Signing secret** → Vercel env `CLERK_WEBHOOK_SECRET`
5. Redeploy

When someone signs up, Clerk notifies your app and creates their row in Supabase **before** they open the dashboard.

## 4. Supabase database

In **SQL Editor**, run migrations in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `002_customer_invoice_link.sql`
3. `003_profile_phone.sql`
4. `004_users_and_payments.sql`
5. **`005_clerk_auth.sql`** ← required for Clerk sign-in

Migration `005` adds `clerk_user_id` to `profiles` and removes dependency on Supabase Auth.

## 5. Verify

1. Open `https://denzarc.com/api/setup/status` — should show `"ready": true`.
2. Sign up at `https://denzarc.com/sign-up`.
3. You should land on `/dashboard` without errors.

If you see a yellow setup box, click **Link my account now**, then refresh.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Something went wrong” after login | Check Vercel env vars + run migration `005` + redeploy |
| `ready: false` on `/api/setup/status` | Missing Clerk or Supabase keys in Vercel |
| Profile not created | Add Clerk webhook + `CLERK_WEBHOOK_SECRET`, or use “Link my account now” on dashboard |

# Small Business Tools (Businesstool)

A responsive, modern Small Business Tools SaaS with **Invoice/Receipt Generator** as the primary feature, plus sales tracking, expenses, profit dashboard, and more.

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Supabase (Auth + PostgreSQL), Paystack, Termii, OpenAI, React-PDF, Recharts. Deploy on Vercel.

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill:

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase project
   - `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (optional for payments)
   - `NEXT_PUBLIC_SUPPORT_EMAIL` (support inbox used by the support page mailto)
   - `TERMII_API_KEY`, `TERMII_SENDER_ID` (optional for SMS/WhatsApp)
   - `OPENAI_API_KEY` (optional for AI insights)
   - `NEXT_PUBLIC_APP_URL` – e.g. `http://localhost:3000` or your production URL

3. **Database**

   Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor (or via Supabase CLI) to create tables, RLS, and the `handle_new_user` trigger.

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Plans

- **Free:** 5 invoices/month, platform branding, basic sales tracking.
- **Pro:** Unlimited invoices, no branding, sales + expense tracking, profit dashboard, customer management, inventory, AI insights, email & WhatsApp notifications.

## Features

- **Invoices & receipts:** Create, PDF download, print, share via WhatsApp and email.
- **Sales tracker:** Daily sales (cash/transfer), daily/weekly/monthly totals.
- **Expense tracker:** Categorized expenses, monthly summaries.
- **Profit dashboard (Pro):** Sales vs expenses, net profit, charts, best-selling day.
- **Customers (Pro):** CRM-lite, profiles, notes.
- **Inventory (Pro):** Products, stock in/out, low-stock alerts.
- **AI insights (Pro):** OpenAI-powered analysis and predictions.
- **Payments:** Paystack for Pro upgrades.
- **Notifications:** Email + Termii (SMS/WhatsApp) – API routes ready.

## API routes

- `POST /api/invoices`, `GET /api/invoices`, `GET /api/invoices/[id]`, `GET /api/invoices/[id]/pdf`
- `POST /api/sales`, `POST /api/expenses`
- `POST /api/payments/initiate`, `GET /api/payments/verify`
- `POST /api/notifications/email`, `POST /api/notifications/whatsapp`
- `POST /api/ai/insights`

## Deploy

Connect the repo to Vercel, set env vars, and deploy. Ensure `NEXT_PUBLIC_APP_URL` matches your production URL for Paystack callbacks.

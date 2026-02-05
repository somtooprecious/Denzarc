# Database Schema

Run migrations in order: `001` → `002` → `003` → `004` → `005`

## Users (profiles + Clerk)

Authentication is handled by Clerk. The app uses `public.profiles` as the user table and links to Clerk via `clerk_user_id`.

**View: `public.users`** (per prompt spec)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User email |
| plan | TEXT | 'free' or 'pro' |
| subscription_start | TIMESTAMPTZ | When Pro started |
| subscription_end | TIMESTAMPTZ | When Pro expires |

**Table: `public.profiles`** (full user data)
- id, clerk_user_id, email, full_name, business_name, business_logo_url, plan, subscription_start, subscription_end
- invoice_count_this_month, invoice_count_reset_at, phone
- created_at, updated_at

---

## Payments (Paystack)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References profiles(id) |
| amount | DECIMAL(12,2) | Amount paid |
| reference | TEXT | Paystack transaction reference (unique) |
| status | TEXT | 'pending', 'success', 'failed' |
| provider | TEXT | Default 'paystack' |
| created_at | TIMESTAMPTZ | When record was created |

---

## Other Tables

- **invoices** – Invoice/receipt data, items (JSONB), customer, totals
- **customers** – CRM customer profiles
- **sales** – Daily sales entries (cash/transfer)
- **expenses** – Categorized expenses
- **products** – Inventory products
- **stock_movements** – Stock in/out per product

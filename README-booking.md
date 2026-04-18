# Booking & admin dashboard — owner guide

This guide is for the bar owner. It covers **what the system does**, **how to post a
new tasting**, and **how to handle bookings** — no code required.

## 1. What's new on the site

- **`/events.html`** — a public page that lists upcoming gin tastings.
  Customers see the date, price, seats left, and a "Book" button.
- **`/book.html?event=…`** — the booking form: name, email, phone, seats,
  no-refund consent. Submitting sends the customer to **Stripe** to pay.
- Once Stripe confirms the payment, the booking is automatically marked **paid**
  and the customer receives a **confirmation email**. You get a notification
  email too.

### No-refund policy

Bookings are **non-refundable and non-transferable** by default — customers must
tick a checkbox confirming this before they can pay. If someone emails asking
for a refund, you decide case-by-case and issue it manually from the Stripe
dashboard (see Section 4).

## 2. Signing into the admin dashboard

1. Visit **`https://theginlibrary.de/admin/`**.
2. Sign in with the email + password you set up in Supabase.
3. You'll land on the dashboard. If you close the tab, the session stays active
   for a few hours; otherwise sign in again.

> Forgot your password? Open the Supabase project → **Authentication → Users** →
> click your email → **Send recovery email**.

## 3. Posting a new tasting event

1. On the dashboard click **+ New event**.
2. Fill in both **English** and **German** titles and descriptions.
3. Pick the **date & time** — this is in your local time.
4. Set the **capacity** (max seats) and **price in cents** (e.g. `6900` for
   €69.00).
5. Optional: paste an **image URL** if you want a photo on the event card
   later.
6. Tick **Published** when you're ready for customers to see it. Leave it
   unticked to save a draft.
7. Click **Save**.

### Editing, duplicating, deleting

- **Edit** — change any field and click Save. If you raise or lower the
  capacity, existing bookings stay valid.
- **Duplicate** — clones an event with a new slug, shifts the date by 7 days,
  and leaves it unpublished. Useful for weekly tastings.
- **Delete** — only allowed when the event has **no paid bookings**. If it
  does, **unpublish** instead (uncheck "Published") so it disappears from the
  public site but bookings stay intact.

## 4. Viewing bookings & refunding someone

1. In the events table, click **Bookings** on the event you care about.
2. A list of all bookings appears: name, email, phone, seats, total, status.
3. Click **Export CSV** to download a guest list you can open in Excel or Numbers.

### Issuing a refund (case-by-case)

Since the site does not automate refunds:

1. Open the Stripe dashboard → **Payments**.
2. Find the payment (search by the customer's email).
3. Click the payment → **Refund payment**.
4. Come back to the admin dashboard and open the event's bookings.
   The booking row will still show `paid`. You can leave it or, if you want a
   cleaner record, ask the developer to mark it `cancelled` (this is a manual
   DB tweak — not part of day-to-day owner workflow).

## 5. Adding another admin user

1. Supabase dashboard → **Authentication → Users → Add user**.
2. Enter their email + a temporary password. Tell them to log in at `/admin/`.
3. There's no "role" distinction today — every authenticated user has full
   admin access. Only add people you fully trust.

## 6. Emails

Customer confirmations and your admin notifications are sent via **Resend**.
If emails aren't arriving:

1. Check the **Resend dashboard** → *Logs* — is the email attempted?
2. Check spam. Ensure the **sender domain** (`theginlibrary.de` or similar) is
   verified in Resend.
3. Check the admin email in Netlify env var `ADMIN_NOTIFICATION_EMAIL`.

## 7. Environment variables (developer reference)

Set in the Netlify dashboard → *Site settings → Environment variables*:

| Name | Example | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | `sk_live_…` | server-only |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | from Stripe → Developers → Webhooks |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_…` | |
| `SUPABASE_URL` | `https://xxx.supabase.co` | |
| `SUPABASE_ANON_KEY` | `eyJ…` | safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` | **server-only** — never commit |
| `RESEND_API_KEY` | `re_…` | |
| `EMAIL_FROM` | `The Gin Library <bookings@theginlibrary.de>` | must be a verified domain |
| `ADMIN_NOTIFICATION_EMAIL` | `theginlibrary@web.de` | |
| `SITE_URL` | `https://theginlibrary.de` | no trailing slash |

## 8. Local dev (developer reference)

```bash
npm install
cp .env.example .env   # fill in test keys
npx netlify dev        # serves site + functions on localhost:8888

# In another terminal, to test Stripe webhooks locally:
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
# Copy the `whsec_…` it prints into your local .env as STRIPE_WEBHOOK_SECRET.
```

Apply the DB schema once: open `supabase/migrations/0001_init.sql` and run it
in the Supabase SQL editor (or `supabase db push` if you use the CLI).

### Smoke test

1. Create an event in the admin dashboard and publish it.
2. Open `/events.html` → the event appears.
3. Click Book → fill form → pay with test card `4242 4242 4242 4242`, any
   future expiry, any CVC.
4. Verify the booking row in Supabase shows `status = 'paid'`.
5. Check Resend logs for the two emails (customer + admin).
6. Try booking more seats than remain → expect a "sold out" error message.

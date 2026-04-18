-- The Gin Library — booking schema
-- Run in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ============================================================
-- events
-- ============================================================
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title_en          text not null,
  title_de          text not null,
  description_en    text not null,
  description_de    text not null,
  starts_at         timestamptz not null,
  duration_minutes  int  not null default 120 check (duration_minutes > 0),
  capacity          int  not null check (capacity > 0),
  price_cents       int  not null check (price_cents >= 0),
  currency          text not null default 'eur',
  image_url         text,
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists events_starts_at_published_idx
  on public.events (starts_at)
  where is_published = true;

-- ============================================================
-- bookings
-- ============================================================
create table if not exists public.bookings (
  id                        uuid primary key default gen_random_uuid(),
  event_id                  uuid not null references public.events(id) on delete restrict,
  customer_name             text not null,
  customer_email            text not null,
  customer_phone            text,
  seats                     int  not null check (seats > 0),
  total_cents               int  not null check (total_cents >= 0),
  currency                  text not null,
  status                    text not null check (status in ('pending','paid','expired','cancelled')),
  stripe_session_id         text unique,
  stripe_payment_intent_id  text,
  locale                    text not null default 'en' check (locale in ('en','de')),
  created_at                timestamptz not null default now(),
  paid_at                   timestamptz,
  notes                     text
);

create index if not exists bookings_event_status_idx on public.bookings (event_id, status);
create index if not exists bookings_pending_created_idx
  on public.bookings (created_at)
  where status = 'pending';

-- ============================================================
-- updated_at trigger for events
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ============================================================
-- seats_available(event_id)
-- ============================================================
create or replace function public.seats_available(p_event_id uuid)
returns int language sql stable as $$
  select greatest(
    e.capacity - coalesce((
      select sum(b.seats)
      from public.bookings b
      where b.event_id = e.id
        and b.status in ('pending','paid')
    ), 0),
    0
  )
  from public.events e
  where e.id = p_event_id;
$$;

-- ============================================================
-- create_pending_booking: atomic capacity check + insert
-- Returns the new booking id and computed total. Locks the
-- event row so concurrent requests cannot overbook.
-- Raises:
--   EVENT_NOT_FOUND  — unknown or unpublished event
--   EVENT_PAST       — event has already started
--   SOLD_OUT         — not enough seats available
-- ============================================================
create or replace function public.create_pending_booking(
  p_event_id        uuid,
  p_seats           int,
  p_customer_name   text,
  p_customer_email  text,
  p_customer_phone  text,
  p_locale          text
)
returns table (
  booking_id    uuid,
  total_cents   int,
  currency      text,
  title_en      text,
  title_de      text,
  starts_at     timestamptz,
  price_cents   int
)
language plpgsql
as $$
declare
  v_event   public.events%rowtype;
  v_taken   int;
  v_id      uuid;
  v_total   int;
begin
  if p_seats is null or p_seats < 1 then
    raise exception 'INVALID_SEATS';
  end if;

  select * into v_event
  from public.events
  where id = p_event_id and is_published = true
  for update;

  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if v_event.starts_at <= now() then
    raise exception 'EVENT_PAST';
  end if;

  select coalesce(sum(seats), 0) into v_taken
  from public.bookings
  where event_id = p_event_id
    and status in ('pending','paid');

  if v_taken + p_seats > v_event.capacity then
    raise exception 'SOLD_OUT';
  end if;

  v_total := v_event.price_cents * p_seats;

  insert into public.bookings (
    event_id, customer_name, customer_email, customer_phone,
    seats, total_cents, currency, status, locale
  ) values (
    p_event_id, p_customer_name, p_customer_email, p_customer_phone,
    p_seats, v_total, v_event.currency, 'pending', p_locale
  )
  returning id into v_id;

  return query
  select v_id, v_total, v_event.currency,
         v_event.title_en, v_event.title_de,
         v_event.starts_at, v_event.price_cents;
end;
$$;

-- ============================================================
-- Row Level Security
-- Public clients may only read published events.
-- All writes and all booking access go through Netlify Functions
-- using the service role key (bypasses RLS).
-- ============================================================
alter table public.events   enable row level security;
alter table public.bookings enable row level security;

drop policy if exists events_public_read on public.events;
create policy events_public_read
  on public.events
  for select
  to anon
  using (is_published = true);

-- No policies on bookings for anon → denied by default.

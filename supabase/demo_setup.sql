-- ============================================================================
-- TVMG Demo Request — Supabase setup (SEPARATE table + bucket from paid intake)
-- Run once:  Supabase -> SQL Editor -> paste -> Run.
-- Same project/keys as the intake form, but demos never mix with paid jobs.
-- ============================================================================

-- 1) Demo requests table -----------------------------------------------------
create table if not exists public.demo_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  lead_slug      text not null,                  -- storage folder for this lead

  -- who
  business_name  text,
  contact_name   text,
  email          text,
  phone          text,

  -- the demo
  demo_type      text,
  topic          text,
  use_case       text,

  -- content
  content_pasted text,

  -- voice & feel
  language       text,
  language_other text,
  voice_pref     text,
  accent_pref    text,

  -- branding
  brand_colours  text,

  -- bookkeeping
  files          jsonb default '[]'::jsonb,
  brief_path     text
);

alter table public.demo_requests enable row level security;

-- Public demo form may INSERT only.
drop policy if exists "demo anon insert" on public.demo_requests;
create policy "demo anon insert"
  on public.demo_requests
  for insert
  to anon
  with check (true);

-- 2) Storage bucket for demos (private, 50 MB/file) --------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('demos', 'demos', false, 52428800)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

-- Public demo form may UPLOAD into the demos bucket only.
drop policy if exists "demo anon upload" on storage.objects;
create policy "demo anon upload"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'demos');

-- ============================================================================
-- Files land in Storage bucket "demos" under <lead_slug>/content/ , /branding/
-- and <lead_slug>/demo-brief.md . Records in table public.demo_requests.
-- TODO (optional): auto-forward each demo-brief.md to yourself / trigger the
--   production pipeline via a Supabase Edge Function or a database webhook.
-- ============================================================================

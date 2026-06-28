-- ============================================================================
-- TVMG Client Intake — Supabase setup
-- Run this once in your Supabase project:  Dashboard -> SQL Editor -> paste -> Run.
-- Creates: the submissions table, a private Storage bucket, and RLS/storage
-- policies that let the public intake form WRITE (insert rows + upload files)
-- but never READ other people's data. You read submissions in the dashboard
-- (the service role bypasses RLS).
-- ============================================================================

-- 1) Submissions table -------------------------------------------------------
create table if not exists public.intake_submissions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  client_slug      text not null,                 -- storage folder for this client

  -- Section 1: basics
  business_name    text,
  contact_name     text,
  email            text,
  phone            text,
  quote_ref        text,
  package          text,

  -- Section 2: scope
  video_title      text,
  length_tier      text,
  purpose          text,
  purpose_other    text,
  audience         text,
  learning_outcome text,

  -- Section 3: content
  content_pasted   text,
  section_breakdown text,
  must_include     text,
  avoid_text       text,

  -- Section 4: voice & language
  languages        text[],
  language_other   text,
  voice_pref       text,
  accent_pref      text,
  accent_other     text,
  tone             text,

  -- Section 5: branding & design
  branded          text,
  brand_colours    text,
  visual_prefs     text,

  -- Section 6: portal
  portal_purchased text,
  portal_seats     integer,
  portal_notes     text,

  -- Section 7: logistics & sign-off
  deadline         date,
  approver         text,
  confirm_content  boolean,
  accept_terms     boolean,

  -- bookkeeping
  files            jsonb default '[]'::jsonb,      -- list of uploaded storage paths
  brief_path       text
);

alter table public.intake_submissions enable row level security;

-- Public form may INSERT only. (No select/update/delete for anon.)
drop policy if exists "intake anon insert" on public.intake_submissions;
create policy "intake anon insert"
  on public.intake_submissions
  for insert
  to anon
  with check (true);

-- 2) Storage bucket ----------------------------------------------------------
-- Private bucket, 50 MB per-file limit.
insert into storage.buckets (id, name, public, file_size_limit)
values ('intake', 'intake', false, 52428800)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

-- Public form may UPLOAD into the intake bucket only. No listing/reading.
drop policy if exists "intake anon upload" on storage.objects;
create policy "intake anon upload"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'intake');

-- ============================================================================
-- After running this:
--   1. Project Settings -> API: copy the Project URL and the anon public key.
--   2. Paste them into Site/js/intake.js (SUPABASE_URL, SUPABASE_ANON_KEY).
--   3. Deploy. Submissions land in table public.intake_submissions; files +
--      brief.md land in Storage bucket "intake" under <client_slug>/.
-- ============================================================================

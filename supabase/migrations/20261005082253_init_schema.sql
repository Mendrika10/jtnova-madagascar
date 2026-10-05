-- ============================================================================
-- S1 · Migration 1 — schéma initial
-- Réalisations, contenus éditoriaux, messages de contact, profils admins.
-- Conventions : uuid (gen_random_uuid), timestamptz, deleted content = cascade.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists pgcrypto; -- gen_random_uuid + crypt (mot de passe local)
create extension if not exists pg_trgm;  -- recherche approximative (boîte de réception)

-- ── Utilitaire : updated_at automatique ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Profils & rôles administrateurs ─────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- Vrai pour tout utilisateur authentifié portant le rôle `admin`.
-- security definer : les politiques RLS peuvent l'appeler sans récursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ── Réalisations ────────────────────────────────────────────────────────────
create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  tag          text,
  category     text,
  year         text,
  description  text not null,
  presentation text,
  explication  text,
  security     text,
  performance  text,
  cover_image  text,
  video_url    text,
  video_poster text,
  live_url     text,
  repo_url     text,
  client_name  text,
  featured     boolean not null default false,
  published    boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url        text not null,
  alt        text not null default '',
  sort_order integer not null default 0
);

create table public.project_tech (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label      text not null,
  sort_order integer not null default 0
);

create table public.project_highlights (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  text       text not null,
  sort_order integer not null default 0
);

create index project_images_project_idx     on public.project_images(project_id, sort_order);
create index project_tech_project_idx       on public.project_tech(project_id, sort_order);
create index project_highlights_project_idx on public.project_highlights(project_id, sort_order);
create index projects_published_idx         on public.projects(published, sort_order);

-- ── Contenus éditoriaux ─────────────────────────────────────────────────────
create table public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  icon        text,
  sort_order  integer not null default 0,
  published   boolean not null default true
);

create table public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text,
  avatar_text  text,
  text         text not null,
  linkedin_url text,
  sort_order   integer not null default 0,
  published    boolean not null default true
);

create table public.faq_items (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  sort_order integer not null default 0,
  published  boolean not null default true
);

create table public.tech_banner (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  image_url  text not null,
  sort_order integer not null default 0
);

-- ── Médias (registre des fichiers du bucket Storage) ────────────────────────
create table public.media (
  id          uuid primary key default gen_random_uuid(),
  path        text not null unique,
  url         text not null,
  mime_type   text,
  size_bytes  bigint,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── Messages de contact ─────────────────────────────────────────────────────
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  status     text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  notes      text,
  ip_hash    text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index contact_messages_status_idx on public.contact_messages(status, created_at);

-- ── Déclencheurs updated_at ─────────────────────────────────────────────────
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

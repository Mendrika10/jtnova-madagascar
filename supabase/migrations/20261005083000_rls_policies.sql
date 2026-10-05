-- ============================================================================
-- S1 · Migration 2 — politiques RLS et buckets Storage
-- Principe : lecture publique du contenu publié · écriture réservée au rôle
-- `admin` via is_admin() · contact_messages : insertion publique contrôlée.
-- ============================================================================

-- ── Activation RLS sur toutes les tables ────────────────────────────────────
alter table public.profiles           enable row level security;
alter table public.projects           enable row level security;
alter table public.project_images     enable row level security;
alter table public.project_tech       enable row level security;
alter table public.project_highlights enable row level security;
alter table public.site_settings      enable row level security;
alter table public.services           enable row level security;
alter table public.testimonials       enable row level security;
alter table public.faq_items          enable row level security;
alter table public.tech_banner        enable row level security;
alter table public.media              enable row level security;
alter table public.contact_messages   enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
create policy "profils: lecture de son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profils: les admins lisent tous les profils"
  on public.profiles for select
  using (public.is_admin());

create policy "profils: les admins gèrent les profils"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── projects ────────────────────────────────────────────────────────────────
create policy "projets: lecture publique des réalisations publiées"
  on public.projects for select
  using (published = true);

create policy "projets: les admins voient les brouillons et gèrent tout"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── tables filles : visibilité héritée du projet parent ─────────────────────
create policy "images: publiques si le projet est publié"
  on public.project_images for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.published));

create policy "images: les admins gèrent"
  on public.project_images for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "technos: publiques si le projet est publié"
  on public.project_tech for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.published));

create policy "technos: les admins gèrent"
  on public.project_tech for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "points forts: publics si le projet est publié"
  on public.project_highlights for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.published));

create policy "points forts: les admins gèrent"
  on public.project_highlights for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── contenus éditoriaux (même modèle) ───────────────────────────────────────
create policy "réglages: lecture publique"
  on public.site_settings for select using (true);

create policy "réglages: les admins gèrent"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "services: lecture publique des services publiés"
  on public.services for select using (published);

create policy "services: les admins gèrent"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "témoignages: lecture publique des publiés"
  on public.testimonials for select using (published);

create policy "témoignages: les admins gèrent"
  on public.testimonials for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "faq: lecture publique des publiées"
  on public.faq_items for select using (published);

create policy "faq: les admins gèrent"
  on public.faq_items for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "bandeau: lecture publique"
  on public.tech_banner for select using (true);

create policy "bandeau: les admins gèrent"
  on public.tech_banner for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── media ───────────────────────────────────────────────────────────────────
create policy "médias: lecture publique du registre"
  on public.media for select using (true);

create policy "médias: les admins gèrent le registre"
  on public.media for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── contact_messages ────────────────────────────────────────────────────────
create policy "messages: insertion publique contrôlée"
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    char_length(name) between 2 and 120
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(message) between 10 and 5000
  );

create policy "messages: les admins lisent"
  on public.contact_messages for select
  using (public.is_admin());

create policy "messages: les admins mettent à jour"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

-- ── Storage : buckets + politiques ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('projects', 'projects', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('branding', 'branding', true, 524288,  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

create policy "storage: lecture publique des buckets médias"
  on storage.objects for select
  using (bucket_id in ('projects', 'branding'));

create policy "storage: les admins déposent"
  on storage.objects for insert
  with check (bucket_id in ('projects', 'branding') and public.is_admin());

create policy "storage: les admins mettent à jour"
  on storage.objects for update
  using (bucket_id in ('projects', 'branding') and public.is_admin());

create policy "storage: les admins suppriment"
  on storage.objects for delete
  using (bucket_id in ('projects', 'branding') and public.is_admin());

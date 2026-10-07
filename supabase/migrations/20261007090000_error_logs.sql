-- ============================================================================
-- S7 · Migration 3 (additive) — journal d'erreurs `error_logs`
-- F7.8 — Monitoring : une erreur de production doit être visible dans l'admin
-- (page « Santé »). Insertion publique contrôlée (comme `contact_messages`),
-- lecture et mise à jour réservées au rôle `admin` via is_admin().
-- Migration strictement additive : aucune table existante n'est modifiée.
-- ============================================================================

create table if not exists public.error_logs (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  level      text not null default 'error',
  source     text not null default 'server',
  message    text not null,
  stack      text,
  path       text,
  user_agent text,
  context    jsonb,
  resolved   boolean not null default false
);

comment on table public.error_logs is
  'Journal d''erreurs applicatives (F7.8). Alimenté par src/lib/observability.ts.';

create index if not exists error_logs_created_at_idx
  on public.error_logs (created_at desc);

alter table public.error_logs enable row level security;

-- Insertion publique contrôlée : bornes de taille et niveaux autorisés, afin
-- qu'un tiers ne puisse pas noyer la table ni y stocker n'importe quoi.
create policy "erreurs: insertion publique contrôlée"
  on public.error_logs for insert
  to anon, authenticated
  with check (
    char_length(message) between 1 and 2000
    and level in ('error', 'warn', 'info')
    and char_length(source) between 1 and 40
  );

create policy "erreurs: les admins lisent"
  on public.error_logs for select
  to authenticated
  using (public.is_admin());

create policy "erreurs: les admins mettent à jour"
  on public.error_logs for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

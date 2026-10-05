# STATUS

Sprint en cours : S1 — phase : 0 — dernière mise à jour : 2026-10-05

## État des sprints

| F | Agent | État | PR | Note |
|---|---|---|---|---|
| F1.1 | DEVOPS (+ humain) | BLOQUÉE (partielle) | — | Stack **locale** opérationnelle (`supabase start`, 5 conteneurs healthy). La partie « projet cloud + `supabase link` + Vercel » attend l'humain (voir Bloquants). |
| F1.2 | SCHEMA | ✅ | #3 | Tables `projects` + filles (`project_images`, `project_tech`, `project_highlights`) dans `20261005082253_init_schema.sql` ; `db reset` rejoué sans erreur. |
| F1.3 | SCHEMA | ✅ | #3 | Tables éditoriales (`site_settings`, `services`, `testimonials`, `faq_items`, `tech_banner`) idem. |
| F1.4 | SCHEMA | ✅ | #3 | Tables `contact_messages` + `profiles` idem. |
| F1.5 | RLS | ✅ | #3 | RLS sur toutes les tables dans `20261005083000_rls_policies.sql` ; test REST : anon → 3 projets publiés, brouillon `vina-io` → 0 ligne. |
| F1.6 | SCHEMA | ✅ | #3 | Seed : 4 réalisations (`count(*)` = 4), 36 images, 21 technos, 14 points forts, 6 services/témoignages/FAQ, 13 techs, 3 réglages. |
| F1.7 | SCHEMA | ✅ | #3 | `src/lib/database.types.ts` générés (`supabase gen types`), `tsc` 0 erreur. |
| F1.8 | RLS | ✅ (lecture) | #3 | Buckets `projects` (2 Mo) et `branding` (500 Ko) + politiques créés ; lecture publique vérifiée en base. Upload admin → S4 (aucun écran admin avant S3/S4). |
| F2.1 | DATA | ✅ | #3 | `src/lib/supabase.ts` (client anon serveur, paresseux) — le cadre demande `lib/supabase/server.ts` ; renommage à faire au sprint S2 formel. |
| F2.2 | DATA | ✅ | #3 | `src/lib/content.ts` : requêtes typées, zéro `any`, `null` sur erreur → repli. |
| F2.3 | DATA | BLOQUÉE | — | Mapper `toProjectDetail` impossible avant la route `/projects/[slug]` (F2.6) ; carte actuelle pontée vers les 4 pages statiques. |
| F2.4 | FRONT-PUBLIC | ✅ | #3 | Accueil branché (ISR 60 s) : services, projets, témoignages, bandeau, FAQ servis depuis la base ; fallback local sans `.env`. |
| F2.5 | FRONT-PUBLIC | PARTIELLE | #3 | `/projets` branché ; **détail `/projects/[slug]` non fait** (pages statiques project1-4 restantes). |
| F2.6 | FRONT-PUBLIC | À FAIRE | — | Route dynamique `[slug]` + `notFound()` à créer (conserve les 4 pages statiques existantes). |
| F2.7 | DATA | PARTIELLE | #3 | ISR 60 s en place ; `revalidatePath`/tag n'a de sens qu'avec les mutations (S4). |
| F2.8 | FRONT-PUBLIC | ✅ | #3 | Repli gracieux : tout champ manquant/null → fallback ou vide, aucune page ne casse (validé par build sans `.env`). |

## Journal des décisions prises seul

- 2026-10-05 — PR #3 (S1 + S2 partiels) avait été fusionnée **directement dans `main`** avant l'adoption du cadre ; le flux officiel passe désormais par `dev`. Synchronisation faite via PR #4 (`main` → `dev`, merge simple pour préserver les SHAs `242bc10`, `f37b7d0`, `8099588`).
- 2026-10-05 — Le compte admin local du seed (`admin@jtnova.local` / `admin123`) reste en **dev local uniquement** ; le compte admin réel sera créé en S3 avec l'humain (jamais dans le chat).
- 2026-10-05 — S1 et S2 étant déjà partiellement livrés avant le cadre, `docs/STATUS.md` reflète l'état réel plutôt que de reprendre les sprints à zéro ; les trous identifiés (F2.3, F2.5-détail, F2.6) restent au périmètre de S2.

## Bloquants et pré-requis humains en attente

- **S1 (F1.1)** : créer le **projet Supabase cloud (free)**, fournir URL + clé anon dans `.env.local` **et dans Vercel** (jamais dans le chat) ; faire `supabase link` vers ce projet ; vérifier la connexion Git ↔ Vercel (§9 de AGENTS.md).
- **Décisions §10** en attente (les hypothèses par défaut s'appliquent sinon) : connexion admin (e-mail + mot de passe) · périmètre de personnalisation (tout le site) · hébergement (Vercel Hobby temporaire + plan Cloudflare en S7) · statut du dépôt (inchangé).

## Backlog « plus tard »

- Renommer `src/lib/supabase.ts` → `src/lib/supabase/server.ts` + créer `client.ts` (convention du cadre, à faire en S2 formel).
- 20 avertissements lint préexistants (`<img>` → `next/image`, variables inutilisées) — périmètre PERF-A11Y (S7).
- Route `/projects/[slug]` avec contenu complet (présentation, sécurité, performance, galeries) = cœur du reste de S2.
- Formulaire de contact à brancher sur `contact_messages` (S6, avec MESSAGERIE).

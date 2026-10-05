# STATUS

Sprint en cours : S1 — phase : 3 — dernière mise à jour : 2026-10-05

## État des sprints

| F | Agent | État | PR | Note |
|---|---|---|---|---|
| F1.1 | DEVOPS (+ humain) | BLOQUÉE | #8 | Stack **locale** OK (5 conteneurs healthy, API `54321`, DB `54322`). **Seed rendu sûr pour le cloud** (PR #8) : `seed.sql` = contenus éditoriaux sans aucun compte, `seed.local.sql` = compte admin local. Reste à l'humain : projet Supabase **cloud** (free), `NEXT_PUBLIC_SUPABASE_URL` + clé anon dans `.env.local` **et** Vercel (jamais dans le chat), `npx supabase login`, `supabase link`, connexion Git ↔ Vercel. |
| F1.2 | SCHEMA | ✅ | #3 | `projects`, `project_images`, `project_tech`, `project_highlights` ; preuve : `db reset` rejoué sur `dev` sans erreur. |
| F1.3 | SCHEMA | ✅ | #3 | `site_settings`, `services`, `testimonials`, `faq_items`, `tech_banner` ; idem. |
| F1.4 | SCHEMA | ✅ | #3 | `contact_messages`, `profiles` ; idem. |
| F1.5 | RLS | ✅ | #3 | Preuve S1 : RLS active sur **12/12** tables ; anon → `INSERT` refusé sur les 8 tables sensibles ; `UPDATE`/`DELETE` anon = **0 ligne affectée** (4 projets intacts) ; brouillon `vina-io` invisible en anon (**0**). |
| F1.6 | SCHEMA | ✅ | #3 | Preuve S1 après reset : `count(*)`=4 projets (3 publiés + 1 brouillon), 36 images, 21 technos, 14 points forts, 6 services, 6 témoignages, 6 FAQ, 13 techs, 3 réglages. |
| F1.7 | SCHEMA | ✅ | #3 | Preuve S1 : `gen types` régénéré → **diff nul** avec `src/lib/database.types.ts` committé ; `tsc --noEmit` 0 erreur. |
| F1.8 | RLS | ✅ | #3 | Preuve S1 (clé admin réelle) : upload admin `200` · lecture publique `200` · upload anon `AccessDenied / new row violates row-level security policy` · suppression admin `200`. |
| F2.1 | DATA | ✅ | #3 | `src/lib/supabase.ts` (client anon serveur) — à renommer `src/lib/supabase/server.ts` en S2 formel (backlog). |
| F2.2 | DATA | ✅ | #3 | `src/lib/content.ts` : requêtes typées, zéro `any`, `null` sur erreur → repli. |
| F2.3 | DATA | BLOQUÉE | — | `toProjectDetail` impossible avant F2.6 (route dynamique). |
| F2.4 | FRONT-PUBLIC | ✅ | #3 | Accueil branché (ISR 60 s) ; preuve S1 : textes base servis, brouillon absent, 0 erreur console serveur. |
| F2.5 | FRONT-PUBLIC | PARTIELLE | #3 | `/projets` branché (3 projets base servis, brouillon filtré) ; **détail non branché** (pages statiques `project1-4`). |
| F2.6 | FRONT-PUBLIC | À FAIRE | — | Route dynamique `[slug]` + `notFound()` — reste de S2. |
| F2.7 | DATA | PARTIELLE | #3 | ISR 60 s ; `revalidatePath`/tag utile dès les mutations (S4). |
| F2.8 | FRONT-PUBLIC | ✅ | #3 | Repli gracieux validé : build sans `.env` (données locales) et build avec base. |

## Journal des décisions prises seul

- 2026-10-05 — **Seed scindé en deux fichiers** (PR #8, zone SCHEMA) : `supabase/seed.sql` ne contient plus aucun utilisateur ni mot de passe (contenus éditoriaux uniquement), le bootstrap `admin@jtnova.local / admin123` est passé dans `supabase/seed.local.sql`, chargé par `[db.seed] sql_paths`. Raison : `supabase db push --include-seed` applique `sql_paths` → sans ce découpage, le compte admin local aurait été créé **en production** avec un mot de passe trivial. **Corollaire à retenir : ne jamais utiliser `--include-seed` sur le projet linked** ; les contenus se chargent dans le cloud via l'éditeur SQL. Preuves après `db reset` : exit 0, comptes `admin@jtnova.local | admin`, contenus 4/36/6/6/6/13/3 identiques, login local 200, RLS intacte (brouillon `vina-io` → `[]`, 3 publiés visibles), `tsc` 0, `eslint` 0 erreur.
- 2026-10-05 — Aucun moyen de l'agent d'appliquer seul les migrations sur le cloud : `supabase link` et `db push` exigent un jeton personnel (`npx supabase login`, OAuth navigateur) + le mot de passe base. Le `service_role` ne permet pas d'exécuter du DDL. Ces deux actions sont donc classées **actions humaines** (§9), pas une limite contournable.

- 2026-10-05 — PR #3 (S1 + S2 partiels) avait été fusionnée **directement dans `main`** avant le cadre ; flux officiel rétabli via PR #4 (`main` → `dev`, merge simple pour préserver les SHAs `242bc10`/`f37b7d0`/`8099588`).
- 2026-10-05 — Compte admin local du seed conservé (`admin@jtnova.local` / `admin123`) : le CLI n'applique le seed qu'en local (`db reset`), jamais via `db push`. Risque documenté, à revoir si un jour le seed est poussé vers le cloud.
- 2026-10-05 — Le test RLS d'écriture a d'abord semble-t-il passer en `UPDATE`/`DELETE` : faux positif de mon script (grep sur « ERROR »), pas une faille. Vérification resserrée par comptage avant/après → **0 ligne affectée**. Le critère reste ✅, la méthode est documentée ici.
- 2026-10-05 — F1.8 vérifié avec un vrai PNG : un `text/plain` est rejeté (400) par la contrainte MIME du bucket, ce qui masquait la politique. Test refait en `image/png` → comportement RLS correct.
- 2026-10-05 — S1 et S2 partiellement livrés avant l'adoption du cadre : `STATUS.md` reflète l'état réel au lieu de repartir de zéro ; les trous (F2.3, F2.5-détail, F2.6) restent au périmètre de S2.

## Bloquants et pré-requis humains en attente

- **S1 (F1.1)** : créer le projet **Supabase cloud (free)** ; renseigner `NEXT_PUBLIC_SUPABASE_URL` + clé anon dans `.env.local` **et** Vercel (jamais dans le chat) ; `npx supabase login` ; `npx supabase link --project-ref <ref>` (le CLI demande le mot de passe base → ne jamais le taper dans le chat) ; connexion Git ↔ Vercel (§9 de AGENTS.md).
  - Puis, dans cet ordre : `npx supabase db push` (**sans** `--include-seed`) pour les migrations additives, et chargement de `supabase/seed.sql` via l'éditeur SQL du dashboard pour les contenus. Après cela l'agent rejoue la Porte de merge et peut enfin fusionner la PR #7.
- **Décisions §10** en attente, hypothèses par défaut appliquées : connexion admin **e-mail + mot de passe** · personnalisation **tout le site** · hébergement **Vercel Hobby** temporaire + plan Cloudflare en S7 · dépôt **inchangé**.

## Backlog « plus tard »

- Renommer `src/lib/supabase.ts` → `src/lib/supabase/server.ts` + créer `client.ts` (convention du cadre, S2 formel).
- 20 avertissements lint préexistants (`<img>` → `next/image`, variables inutilisées) — périmètre PERF-A11Y (S7).
- Route `/projects/[slug]` avec contenu complet (présentation, sécurité, performance, galeries) — fin de S2.
- Formulaire de contact à brancher sur `contact_messages` (S6, avec MESSAGERIE).
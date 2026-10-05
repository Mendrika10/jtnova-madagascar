# STATUS

Sprint en cours : S1 — phase : 3 — dernière mise à jour : 2026-10-05

## État des sprints

| F | Agent | État | PR | Note |
|---|---|---|---|---|
| F1.1 | DEVOPS (+ humain) | PARTIELLE | #8, #12 | Stack **locale** OK. **Cloud créé et peuplé** : schéma + RLS + contenus appliqués via l'éditeur SQL (aucun jeton requis). Preuves cloud : 12/12 tables · `projects` 3 publiés visibles / 4 en base · brouillon `vina-io` anon → `[]` · INSERT anon `401 42501` · services/témoignages/FAQ/techs/réglages = 6/6/6/13/3 · **`profiles` = 0** (aucun compte admin en production) · accueil `/` servant les 6 citations de témoignages **absentes de `src/`** → lecture cloud prouvée. Reste : **buckets Storage absents** (voir ci-dessous) + variables Vercel + `supabase link` pour la suite. |
| F1.2 | SCHEMA | ✅ | #3 | `projects`, `project_images`, `project_tech`, `project_highlights` ; preuve : `db reset` rejoué sur `dev` sans erreur. |
| F1.3 | SCHEMA | ✅ | #3 | `site_settings`, `services`, `testimonials`, `faq_items`, `tech_banner` ; idem. |
| F1.4 | SCHEMA | ✅ | #3 | `contact_messages`, `profiles` ; idem. |
| F1.5 | RLS | ✅ | #3 | Preuve S1 : RLS active sur **12/12** tables ; anon → `INSERT` refusé sur les 8 tables sensibles ; `UPDATE`/`DELETE` anon = **0 ligne affectée** (4 projets intacts) ; brouillon `vina-io` invisible en anon (**0**). |
| F1.6 | SCHEMA | ✅ | #3 | Preuve S1 après reset : `count(*)`=4 projets (3 publiés + 1 brouillon), 36 images, 21 technos, 14 points forts, 6 services, 6 témoignages, 6 FAQ, 13 techs, 3 réglages. |
| F1.7 | SCHEMA | ✅ | #3 | Preuve S1 : `gen types` régénéré → **diff nul** avec `src/lib/database.types.ts` committé ; `tsc --noEmit` 0 erreur. |
| F1.8 | RLS | PARTIELLE | #3 | Preuve S1 **locale** (clé admin réelle) : upload admin `200` · lecture publique `200` · upload anon `AccessDenied / new row violates row-level security policy` · suppression admin `200`. **Cloud : les 2 buckets `projects` et `branding` sont absents** (`Bucket not found`) alors que la migration les crée → correctif idempotent prêt, en attente d'exécution puis de nouvelle preuve. |
| F2.1 | DATA | ✅ | #3 | `src/lib/supabase.ts` (client anon serveur) — à renommer `src/lib/supabase/server.ts` en S2 formel (backlog). |
| F2.2 | DATA | ✅ | #3 | `src/lib/content.ts` : requêtes typées, zéro `any`, `null` sur erreur → repli. |
| F2.3 | DATA | BLOQUÉE | — | `toProjectDetail` impossible avant F2.6 (route dynamique). |
| F2.4 | FRONT-PUBLIC | ✅ | #3 | Accueil branché (ISR 60 s) ; preuve S1 : textes base servis, brouillon absent, 0 erreur console serveur. |
| F2.5 | FRONT-PUBLIC | PARTIELLE | #3 | `/projets` branché (3 projets base servis, brouillon filtré) ; **détail non branché** (pages statiques `project1-4`). |
| F2.6 | FRONT-PUBLIC | À FAIRE | — | Route dynamique `[slug]` + `notFound()` — reste de S2. |
| F2.7 | DATA | PARTIELLE | #3 | ISR 60 s ; `revalidatePath`/tag utile dès les mutations (S4). |
| F2.8 | FRONT-PUBLIC | ✅ | #3 | Repli gracieux validé : build sans `.env` (données locales) et build avec base. |

## Journal des décisions prises seul

- 2026-10-05 — **Voie d'application du schéma retenue : éditeur SQL, sans jeton.** `supabase link`/`db push` exigent un jeton personnel d'accès à *tous* les projets ; le faire transiter par le chat serait pire que la fuite de clé déjà subie. Le schéma, les politiques et les contenus ont donc été appliqués depuis l'éditeur SQL du dashboard (fichier unique préparé hors dépôt, 0 secret vérifié). Conséquence à traiter : `supabase_migrations` ne connaît pas ces deux migrations → **`supabase db repair --status applied …` obligatoire avant tout futur `db push`**, sinon le CLI rejouera le schéma et échouera sur « table already exists ».
- 2026-10-05 — **Défaut trouvé et non masqué : les buckets Storage n'existent pas en cloud.** L'éditeur SQL a répondu `Success`, les tables et les données sont bien là, mais `GET /storage/v1/bucket/projects` et `/branding` renvoient `Bucket not found`, alors que la migration les insère (l.143-147) et que le script est allé au-delà de cette section. Cause non devinée : script idempotent (diagnostic + création + policies `drop/create`) préparé pour l'humain, puis preuve à rejouer.
- 2026-10-05 — **Leçon de vérification : « Success. No rows returned » ne prouve rien.** L'éditeur SQL avait announcements un succès total ; seule une interrogation de l'API, par requête, avec la clé publishable, a révélé le trou sur les buckets. Règle retenue pour la suite : toute application de SQL doit être confirmée par lecture via l'API (comptages + politiques), jamais par le statut de l'éditeur.
- 2026-10-05 — **Faux positif évité sur la preuve de lecture cloud** : `/projects/project1` affichait une chaîne également présente dans `Project1Details.tsx` (page statique) → elle ne prouvait aucune lecture base. La preuve retenue utilise les 6 citations de témoignages, présentes **uniquement** en base et servies par `/`. De même, `/projets` et `/services` n'ont fourni aucune chaîne discriminante (contenu identique en base et en repli local) : leur lecture cloud reste **plausible mais non prouvée** par ce moyen.
- 2026-10-05 — **Ligne de test assumée** : un `INSERT` anon sur `contact_messages` (`Test RLS / test@example.com`) a servi à prouver que l'insertion publique est autorisée (201). Elle est **insupprimable par l'agent** (c'est la preuve du verrouillage en lecture/écriture) → à supprimer par l'humain dans *Table Editor* avant la démonstration.

- 2026-10-05 — **Incident de clé secrète (traité, non contourné)** : la clé `sb_secret_…` du projet cloud a été collée dans la conversation par erreur. L'agent ne l'a **ni utilisée, ni écrite dans un fichier, ni committée** ; vérification faite : aucun fichier de travail ne la contient, `.env.local` est propre, **0 occurrence sur 60 commits** de l'historique. Seule exposition = la conversation, donc **rotation demandée à l'humain** (Settings → API Keys). Rappels actés : la clé `publishable` seule suffit au site public ; `SUPABASE_SERVICE_ROLE_KEY` n'arrive qu'en S3, **serveur uniquement**, et ne doit jamais transiter par le chat ni le dépôt.
- 2026-10-05 — **Projet cloud créé et joignable** : URL `https://<project-ref>.supabase.co` (valeur exacte dans `.env.local`, gitignoré) et clé `publishable` obtenue. Preuves en lecture seule avec la clé publishable : `GET /auth/v1/settings` → **200** ; `GET /rest/v1/projects` → **404 `PGRST205`** « table `public.projects` absente du cache de schéma » → la paire URL + clé est **valide** et le **schéma n'est pas encore appliqué**, ce qui est l'état attendu avant `db push`. Aucune migration n'a donc encore été jouée en cloud. À noter : le `ref` lu dans le jeton exposé(différait de l'URL réelle (`http=000`, DNS inexistant) → l'URL fournie par l'humain a été retenue et vérifiée, pas la déduction.


- 2026-10-05 — **Seed scindé en deux fichiers** (PR #8, zone SCHEMA) : `supabase/seed.sql` ne contient plus aucun utilisateur ni mot de passe (contenus éditoriaux uniquement), le bootstrap `admin@jtnova.local / admin123` est passé dans `supabase/seed.local.sql`, chargé par `[db.seed] sql_paths`. Raison : `supabase db push --include-seed` applique `sql_paths` → sans ce découpage, le compte admin local aurait été créé **en production** avec un mot de passe trivial. **Corollaire à retenir : ne jamais utiliser `--include-seed` sur le projet linked** ; les contenus se chargent dans le cloud via l'éditeur SQL. Preuves après `db reset` : exit 0, comptes `admin@jtnova.local | admin`, contenus 4/36/6/6/6/13/3 identiques, login local 200, RLS intacte (brouillon `vina-io` → `[]`, 3 publiés visibles), `tsc` 0, `eslint` 0 erreur.
- 2026-10-05 — Aucun moyen de l'agent d'appliquer seul les migrations sur le cloud : `supabase link` et `db push` exigent un jeton personnel (`npx supabase login`, OAuth navigateur) + le mot de passe base. Le `service_role` ne permet pas d'exécuter du DDL. Ces deux actions sont donc classées **actions humaines** (§9), pas une limite contournable.

- 2026-10-05 — PR #3 (S1 + S2 partiels) avait été fusionnée **directement dans `main`** avant le cadre ; flux officiel rétabli via PR #4 (`main` → `dev`, merge simple pour préserver les SHAs `242bc10`/`f37b7d0`/`8099588`).
- 2026-10-05 — Compte admin local du seed conservé (`admin@jtnova.local` / `admin123`) : le CLI n'applique le seed qu'en local (`db reset`), jamais via `db push`. Risque documenté, à revoir si un jour le seed est poussé vers le cloud.
- 2026-10-05 — Le test RLS d'écriture a d'abord semble-t-il passer en `UPDATE`/`DELETE` : faux positif de mon script (grep sur « ERROR »), pas une faille. Vérification resserrée par comptage avant/après → **0 ligne affectée**. Le critère reste ✅, la méthode est documentée ici.
- 2026-10-05 — F1.8 vérifié avec un vrai PNG : un `text/plain` est rejeté (400) par la contrainte MIME du bucket, ce qui masquait la politique. Test refait en `image/png` → comportement RLS correct.
- 2026-10-05 — S1 et S2 partiellement livrés avant l'adoption du cadre : `STATUS.md` reflète l'état réel au lieu de repartir de zéro ; les trous (F2.3, F2.5-détail, F2.6) restent au périmètre de S2.

## Porte de merge §4ter — état au 2026-10-05 (HEAD `dev` = `bf5cc25`) : **8/10**

| # | Condition | État | Preuve / cause de l'échec |
|---|---|---|---|
| 1 | Toutes les `F` de **S1** ✅ | ❌ | `F1.1` BLOQUÉE (pré-requis humain). `F2.3` est également BLOQUÉE mais appartient à **S2**, hors périmètre de ce sprint. |
| 2 | CI verte sur `dev` et sur la PR de release | ✅ | re-vérifié à chaud sur `bf5cc25` : 2 check-runs `success` |
| 3 | `tsc` / `eslint` / build 0 erreur | ✅ | CI + local (`tsc` 0, `eslint` 0 erreur / 20 warnings préexistants) |
| 4 | Critères d'acceptation rejoués | ✅ | preuves locales S1 + revalidation après `db reset` (PR #8) |
| 5 | Pas de régression, routes clés en 200 | ✅ | 7 routes en 200 sur la stack locale ; revalidation cloud à faire après F1.1 |
| 6 | Verdict REVIEWER, pas d'écriture hors zone | ✅ | PR #8 (zone `supabase/**`) et PR #9 (zone `docs/STATUS.md`) |
| 7 | Aucun secret dans le diff | ✅ | scan sur 773 lignes de `git diff origin/main...origin/dev` : 0 secret (la clé `publishable` locale n'est pas versionnée) |
| 8 | Migrations additives, `db reset` rejoué | ✅ | `supabase db reset` exit 0 après PR #8 ; aucune migration destructive |
| 9 | RLS anon → 0 ligne sur le non publié | ✅ | local : `vina-io` → `[]`, 3 publiés visibles. À rejouer sur le cloud. |
| 10 | Aucun pré-requis humain en attente | ❌ | `F1.1` + décisions §10 non tranchées |

**Conclusion** : une seule action — `F1.1` — tient les deux conditions en échec. Les décisions §10 restent couvertes par les hypothèses par défaut du cadre et ne sont pas bloquantes pour la porte.

## Bloquants et pré-requis humains en attente

- **S1 (F1.1)** : projet cloud **créé et peuplé** (schéma + RLS + contenus). Reste à faire par l'humain : **révoquer la clé secrète `default`** exposée dans la conversation ; **exécuter `jtnova-fix-buckets.sql`** dans l'éditeur SQL (2 buckets manquants) ; supprimer la ligne de test dans `contact_messages` ; poser les 2 variables dans **Vercel** (Preview + Production) ; `npx supabase login` + `supabase link --project-ref <ref>` (le CLI demande le mot de passe base → ne jamais le taper dans le chat) ; connexion Git ↔ Vercel (§9 de AGENTS.md).
- **S1 (opérationnel)** : après un jour où le projet cloud sera lié, lancer `supabase db repair --status applied 20261005082253 --status applied 20261005083000` pour resynchroniser `supabase_migrations` avec ce qui a été appliqué via l'éditeur SQL. Sans cela, le prochain `db push` échouera sur « table already exists ».
  - Puis, dans cet ordre : `npx supabase db push` (**sans** `--include-seed`) pour les migrations additives, et chargement de `supabase/seed.sql` via l'éditeur SQL du dashboard pour les contenus. Après cela l'agent rejoue la Porte de merge et peut enfin fusionner la PR #7.
- **Décisions §10** en attente, hypothèses par défaut appliquées : connexion admin **e-mail + mot de passe** · personnalisation **tout le site** · hébergement **Vercel Hobby** temporaire + plan Cloudflare en S7 · dépôt **inchangé**.

## Backlog « plus tard »

- Renommer `src/lib/supabase.ts` → `src/lib/supabase/server.ts` + créer `client.ts` (convention du cadre, S2 formel).
- 20 avertissements lint préexistants (`<img>` → `next/image`, variables inutilisées) — périmètre PERF-A11Y (S7).
- Route `/projects/[slug]` avec contenu complet (présentation, sécurité, performance, galeries) — fin de S2.
- Formulaire de contact à brancher sur `contact_messages` (S6, avec MESSAGERIE).
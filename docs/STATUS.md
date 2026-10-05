# STATUS

Sprint en cours : S1 — phase : 3 — dernière mise à jour : 2026-10-05

## État des sprints

| F | Agent | État | PR | Note |
|---|---|---|---|---|
| F1.1 | DEVOPS (+ humain) | PARTIELLE | #8, #12, #13 | **Cloud créé, peuplé et lu par le site.** Preuves : 12/12 tables · `projects` 3 publiés visibles / 4 en base · brouillon `vina-io` anon → `[]` · INSERT anon `401 42501` · 6/6/6/13/3 · **`profiles` = 0** · accueil `/` servant les 6 citations absentes de `src/` → lecture cloud prouvée. **Reste : poser les 2 variables dans Vercel + connecter le dépôt Git à Vercel** (le CLI a refusé d'écrire : *« Project does not have a connected Git repository »* → les push sur `dev` ne produisent aucune preview). **Rejoué 2026-10-05 : le dépôt Git EST connecté** — la PR #14 a déclenché une preview Vercel automatique. **Il ne reste que les 2 variables** : `vercel env ls` → *No Environment Variables found*, et la prod publique sert le **repli local** (0/6 citation cloud). `supabase link` non fait, remplacé volontairement (voir journal). |
| F1.2 | SCHEMA | ✅ | #3 | `projects`, `project_images`, `project_tech`, `project_highlights` ; preuve : `db reset` rejoué sur `dev` sans erreur. |
| F1.3 | SCHEMA | ✅ | #3 | `site_settings`, `services`, `testimonials`, `faq_items`, `tech_banner` ; idem. |
| F1.4 | SCHEMA | ✅ | #3 | `contact_messages`, `profiles` ; idem. |
| F1.5 | RLS | ✅ | #3 | Preuve S1 : RLS active sur **12/12** tables ; anon → `INSERT` refusé sur les 8 tables sensibles ; `UPDATE`/`DELETE` anon = **0 ligne affectée** (4 projets intacts) ; brouillon `vina-io` invisible en anon (**0**). |
| F1.6 | SCHEMA | ✅ | #3 | Preuve S1 après reset : `count(*)`=4 projets (3 publiés + 1 brouillon), 36 images, 21 technos, 14 points forts, 6 services, 6 témoignages, 6 FAQ, 13 techs, 3 réglages. |
| F1.7 | SCHEMA | ✅ | #3 | Preuve S1 : `gen types` régénéré → **diff nul** avec `src/lib/database.types.ts` committé ; `tsc --noEmit` 0 erreur. |
| F1.8 | RLS | PARTIELLE | #3, #13 | Preuve S1 **locale** (clé admin réelle) : upload admin `200` · lecture publique `200` · upload anon `AccessDenied / new row violates row-level security policy` · suppression admin `200`. **Cloud : les 2 buckets existent** — discriminateur vérifié : `projects/inexistant.png` → `Object not found` alors qu'un bucket inexistant → `Bucket not found` · upload anon sur vrai PNG → **403 `new row violates row-level security policy`**. **Rejoué 2026-10-05** : `supabase db reset` → buckets `projects` (2 Mo) et `branding` (500 Ko) recréés, publics ; **lecture publique d'un objet réel = `200`** (local, PNG 70 o déposé via clé service puis supprimé) — la preuve qui manquait est désormais complète **en local**. En cloud, aucun objet n'est déposé (aucune session admin en prod) : la lecture d'un objet réel reste non testable côté cloud. |
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
- 2026-10-05 — **Contre-épreuve et autocorrection : les buckets n'étaient peut-être jamais absents.** Le diagnostic précédent reposait sur `GET /storage/v1/bucket/{id}`, qui renvoie `Bucket not found` **à tort pour une clé anon** (il l'a rendu même après création). Le bon discriminateur est `GET /storage/v1/object/public/<bucket>/<fichier>` : `Object not found` = le bucket existe ; `Bucket not found` = il n'existe pas. Le contrôle a été refait contre un bucket fantôme et le cloud a été revalidé → **les deux buckets existent**, upload anon refusé par RLS. Le défaut « buckets manquants » n'était donc pas établi ; la conclusion honnête est que l'endpoint utilisé était inexploitable en anon, et qu'on ne saura pas si les buckets existaient avant la réapplication. Règle retenue : **ne jamais juger l'existence d'un bucket sur `GET /bucket/{id}` en clé anon**.
- 2026-10-05 — **Vercel : deux constats nonexistants avant.** (1) Le projet **n'a aucune variable d'environnement** (`No Environment Variables found`). (2) Le projet **n'a pas de dépôt Git connecté** — le CLI a refusé d'ajouter les variables : *« Project does not have a connected Git repository »*. Conséquence : les push sur `dev` ne déclenchent **aucune preview**. C'est aussi l'action manuelle §9.1, restée à faire. Les deux variables restent donc à poser dans le dashboard (elles sont publiques : URL + clé publishable, jamais de clé de service).

- 2026-10-05 — **Leçon de vérification : « Success. No rows returned » ne prouve rien.** L'éditeur SQL avait announcements un succès total ; seule une interrogation de l'API, par requête, avec la clé publishable, a révélé le trou sur les buckets. Règle retenue pour la suite : toute application de SQL doit être confirmée par lecture via l'API (comptages + politiques), jamais par le statut de l'éditeur.
- 2026-10-05 — **Faux positif évité sur la preuve de lecture cloud** : `/projects/project1` affichait une chaîne également présente dans `Project1Details.tsx` (page statique) → elle ne prouvait aucune lecture base. La preuve retenue utilise les 6 citations de témoignages, présentes **uniquement** en base et servies par `/`. De même, `/projets` et `/services` n'ont fourni aucune chaîne discriminante (contenu identique en base et en repli local) : leur lecture cloud reste **plausible mais non prouvée** par ce moyen.
- 2026-10-05 — **Ligne de test assumée** : un `INSERT` anon sur `contact_messages` (`Test RLS / test@example.com`) a servi à prouver que l'insertion publique est autorisée (201). Elle est **insupprimable par l'agent** (c'est la preuve du verrouillage en lecture/écriture) → à supprimer par l'humain dans *Table Editor* avant la démonstration.

- 2026-10-05 (rejeu) — **Correction Vercel : le dépôt Git est connecté.** La PR #14 (`docs/S1-verification`) a produit **automatiquement** une preview Vercel (`jtnova-madagascar-qwf73xhsl-…`, statut *Ready*) → l'integration Git fonctionne, contrairement au constat « aucun dépôt connecté » consigné plus haut. Restent vrais : **0 variable d'environnement** (`vercel env ls` → *No Environment Variables found*) et la **production publique sert le repli local** (`jtnova-madagascar.vercel.app` = 200, mais 0/6 citation de témoignage cloud) → les 2 variables restent l'unique pré-requis Vercel. À noter : les URL de déploiement brut sont protégées par **Vercel SSO** (302 → login) ; seule l'alias de production est public.
- 2026-10-05 — **Incident de clé secrète (traité, non contourné)** : la clé `sb_secret_…` du projet cloud a été collée dans la conversation par erreur. L'agent ne l'a **ni utilisée, ni écrite dans un fichier, ni committée** ; vérification faite : aucun fichier de travail ne la contient, `.env.local` est propre, **0 occurrence sur 60 commits** de l'historique. Seule exposition = la conversation, donc **rotation demandée à l'humain** (Settings → API Keys). Rappels actés : la clé `publishable` seule suffit au site public ; `SUPABASE_SERVICE_ROLE_KEY` n'arrive qu'en S3, **serveur uniquement**, et ne doit jamais transiter par le chat ni le dépôt.
- 2026-10-05 — **Projet cloud créé et joignable** : URL `https://<project-ref>.supabase.co` (valeur exacte dans `.env.local`, gitignoré) et clé `publishable` obtenue. Preuves en lecture seule avec la clé publishable : `GET /auth/v1/settings` → **200** ; `GET /rest/v1/projects` → **404 `PGRST205`** « table `public.projects` absente du cache de schéma » → la paire URL + clé est **valide** et le **schéma n'est pas encore appliqué**, ce qui est l'état attendu avant `db push`. Aucune migration n'a donc encore été jouée en cloud. À noter : le `ref` lu dans le jeton exposé(différait de l'URL réelle (`http=000`, DNS inexistant) → l'URL fournie par l'humain a été retenue et vérifiée, pas la déduction.


- 2026-10-05 — **Seed scindé en deux fichiers** (PR #8, zone SCHEMA) : `supabase/seed.sql` ne contient plus aucun utilisateur ni mot de passe (contenus éditoriaux uniquement), le bootstrap `admin@jtnova.local / admin123` est passé dans `supabase/seed.local.sql`, chargé par `[db.seed] sql_paths`. Raison : `supabase db push --include-seed` applique `sql_paths` → sans ce découpage, le compte admin local aurait été créé **en production** avec un mot de passe trivial. **Corollaire à retenir : ne jamais utiliser `--include-seed` sur le projet linked** ; les contenus se chargent dans le cloud via l'éditeur SQL. Preuves après `db reset` : exit 0, comptes `admin@jtnova.local | admin`, contenus 4/36/6/6/6/13/3 identiques, login local 200, RLS intacte (brouillon `vina-io` → `[]`, 3 publiés visibles), `tsc` 0, `eslint` 0 erreur.
- 2026-10-05 — Aucun moyen de l'agent d'appliquer seul les migrations sur le cloud : `supabase link` et `db push` exigent un jeton personnel (`npx supabase login`, OAuth navigateur) + le mot de passe base. Le `service_role` ne permet pas d'exécuter du DDL. Ces deux actions sont donc classées **actions humaines** (§9), pas une limite contournable.

- 2026-10-05 — PR #3 (S1 + S2 partiels) avait été fusionnée **directement dans `main`** avant le cadre ; flux officiel rétabli via PR #4 (`main` → `dev`, merge simple pour préserver les SHAs `242bc10`/`f37b7d0`/`8099588`).
- 2026-10-05 — Compte admin local du seed conservé (`admin@jtnova.local` / `admin123`) : le CLI n'applique le seed qu'en local (`db reset`), jamais via `db push`. Risque documenté, à revoir si un jour le seed est poussé vers le cloud.
- 2026-10-05 — Le test RLS d'écriture a d'abord semble-t-il passer en `UPDATE`/`DELETE` : faux positif de mon script (grep sur « ERROR »), pas une faille. Vérification resserrée par comptage avant/après → **0 ligne affectée**. Le critère reste ✅, la méthode est documentée ici.
- 2026-10-05 — F1.8 vérifié avec un vrai PNG : un `text/plain` est rejeté (400) par la contrainte MIME du bucket, ce qui masquait la politique. Test refait en `image/png` → comportement RLS correct.
- 2026-10-05 — S1 et S2 partiellement livrés avant l'adoption du cadre : `STATUS.md` reflète l'état réel au lieu de repartir de zéro ; les trous (F2.3, F2.5-détail, F2.6) restent au périmètre de S2.

## Porte de merge §4ter — état au 2026-10-05 (HEAD `dev` = `19c8ea6`, rejouée) : **8/10**

| # | Condition | État | Preuve / cause de l'échec |
|---|---|---|---|
| 1 | Toutes les `F` de **S1** ✅ | ❌ | `F1.1` PARTIELLE (pré-requis humain). `F2.3` est BLOQUÉE mais appartient à **S2**, hors périmètre de ce sprint. |
| 2 | CI verte sur `dev` et sur la PR de release | ✅ | re-vérifié à chaud sur `19c8ea6` : 2 check-runs `success` (PR #7 comprise) |
| 3 | `tsc` / `eslint` / build 0 erreur | ✅ | CI + local (`tsc` 0, `eslint` 0 erreur / 20 warnings préexistants) |
| 4 | Critères d'acceptation rejoués | ✅ | **rejeu complet 2026-10-05** (section ci-dessus) : F1.2→F1.8 reconfirmées, preuves jointes |
| 5 | Pas de régression, routes clés en 200 | ✅ | **11/11 routes en `200`** sur serveur local (`next start -p 3110`), 0 erreur de log ; 0 régression mesurée |
| 6 | Verdict REVIEWER, pas d'écriture hors zone | ✅ | PR #8 (zone `supabase/**`) et PR #9 (zone `docs/STATUS.md`) |
| 7 | Aucun secret dans le diff | ✅ | scan sur 773 lignes de `git diff origin/main...origin/dev` : 0 secret (la clé `publishable` locale n'est pas versionnée) |
| 8 | Migrations additives, `db reset` rejoué | ✅ | **rejoué 2026-10-05** : `supabase db reset` exit 0 (2 migrations + 2 seeds) ; aucune migration destructive |
| 9 | RLS anon → 0 ligne sur le non publié | ✅ | **rejoué 2026-10-05 en local ET cloud** : `vina-io` → `[]`, 3 publiés visibles, INSERT anon `401 42501`. |
| 10 | Aucun pré-requis humain en attente | ❌ | `F1.1` + décisions §10 non tranchées |

**Conclusion** : une seule action — `F1.1` — tient les deux conditions en échec. Les décisions §10 restent couvertes par les hypothèses par défaut du cadre et ne sont pas bloquantes pour la porte.

## Vérification S1 rejouée le 2026-10-05 (preuves fraîches)

Contexte : rejeu complet de S1 sur `dev` = `19c8ea6`, arbre de travail propre, stack Docker up.

| Preuve | Commande | Résultat |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Lint | `npx eslint .` | 0 erreur / 20 warnings préexistants |
| Build cloud | `npm run build` (avec `.env.local`) | exit 0, 13 pages, ISR 1m sur `/`, `/projets`, `/services` |
| Build repli | `npm run build` **sans** `.env.local` | exit 0 (F2.8) |
| Reset + seed | `supabase db reset` | exit 0, 2 migrations + 2 seeds |
| Comptages | `psql` | projects 4 (3 publiés) · images 36 · tech 21 · highlights 14 · settings 3 · services 6 · testimonials 6 · faq 6 · tech_banner 13 · profiles 1 (admin local) |
| RLS active | `pg_class` | 12/12 tables · 26 policies |
| Buckets local | `storage.buckets` | `projects` 2 Mo, `branding` 500 Ko, publics |
| Types générés | `gen types --local` vs fichier committé | **identiques à formatage près** |
| RLS anon local | REST `127.0.0.1:54321` | 3 publiés visibles · `vina-io` → `[]` · INSERT `401 42501` · UPDATE `[]` · DELETE sans effet · `contact_messages` `[]` · `profiles` `[]` |
| Storage local | REST | anon upload `403 AccessDenied` · admin `200` · **lecture publique objet réel `200` (70 o PNG)** · objet absent `404 NoSuchKey` |
| Routes | `next start -p 3110` | 11/11 en `200`, 0 erreur dans les logs |
| Lecture cloud | HTML de `/` vs API cloud | **6/6** citations de témoignages servies, **0** occurrence dans `src/` |
| Cloud REST anon | clé publishable | projects 3 · images 27 · tech 16 · highlights 11 · settings 3 · 6/6/6/13 · `profiles` 0 · INSERT `401` · `vina-io` `[]` |
| Buckets cloud | objet public | `projects` & `branding` existent (`Object not found`) · fantôme → `Bucket not found` · upload anon `403` |
| Secrets | scan diff `main...dev` + `git grep` historique | 0 valeur de secret ; `.env.local` gitignoré |
| CI | `gh pr checks 7` | « Types, lint et build » **pass** |
| Vercel Git | preview de la PR #14 | **auto-déployée** (`Ready`) → dépôt Git **connecté** |
| Vercel env | `vercel env ls` | **0 variable** |
| Prod publique | `jtnova-madagascar.vercel.app` | `200` mais **0/6 citation cloud** → repli local |
| Preview | URL de déploiement brut | **302 → Vercel SSO** (non publique) |

Résultat : **F1.2 → F1.8 reconfirmées** (F1.8 désormais complète en local). `F1.1` reste PARTIELLE : pré-requis humaines Vercel/Git ci-dessous. Porte de merge inchangée : **8/10**.

## Bloquants et pré-requis humains en attente

- **S1 (F1.1)** : **le dépôt Git est connecté** (vérifié 2026-10-05 : preview auto déployée par la PR #14). Reste **à poser les 2 variables** `NEXT_PUBLIC_SUPABASE_URL` = URL du projet et `NEXT_PUBLIC_SUPABASE_ANON_KEY` = clé publishable, pour **Preview + Production**, et **redeployer**. Sans elles, preview et production restent sur repli local (vérifié : prod = 0/6 citation cloud) et le site ne lit pas Supabase. Toujours à faire : **révoquer la clé secrète `default`** exposée dans la conversation ; supprimer la ligne de test `Test RLS` dans `contact_messages`.
- **S1 (opérationnel)** : après un jour où le projet cloud sera lié, lancer `supabase db repair --status applied 20261005082253 --status applied 20261005083000` pour resynchroniser `supabase_migrations` avec ce qui a été appliqué via l'éditeur SQL. Sans cela, le prochain `db push` échouera sur « table already exists ».
  - Puis, dans cet ordre : `npx supabase db push` (**sans** `--include-seed`) pour les migrations additives, et chargement de `supabase/seed.sql` via l'éditeur SQL du dashboard pour les contenus. Après cela l'agent rejoue la Porte de merge et peut enfin fusionner la PR #7.
- **Décisions §10** en attente, hypothèses par défaut appliquées : connexion admin **e-mail + mot de passe** · personnalisation **tout le site** · hébergement **Vercel Hobby** temporaire + plan Cloudflare en S7 · dépôt **inchangé**.

## Backlog « plus tard »

- Renommer `src/lib/supabase.ts` → `src/lib/supabase/server.ts` + créer `client.ts` (convention du cadre, S2 formel).
- 20 avertissements lint préexistants (`<img>` → `next/image`, variables inutilisées) — périmètre PERF-A11Y (S7).
- Route `/projects/[slug]` avec contenu complet (présentation, sécurité, performance, galeries) — fin de S2.
- Formulaire de contact à brancher sur `contact_messages` (S6, avec MESSAGERIE).
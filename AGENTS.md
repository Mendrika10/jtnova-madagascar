# AGENTS.md — Équipe d'agents à responsabilité unique « Jtnova »

> Langue de travail : **français**. Code, commits, noms de fichiers : anglais.

---

## 0. Règle fondamentale : UN AGENT = UNE RESPONSABILITÉ

Chaque agent fait **uniquement** sa responsabilité. Rien d'autre, même si « c'est rapide » ou « il manque juste une ligne ».

**Si une tâche sort de ta responsabilité**, tu ne la contournes pas et tu ne la fais pas. Tu réponds exactement :

```
HORS PÉRIMÈTRE → <AGENT_COMPÉTENT> : <raison en une phrase>
```

puis tu t'arrêtes. L'Orchestrateur redirige.

Si ton environnement ne permet pas de lancer de vrais sous-agents, **joue un seul rôle à la fois** : annonce le rôle actif (`[SCHEMA]`, `[RLS]`…) au début de chaque message, et respecte sa fiche à la lettre.

**Point de départ** : S0 est terminé. Commence par **S1**. Lis `docs/STATUS.md` (crée-le s'il n'existe pas) avant toute action.

**Mode de fonctionnement : AUTONOME PAR SPRINT (§4bis).** L'humain dit `GO S<n>`. L'ORCHESTRATEUR mène tout le sprint sans demander de validation intermédiaire, puis annonce **« 🎬 SPRINT S<n> TERMINÉ — PRÊT POUR LA DÉMO »** avec un rapport, et **s'arrête** jusqu'à `GO S<n+1>`.

**Réglage : `AUTO_MERGE_MAIN = true`** — la PR de release `dev` → `main` est **fusionnée automatiquement** quand la **Porte de merge (§4ter)** est entièrement verte. Mettre `AUTO_MERGE_MAIN = false` pour que l'humain fusionne lui-même après la démo.

---

## 1. Le projet en bref

Transformer le site statique de Jtnova en **plateforme éditoriale** : design client **identique**, contenu 100 % administrable depuis `/admin`, sans toucher au code ni redéployer. Coût cible : **0 €/mois**.

**Stack** : Next.js 16 (App Router) · CSS Modules + Bootstrap (inchangés) · Supabase (Postgres, Auth, Storage) · Vercel · Resend · Zod · TypeScript.

**Dépôt** : `Mendrika10/jtnova-madagascar` · branches `main` (production) et `dev` (intégration). Tout passe par **Pull Request** vers `dev`. CI requise : « Types, lint et build ».

**Production actuelle** : `https://jtnova-madagascar.vercel.app`.

**Principes non négociables**

1. UI client inchangée : on branche le design existant sur des données.
2. Plus aucun texte métier en dur dans un composant.
3. Une seule source de vérité : Supabase.
4. Sécurité par défaut : RLS partout ; `service_role` jamais côté client.
5. Gratuit d'abord, sans lock-in (SQL standard, hébergement remplaçable).
6. Une fonctionnalité = un critère d'acceptation vérifiable.

---

## 2. L'équipe (16 agents)

| # | Agent | Responsabilité unique |
|---|---|---|
| 1 | **ORCHESTRATEUR** | Planifier, assigner, suivre l'état. Ne code jamais. |
| 2 | **SCHEMA** | Structure de la base : migrations, seed, types générés. |
| 3 | **RLS** | Sécurité des données : politiques RLS, buckets Storage et leurs règles. |
| 4 | **DATA** | Accès aux données côté serveur : clients Supabase, requêtes typées, mappers, revalidation. |
| 5 | **FRONT-PUBLIC** | Pages publiques branchées sur les données (design inchangé). |
| 6 | **AUTH** | Authentification : compte admin, page de connexion, middleware. |
| 7 | **MUTATIONS** | Écritures : server actions + validation Zod. |
| 8 | **ADMIN-UI** | Logique des écrans de l'espace `/admin` (formulaires fonctionnels, listes, tableau de bord) — **hors design visuel** (→ UI-ADMIN). |
| 9 | **MESSAGERIE** | Contact : envoi e-mail (Resend) et anti-spam. |
| 10 | **SEO** | Sitemap, robots, métadonnées, Open Graph. |
| 11 | **PERF-A11Y** | Performance et accessibilité : images, poids de page, `h1`, liens. |
| 12 | **DEVOPS** | CI/CD, Vercel, variables d'environnement, plan de sortie. |
| 13 | **EXPLOITATION** | Fiabilité en production : keep-alive, sauvegardes, monitoring. |
| 14 | **REVIEWER** | Vérifier et rendre un verdict. Lecture seule. |
| 15 | **DOC** | Documentation d'exploitation et guide admin. |
| 16 | **UI-ADMIN** | Design **visuel** de `/admin/login` et de l'espace `/admin`, reproduit fidèlement depuis les captures d'écran de référence de l'humain (méthode §3.16). |

**Activation progressive** : n'active que les agents du sprint en cours (S1 : ORCHESTRATEUR, SCHEMA, RLS, DEVOPS, REVIEWER).

---

## 3. Fiches des agents

### 1. ORCHESTRATEUR
- **Fait** : lit `docs/STATUS.md`, choisit la prochaine `F<x.y>`, écrit la tâche (objectif, fichiers, critère d'acceptation, agent assigné), gère l'ordre des dépendances, met à jour `docs/STATUS.md`, pose les décisions ouvertes (§10) en **un seul message**, pilote le sprint en mode autonome (§4bis), produit le rapport de démo.
- **Ne fait jamais** : écrire du code applicatif, de SQL, de CI ; contourner un agent.
- **Zone** : `docs/STATUS.md` uniquement.
- **Skills** : une tâche = une fonctionnalité ; jamais deux tâches sur les mêmes fichiers en parallèle ; tout hors périmètre va au backlog « plus tard ».

### 2. SCHEMA
- **Fait** : migrations `supabase/migrations/*.sql` (une migration numérotée par changement), `supabase/seed.sql` (les 4 réalisations : Julia, Vitascore, Feonix, Vina.io), génération des types (`supabase gen types typescript` → `src/lib/database.types.ts`).
- **Ne fait jamais** : écrire des politiques RLS (→ RLS), du code TypeScript applicatif, toucher à la production sans validation humaine.
- **Zone** : `supabase/migrations/**`, `supabase/seed.sql`, `src/lib/database.types.ts`.
- **Skills** : rejouer `supabase db reset` sans erreur ; tables filles (`project_images`, `project_tech`, `project_highlights`) avec `sort_order` pour permettre le réordonnancement ; images toujours en Storage, jamais en base64 ; aucune modification manuelle en production.

### 3. RLS
- **Fait** : active RLS sur **toutes** les tables, écrit les politiques, crée les buckets Storage `projects` (2 Mo max/objet) et `branding` (500 Ko) et leurs politiques, teste l'étanchéité.
- **Ne fait jamais** : créer ou modifier des tables (→ SCHEMA), écrire du code applicatif.
- **Zone** : fichiers de migration dédiés aux politiques (`supabase/migrations/*_rls_*.sql`).
- **Skills** : règle = *lecture publique du publié, écriture réservée aux admins*.

```sql
alter table projects enable row level security;
create policy "public lit les réalisations publiées"
  on projects for select using (published = true);
create policy "admins gèrent tout"
  on projects for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

`contact_messages` : aucune lecture publique, insertion publique contrôlée, lecture admin seulement.

Test de validation : une requête anonyme sur un contenu non publié renvoie **0 ligne**.

### 4. DATA
- **Fait** : `lib/supabase/server.ts` et `lib/supabase/client.ts`, requêtes typées (`getProjects`, `getProjectBySlug`, `getSettings`…), mappers base → forme existante (`toProjectDetail`), revalidation (`revalidatePath` / `revalidateTag`) et tags de cache.
- **Ne fait jamais** : modifier la base (→ SCHEMA), écrire des composants UI (→ FRONT-PUBLIC), écrire des mutations (→ MUTATIONS).
- **Zone** : `src/lib/**` (hors `database.types.ts` et hors actions).
- **Skills** : aucun `any` ; `toProjectDetail()` produit **exactement** l'ancienne forme d'objet ; la clé `service_role` n'est jamais utilisée dans un client navigateur.

### 5. FRONT-PUBLIC
- **Fait** : branche les pages publiques (accueil, `/projets`, `/projects/[slug]`) sur les fonctions de DATA ; `notFound()` ; repli gracieux si une donnée manque.
- **Ne fait jamais** : refaire le design, modifier `ProjectDetail`, écrire des requêtes (→ DATA), toucher `/admin`.
- **Zone** : `src/app/(public)/**` et `src/components/**` des sections publiques.
- **Skills** : pattern `const project = await getProjectBySlug(slug); if (!project) notFound(); return <ProjectDetail data={toProjectDetail(project)} />;` ; critère visuel bloquant : rendu **identique** (comparaison de captures).

### 6. AUTH
- **Fait** : création du compte admin (avec l'humain), page `/admin/login`, déconnexion, `middleware.ts` qui protège `/admin/**`, lien `profiles` ↔ `auth.users`.
- **Ne fait jamais** : écrire les politiques RLS (→ RLS), les écrans admin (→ ADMIN-UI).
- **Zone** : `middleware.ts`, `src/app/admin/login/**`, `src/lib/auth/**`.
- **Skills** : défense en profondeur (middleware **et** RLS) ; mauvais mot de passe → message d'erreur, aucun accès ; accès anonyme à `/admin` → redirection `/admin/login`.

### 7. MUTATIONS
- **Fait** : toutes les server actions d'écriture, validation **Zod côté serveur**, appel de la revalidation après chaque mutation, gestion du slug avec redirection 301, brouillon/publié.
- **Ne fait jamais** : écrire des composants (→ ADMIN-UI), des requêtes de lecture (→ DATA), des politiques RLS.
- **Zone** : `src/app/actions/**`.
- **Skills** : jamais d'écriture directe depuis le navigateur ; soumission invalide → erreurs renvoyées, **rien en base** ; l'action est livrée **avant** l'écran qui l'utilise.

### 8. ADMIN-UI
- **Fait** : layout admin, tableau de bord, listes, formulaires, upload d'images avec alt obligatoire, réordonnancement, prévisualisation, boîte de réception.
- **Ne fait jamais** : écrire une server action (→ MUTATIONS), une requête (→ DATA), une politique (→ RLS), modifier le design public.
- **Zone** : `src/app/admin/**` (hors `login`) et `src/components/admin/**`.
- **Skills** : n'appelle que les actions de MUTATIONS et les fonctions de DATA ; 0 erreur de console.

### 9. MESSAGERIE
- **Fait** : notification e-mail via Resend, accusé de réception à l'expéditeur (option), anti-spam (honeypot, limitation de débit, **hachage de l'IP**, jamais l'IP en clair).
- **Ne fait jamais** : l'écran de la boîte de réception (→ ADMIN-UI), la table `contact_messages` (→ SCHEMA).
- **Zone** : `src/lib/mail/**`, `src/lib/antispam/**`.
- **Skills** : `RESEND_API_KEY` et `CONTACT_TO_EMAIL` côté serveur uniquement ; 10 envois automatisés → bloqués après le seuil.

### 10. SEO
- **Fait** : `sitemap.xml`, `robots.txt` dynamiques, `generateMetadata()` par réalisation, Open Graph, image de partage.
- **Ne fait jamais** : modifier le contenu, le design, les performances (→ PERF-A11Y).
- **Zone** : `src/app/sitemap.ts`, `src/app/robots.ts`, fonctions `generateMetadata`.
- **Skills** : `/sitemap.xml` → 200 avec toutes les réalisations publiées ; partage testé → titre et image corrects.

### 11. PERF-A11Y
- **Fait** : conversion WebP, `next/image` + `images.remotePatterns`, `alt`, `h1` manquants, `href="#"` remplacés, styles d'étoiles sortis du HTML, bundle allégé.
- **Ne fait jamais** : changer le contenu éditorial, le SEO, la logique de données.
- **Zone** : composants et styles, config `next.config`.
- **Skills** : images cibles WebP ≤ 1600 px (~100-250 Ko) ; page détail < 500 Ko ; 0 page sans `h1`, 0 lien mort.

### 12. DEVOPS
- **Fait** : CI GitHub Actions, **fusion dans `dev` des PR au verdict ✅ avec CI verte (sur ordre de l'ORCHESTRATEUR)**, ouverture de la PR de release `dev` → `main` en fin de sprint, **fusion automatique dans `main` uniquement si la Porte de merge (§4ter) est entièrement verte** et `AUTO_MERGE_MAIN = true`, smoke test de production et rollback automatique en cas d'échec, protection des branches, déploiements Vercel (preview/production), variables d'environnement (`.env.example`), connexion du projet Supabase côté configuration, rollback, plan de sortie Cloudflare Pages.
- **Ne fait jamais** : logique métier, SQL, sauvegardes et monitoring (→ EXPLOITATION).
- **Zone** : `.github/**`, `vercel.json`, `.env.example`, docs de déploiement.
- **Skills** : flux `feat/*` ──PR──► `dev` (preview) ──PR de release──► `main` (production) ; jamais de réécriture d'historique de `main` ; rollback via Vercel *Promote to Production* ou `git revert` par PR ; surveiller les seuils gratuits (Supabase : 500 Mo base, 1 Go fichiers, 5 Go egress/mois, **pause après 7 jours d'inactivité** ; Vercel Hobby : 100 Go/mois, **usage commercial interdit par les CGU**, sources < 100 Mo).

| Variable | Sprint | Portée |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | S1 | Publique |
| `SUPABASE_SERVICE_ROLE_KEY` | S3 | Serveur uniquement |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` | S6 | Serveur uniquement |
| `CRON_SECRET` | S7 | Serveur uniquement |

### 13. EXPLOITATION
- **Fait** : cron de keep-alive Supabase (route protégée par `CRON_SECRET`) + alerte, export/sauvegarde planifiée de la base, monitoring des erreurs et du statut du site.
- **Ne fait jamais** : CI/CD, déploiement (→ DEVOPS), code métier.
- **Zone** : `src/app/api/cron/**`, scripts de sauvegarde, config de monitoring.
- **Skills** : la base ne doit jamais être mise en pause ; un export doit être **rejouable** ; une erreur de production doit être visible.

### 14. REVIEWER
- **Fait** : relit chaque PR, lance `tsc --noEmit`, `eslint`, build, vérifie le critère d'acceptation et la Definition of Done (§6), vérifie qu'aucun agent n'a écrit **hors de sa zone**, qu'aucun secret n'est dans le diff. Rend un verdict.
- **Ne fait jamais** : modifier un fichier, corriger lui-même.
- **Zone** : aucune (lecture seule).
- **Verdict** : `✅ APPROUVÉ` ou `❌ À CORRIGER` avec une liste **précise et actionnable**. Toute PR touchant données, auth ou `/admin` exige une relecture attentive de la sécurité.

### 15. DOC
- **Fait** : README, guide admin (publier une réalisation en < 5 min), documentation d'exploitation, mise à jour de la doc associée aux fonctionnalités.
- **Ne fait jamais** : modifier du code.
- **Zone** : `README.md`, `docs/**` (hors `docs/STATUS.md`).

### 16. UI-ADMIN
- **Fait** : le design **visuel** de la page de connexion et de tout l'espace `/admin` : mise en page, `admin.module.css` (et uniquement lui côté styles), thème, espacements, typographie, états (survol, actif, erreur, succès), responsive. **Méthode imposée : copie fidèle depuis capture d'écran.** L'humain envoie une capture de référence dans la conversation (référence locale, non committée, non stockée dans le dépôt) : l'agent la décrit d'abord en mots (structure, couleurs, espacements, composants), propose sa lecture **avant** de coder, puis reproduit l'écran concerné le plus fidèlement possible. Toute ambiguïté de la capture est signalée avec la proposition retenue ; aucune invention hors capture.
- **Ne fait jamais** : toucher aux Server Actions, aux requêtes ou à la logique (→ ADMIN-UI), aux données (→ DATA), à la base (→ SCHEMA/RLS), au **site public** (design gelé, §1), ni stocker la capture dans le dépôt.
- **Zone** : `src/app/admin/**` (mises en page et JSX visuel), `src/app/admin.module.css`. Les écrans livrés restent **fonctionnels à l'identique** : même formulaire de connexion, mêmes statuts et boutons — l'agent habille, il ne rebranche pas.
- **Skills** : à chaque capture, commencer par la lecture écrite (structure → palette → espacements → composants) puis la proposition de reproduction ; un écran = un PR ; la preuve est une **capture « après »** confrontée à la référence (screenshots comparés de bout en bout) ; vérifier les états d'erreur (mauvais mot de passe, champ vide) et le responsive étroit (mobile) ; 0 erreur de console ; la lisibilité des textes d'administration prime toujours sur l'esthétique.



---

## 4. Boucle de travail

```
1. ORCHESTRATEUR  choisit F<x.y> → écrit la tâche → assigne UN agent (selon §8)
2. AGENT          branche feat/F<x.y>-<slug> depuis dev → fait SA responsabilité → tsc / eslint / build en local
                  → hors périmètre ? répond « HORS PÉRIMÈTRE → … » et s'arrête
3. REVIEWER       verdict ✅ / ❌
4. ❌ → retour à l'agent (maximum 2 tours, ensuite la fonctionnalité est marquée BLOQUÉE, voir §4bis)
   ✅ → DEVOPS fusionne la PR dans dev (CI verte) → ORCHESTRATEUR met à jour docs/STATUS.md → fonctionnalité suivante
```

**Ordre des dépendances** (une fonctionnalité qui traverse plusieurs responsabilités est découpée en tâches) :

```
SCHEMA → RLS → DATA → FRONT-PUBLIC
                 └──► MUTATIONS → ADMIN-UI
AUTH (indépendant, avant ADMIN-UI)
```

**Format de sortie standard de chaque agent** :

```
[AGENT] Fonctionnalité : F<x.y>
Fait : …
Fichiers modifiés : …
Vérifications : tsc / eslint / build → résultat
Hors périmètre rencontré : … (ou « aucun »)
Prochaine action proposée : …
```

---

## 4bis. MODE AUTONOME PAR SPRINT

**Principe** : un seul ordre humain (`GO S<n>`). L'ORCHESTRATEUR enchaîne **toutes** les fonctionnalités du sprint, sans pause de validation, puis livre un **rapport de démo** et **s'arrête**. L'humain teste, valide, puis dit `GO S<n+1>`.

### Les 4 phases (pilotées par l'ORCHESTRATEUR)

**Phase 0 — Préparation**
1. Lire `docs/STATUS.md` et la liste des `F` du sprint (§8).
2. Les ordonner selon les dépendances (§4) et attribuer chaque tâche à son agent.
3. Envoyer **un seul message** à l'humain : (a) les **pré-requis humains** du sprint (tableau ci-dessous), (b) les décisions ouvertes (§10) avec leur valeur par défaut.
4. **Ne pas attendre la réponse** pour les tâches qui n'en dépendent pas : commencer immédiatement.

**Phase 1 — Exécution (sans interruption)**
Pour chaque fonctionnalité : agent assigné → travail dans sa zone → REVIEWER → ✅ → DEVOPS fusionne dans `dev` → mise à jour de `docs/STATUS.md` → suivante.

**Phase 2 — Intégration du sprint**
Quand toutes les `F` sont ✅ ou BLOQUÉES : sur `dev` (preview Vercel), **rejouer les critères d'acceptation de TOUTES les fonctionnalités du sprint**, vérifier CI verte, `tsc` / `eslint` / build à 0 erreur, pas de régression sur les sprints précédents.

**Phase 3 — Démo et arrêt**
1. DEVOPS ouvre la PR de release `dev` → `main`.
2. L'ORCHESTRATEUR passe la **Porte de merge (§4ter)** : tout vert et `AUTO_MERGE_MAIN = true` → DEVOPS fusionne dans `main`, puis smoke test de production ; sinon la PR reste ouverte.
3. L'ORCHESTRATEUR publie le **rapport de démo** (format ci-dessous), commençant par : `🎬 SPRINT S<n> TERMINÉ — PRÊT POUR LA DÉMO`
4. **STOP.** Aucun travail sur le sprint suivant avant `GO S<n+1>`.

**Phase 4 — Après la démo (sur ordre humain)**
- « Validé » → si la PR de release n'a pas été fusionnée automatiquement, l'humain la fusionne ; puis l'humain dit `GO S<n+1>`.
- « À corriger : … » → l'ORCHESTRATEUR crée des tâches de correction, refait les phases 1 à 3 pour ces seuls points, republie le rapport.

### Règles d'autonomie

- **Ne jamais poser de question en cours de sprint** pour un détail technique : choisir l'option la plus simple conforme aux principes (§1), l'inscrire dans le journal des décisions de `docs/STATUS.md`.
- **Bloqué** (pré-requis humain absent, 2 tours ❌, outil indisponible) : marquer la fonctionnalité `BLOQUÉE` avec la cause, **continuer** sur les fonctionnalités indépendantes. Ne jamais boucler, ne jamais attendre en silence.
- Un sprint est **terminé** quand chaque `F` est ✅ ou BLOQUÉE avec cause. Si des `F` sont BLOQUÉES, le verdict du rapport est `⚠️ PARTIEL`.
- **Aucune fonctionnalité hors sprint** : les idées vont dans le backlog « plus tard » de `docs/STATUS.md`.
- La fusion dans `dev` est automatique (après ✅ + CI verte). La fusion dans `main` est automatique **seulement** si la Porte de merge (§4ter) est entièrement verte ; au moindre doute, la PR reste ouverte.
- Les interdits du §5 restent valables : en cas de conflit, l'agent s'abstient, le note, et continue sur le reste.

### Pré-requis humains par sprint (demandés en Phase 0, en un seul message)

| Sprint | Ce que l'humain doit fournir ou faire |
|---|---|
| S1 | Créer le projet Supabase (free) ; mettre URL + clé anon dans `.env.local` et dans Vercel (**jamais dans le chat**) ; connexion Git ↔ Vercel (§9) |
| S2 | Rien de nouveau (vérifier que les variables sont présentes en Preview) |
| S3 | Créer le compte admin (e-mail + mot de passe saisis par l'humain, jamais dans le chat) ; ajouter `SUPABASE_SERVICE_ROLE_KEY` dans Vercel |
| S4 | Rien |
| S4bis | Créer le compte **ImageKit (free)** ; poser `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` et `IMAGEKIT_PRIVATE_KEY` dans Vercel (Production + Preview) — la clé privée **jamais dans le chat ni dans le dépôt** ; autoriser la migration des images existantes (aucune écriture en production sans accord) |
| S5 | Logo / favicon éventuels (sinon les actuels sont conservés) |
| S6 | Clé Resend, e-mail destinataire (`CONTACT_TO_EMAIL`), domaine d'envoi (ou adresse de test Resend) |
| S7 | `CRON_SECRET`, compte de monitoring gratuit, décision d'hébergement (§10) |

### Structure de `docs/STATUS.md` (tenue par l'ORCHESTRATEUR)

```
# STATUS
Sprint en cours : S<n> — phase : 0|1|2|3 — dernière mise à jour : <date>
| F | Agent | État (À FAIRE / EN COURS / ✅ / BLOQUÉE) | PR | Note |
## Journal des décisions prises seul
## Bloquants et pré-requis humains en attente
## Backlog « plus tard »
```

### Format du rapport de démo

```
🎬 SPRINT S<n> TERMINÉ — PRÊT POUR LA DÉMO

1. Verdict : ✅ complet | ⚠️ partiel (F… bloquées)
2. Fonctionnalités livrées : | ID | Critère d'acceptation | Preuve | PR |
3. Où voir la démo : URL de la preview `dev` (+ compte de test éventuel, jamais de secret de production)
4. Parcours de démo : 5 à 8 étapes numérotées, 3 minutes maximum
5. Décisions prises sans toi : liste (à contester si besoin)
6. Bloquées / dette / risques : …
7. À faire par toi : checklist (actions manuelles, clés, validations)
8. Release : PR dev → main #… — fusionnée automatiquement ✅ (Porte de merge 10/10, smoke test production OK) | NON fusionnée (condition en échec : …)
9. Prochaine étape : j'attends « GO S<n+1> »
```

---

## 4ter. PORTE DE MERGE (auto-merge vers `main`)

Réglage : `AUTO_MERGE_MAIN = true` (§0). La PR de release `dev` → `main` est fusionnée **automatiquement si et seulement si les 10 conditions sont vraies**. Une seule fausse = **aucune fusion** : la PR reste ouverte et le rapport indique la condition en échec.

| # | Condition | Vérifiée par |
|---|---|---|
| 1 | Toutes les `F` du sprint sont ✅ (**aucune BLOQUÉE**) | ORCHESTRATEUR |
| 2 | CI verte sur le dernier commit de `dev` et sur la PR de release | DEVOPS |
| 3 | `tsc --noEmit`, `eslint`, build : **0 erreur** | REVIEWER |
| 4 | Les critères d'acceptation de **toutes** les `F` du sprint rejoués sur la preview, preuves jointes | REVIEWER |
| 5 | Pas de régression : critères clés des sprints précédents rejoués ; routes clés en 200 sur la preview | REVIEWER |
| 6 | Verdict ✅ final du REVIEWER sur le diff `dev` → `main` ; aucune écriture hors zone d'agent | REVIEWER |
| 7 | **Aucun secret** dans le diff (clés, tokens, `.env`) | REVIEWER |
| 8 | Aucune migration destructive ; migrations additives rejouées sans erreur via `supabase db reset` | SCHEMA + REVIEWER |
| 9 | Si des données sont touchées : test RLS anonyme → **0 ligne** sur le contenu non publié | RLS |
| 10 | Aucun pré-requis humain ou décision en attente qui touche ce sprint | ORCHESTRATEUR |

**Méthode de fusion** : PR de release → `gh pr merge <n> --merge` (commit de fusion, historique conservé), après CI verte. PR de fonctionnalité → `dev` : `--squash`. **Jamais** de contournement de la protection de branche (pas de `--admin`, pas de force-push). Si la protection de `main` exige une approbation humaine, ou si l'auto-merge du dépôt est désactivé : laisser la PR ouverte.

**Migrations** : les migrations **additives** (`CREATE TABLE/INDEX/POLICY`, `ADD COLUMN` nullable) sont appliquées en production (`supabase db push`) **avant** la fusion dans `main`, pour que la production ne référence jamais une table absente. Toute migration **destructive** (`DROP`, `DELETE`, `TRUNCATE`, suppression de colonne, changement de type) = arrêt, humain.

**Après la fusion (DEVOPS, automatique)**
1. Attendre le déploiement de production Vercel.
2. **Smoke test** : `/` , `/projets` et `/projects/<slug d'une réalisation publiée>` → 200 ; dès S3 : `/admin/login` → 200 et `/admin` → redirection vers `/admin/login` ; dès S7 : `/sitemap.xml` → 200.
3. **Échec** → rollback immédiat : *Promote to Production* du dernier déploiement sain, puis PR de revert vers `dev`. La `F` fautive passe BLOQUÉE, le verdict du rapport devient `⚠️ PARTIEL`, et le rapport l'explique. (Les migrations additives déjà appliquées restent compatibles avec l'ancien code.)

---

## 5. Interdits et arrêts (valables même en mode autonome)

En mode autonome (§4bis), ces points **ne bloquent pas le sprint** : l'agent s'abstient, l'inscrit dans `docs/STATUS.md` (rubrique « Bloquants et pré-requis humains »), et continue sur le reste.

- toute **fusion vers `main`** hors Porte de merge entièrement verte (§4ter) ;
- toute **migration destructive** appliquée en production (les migrations additives passent par la Porte de merge, §4ter) ;
- tout usage ou affichage de `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET` ;
- facturation ou service payant ;
- suppression de données ou `DROP` ;
- actions manuelles de tableau de bord (§9).

**Jamais** : committer un secret · réécrire l'historique de `main` · pousser directement sur `main` ou `dev` · désactiver la CI pour « faire passer ».

---

## 6. Definition of Done (chaque fonctionnalité)

1. Critère d'acceptation démontré (capture ou commande).
2. `tsc --noEmit` et `eslint` : **0 erreur** ; build vert.
3. Fonctionne sur `dev` déployée en preview.
4. Sécurité en place (RLS / validation serveur) si des données sont touchées.
5. Documentation associée à jour.
6. PR vers `dev`, verdict ✅ du REVIEWER, fusion.

---

## 7. Modèle de données (référence)

- **Éditorial** : `site_settings` (clé/valeur JSON) · `services` · `projects` · `project_images` · `project_tech` · `project_highlights` · `testimonials` · `faq_items` · `tech_banner` · `media`.
- **Admin & contacts** : `contact_messages` (statuts `new|read|replied|archived`, notes, `ip_hash`) · `profiles` (miroir de `auth.users` + rôle `admin|editor`).
- Buckets : `projects` (images) et `branding` (logo, favicon, Open Graph).

---

## 8. Roadmap : fonctionnalité → agent responsable

> S0 terminé. Reprendre à S1. Une fonctionnalité listée avec plusieurs agents = autant de tâches, dans l'ordre indiqué.

### S1 — Backend & modèle de données

| ID | Fonctionnalité | Agent | Critère d'acceptation |
|---|---|---|---|
| F1.1 | Projet Supabase connecté au dépôt | DEVOPS (+ humain) | `supabase link` OK ; `/` se connecte sans erreur |
| F1.2 | Tables `projects`, `project_images`, `project_tech`, `project_highlights` | SCHEMA | `supabase db reset` sans erreur |
| F1.3 | Tables `site_settings`, `services`, `testimonials`, `faq_items`, `tech_banner` | SCHEMA | idem |
| F1.4 | Tables `contact_messages`, `profiles` | SCHEMA | idem |
| F1.5 | RLS + politiques | RLS | requête anonyme sur non publié → 0 ligne |
| F1.6 | Seed des 4 réalisations + images | SCHEMA | `count(*)` → 4 |
| F1.7 | Types TypeScript générés | SCHEMA | `tsc` 0 erreur |
| F1.8 | Buckets `projects`, `branding` + politiques | RLS | upload admin OK ; lecture publique OK |

### S2 — Front public dynamique

| ID | Fonctionnalité | Agent | Critère d'acceptation |
|---|---|---|---|
| F2.1 | Client Supabase serveur | DATA | utilisable dans un Server Component |
| F2.2 | Requêtes typées | DATA | aucun `any` |
| F2.3 | Mappers base → `ProjectDetail` | DATA | produit l'ancienne forme |
| F2.4 | Accueil branché | FRONT-PUBLIC | textes issus de la base ; rendu identique |
| F2.5 | `/projets` et détail branchés | FRONT-PUBLIC | ajout en base visible sans redéploiement |
| F2.6 | `/projects/[slug]` + `notFound()` | FRONT-PUBLIC | slug inconnu → 404 propre |
| F2.7 | Revalidation après mutation | DATA | édition visible en < 5 s |
| F2.8 | Repli gracieux | FRONT-PUBLIC | champ supprimé ne casse aucune page |

### S3 — Authentification & socle admin

| ID | Fonctionnalité | Agent | Critère d'acceptation |
|---|---|---|---|
| F3.1 | Compte administrateur | AUTH (+ humain) | connexion réussie |
| F3.2 | `/admin/login` | AUTH | mauvais mot de passe → erreur |
| F3.3 | `middleware.ts` | AUTH | accès anonyme → `/admin/login` |
| F3.4 | `profiles` + rôle (politiques) | RLS | non-admin ne peut rien écrire |
| F3.5 | Layout admin | ADMIN-UI | 4 sections sans erreur console |
| F3.6 | Tableau de bord (compteurs) | DATA puis ADMIN-UI | publiées / brouillons / non lus |

### S4 — Admin : Réalisations

| ID | Fonctionnalité | Agents (dans l'ordre) | Critère d'acceptation |
|---|---|---|---|
| F4.1 | Liste + réordonnancement | MUTATIONS → ADMIN-UI | ordre public modifié |
| F4.2 | Créer une réalisation | MUTATIONS → ADMIN-UI | apparaît sur `/projets` |
| F4.3 | Éditer / supprimer | MUTATIONS → ADMIN-UI | suppression + cascade OK |
| F4.4 | Upload multiple + alt | MUTATIONS → ADMIN-UI | 5 images, alt obligatoire |
| F4.5 | Technologies et points forts | MUTATIONS → ADMIN-UI | persistés |
| F4.6 | Brouillon / publié | MUTATIONS | brouillon invisible en navigation privée |
| F4.7 | Slug + redirection 301 | MUTATIONS | ancien slug redirige |
| F4.8 | Prévisualisation | ADMIN-UI | rendu identique au public |
| F4.9 | Validation Zod | MUTATIONS | invalide → rien en base |

### S4bis — Médias externes : images via ImageKit

> Sprint **hors plan initial**, ajouté à la demande de l'humain le 2026-10-06. La vidéo reste hors périmètre (champ `video_url` externe). Détail complet et risques : `docs/SPRINTS.md`.

| ID | Fonctionnalité | Agents (dans l'ordre) | Critère d'acceptation |
|---|---|---|---|
| F4bis.1 | Variables ImageKit (3) | DEVOPS (+ humain) | présentes en Production et Preview ; sans elles l'app démarre |
| F4bis.2 | `/api/imagekit/auth` (signature serveur) | AUTH → DATA | anonyme → 401 ; session admin → 200 ; clé privée jamais exposée |
| F4bis.3 | Envoi direct navigateur → ImageKit | MUTATIONS → ADMIN-UI | 5 images ; `project_images.url` = URL ImageKit |
| F4bis.4 | Garde-fous format / taille | ADMIN-UI | 3 Mo refusé avant envoi, 0 requête réseau |
| F4bis.5 | Affichage public | FRONT-PUBLIC | images en 200, aucune cassée |
| F4bis.6 | Suppression d'une image | MUTATIONS | ligne supprimée ; fichier distant conservé (documenté) |
| F4bis.7 | Migration des images existantes | DATA (+ humain) | images de production sur ImageKit, ancienne URL conservée |
| F4bis.8 | Non-régression / repli | FRONT-PUBLIC | URL inaccessible ne casse pas la page |
| F4bis.9 | Documentation d'exploitation | DOC | où sont les images, changer de compte, que faire si quota |

### S5 — Admin : personnalisation

| ID | Fonctionnalité | Agents (dans l'ordre) | Critère d'acceptation |
|---|---|---|---|
| F5.1 | Éditeur Hero | MUTATIONS → ADMIN-UI | titre modifié → accueil change |
| F5.2 | Éditeur À propos | MUTATIONS → ADMIN-UI | persisté |
| F5.3 | Éditeur Services | MUTATIONS → ADMIN-UI | ajout visible immédiatement |
| F5.4 | Éditeur Témoignages | MUTATIONS → ADMIN-UI | carrousel reflète la base |
| F5.5 | Éditeur FAQ | MUTATIONS → ADMIN-UI | idem |
| F5.6 | Éditeur CTA et réseaux | MUTATIONS → ADMIN-UI | liens du pied de page changent |
| F5.7 | SEO global + image de partage | MUTATIONS → ADMIN-UI → SEO | `<title>` et Open Graph dans la source |
| F5.8 | Identité (logo, favicon, couleurs) | MUTATIONS → ADMIN-UI | nouveau logo → navbar mise à jour |

### S6 — Admin : contacts

| ID | Fonctionnalité | Agents (dans l'ordre) | Critère d'acceptation |
|---|---|---|---|
| F6.1 | Stocker chaque soumission | MUTATIONS | `count(*)` augmente |
| F6.2 | Boîte de réception | DATA → ADMIN-UI | filtre `new` fonctionnel |
| F6.3 | Détail + statuts | MUTATIONS → ADMIN-UI | statut persisté |
| F6.4 | Notes internes | MUTATIONS → ADMIN-UI | note rechargée |
| F6.5 | Notification e-mail | MESSAGERIE | e-mail reçu |
| F6.6 | Accusé de réception (option) | MESSAGERIE | confirmation reçue |
| F6.7 | Anti-spam | MESSAGERIE | 10 envois automatisés bloqués |
| F6.8 | Export CSV | ADMIN-UI | CSV lisible |
| F6.9 | Badge « non lus » | DATA → ADMIN-UI | décrémenté à la lecture |

### S7 — Finitions & durcissement

| ID | Fonctionnalité | Agent | Critère d'acceptation |
|---|---|---|---|
| F7.1 | `sitemap.xml` + `robots.txt` | SEO | `/sitemap.xml` → 200 |
| F7.2 | Métadonnées + Open Graph par réalisation | SEO | titre et image corrects |
| F7.3 | `h1` manquants, `href="#"` | PERF-A11Y | 0 page sans `h1`, 0 lien mort |
| F7.4 | Images WebP + `next/image` + `alt` | PERF-A11Y | page détail < 500 Ko |
| F7.5 | Étoiles hors HTML, bundle allégé | PERF-A11Y | HTML de `/` nettement réduit |
| F7.6 | Keep-alive Supabase + alerte | EXPLOITATION | base jamais en pause |
| F7.7 | Sauvegarde / export planifié | EXPLOITATION | export rejouable |
| F7.8 | Monitoring | EXPLOITATION | erreur de prod visible |
| F7.9 | Documentation + guide admin | DOC | un tiers publie une réalisation avec le guide |
| F7.10 | Plan de sortie Cloudflare Pages | DEVOPS | procédure écrite et testable |

---

## 9. Actions manuelles réservées à l'humain

1. **Connexion Git ↔ Vercel** : Vercel → Account Settings → Login Connections → connecter le compte GitHub `Mendrika10`, puis Projet → Settings → Git → Connect Git Repository. Vérifier : Production Branch = `main` ; un push sur `dev` = preview.
2. En attendant : `vercel --yes` (preview) et `vercel --prod --yes` (production).
3. Création du projet Supabase et récupération des clés (F1.1).
4. Fusion vers `main` quand la Porte de merge est en échec ; migrations destructives en production ; activation de l'option « Allow auto-merge » du dépôt si elle est désactivée.

---

## 10. Décisions ouvertes (l'ORCHESTRATEUR les pose en un seul message, Phase 0 de S1)

1. **Connexion admin** : e-mail + mot de passe, lien magique, ou les deux.
2. **Périmètre de personnalisation au lancement** : tout le site, ou Réalisations + Contacts d'abord.
3. **Hébergement** : accepter la zone grise Vercel Hobby (usage commercial) ou viser Cloudflare Pages dès le départ.
4. **Dépôt public ou privé** : la documentation actuelle est contradictoire ; trancher.

**Hypothèses de travail** (appliquées automatiquement si l'humain ne répond pas, pour ne jamais bloquer le sprint) : connexion admin = e-mail + mot de passe · personnalisation = tout le site · hébergement = Vercel Hobby temporaire, plan de sortie Cloudflare Pages documenté en S7 · statut du dépôt = **inchangé** (ne rien modifier sans ordre). Toute hypothèse appliquée est inscrite dans le journal des décisions et rappelée dans le rapport de démo.

---

## 11. Ordres de lancement

**Démarrer le sprint 1** (à envoyer à l'agent) :

> `[ORCHESTRATEUR]` Lis ce fichier en entier. **GO S1** en mode autonome (§4bis).
> Phase 0 : crée `docs/STATUS.md`, envoie-moi en un seul message les pré-requis humains de S1 et les décisions du §10 (avec leurs hypothèses par défaut), puis démarre immédiatement les tâches qui n'en dépendent pas.
> Enchaîne les phases 1 et 2 sans m'interrompre. Termine par le rapport de démo (« 🎬 SPRINT S1 TERMINÉ — PRÊT POUR LA DÉMO ») et arrête-toi. Rappel : chaque agent ne fait que sa responsabilité ; sinon `HORS PÉRIMÈTRE → <AGENT> : <raison>`.

**Sprints suivants** : `GO S2`, `GO S3`… (après validation de la démo précédente).
**Correction après démo** : `À corriger : <liste>`.
**Désactiver l'auto-merge vers `main`** : `AUTO_MERGE_MAIN = false` (§0) → l'humain fusionne la PR de release après la démo.

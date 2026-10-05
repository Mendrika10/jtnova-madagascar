# Équipe projet — organisation, rôles et workflow

---

## 1. Point de vérité sur « l'équipe d'agents »

**Ce que je peux faire réellement** : je suis un agent unique. Je ne peux pas lancer plusieurs
sub-agents qui travaillent en parallèle sur la machine. Je ne vais donc pas te promettre une équipe
de 6 agents simultanés — ce serait faux.

**Ce que je fais à la place, et qui produit le même résultat** : j'endosse **des rôles spécialisés
séquentiels**, chacun avec une **charte écrite**, des **livrables propres** et une **relecture
croisée**. Concrètement, à chaque fonctionnalité, le travail passe par les rôles dans l'ordre :
conception → données → interface → sécurité → test → revue → fusion. Chaque rôle produit un artefact
vérifiable, ce qui rend le travail traçable exactement comme avec une vraie équipe.

Et pour la livraison, j'utilise les **skills de workflow git** disponibles dans la queue Freebuff
(`commit`, `push`, `open-pr`, `merge-pr`) : chaque fonctionnalité devient une branche, une PR, une
revue, une fusion — le processus d'une vraie équipe.

---

## 2. Les rôles

### 🎯 Lead / Architecte — *orchestrateur*
- Découpe les sprints, arbitre les choix techniques, tient la roadmap.
- Garant du respect de la DoD (`PLAN.md` §8) et du périmètre.
- **Livrable** : plan de sprint, décisions d'architecture, revue finale.

### 🗄️ Backend & Données
- Schéma Postgres, migrations SQL, RLS, seed, types TypeScript.
- Server actions, validation Zod, logique métier.
- **Livrable** : migration + action + types générés.
- **Fichiers possédés** : `supabase/**`, `src/lib/**`, `src/app/actions/**`.

### 🎨 Frontend / UI
- Branchement des composants existants sur les données (mappers — **design inchangé**).
- Construction de l'interface `/admin`.
- **Livrable** : composant + capture de vérification.
- **Fichiers possédés** : `src/components/**`, `src/app/**` (hors actions).

### 🔒 Sécurité
- Contrôle des politiques RLS, des gardes d'accès, anti-spam, gestion des secrets.
- Vérifie qu'aucune clé serveur ne fuit côté client.
- **Livrable** : revue de sécurité signée pour chaque PR touchant des données.

### ⚙️ DevOps / Plateforme
- Dépôt, branches, CI (lint + typecheck + build), environnements Vercel, preview/production.
- Cron de keep-alive Supabase, sauvegardes, monitoring, plan de sortie d'hébergement.
- **Livrable** : pipeline vert, environnement reproductible.

### ✅ QA / Relecteur
- Exécute les critères d'acceptation, cherche les cas limites, teste les parcours réels.
- Impossible de fusionner sans son accord.
- **Livrable** : rapport « critère X vérifié par commande/capture ».

### ✍️ Design / UX (léger, au besoin)
- Cohérence de l'interface admin avec l'identité existante (tokens cyan/sombre).
- Accessibilité : titres, contrastes, navigation clavier.

---

## 3. Matrice de responsabilité (RACI)

| Activité | Lead | Backend | Frontend | Sécurité | DevOps | QA |
|---|---|---|---|---|---|---|
| Schéma de données | A | **R** | C | C | C | C |
| Composants publics | A | C | **R** | C | – | C |
| Interface admin | A | C | **R** | C | – | C |
| Politiques RLS | A | C | – | **R** | – | C |
| CI / déploiement | A | – | – | C | **R** | C |
| Critères d'acceptation | A | C | C | C | C | **R** |

*R = réalise · A = approuve · C = consulté*

---

## 4. Workflow Git

```
main   ←──────────────────────── PR de release ────────────────
  ▲                                                             │
  │                                                    (sprint terminé)
  │                                                             │
dev    ←── PR ── feat/S4.2-edition-realisation ── PR ───────────┘
  ▲                    │
  │                 commits atomiques
  └── PR ── fix/S6.1-anti-spam-contact
```

- **`main`** : état de production. Fusion **uniquement** depuis `dev`, en fin de sprint.
  ⚠️ La protection de branche n'est pas disponible sur un dépôt privé en offre gratuite
  (l'API répond 403 « Upgrade to GitHub Pro »). La règle est donc une **convention d'équipe**,
  pas un verrou technique. Elle devient un verrou si le dépôt passe en public ou en Pro.
- **`dev`** : intégration continue, déployée automatiquement en **preview Vercel**.
- **`feat/<sprint>.<n>-<slug>`** : une branche par fonctionnalité. PR vers `dev`.
- **`fix/<sprint>.<n>-<slug>`** : corrections.
- **`chore/…`** : outillage, CI, dépendances.

**Règles**
1. Aucun commit direct sur `main` ou `dev` (convention non verrouillée techniquement, cf. ci-dessus).
2. Une PR = une fonctionnalité = un critère d'acceptation.
3. La CI doit être verte avant fusion (lint, typecheck, build).
4. La PR est relue par le rôle complémentaire (ex. Frontend relit le Backend).

### Conventions de commit
`<type>(<périmètre>): <description à l'impératif>`
— types : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `security`.
Exemple : `feat(admin): permettre la réorganisation des images d'une réalisation`

---

## 5. Cérémonies légères

| Moment | Quand | Sortie |
|---|---|---|
| Plan de sprint | Début de sprint | Sprints + critères d'acceptation validés |
| Revue de sprint | Fin de sprint | Démo + critères prouvés + PR `dev` → `main` |
| Rétrospective | Après revue | 1 amélioration de process |

---

## 6. Outillage de l'équipe

| Outil | Usage |
|---|---|
| `tsc --noEmit` + `eslint` | Porte qualité obligatoire |
| `next build` | Vérifie que le déploiement passera |
| Vercel preview | Environnement de démonstration par PR |
| Supabase CLI | Migrations, seed, types, branche locale |
| Skills git | `commit` → `push` → `open-pr` → `merge-pr` |

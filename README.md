# Jtnova Madagascar — site & back-office

Site vitrine de l'agence **Jtnova** (web & digital), transformé en plateforme éditoriale :
l'interface client garde son design, mais **tout son contenu est administrable** depuis un
espace `/admin` protégé.

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| UI | CSS Modules + Bootstrap 5 (design existant conservé) |
| Base de données | Supabase (Postgres) |
| Authentification | Supabase Auth |
| Fichiers | Supabase Storage |
| Hébergement | Vercel |
| E-mails | Gmail SMTP (nodemailer) |
| Images | Supabase Storage + ImageKit (upload admin), `next/image` + WebP/AVIF côté site |
| Validation | Zod |

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés Supabase
npm run dev
```

Le site est servi sur http://localhost:3000, l'administration sur http://localhost:3000/admin.

## Exploitation au quotidien

| Besoin | Où |
|---|---|
| Publier une réalisation, gérer les messages, personnaliser le site | `docs/GUIDE-ADMIN.md` |
| Sauvegarde et restauration des contenus | `docs/GUIDE-ADMIN.md` — « Sauvegarde et restauration » |
| Vérifier l'état du site (base, erreurs) | `/admin/sante` (page « Santé ») |
| Déploiement, variables, rollback, limites gratuites | `docs/DEPLOIEMENT.md` |

### Automatisations (GitHub Actions)

| Workflow | Fréquence | Rôle |
|---|---|---|
| `CI` | chaque PR | types + lint + build |
| `Keep-alive Supabase` | tous les 3 jours | appelle `/api/cron/keep-alive` pour éviter la mise en pause de la base ; ouvre une issue en cas d'échec |
| `Sauvegarde des contenus` | chaque lundi | télécharge JSON + SQL rejouable via `/api/export`, archivés en artefact (90 j) |

Les deux automatisations utilisent le secret `CRON_SECRET` (GitHub **et** Vercel) ;
`SITE_URL` (variable de dépôt) permet de surcharger l'URL du site.

## Branches et workflow

| Branche | Rôle |
|---|---|
| `main` | Production. Protégée : on n'y fusionne que depuis `dev`, en fin de sprint. |
| `dev` | Intégration, déployée en preview. Toute fonctionnalité y arrive par Pull Request. |
| `feat/<n>-<slug>` | Une fonctionnalité (branche créée depuis `dev`). |
| `fix/<n>-<slug>` | Une correction. |
| `chore/<slug>` | Outillage, CI, dépendances. |

Aucun commit direct sur `main` ou `dev`. Convention de commit :
`<type>(<périmètre>): <description à l'impératif>`
(`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `security`).

## Qualité

```bash
npx tsc --noEmit   # types
npx eslint .       # lint (0 erreur exigée)
npm run build      # build de production
```

La CI (`.github/workflows/ci.yml`) exécute ces trois vérifications sur chaque Pull Request.

## Déploiement

| Environnement | Branche | Mise en place |
|---|---|---|
| Production | `main` | Vercel (`vercel link` effectué) |
| Preview | `dev` et branches de fonctionnalité | générée automatiquement par Vercel |

Procédure complète, variables d'environnement, rollback et seuils des offres gratuites :
**`docs/DEPLOIEMENT.md`**. Le plan de sortie vers Cloudflare Pages (si un jour les seuils
Vercel deviennent limitants) y est documenté et testable : **`docs/DEPLOIEMENT-CLOUDFLARE.md`**.

## Documentation de pilotage

| Document | Contenu |
|---|---|
| `docs/PLAN.md` | Vision, périmètre, stack, contraintes des offres gratuites, roadmap, Definition of Done |
| `docs/ARCHITECTURE.md` | Flux de données, modèle de données, politiques RLS, sécurité, performances |
| `docs/EQUIPE.md` | Rôles, matrice RACI, workflow Git, conventions |
| `docs/SPRINTS.md` | Sprints S0 → S7, chaque fonctionnalité et son critère d'acceptation |
| `docs/DEPLOIEMENT.md` | Runbook Vercel, variables d'environnement, rollback, limites gratuites |
| `docs/DEPLOIEMENT-CLOUDFLARE.md` | Plan de sortie vers Cloudflare Pages (procédure écrite et testable) |
| `docs/GUIDE-ADMIN.md` | Guide d'exploitation pour un rédacteur/admin : publier, modérer, sauvegarder |

## Règles à ne pas enfreindre

1. La clé `SUPABASE_SERVICE_ROLE_KEY` reste **exclusivement serveur** : jamais dans un composant client.
2. Le design de l'interface client ne change pas sans décision explicite — on branche des données, on ne refait pas la vue.
3. Aucun média lourd (vidéo) dans le dépôt : Supabase Storage ou hébergement externe.
4. Pas de modification manuelle du schéma en production : tout passe par une migration SQL versionnée.
5. Aucun secret dans le dépôt ni dans une URL : `CRON_SECRET` circule uniquement en en-tête `Authorization: Bearer`.

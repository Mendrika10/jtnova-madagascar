# Plan de sortie — Cloudflare Pages

**F7.10 — procédure écrite et testable.** Ce document décrit le basculement du
site de Vercel vers Cloudflare Pages, à exécuter uniquement si l'hébergement
Vercel devient limitant (CGU Hobby, bande passante, suspension). Il a été
**testé partiellement en local** (build compatible, voir §5) ; les étapes 1 à 4
sont à rejouer le jour de la bascule réelle.

## 0. Quand basculer ?

| Signal | Seuil |
|---|---|
| Usage commercial refusé / projet suspendu par Vercel | immédiat |
| Bande passante proche de la limite Hobby | > 80 Go/mois |
| Besoin d'un SLA ou d'un usage professionnel | décision humaine |

Aucun basculement n'est nécessaire tant que rien de tout cela ne se produit :
le projet tient volontairement dans les offres gratuites.

## 1. Prérequis

- Un compte Cloudflare (plan **Free**, carte bancaire non requise).
- Le dépôt GitHub `Mendrika10/jtnova-madagascar` (déjà poussé).
- Aucune dépendance propriétaire dans le code : Next.js standard + Supabase +
  nodemailer. Seules les variables d'environnement sont à recréer.

## 2. Créer le projet Cloudflare Pages

1. Dashboard Cloudflare → **Workers & Pages** → *Create* → *Pages* →
   *Connect to Git* → autoriser GitHub → sélectionner `Mendrika10/jtnova-madagascar`.
2. Configuration de build :
   - **Framework preset** : `Next.js`;
   - **Build command** : `npx @cloudflare/next-on-pages@1`;
   - **Build output directory** : `.vercel/output/static`;
   - **Compatibility flags** : `nodejs_compat` (Production et Preview) —
     requis par nodemailer et l'optimiseur d'images ;
   - **Node version** : variable `NODE_VERSION` = `24`.
3. Lancer le premier build et vérifier qu'il passe (le build local passe déjà :
   `npm run build` → 25 routes, zéro dépendance spécifique à Vercel).

> Alternative runtime (si `next-on-pages` bloque sur une API) : passer sur
> **OpenNext Cloudflare** (`@opennextjs/cloudflare`), supporté nativement par
> Cloudflare depuis 2025. La procédure dashboard est identique ; seul le build
> command devient `npx opennextjs-cloudflare build`.

## 3. Recréer les variables d'environnement

Dans **Workers & Pages → le projet → Settings → Variables and Secrets**
(les mêmes valeurs que `.env.local` — jamais committées) :

| Variable | Secret | Note |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | non | identique |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | non | identique |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` / `_PUBLIC_KEY` | non | si ImageKit actif |
| `IMAGEKIT_PRIVATE_KEY` | **oui** | chiffrée |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` | non/oui | Gmail SMTP |
| `SMTP_PASS` | **oui** | mot de passe d'application |
| `CONTACT_TO_EMAIL` / `CONTACT_AUTOREPLY` / `CONTACT_IP_SALT` | — | anti-spam |
| `CRON_SECRET` | **oui** | rotations des workflows |
| `NEXT_PUBLIC_SITE_URL` | non | `https://<sous-domaine>.pages.dev` |

## 4. Basculer le domaine

1. Laisser tourner les deux hébergements en parallèle : Cloudflare fournit
   `https://jtnova-madagascar.pages.dev` — vérifier les 8 pages publiques, une
   soumission de contact, une connexion `/admin`, un export `/api/export`.
2. Pointage du domaine personnalisé (le jour J) :
   - Cloudflare → Pages → *Custom domains* → ajouter le domaine (si le DNS est
     déjà chez Cloudflare, l'enregistrement est proposé automatiquement) ;
   - Vercel → Settings → Domains → retirer le domaine (sinon conflit DNS).
3. Mettre à jour `NEXT_PUBLIC_SITE_URL` (Vercel puis Cloudflare) et la
   variable de dépôt GitHub `SITE_URL` : sitemap, Open Graph et les workflows
   (`keep-alive.yml`, `backup.yml`) pointent alors vers la nouvelle URL.
4. Après 48 h sans incident : mettre le projet Vercel en pause (pas de
   suppression immédiate — rollback en un clic).

## 5. Ce qui a déjà été testé (préparation S7)

- `npm run build` : 25 routes, aucune API spécifique à Vercel détectée.
- Route handlers utilisés : `/api/cron/keep-alive`, `/api/export`,
  `/api/log-error`, `/api/imagekit/auth` — tous du Next.js standard
  (Web Request/Response), compatibles Workers.
- Server Actions, `revalidatePath`, ISR (`revalidate = 60`) : supportés par
  `next-on-pages`.
- Optimiseur d'images : `next/image` fonctionne sur Cloudflare via
  `next-on-pages` (conversion en edge function) ; en cas de limite, basculer
  `images.unoptimized = true` dans `next.config.ts` dégrade proprement
  (images servies en format d'origine, le site reste correct).

## 6. Points d'attention connus

- **Durée de build** : gratuite jusqu'à 20 min/build — le projet en fait ~1.
- **Logs** : moins pratiques que Vercel ; les erreurs applicatives restent
  visibles dans `/admin/sante` (indépendant de l'hébergeur).
- **Web analytics** : facultatif ; ajouter le beacon Cloudflare si souhaité.
- **Rollback** : repointer le domaine vers Vercel (ou *Promote* sur Vercel si
  le projet a été gardé actif).

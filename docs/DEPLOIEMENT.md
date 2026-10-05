# Déploiement — runbook

## 1. État actuel

| Étape | Statut |
|---|---|
| Dépôt GitHub `Mendrika10/jtnova-madagascar` (privé) | ✅ créé |
| Branches `main` et `dev` poussées | ✅ fait |
| CI (types, lint, build) sur `main` et `dev` | ✅ verte |
| Projet Vercel | ✅ **`mendrikaramaro20-7982/jtnova-madagascar`** — compte Jtnova (migré le 2026-10-05 depuis le compte d'une autre entreprise, projet y ayant été supprimé) |
| **Production en ligne** | ✅ `https://jtnova-madagascar.vercel.app` (déploiement CLI, routes vérifiées 200) |
| Déploiements automatiques Git | ⛔ **une action manuelle reste à faire** (voir §2) |
| Branche `main` protégée | ⚠️ impossible sur un dépôt privé gratuit (403 GitHub Pro) |

## 2. Activer les déploiements automatiques (une action, 2 minutes)

À refaire sur chaque nouveau compte Vercel : `vercel git connect` échoue avec l'erreur :
> « You need to add a Login Connection to your GitHub account first. (400) »

C'est une configuration de **compte**, pas de projet : elle ne peut être faite que depuis le
tableau de bord. Une seule fois :

1. **Vercel → Account Settings → Login Connections** → connecter le compte GitHub `Mendrika10`
   (aujourd'hui sur le compte `mendrikaramaro20-7982`).
2. **Projet jtnova-madagascar → Settings → Git → Connect Git Repository** → sélectionner
   `Mendrika10/jtnova-madagascar` (ou relancer `vercel git connect --yes` une fois la connexion ajoutée).

### Vérifier que le lien a fonctionné

- Vercel doit afficher **Production Branch = `main`**.
- Un push sur `dev` doit produire un **preview deployment**.
- Un merge dans `main` doit produire un **déploiement de production**.

En attendant, la production peut être mise à jour à la main depuis le dossier lié :

```bash
vercel --prod --yes    # déploie le code local en production
vercel --yes           # déploie un preview
```

## 3. Variables d'environnement

Aucune n'est nécessaire aujourd'hui : le site est encore alimenté par des données statiques.

À créer dans **Vercel → Settings → Environment Variables** au fur et à mesure des sprints :

| Variable | Sprints | Portée | Exemple |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | S1 | Tous | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | S1 | Tous | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | S3 | Production + Preview | **secret** |
| `RESEND_API_KEY` | S6 | Production + Preview | **secret** |
| `CONTACT_TO_EMAIL` | S6 | Production + Preview | `contact@jtnova.mg` |
| `CRON_SECRET` | S7 | Production | **secret** |

Référence locale : `.env.example` (les valeurs réelles restent dans `.env.local`, gitignoré).

## 4. Flux de déploiement

```
feat/*  ──PR──►  dev  ──►  Preview Vercel     (vérification)
                  │
                  └──PR de release──►  main  ──►  Production Vercel
```

## 5. Seuils des offres gratuites à surveiller

| Limite | Valeur | Risque si dépassée |
|---|---|---|
| Vercel Hobby — usage commercial | **interdit par les CGU** | suspension du projet |
| Vercel Hobby — bande passante | 100 Go/mois | dépassement facturé ou blocage |
| Vercel Hobby — taille des sources | 100 Mo | échec du déploiement (le dépôt est à ~25 Mo) |
| Supabase Free — base | 500 Mo | écritures bloquées |
| Supabase Free — fichiers | 1 Go | upload impossible |
| Supabase Free — egress | 5 Go/mois | service dégradé |
| Supabase Free — inactivité | pause après 7 jours | **site indisponible** → cron de keep-alive en S7 |

## 6. Revenir en arrière (rollback)

1. **Déploiement** : Vercel → Deployments → sélectionner un déploiement sain → *Promote to Production*. Immédiat, sans toucher au code.
2. **Code** : `git revert <sha>` sur une branche `fix/…`, PR vers `dev`, puis release vers `main`.
3. **Ne jamais** réécrire l'historique de `main` : c'est la branche que Vercel déploie.

## 7. Plan de sortie si Vercel Hobby pose problème

Le risque commercial (voir PLAN.md §5) peut être levé sans réécrire le projet :

1. Déployer le même dépôt sur **Cloudflare Pages** (gratuit, usage commercial autorisé).
2. Aucune dépendance propriétaire dans le code : Next.js standard + Supabase.
3. Seules les variables d'environnement sont à recréer côté Cloudflare.

# Jtnova — Plan de transformation « site professionnel piloté par l'admin »

> Repository cible : `jtnova-madagascar` · branches `main` (production) et `dev` (intégration)
> Coût cible : **0 € / mois** tant que le trafic reste sous les seuils gratuits.

---

## 1. Vision

Passer d'un site **statique codé en dur** à une **plateforme éditoriale** : l'interface client
conserve son design actuel (aucune refonte visuelle imposée), mais **tout son contenu devient
administrable** depuis un espace `/admin` protégé.

Objectif de fond : **publier, modifier et gérer le site sans toucher au code et sans redéployer.**

---

## 2. Objectifs mesurables (Definition of Success)

| # | Objectif | Mesure |
|---|---|---|
| O1 | Contenus client administrables | 100 % des sections visibles (Hero, À propos, Services, Réalisations, Témoignages, FAQ, CTA, SEO) éditables depuis `/admin` |
| O2 | Ajouter une réalisation | < 5 minutes, images incluses, **sans redéploiement** |
| O3 | Aucun lead perdu | Chaque message stocké en base + notification e-mail |
| O4 | Qualité bloquante | ESLint **0 erreur**, `tsc` 0 erreur, build vert, CI exécutée sur chaque PR |
| O5 | Process pro | `main` protégée, tout passe par `dev` via Pull Request |
| O6 | Budget | 0 €/mois à l'échelle actuelle |

---

## 3. Périmètre

**Inclus**
- Espace admin authentifié (`/admin`) : réalisations, contenus du site, contacts, médias, réglages.
- Base de données + stockage de fichiers + authentification (Supabase).
- Site public **dynamique** (données lues depuis la base, design inchangé).
- SEO réel (sitemap, robots, Open Graph, métadonnées par réalisation).
- CI/CD : 2 branches, PR, déploiement preview (Vercel).

**Exclu au départ** (pour ne pas diluer l'effort)
- Paiement / facturation, blog complet, multi-langue, espace client public, gestion d'équipe avancée,
  analytics payants, e-mails transactionnels marketing.

---

## 4. Principes directeurs

1. **UI client inchangée** — on ne refait pas le design ; on le branche sur des données.
2. **Le contenu quitte le code** — plus un seul texte métier en dur dans un composant.
3. **Une seule source de vérité** — Supabase (Postgres + Storage + Auth).
4. **Sécurité par défaut** — Row Level Security activée partout ; la clé `service_role`
   ne quitte jamais le serveur.
5. **Gratuit d'abord, sans lock-in** — SQL standard, hébergement remplaçable, pas d'abstraction propriétaire.
6. **Une fonctionnalité = un critère d'acceptation vérifiable** (cf. `SPRINTS.md`).

---

## 5. Stack cible et contraintes des offres gratuites ⚠️

### 5.1 Stack retenue

| Couche | Choix | Rôle |
|---|---|---|
| Framework | **Next.js 16 (App Router)** — existant | Rendu, routes, server actions |
| UI | **CSS Modules existants + Bootstrap** — inchangés | Design client |
| Base de données | **Supabase Postgres** | Contenus, réalisations, messages |
| Auth | **Supabase Auth** | Comptes admin |
| Fichiers | **Supabase Storage** | Images des réalisations |
| Hébergement | **Vercel** | Front + fonctions serveur |
| E-mails | **Resend** (free tier) | Notification des messages de contact |
| Validation | **Zod** | Validation des formulaires côté serveur |

### 5.2 Limites gratuites **vérifiées** (sources officielles, 2026)

**Supabase Free** — [supabase.com/pricing](https://supabase.com/pricing)
- Base : **500 Mo** · Fichiers : **1 Go** · Egress : **5 Go/mois** · Auth : 50 000 MAU
- **Le projet est mis en pause après 7 jours sans activité base de données** (pas « sans visite admin »)
- Maximum **2 projets actifs**

**Vercel Hobby** — [vercel.com/docs/plans/hobby](https://vercel.com/docs/plans/hobby), [fair-use](https://vercel.com/docs/limits/fair-use-guidelines)
- Bande passante : **100 Go/mois** · Invocations : 1 M/mois
- 🔴 **Usage NON COMMERCIAL uniquement.** « All commercial usage of the platform requires either a Pro
  or Enterprise plan. » Or le site de Jtnova **est** commercial.
- 🔴 **Taille maximale des fichiers source uploadés : 100 Mo (Hobby)** — or `public/` pèse **108 Mo**
  aujourd'hui → le déploiement CLI peut échouer.

### 5.3 Risques issus de ces limites et parades

| Risque | Impact | Parade retenue |
|---|---|---|
| Vercel Hobby interdit le commercial | Suspension possible du site client | **Option A** : rester en Hobby le temps du développement (toléré en pratique), **Option B** : basculer le front sur **Cloudflare Pages** (gratuit, commercial autorisé) — prévu comme plan de sortie (S7) |
| > 100 Mo de sources | Échec de déploiement | **S0** : suppression des 82,7 Mo de MP4 morts (identifiés à l'audit) → `public/` retombe sous 25 Mo |
| Supabase en pause après 7 j d'inactivité | Site client potentiellement indisponible | **Cron Vercel quotidien** (gratuit) qui touche la base + supervision |
| Egress 5 Go/mois | Une vidéo de 46,8 Mo ≈ 107 vues max/mois | **Ne jamais servir de vidéo longue depuis Supabase/Vercel** : compression ou hébergement vidéo externe |
| 500 Mo de base | Largement suffisant (contenu texte + URLs) | Toutes les images en **Storage**, jamais en base64 |

---

## 6. Architecture cible (résumé)

> Détail complet : `docs/ARCHITECTURE.md` (flux, modèle de données, RLS, sécurité, performances).

```
        ┌──────────────── VISITEUR ────────────────┐
        │  Next.js (Server Components)             │
        │  lit Supabase → mappe → composants UI    │
        │  existants (design inchangé)             │
        └──────────────────┬───────────────────────┘
                           │  lecture (RLS : public = publié uniquement)
                    ┌──────▼──────┐
                    │  SUPABASE   │  Postgres + Auth + Storage
                    └──────▲──────┘
                           │  écriture (RLS : role = admin)
        ┌──────────────────┴───────────────────────┐
        │  /admin (protégé) — CRUD + Server Actions│
        │  Réalisations · Contenus · Contacts      │
        └──────────────────────────────────────────┘
```

Point clé : **le composant `ProjectDetail` existant ne change pas.** On remplace seulement sa source de
données (objet JS statique → enregistrement Supabase relu par un *mapper*).

---

## 7. Roadmap par sprints (résumé)

> Détail fonctionnalité par fonctionnalité + critères d'acceptation : `docs/SPRINTS.md`.

| Sprint | Thème | Livrable vérifiable |
|---|---|---|
| **S0** | Fondations & assainissement | Repo `jtnova-madagascar` (main/dev), CI verte, code mort supprimé, site déployé |
| **S1** | Backend & modèle de données | Schéma Supabase migré, RLS active, 4 réalisations existantes en base |
| **S2** | Front public dynamique | Le site lit la base ; design identique ; ajout d'une réalisation visible sans code |
| **S3** | Auth & socle admin | `/admin` protégé, connexion/déconnexion, rôles |
| **S4** | Admin : Réalisations | CRUD complet + images + publication |
| **S5** | Admin : Personnalisation | Hero, À propos, Services, Témoignages, FAQ, CTA, SEO éditables |
| **S6** | Admin : Contacts | Boîte de réception, statuts, notification e-mail, anti-spam |
| **S7** | Finitions pro & durcissement | SEO complet, a11y, images optimisées, perfs, sauvegardes, monitoring |

---

## 8. Définition de « Fait » (Definition of Done) — s'applique à **chaque** fonctionnalité

Une fonctionnalité n'est terminée que si :
1. Le critère d'acceptation du sprint est démontré (capture ou commande).
2. `tsc --noEmit` et `eslint` passent **sans erreur**.
3. Elle fonctionne **sur la branche `dev` déployée en preview Vercel**.
4. Les règles de sécurité sont en place (RLS / validation serveur) si elle touche des données.
5. La documentation associée est à jour.
6. Elle passe en PR vers `dev`, relue, puis fusionnée.

---

## 9. Risques projet

| Risque | Parade |
|---|---|
| Périmètre qui s'élargit sans fin | Un sprint = un thème ; tout hors périmètre part dans un backlog « plus tard » |
| Rupture de l'UI existante | S2 = « design identique » comme critère d'acceptation bloquant |
| Perte de données | Migrations SQL versionnées + export régulier (gratuit) |
| Dépendance à une offre gratuite | Plan de sortie Cloudflare Pages + SQL exportable |

---

## 10. Décisions à valider avant de coder

1. **Emplacement du dépôt** `jtnova-madagascar` (dossier frère / réutilisation de l'atelier actuel).
2. **Base de code** : migration du code actuel (design conservé) ou projet neuf avec réimport du design.
3. **Méthode de connexion admin** : e-mail + mot de passe, lien magique, ou les deux.
4. **Périmètre de personnalisation au lancement** : tout le site, ou Réalisations + Contacts d'abord.
5. **Hébergement** : accepter temporairement la zone grise Vercel Hobby, ou viser Cloudflare Pages dès le départ.

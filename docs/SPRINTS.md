# Sprints — chaque fonctionnalité, avec critères d'acceptation

Convention d'identifiant : `F<sprint>.<n>` (fonctionnalité). Chaque fonctionnalité est
**terminée** quand son critère d'acceptation est prouvé, la CI verte et la PR fusionnée dans `dev`.

---

## S0 — Fondations & assainissement
*But : un dépôt propre, deux branches, une CI verte, un site déployé. Aucune fonctionnalité visible.*

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F0.1 | Créer le dépôt `jtnova-madagascar` avec `main` + `dev` | DevOps | `git branch -a` montre `main` et `dev` ; `main` protégée |
| F0.2 | Importer la base de code (design conservé) | Lead | Le site tourne à l'identique : les 10 routes répondent 200 |
| F0.3 | Supprimer le code mort (575 l. : `src/sections/`, `project[234].tsx`, import mort) | Frontend | `grep` ne trouve plus aucune référence ; build vert |
| F0.4 | Supprimer les 82,7 Mo de MP4 morts de `public/` | DevOps | `public/` < 25 Mo → déploiement Vercel possible (< 100 Mo) |
| F0.5 | Corriger les 13 erreurs ESLint (dont hooks de `TechBannerImages`) | Frontend | `eslint` → **0 erreur** |
| F0.6 | CI : lint + typecheck + build sur chaque PR | DevOps | Une PR volontairement cassée est bloquée |
| F0.7 | Déployer `dev` en preview et `main` en production | DevOps | URL de preview fonctionnelle ; production répond 200 |
| F0.8 | `.env.example` + consignes de secrets | Sécurité | Aucune clé dans le dépôt ; `.env.local` gitignoré |

---

## S1 — Backend & modèle de données
*But : les contenus existants vivent en base, avec la sécurité active.*

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F1.1 | Créer le projet Supabase (free) et connecter le dépôt | Backend | `supabase link` OK ; `/` se connecte sans erreur |
| F1.2 | Migration : tables `projects`, `project_images`, `project_tech`, `project_highlights` | Backend | `supabase db reset` rejoue le schéma sans erreur |
| F1.3 | Migration : `site_settings`, `services`, `testimonials`, `faq_items`, `tech_banner` | Backend | Idem F1.2 |
| F1.4 | Migration : `contact_messages`, `profiles` | Backend | Idem F1.2 |
| F1.5 | Activer RLS + politiques (lecture publiée / écriture admin) | Sécurité | Requête anonyme sur un contenu non publié → **0 ligne** |
| F1.6 | Seed : les 4 réalisations existantes (Julia, Vitascore, Feonix, Vina.io) + images | Backend | `select count(*) from projects` → 4 |
| F1.7 | Générer les types TypeScript depuis le schéma | Backend | `database.types.ts` généré, `tsc` 0 erreur |
| F1.8 | Buckets Storage `projects` et `branding` + politiques | Sécurité | Upload admin OK ; lecture publique des images OK |

---

## S2 — Front public dynamique (design inchangé)
*But : le site affiche la base, et un ajout en base se voit sans redéployer.*

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F2.1 | Client Supabase serveur (`lib/supabase/server.ts`) | Backend | Utilisable dans un Server Component |
| F2.2 | Requêtes typées (`getProjects`, `getProjectBySlug`, `getSettings`…) | Backend | Aucun `any` ; requêtes couvertes par les types générés |
| F2.3 | Mappers base → forme `ProjectDetail` | Frontend | `toProjectDetail()` produit exactement l'ancienne forme |
| F2.4 | Brancher la page d'accueil (Hero, Services, Témoignages, FAQ, CTA, TechBanner) | Frontend | Textes issus de la base ; **rendu visuel identique** (comparaison capture) |
| F2.5 | Brancher `/projets` et la page détail | Frontend | Ajouter une réalisation en base la fait apparaître sans redéploiement |
| F2.6 | Route dynamique `/projects/[slug]` + `notFound()` | Frontend | Slug inconnu → page 404 propre |
| F2.7 | Revalidation après mutation (`revalidatePath`/`revalidateTag`) | Backend | Après édition admin, la page publique change en < 5 s |
| F2.8 | Repli gracieux si une donnée manque | Frontend | Supprimer un champ en base ne casse aucune page |

---

## S3 — Authentification & socle admin
*But : un espace `/admin` protégé, impossible à atteindre sans compte.*

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F3.1 | Créer le compte administrateur (Supabase Auth) | Sécurité | Connexion réussie avec le compte créé |
| F3.2 | Page `/admin/login` (connexion / déconnexion) | Frontend | Mauvais mot de passe → message d'erreur, pas d'accès |
| F3.3 | `middleware.ts` protégeant `/admin/**` | Sécurité | Accès anonyme à `/admin` → redirection vers `/admin/login` |
| F3.4 | Table `profiles` + rôle, lié à `auth.users` | Backend | Un utilisateur sans rôle `admin` ne peut rien écrire (vérifié par RLS) |
| F3.5 | Layout admin (navigation latérale cohérente avec l'identité) | Design | Navigation entre 4 sections sans erreur de console |
| F3.6 | Tableau de bord d'accueil (`/admin`) : compteurs | Frontend | Affiche nb réalisations publiées / brouillons / messages non lus |

---

## S4 — Admin : gestion des Réalisations
*But : créer, modifier, publier une réalisation complète depuis l'interface.*

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F4.1 | Liste des réalisations (statut, année, réordonnancement) | Frontend | Glisser-déposer → l'ordre change sur le site public |
| F4.2 | Créer une réalisation (formulaire complet) | Frontend | Une nouvelle réalisation apparaît sur `/projets` |
| F4.3 | Éditer / supprimer (avec confirmation) | Frontend | Suppression → disparaît du site, contenu lié supprimé (cascade) |
| F4.4 | Upload multiple d'images + réordonnancement + alt | Frontend | 5 images uploadées, ordre modifiable, alt obligatoire |
| F4.5 | Gestion des technologies et des points forts (listes ordonnées) | Frontend | Ajout/suppression/réordonnancement persistés |
| F4.6 | Brouillon / publié | Backend | Brouillon invisible publiquement (vérifié en navigation privée) |
| F4.7 | Mise à jour du slug avec redirection | Backend | Ancien slug redirige (301) vers le nouveau |
| F4.8 | Prévisualisation du détail | Frontend | Rendu identique à la page publique |
| F4.9 | Validation de tous les champs (Zod, serveur) | Sécurité | Soumission invalide → erreurs affichées, rien en base |

---

## S5 — Admin : personnalisation complète du site
*But : « personnaliser tout le côté client » — sans code.*

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F5.1 | Éditeur de la section Hero (titres, sous-titre, boutons, badge) | Frontend | Modifier un titre change la page d'accueil |
| F5.2 | Éditeur « À propos » (texte, valeurs, chiffres clés) | Frontend | Contenu éditable persisté |
| F5.3 | Éditeur des Services (CRUD cartes + icône) | Frontend | Ajouter un service l'affiche immédiatement |
| F5.4 | Éditeur des Témoignages (CRUD + ordre + publication) | Frontend | Le carrousel reflète la base |
| F5.5 | Éditeur de la FAQ (CRUD questions/réponses) | Frontend | Idem |
| F5.6 | Éditeur du CTA et des réseaux sociaux | Frontend | Les liens du pied de page changent |
| F5.7 | Réglages SEO globaux + image de partage | Frontend | Balise `<title>` et Open Graph visibles dans la source |
| F5.8 | Identité : logo, favicon, couleurs d'accent | Design | Remplacer le logo met à jour la navbar |

---

## S6 — Admin : gestion des contacts
*But : ne plus jamais perdre une demande.*

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F6.1 | Stocker chaque soumission en base | Backend | `count(*)` augmente après un envoi |
| F6.2 | Boîte de réception (liste, filtre par statut, recherche) | Frontend | Filtrage `new` fonctionnel |
| F6.3 | Détail d'un message + statuts (nouveau/lu/répondu/archivé) | Frontend | Changement de statut persisté |
| F6.4 | Notes internes | Frontend | Note enregistrée et rechargée |
| F6.5 | Notification e-mail via Resend | Backend | Un envoi déclenche un e-mail reçu dans la boîte cible |
| F6.6 | Accusé de réception à l'expéditeur (option) | Backend | L'expéditeur reçoit un e-mail de confirmation |
| F6.7 | Anti-spam : honeypot + limitation de débit + hachage IP | Sécurité | 10 envois automatisés → bloqués après le seuil |
| F6.8 | Export CSV de la boîte de réception | Frontend | Fichier CSV téléchargé et lisible |
| F6.9 | Badge « messages non lus » | Frontend | Visite initiale → badge décrémenté |

---

## S7 — Finitions pro & durcissement
*But : le niveau « agence », mesurable.*

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F7.1 | `sitemap.xml` + `robots.txt` générés dynamiquement | Frontend | `/sitemap.xml` → 200 avec toutes les réalisations |
| F7.2 | Métadonnées + Open Graph par réalisation | Frontend | Partage testé → titre et image corrects |
| F7.3 | Accessibilité : `h1` sur les 4 pages fautives, `href="#"` remplacés | Frontend | 0 page sans `h1` ; 0 lien mort |
| F7.4 | Images : conversion WebP + `next/image` + `alt` | Frontend | Poids d'une page détail < 500 Ko |
| F7.5 | Performances : styles d'étoiles sortis du HTML, bundle allégé | Frontend | HTML de `/` nettement réduit (référence : 201 Ko) |
| F7.6 | Cron de keep-alive Supabase + alerte | DevOps | La base n'est plus mise en pause après 7 j |
| F7.7 | Sauvegarde/export planifié de la base | DevOps | Un export rejouable existe |
| F7.8 | Monitoring : suivi des erreurs + statut du site | DevOps | Une erreur de production est visible |
| F7.9 | Documentation d'exploitation (README, guide admin) | Lead | Un tiers peut publier une réalisation en suivant le guide |
| F7.10 | Plan de sortie hébergement (Cloudflare Pages) documenté | DevOps | Procédure écrite et testable |

---

## Backlog « plus tard » (hors périmètre actuel)

- Blog / actualités, multi-langue (FR/EN), espace client, devis en ligne,
  newsletter, analytics avancés, rôles fins (éditeur vs admin), historique des versions de contenu.

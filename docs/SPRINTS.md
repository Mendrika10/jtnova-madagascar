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

## S4bis — Médias externes : images via ImageKit
*But : les images des réalisations sont hébergées et optimisées par **ImageKit** (CDN, formats modernes), le bucket Supabase Storage n'étant plus alimenté par ce flux. Sprint **hors plan initial**, ajouté à la demande de l'humain le 2026-10-06. La **vidéo reste hors périmètre** : elle continue de passer par le champ `video_url` (URL externe), déjà rendu par `VideoShowcase`.*

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F4bis.1 | Variables ImageKit (URL endpoint, clé publique, clé privée) posées côté hébergeur | DevOps (+ humain) | Les 3 variables existent en **Production et Preview** ; **sans elles l'application démarre quand même** et l'uploader affiche un message clair (jamais de crash) ; `.env.example` les liste **sans valeur** |
| F4bis.2 | `GET /api/imagekit/auth` délivrant `token` + `expire` + `signature` | AUTH → DATA | Anonyme → **401**, aucune signature délivrée ; session `admin` → **200** avec les 3 paramètres ; la clé privée n'apparaît dans **aucune** réponse HTTP ni dans le bundle client |
| F4bis.3 | Envoi direct navigateur → ImageKit depuis `/admin/realisations/[id]` | MUTATIONS → ADMIN-UI | 5 images envoyées, présentes dans la médiathèque ImageKit, redirection `?images=1`, et `project_images.url` contient bien l'URL ImageKit |
| F4bis.4 | Garde-fous de validation conservés | ADMIN-UI | Un fichier de 3 Mo est refusé **avant tout envoi** (message en français, **0 requête réseau**) ; un format non pris en charge est refusé de même |
| F4bis.5 | Affichage public inchangé | FRONT-PUBLIC | `/projects/<slug>` sert les images ImageKit en **200**, aucune image cassée, `alt` toujours renseigné |
| F4bis.6 | Suppression d'une image | MUTATIONS | Supprimer une image retire bien la ligne et l'image disparaît du projet ; **le fichier distant n'est pas supprimé** (aucun appel destructif en v1) — comportement documenté |
| F4bis.7 | Migration des images existantes des réalisations vers ImageKit | DATA (+ humain) | Les images de réalisations publiées en production pointent vers ImageKit ; l'**ancienne URL est conservée** jusqu'à validation visuelle ; la migration est **idempotente et rejouable** |
| F4bis.8 | Non-régression si ImageKit est indisponible ou mal configuré | FRONT-PUBLIC | Une URL d'image inaccessible ne casse ni la page détail ni la liste ; sans variables ImageKit, l'uploader affiche une erreur au lieu de planter |
| F4bis.9 | Documentation d'exploitation | DOC | Un tiers peut dire **où sont stockées les images**, comment changer de compte ImageKit et quoi faire si un quota est atteint |

**Pré-requis humains (Phase 0)** — repris dans `AGENTS.md` §4bis :
1. Créer le compte **ImageKit (gratuit)** et relever l'**URL endpoint**, la **clé publique** et la **clé privée**.
2. Poser les 3 variables dans Vercel (**Production + Preview**) : `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`. La clé privée **ne doit jamais** transiter par le chat ni par le dépôt ; en local, uniquement dans `.env.local` (déjà gitignoré).
3. Pour F4bis.7 : autoriser l'exécution de la migration (procédure fournie par l'agent). **Aucune écriture en production sans cet accord.**

**Hors périmètre** : la vidéo (reste sur `video_url`, URL externe) · la table `media` (non utilisée en v1) · la suppression des fichiers distants · les transformations d'URL avancées (backlog).

**Risques et parades**
- *Quota* : le plan gratuit offre environ **20 Go de bande passante/mois** et **3 Go de stockage** ; au-delà la diffusion s'arrête → parades : surveiller la consommation, garder les fichiers sources des images statiques dans le dépôt, et pouvoir revenir à l'ancienne URL (conservée par F4bis.7).
- *Second secret* : la clé privée ImageKit est un secret de plus à protéger et à pouvoir révoquer.
- *Dépendance externe* : le service n'est pas couvert par la RLS Supabase → le contrôle d'accès repose **entièrement** sur la route F4bis.2 (session admin).
- *Sortie du flux Supabase Storage* : le bucket `projects` reste en place mais n'est plus alimenté ; sa suppression éventuelle fera l'objet d'un sprint ultérieur, jamais d'un effet de bord de S4bis.

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
| F6.5 | Notification e-mail via **Gmail SMTP** *(choix de l'humain du 2026-10-07, en remplacement de Resend)* | Backend | Un envoi déclenche un e-mail reçu dans la boîte cible |
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

---

## S8 — Statut « lu » synchronisé avec la boîte mail

> Incrément **hors roadmap**, ajouté à la demande de l'humain le 2026-10-07 :
> « une fois que le mail est lu dans la boîte mail, le message dans l'admin
> passe automatiquement en lu ». L'envoi étant en SMTP (canal qui n'écoute
> rien), c'est l'application qui interroge la boîte en IMAP.

| ID | Fonctionnalité | Rôle | Critère d'acceptation |
|---|---|---|---|
| F8.1 | Notification à plusieurs destinataires (`CONTACT_TO_EMAIL` = liste séparée par virgules) | Messagerie | Un envoi → l'e-mail est reçu sur **chacune** des adresses |
| F8.2 | Corrélation e-mail ↔ message (`X-Jtnova-Contact-Id`) | Messagerie | L'e-mail reçu porte l'identifiant du message en base |
| F8.3 | Passage automatique en « Lu » à la lecture de l'e-mail (IMAP) | Messagerie | E-mail marqué lu dans la boîte → message « Lu » dans `/admin/messages` |
| F8.4 | Mode dégradé | Messagerie | Sans IMAP/SMTP configuré : pages `200`, statuts intacts, aucune erreur |

**Hors périmètre** (assumé) : surveillance de **plusieurs** boîtes (une seule
boîte = le compte d'envoi), cron planifié (l'écriture en base exigerait la clé
`service_role`, absente de Vercel).

---

## Backlog « plus tard » (hors périmètre actuel)

- Blog / actualités, multi-langue (FR/EN), espace client, devis en ligne,
  newsletter, analytics avancés, rôles fins (éditeur vs admin), historique des versions de contenu.

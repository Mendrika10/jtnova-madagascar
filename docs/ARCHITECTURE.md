# Architecture technique — `jtnova-madagascar`

---

## 1. Vue d'ensemble

```
┌─────────────────────────── CLIENTS ───────────────────────────┐
│                                                               │
│   VISITEUR (public)                    ADMINISTRATEUR         │
│   ┌────────────────────┐               ┌──────────────────┐   │
│   │ / /projets /contact│               │ /admin/**        │   │
│   │ /projects/[slug]   │               │ login requis     │   │
│   └─────────┬──────────┘               └────────┬─────────┘   │
└─────────────┼────────────────────────────────── ┼────────────┘
              │ Server Components                  │ Server Actions
              │ (lecture)                          │ (écriture)
      ┌───────▼────────────────────────────────────▼───────┐
      │              NEXT.JS 16 — App Router               │
      │  • lib/supabase/server.ts   (client SSR, RLS)      │
      │  • lib/supabase/client.ts   (client navigateur)    │
      │  • middleware.ts            (session + garde /admin)│
      │  • app/actions/*.ts         (mutations Zod + auth) │
      └───────────────────────┬────────────────────────────┘
                              │
                  ┌───────────▼────────────┐
                  │       SUPABASE         │
                  │  Postgres  (contenus)  │
                  │  Auth      (admins)    │
                  │  Storage   (images)    │
                  │  RLS       (étanchéité)│
                  └────────────────────────┘
```

---

## 2. Flux de données — le cœur de la transformation

**Avant** (aujourd'hui) : le contenu est un objet JavaScript dans le composant.

```tsx
// src/components/projets/projet1/Project1Details.tsx  (état actuel)
const data = { title: "…", tech: [...], highlights: [...], images: [...] };
return <ProjectDetail data={data} />;
```

**Après** : le contenu vient de la base, puis passe par un *mapper* vers la **même forme**.

```tsx
// src/app/projects/[slug]/page.tsx  (cible)
const project = await getProjectBySlug(slug);        // Supabase
if (!project) notFound();
return <ProjectDetail data={toProjectDetail(project)} />;  // mapper → forme inchangée
```

> Conséquence majeure : **`ProjectDetail.tsx` et tout le design restent intacts.**
> Seule change la provenance de `data`. C'est ce qui rend la migration à faible risque.

---

## 3. Modèle de données

### 3.1 Contenu éditorial

```
site_settings                     -- réglages globaux (clé/valeur JSON)
  key            text PK          -- 'hero', 'about', 'seo', 'socials', 'cta'…
  value          jsonb
  updated_at     timestamptz

services                          -- cartes de la section Services
  id             uuid PK
  title          text
  description    text
  icon           text
  sort_order     int
  published      bool default true

projects                          -- RÉALISATIONS
  id             uuid PK
  slug           text UNIQUE      -- /projects/julia
  title          text
  tag            text             -- « Application Web »
  category       text
  year           text
  description    text             -- texte court (carte + hero détail)
  presentation   text             -- section « Présentation »
  explication    text             -- section « Explication »
  security       text             -- section « Sécurité » (nullable)
  performance    text             -- section « Performance » (nullable)
  cover_image    text             -- URL Storage
  video_url      text             -- nullable
  video_poster   text             -- nullable
  live_url       text             -- nullable
  repo_url       text             -- nullable
  client_name    text             -- nullable
  featured       bool default false
  published      bool default false
  sort_order     int
  created_at     timestamptz
  updated_at     timestamptz

project_images                    -- galerie / marquee + lightbox
  id             uuid PK
  project_id     uuid FK → projects (ON DELETE CASCADE)
  url            text
  alt            text
  sort_order     int

project_tech                      -- badges technologiques
  id             uuid PK
  project_id     uuid FK
  label          text
  sort_order     int

project_highlights                -- « Fonctionnalités & objectifs »
  id             uuid PK
  project_id     uuid FK
  text           text
  sort_order     int

testimonials                      -- section Témoignages
  id             uuid PK
  name, role, avatar_text, text, linkedin_url
  sort_order     int
  published      bool

faq_items                         -- section FAQ
  id             uuid PK
  question, answer
  sort_order     int
  published      bool

tech_banner                       -- logos défilants
  id             uuid PK
  name, image_url
  sort_order     int

media                             -- registre des fichiers Storage
  id             uuid PK
  path           text             -- chemin dans le bucket
  url            text
  mime_type      text
  size_bytes     bigint
  uploaded_by    uuid FK → auth.users
  created_at     timestamptz
```

### 3.2 Contacts et administration

```
contact_messages
  id             uuid PK
  name           text
  email          text
  subject        text  (nullable)
  message        text
  status         text   -- 'new' | 'read' | 'replied' | 'archived'
  notes          text   -- notes internes admin (nullable)
  ip_hash        text   -- anti-spam, jamais l'IP en clair
  user_agent     text
  created_at     timestamptz

profiles                          -- miroir de auth.users + rôle
  id             uuid PK → auth.users(id)
  email          text
  full_name      text
  role           text default 'editor'   -- 'admin' | 'editor'
  created_at     timestamptz
```

**Choix justifié** : tables filles (`project_images`, `project_tech`, `project_highlights`) plutôt que
colonnes tableau — on peut les **réordonner** depuis l'admin, ce qui est précisément le besoin
« personnaliser côté client ».

---

## 4. Sécurité — Row Level Security (RLS)

RLS est **activée sur toutes les tables**. Règle générale : *lecture publique du publié, écriture réservée aux admins.*

```sql
-- Exemple : projects
alter table projects enable row level security;

create policy "public lit les réalisations publiées"
  on projects for select
  using (published = true);

create policy "admins gèrent tout"
  on projects for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- contact_messages : AUCUNE lecture publique ; insertion publique contrôlée
create policy "insertion publique d'un message"
  on contact_messages for insert to anon with check (true);

create policy "admins lisent les messages"
  on contact_messages for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

**Règles d'or**
1. La clé `service_role` n'apparaît **que** dans du code serveur, jamais dans un composant client.
2. Seules les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont publiques.
3. Toute mutation passe par une **server action** validée par Zod — jamais par un appel direct du navigateur.
4. Le formulaire public de contact est protégé par *honeypot* + limitation de débit + hachage de l'IP.
5. `/admin/**` est protégé par `middleware.ts` **et** par RLS (défense en profondeur).

---

## 5. Stockage des fichiers

| Bucket | Contenu | Accès | Taille max/objet |
|---|---|---|---|
| `projects` | Images des réalisations | Lecture publique | 2 Mo |
| `branding` | Logo, favicon, Open Graph | Lecture publique | 500 Ko |

- **Interdiction** de servir des vidéos longues depuis Supabase / Vercel (coût egress) :
  URLs externes (plateforme vidéo) ou fichiers fortement compressés.
- Format cible des images : **WebP**, largeur ≤ 1600 px → ~100-250 Ko au lieu de 1,3 Mo.
- Référencement des fichiers dans la table `media` pour l'admin.

---

## 6. Performances

| Levier | Mise en œuvre |
|---|---|
| Rendu statique + revalidation | Server Components + `revalidatePath()` / `revalidateTag()` appelés après chaque mutation admin |
| Cache | `unstable_cache` / tags par collection (`projects`, `settings`) |
| Images | `next/image` + `images.remotePatterns` pour le domaine Supabase |
| Bundle | Retrait du JS Bootstrap inutilisé ; effets étoiles mutualisés en un composant `client` unique |
| HTML | Génération des étoiles côté CSS plutôt qu'en styles inline (56 Ko actuellement sur `/`) |
| SEO | `generateMetadata()` par réalisation (titre, description, Open Graph, image de couverture) |

---

## 7. Migrations et versioning

- Dossier `supabase/migrations/*.sql` : **une migration numérotée par changement de schéma**.
- Aucune modification manuelle en production : tout passe par migration, revue en PR.
- `supabase/seed.sql` : seed initial avec les **4 réalisations existantes** converties en SQL.
- Types TypeScript régénérés (`supabase gen types typescript`) → `src/lib/database.types.ts`.

---

## 8. Variables d'environnement

| Variable | Portée | Usage |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Publique | Endpoint Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publique | Client RLS (navigateur + serveur) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Serveur uniquement** | Tâches d'administration (jamais exposée) |
| `RESEND_API_KEY` | **Serveur uniquement** | Notification des messages de contact |
| `CONTACT_TO_EMAIL` | **Serveur uniquement** | Destinataire des notifications |
| `CRON_SECRET` | **Serveur uniquement** | Protège la route de keep-alive |

`.env.local` reste **gitignoré** ; `.env.example` documente les clés sans valeurs.

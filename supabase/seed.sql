-- ============================================================================
-- S1 · Seed — DONNÉES ÉDITORIALES (sans aucun compte utilisateur)
-- ----------------------------------------------------------------------------
-- Ce fichier est SÛR POUR LE CLOUD : il ne crée aucun utilisateur, aucun mot de
-- passe, rien de secret. Le compte administrateur local vit dans seed.local.sql,
-- qui n'est jamais poussé (voir l'en-tête de ce fichier et docs/STATUS.md).
--
-- Contenus extraits du site actuel (source de vérité temporaire avant S2) :
--   • 4 réalisations (dont 1 brouillon pour prouver la RLS)
--   • 6 services, 6 témoignages, 6 FAQ, 13 technologies du bandeau
--
-- Idempotent : les inserts sont upserts, le rechargement est sans risque.
-- ============================================================================

-- ── Réalisations ────────────────────────────────────────────────────────────
insert into public.projects
  (slug, title, tag, category, year, description, presentation, explication,
   security, performance, cover_image, video_url, video_poster, live_url,
   featured, published, sort_order)
values
(
  'julia',
  'Plateforme de gestion d''activités et de planning',
  'Application Web', 'Développement & Design', '2023',
  'Ce projet consistait en la création d''une plateforme de gestion d''activités et de planning permettant aux utilisateurs de planifier, suivre et organiser efficacement leurs tâches et événements',
  'Ce projet consistait en la création d''une plateforme de gestion d''activités et de planning permettant aux utilisateurs de planifier, suivre et organiser efficacement leurs tâches et événements. En combinant des technologies modernes de frontend et backend, la plateforme offre une expérience utilisateur fluide et des fonctionnalités robustes pour la gestion de projet.',
  'Pour ce projet, j''ai opté pour un développement basé sur React.js et Next.js pour le frontend, tandis que Laravel a été utilisé pour gérer le backend. Ce choix technologique a permis de créer une plateforme réactive et performante, avec une structure modulaire permettant une évolution facile des fonctionnalités. La base de données MySQL a été utilisée pour stocker les données des utilisateurs, des tâches et des événements, assurant une gestion efficace des informations.
L''intégration de Framer Motion a permis d''ajouter des animations fluides et engageantes, améliorant ainsi l''expérience utilisateur. Le projet a également mis en œuvre des fonctionnalités d''authentification sécurisée, de gestion multi-utilisateurs et de tableaux de bord en temps réel pour offrir une solution complète de gestion d''activités et de planning.',
  'Authentification forte (JWT / tokens)
Hashage des mots de passe (bcrypt)
Permissions et rôles fins (RBAC)
Validation et sanitation côté serveur
HTTPS, HSTS, en-têtes sécurité (CSP, X-Frame-Options)
Surveillance et logs d''audit',
  'Mise en cache (Redis) pour endpoints coûteux
Optimisation des requêtes SQL et indexation
Pagination et lazy-loading pour listes volumineuses
CDN pour assets statiques et compression des médias
Traitement asynchrone (jobs/background) pour tâches lourdes
Mise en place de monitoring et alerting (metrics)',
  '/images/ImagesProjetDetail/Projet1/referent.png',
  null,  -- la vidéo du projet 1 n''existe pas dans le dépôt (constat S0)
  '/images/ImagesProjetDetail/Projet1/login.png',
  'https://julia.vilogi.com/login',
  true, true, 1
),
(
  'vitascore',
  'Plateforme SaaS posters visuels professionnels',
  'Application Web', 'Développement & Design', '2026',
  'Vitascore est une plateforme SaaS qui transforme automatiquement les statistiques de vos matchs sportifs en posters visuels professionnels. Entrez vos donnees, choisissez un template, telechargez votre visuel — en moins de 3 secondes.',
  ' L''art de transformer les données sportives en visuels d''élite. VITASCORE est une solution SaaS (Software as a Service) innovante conçue pour les clubs de sport et les community managers. La plateforme permet de générer des posters de match professionnels de manière instantanée, supprimant le besoin de compétences en design graphique complexe ou d''outils coûteux comme Photoshop',
  'L''écosystème technologique de VITASCORE s''articule autour de quatre piliers fondamentaux conçus pour automatiser l''excellence visuelle du marketing sportif. Au cœur du système, la personnalisation intelligente permet une adaptation chromatique instantanée, où chaque template se moule aux couleurs officielles de votre club pour préserver une identité de marque rigoureuse sans aucun effort manuel. Cette souplesse s''accompagne d''une bibliothèque de styles thématiques d''une grande richesse, offrant des esthétiques variées allant du néon ultra-moderne au grain vintage, tout en proposant des thèmes immersifs dédiés aux plus grandes compétitions mondiales comme la Ligue 1 ou la Champions League. L''expérience est complétée par un module d''édition de données dynamique qui simplifie la saisie des statistiques complexes — scores, buteurs, taux de possession ou distinction du "Man of the Match" — pour les transformer en infographies claires. Enfin, la plateforme garantit un export haute définition au format 1080x1080, assurant une netteté absolue et une compatibilité parfaite avec les exigences techniques des réseaux sociaux tels qu''Instagram, Twitter/X et Facebook.',
  'Protection des Données : Infrastructure sécurisée garantissant la confidentialité des informations des clubs et des utilisateurs.

Stabilité du Rendu : Système de "Cloud Rendering" qui assure que chaque poster est généré avec la même qualité, peu importe la puissance de l''appareil de l''utilisateur.

Validation : Déjà adopté par plus de 200 community managers, prouvant la robustesse et la fiabilité de l''outil sur le terrain.',
  'Vitesse de génération : Environ 2.3 secondes pour produire un visuel complet.

Précision : Algorithme de rendu garantissant une précision de 96.4% sur l''alignement des données et des graphiques.

Disponibilité : Architecture Cloud permettant une utilisation fluide, même lors des pics de trafic (fins de matchs simultanés)',
  '/images/ImagesProjetDetail/Projet2/vitascore.png',
  'https://ia903105.us.archive.org/11/items/vitascore/vitascore.mp4',
  '/images/ImagesProjetDetail/Projet2/3.png',
  null,
  true, true, 2
),
(
  'feonix',
  'Feonix IA',
  'IA Générative', 'Développement & Design', '2026',
  'Ne perdez plus de temps à rédiger. Enregistrez simplement une note vocale et laissez notre IA convertir vos idées en un écosystème marketing complet : un post LinkedIn engageant, un article de blog SEO, une newsletter captivante et un script vidéo prêt à tourner. Une seule prise de parole, quatre formats professionnels, instantanément',
  'L''alchimie vocale au service de votre marketing digital.
Feonix IA est une plateforme SaaS de "Voice-to-Content" conçue pour les créateurs, entrepreneurs et marketeurs. Elle permet de briser la barrière de la page blanche en transformant une simple note vocale spontanée en un écosystème complet de contenus écrits et scénarisés, optimisés pour chaque canal de diffusion',
  'La force de Feonix IA réside dans son architecture Full-Stack, qui fusionne une reconnaissance vocale haute fidélité avec un moteur de transformation marketing polyvalent. Le processus commence par une transcription ultra-précise capable de capter les nuances de la voix et des accents dans 12 langues différentes, éliminant ainsi toute friction entre l''idée orale et l''écrit. Une fois le texte brut extrait, l''intelligence artificielle opère une génération multi-plateforme simultanée : en un seul clic, elle décline la pensée de l''utilisateur en un post LinkedIn percutant, un article de blog optimisé pour le SEO, une newsletter engageante et un script vidéo structuré pour les formats courts (Reels/TikTok). Cette approche permet une omniprésence digitale sans effort, où chaque contenu produit respecte les codes spécifiques de son support, garantissant ainsi des taux d''ouverture élevés et un engagement maximal, tout en offrant une rapidité d''exécution qui transforme quelques secondes de parole en une véritable machine de guerre marketing.',
  null,
  'Vitesse de Traitement : Conversion de l''audio en texte et génération des 4 formats en seulement quelques secondes.

Accessibilité : 10 générations gratuites sans carte bancaire, offrant jusqu''à 40 contenus marketing pour tester la puissance de l''outil.

Fiabilité IA : Utilisation de modèles de pointe garantissant un contenu de niveau professionnel, évitant les répétitions et optimisant l''engagement',
  '/images/ImagesProjetDetail/Projet3/feonix.png',
  null,  -- pas de vidéo disponible (constat S0)
  '/images/ImagesProjetDetail/Projet3/4.png',
  null,
  true, true, 3
),
(
  'vina-io',
  'Vina.io',
  'IA Générative', 'Développement & Design', '2026',
  'Dites adieu à la saisie manuelle et aux erreurs de recopie. Vina.io transforme instantanément vos baux PDF, scans et fichiers Excel en données comptables et techniques structurées. Divisez votre temps de migration par dix et passez de 3 semaines de travail à une seule journée de production, avec une précision garantie de 100%. Importez, validez et exportez vos actifs immobiliers en quelques clics',
  'L''intelligence artificielle au service de la donnée immobilière.
Vina.io est une plateforme SaaS de pointe spécialisée dans l''automatisation de la migration de données pour la gestion locative. En utilisant des technologies d''OCR et d''IA avancées, le projet résout le problème majeur des professionnels de l''immobilier : la saisie manuelle chronophage et source d''erreurs lors du changement de logiciel ou de la reprise de portefeuilles.',
  'L''architecture de Vina.io redéfinit les standards de la gestion immobilière en remplaçant des semaines de travail manuel par un flux automatisé ultra-performant. Grâce à la puissance de Vina IA, la plateforme est capable de traiter plus de 250 baux en moins de deux heures, là où un processus classique exigerait 120 heures de saisie humaine. Cette efficacité repose sur un pipeline technologique robuste, utilisant Prisma et MySQL pour structurer des données complexes (techniques et comptables) avec une précision chirurgicale. Au-delà de la simple extraction, le système sécurise la migration grâce à des alertes intelligentes qui signalent instantanément toute incohérence contractuelle, garantissant une mise en production en un temps record d''une journée. Que ce soit pour une agence, un cabinet comptable ou un syndic, Vina.io transforme la contrainte de la migration en un levier de rentabilité immédiat, avec un taux d''erreur réduit à zéro',
  null,
  '🎯 Vina OCR & IA : Un moteur capable de lire et comprendre tous types de fichiers (scans, images, exports CSV) pour extraire loyers, charges, baux et clauses contractuelles.

🎯 Migration Comptable & Technique : Extraction automatique du plan comptable (journaux, appels de fonds) et structuration des actifs (biens, locataires, états des lieux) via MySQL et Prisma.

🎯 Alertes Intelligentes : Système de détection automatique des anomalies pour identifier les dates de révision oubliées ou les données manquantes.

🎯 Export Flexible : Mise à disposition des données via Excel, CSV ou directement par API REST.',
  '/images/ImagesProjetDetail/Projet4/vina.png',
  'https://ia903105.us.archive.org/11/items/vitascore/vina.mp4',
  '/images/ImagesProjetDetail/Projet4/1.png',
  null,
  false,
  false,  -- ⚠️ BROUILLON volontaire : preuve RLS (invisible publiquement, visible admin)
  4
);

-- ── Galeries ────────────────────────────────────────────────────────────────
insert into public.project_images (project_id, url, alt, sort_order)
select p.id, v.url, v.alt, v.ord
from public.projects p
join (values
  ('julia',    '/images/ImagesProjetDetail/Projet1/referent.png',   'Julia — vue référent',        1),
  ('julia',    '/images/ImagesProjetDetail/Projet1/suivi.png',      'Julia — suivi d''activité',   2),
  ('julia',    '/images/ImagesProjetDetail/Projet1/reviseur.png',   'Julia — espace réviseur',     3),
  ('julia',    '/images/ImagesProjetDetail/Projet1/client.png',     'Julia — espace client',       4),
  ('julia',    '/images/ImagesProjetDetail/Projet1/comptable.png',  'Julia — espace comptable',    5),
  ('julia',    '/images/ImagesProjetDetail/Projet1/commercial.png', 'Julia — espace commercial',   6),
  ('julia',    '/images/ImagesProjetDetail/Projet1/admin.png',      'Julia — console admin',       7),
  ('vitascore','/images/ImagesProjetDetail/Projet2/vitascore.png',  'Vitascore — accueil',         1),
  ('vitascore','/images/ImagesProjetDetail/Projet2/1.png',          'Vitascore — écran 1',         2),
  ('vitascore','/images/ImagesProjetDetail/Projet2/2.png',          'Vitascore — écran 2',         3),
  ('vitascore','/images/ImagesProjetDetail/Projet2/3.png',          'Vitascore — écran 3',         4),
  ('vitascore','/images/ImagesProjetDetail/Projet2/4.png',          'Vitascore — écran 4',         5),
  ('vitascore','/images/ImagesProjetDetail/Projet2/5.png',          'Vitascore — écran 5',         6),
  ('vitascore','/images/ImagesProjetDetail/Projet2/6.png',          'Vitascore — écran 6',         7),
  ('vitascore','/images/ImagesProjetDetail/Projet2/7.png',          'Vitascore — écran 7',         8),
  ('vitascore','/images/ImagesProjetDetail/Projet2/8.png',          'Vitascore — écran 8',         9),
  ('vitascore','/images/ImagesProjetDetail/Projet2/9.png',          'Vitascore — écran 9',         10),
  ('vitascore','/images/ImagesProjetDetail/Projet2/10.png',         'Vitascore — écran 10',        11),
  ('vitascore','/images/ImagesProjetDetail/Projet2/11.png',         'Vitascore — écran 11',        12),
  ('feonix',   '/images/ImagesProjetDetail/Projet3/feonix.png',     'Feonix — accueil',            1),
  ('feonix',   '/images/ImagesProjetDetail/Projet3/1.png',          'Feonix — écran 1',            2),
  ('feonix',   '/images/ImagesProjetDetail/Projet3/2.png',          'Feonix — écran 2',            3),
  ('feonix',   '/images/ImagesProjetDetail/Projet3/3.png',          'Feonix — écran 3',            4),
  ('feonix',   '/images/ImagesProjetDetail/Projet3/4.png',          'Feonix — écran 4',            5),
  ('feonix',   '/images/ImagesProjetDetail/Projet3/5.png',          'Feonix — écran 5',            6),
  ('feonix',   '/images/ImagesProjetDetail/Projet3/6.png',          'Feonix — écran 6',            7),
  ('feonix',   '/images/ImagesProjetDetail/Projet3/7.png',          'Feonix — écran 7',            8),
  ('vina-io',  '/images/ImagesProjetDetail/Projet4/vina.png',       'Vina.io — accueil',           1),
  ('vina-io',  '/images/ImagesProjetDetail/Projet4/1.png',          'Vina.io — écran 1',           2),
  ('vina-io',  '/images/ImagesProjetDetail/Projet4/2.png',          'Vina.io — écran 2',           3),
  ('vina-io',  '/images/ImagesProjetDetail/Projet4/3.png',          'Vina.io — écran 3',           4),
  ('vina-io',  '/images/ImagesProjetDetail/Projet4/4.png',          'Vina.io — écran 4',           5),
  ('vina-io',  '/images/ImagesProjetDetail/Projet4/5.png',          'Vina.io — écran 5',           6),
  ('vina-io',  '/images/ImagesProjetDetail/Projet4/6.png',          'Vina.io — écran 6',           7),
  ('vina-io',  '/images/ImagesProjetDetail/Projet4/7.png',          'Vina.io — écran 7',           8),
  ('vina-io',  '/images/ImagesProjetDetail/Projet4/8.png',          'Vina.io — écran 8',           9)
) as v(slug, url, alt, ord) on v.slug = p.slug;

-- ── Technologies par projet ─────────────────────────────────────────────────
insert into public.project_tech (project_id, label, sort_order)
select p.id, v.label, v.ord
from public.projects p
join (values
  ('julia',     'Next.js 16',     1),
  ('julia',     'React 19',       2),
  ('julia',     'TypeScript',     3),
  ('julia',     'Bootstrap 5',    4),
  ('julia',     'Framer Motion',  5),
  ('julia',     'Laravel',        6),
  ('julia',     'MySQL',          7),
  ('vitascore', 'Next.js',        1),
  ('vitascore', 'Bootstrap 5',    2),
  ('vitascore', 'Prisma',         3),
  ('vitascore', 'MySQL',          4),
  ('vitascore', 'Stripe',         5),
  ('feonix',    'Next.js',        1),
  ('feonix',    'Bootstrap 5',    2),
  ('feonix',    'Prisma',         3),
  ('feonix',    'MySQL',          4),
  ('vina-io',   'Next.js',        1),
  ('vina-io',   'Bootstrap 5',    2),
  ('vina-io',   'Prisma',         3),
  ('vina-io',   'MySQL',          4),
  ('vina-io',   'Groq (IA)',      5)
) as v(slug, label, ord) on v.slug = p.slug;

-- ── Points forts par projet ─────────────────────────────────────────────────
insert into public.project_highlights (project_id, text, sort_order)
select p.id, v.txt, v.ord
from public.projects p
join (values
  ('julia', 'Authentification et gestion multi-utilisateurs',                        1),
  ('julia', 'Gestion des activités',                                                 2),
  ('julia', 'Planification avancée',                                                 3),
  ('julia', 'Notifications et rappels',                                              4),
  ('julia', 'Suivi et rapports en temps réel',                                       5),
  ('vitascore', 'Accessibilité : Permettre à tous les clubs (amateurs comme pros) d''avoir une identité visuelle de haut niveau', 1),
  ('vitascore', 'Engagement : Augmenter l''interaction sur les réseaux sociaux grâce à des visuels cinématiques et percutants.', 2),
  ('vitascore', 'Gain de temps : Réduire le processus de création de plusieurs heures à quelques secondes seulement après le coup de sifflet final', 3),
  ('feonix', 'Productivité Décuplée : Transformer une réflexion de 30 secondes en une stratégie de contenu hebdomadaire.', 1),
  ('feonix', 'Omniprésence Facilitée : Permettre d''être présent sur LinkedIn, les blogs, les newsletters et la vidéo sans multiplier les efforts de rédaction', 2),
  ('feonix', 'Fluidité Créative : Capturer les idées ''à la volée'' sans avoir besoin d''un script ou d''un clavier', 3),
  ('vina-io', 'Productivité Massive : Réduire le temps de traitement de 3 semaines à seulement 1 journée (gain de 98%)', 1),
  ('vina-io', 'Fiabilité Absolue : Éliminer les erreurs de saisie humaine grâce à une extraction de données garantie sans fautes', 2),
  ('vina-io', 'Simplification Technique : Transformer des documents hétérogènes (PDF, scans, Excel) en bases de données structurées et exploitables', 3)
) as v(slug, txt, ord) on v.slug = p.slug;

-- ── Services (section « Nos services ») ─────────────────────────────────────
insert into public.services (title, description, icon, sort_order) values
  ('Création de sites web',       'Sites vitrine, landing pages et portails web modernes, rapides et responsive, optimisés pour convertir.', 'Web',      1),
  ('Applications web',            'Développement d''applications web sur mesure avec React, Next.js et Node.js pour automatiser vos processus.', 'Dev',   2),
  ('Design UI/UX',                'Conception d''interfaces intuitives et esthétiques sous Figma, centrées sur l''expérience utilisateur.', 'Design',   3),
  ('E-commerce',                  'Boutiques en ligne performantes avec gestion produits, paiements sécurisés et tableaux de bord analytiques.', 'Commerce', 4),
  ('Optimisation & SEO',          'Audit de performance, Core Web Vitals, référencement naturel pour améliorer votre visibilité en ligne.', 'SEO',      5),
  ('Conseil & Accompagnement',    'Stratégie digitale, choix technologiques et accompagnement de A à Z pour concrétiser votre vision.', 'Conseil',  6);

-- ── Témoignages ─────────────────────────────────────────────────────────────
insert into public.testimonials (name, role, avatar_text, text, linkedin_url, sort_order) values
  ('Sophie Martin', 'CEO, TechStart',                    'SM', 'Jtnova a transformé notre présence en ligne. Le site livré est non seulement magnifique mais aussi extrêmement performant. Notre taux de conversion a augmenté de 40% dès le premier mois. Une équipe professionnelle, à l''écoute et qui sait comment transformer une vision en réalité digitale.', 'https://linkedin.com', 1),
  ('Karim Benali',  'Directeur Marketing, Nexora',       'KB', 'Une équipe à l''écoute, réactive, et qui comprend vraiment les enjeux business. Le résultat final a dépassé toutes nos attentes. Je recommande sans hésitation à toute entreprise cherchant un partenaire digital de confiance.', 'https://linkedin.com', 2),
  ('Léa Fontaine',  'Fondatrice, Moda Shop',             'LF', 'Notre boutique e-commerce a été développée en un temps record avec une qualité impeccable. Le suivi après livraison est également top. L''interface est intuitive et nos clients adorent l''expérience d''achat.', 'https://linkedin.com', 3),
  ('Thomas Roux',   'CTO, DataFlow SAS',                 'TR', 'Collaboration fluide du début à la fin. Jtnova maîtrise les technologies modernes et sait les appliquer intelligemment pour livrer des produits robustes et scalables. Une vraie expertise technique.', 'https://linkedin.com', 4),
  ('Amira Diallo',  'Responsable Digital, GreenBio',     'AD', 'Le redesign de notre site a redonné vie à notre marque. L''équipe a su capturer notre identité et la traduire en une expérience digitale cohérente et engageante. Les résultats ont été immédiats.', 'https://linkedin.com', 5),
  ('Marc Leclerc',  'Gérant, Studio Arc',                'ML', 'Interface épurée, animations soignées, performances au top. Exactement ce que nous cherchions. Jtnova est maintenant notre partenaire digital de référence pour tous nos projets futurs.', 'https://linkedin.com', 6);

-- ── FAQ ─────────────────────────────────────────────────────────────────────
insert into public.faq_items (question, answer, sort_order) values
  ('Quels types de projets réalisez-vous ?', 'Nous concevons et développons des sites vitrines, boutiques e-commerce, plateformes SaaS, dashboards analytics et applications web sur mesure. Chaque projet est adapté aux besoins spécifiques de notre client.', 1),
  ('Combien de temps faut-il pour livrer un projet ?', 'Un site vitrine simple est livré en 2 à 4 semaines. Un projet plus complexe (e-commerce, SaaS) prend généralement 4 à 10 semaines selon le périmètre fonctionnel défini ensemble lors du brief.', 2),
  ('Quelles technologies utilisez-vous ?', 'Nous travaillons principalement avec React, Next.js, TypeScript, Node.js et Tailwind CSS. Pour les bases de données nous utilisons PostgreSQL ou MongoDB selon les besoins, et nous déployons sur Vercel ou des serveurs dédiés.', 3),
  ('Proposez-vous un suivi après la livraison ?', 'Oui, nous proposons des contrats de maintenance mensuelle incluant les mises à jour, la surveillance des performances, les correctifs et les évolutions mineures. Nous restons accessibles après chaque livraison.', 4),
  ('Comment se déroule le processus de travail ?', 'Notre processus comprend 4 étapes : un brief de découverte, une phase de design/maquettes validées par vous, le développement avec des points réguliers, puis la livraison et le déploiement. Vous êtes impliqué à chaque étape.', 5),
  ('Quel est le tarif pour un projet ?', 'Les tarifs varient selon la complexité du projet. Un site vitrine démarre à partir de 800€. Nous établissons un devis gratuit et personnalisé après un premier échange pour comprendre vos besoins précis.', 6);

-- ── Bandeau technologique ───────────────────────────────────────────────────
insert into public.tech_banner (name, image_url, sort_order) values
  ('HTML',       '/images/tech/html.svg',       1),
  ('CSS',        '/images/tech/css.svg',        2),
  ('JavaScript', '/images/tech/javascript.svg', 3),
  ('TypeScript', '/images/tech/typescript.svg', 4),
  ('React.js',   '/images/tech/react.svg',      5),
  ('Next.js',    '/images/tech/nextjs.svg',     6),
  ('Node.js',    '/images/tech/nodejs.svg',     7),
  ('Tailwind',   '/images/tech/tailwind.svg',   8),
  ('MongoDB',    '/images/tech/mongodb.svg',    9),
  ('PostgreSQL', '/images/tech/postgresql.svg', 10),
  ('Git',        '/images/tech/git.svg',        11),
  ('Docker',     '/images/tech/docker.svg',     12),
  ('Figma',      '/images/tech/figma.svg',      13);

-- ── Réglages globaux (contenus de section en JSONB) ─────────────────────────
insert into public.site_settings (key, value) values
(
  'hero',
  '{
    "badge": "Agence Web & Digital",
    "subtitle": "Création de sites, design UI/UX et applications web sur mesure",
    "cta_primary": { "label": "Démarrer un projet", "href": "/contact" },
    "cta_secondary": { "label": "Nos réalisations", "href": "/projets" }
  }'::jsonb
),
(
  'seo',
  '{
    "site_name": "Jtnova",
    "title": "Jtnova | Agence Web & Digital",
    "description": "Jtnova — Agence web spécialisée en création de sites, design UI/UX et applications web sur mesure.",
    "locale": "fr"
  }'::jsonb
),
(
  'contact_info',
  '{
    "location": "Madagascar — disponible à distance",
    "email": "contact@jtnova.com",
    "availability": "Ouvert aux nouveaux projets",
    "github": "",
    "linkedin": ""
  }'::jsonb
);

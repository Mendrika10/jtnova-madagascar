# Guide d'administration — Jtnova

À destination d'un rédacteur ou d'un administrateur : publier une réalisation,
traiter les messages, surveiller le site, sauvegarder et restaurer les contenus.

> Prérequis : un compte disposant du rôle `admin` (créé via Supabase Auth et le
> profil associé). L'administration vit sur `/admin`.

---

## 1. Se connecter

1. Ouvrir `https://<votre-site>/admin` — toute page `/admin/*` redirige vers
   `/admin/login` si vous n'êtes pas connecté.
2. Saisir l'e-mail et le mot de passe du compte admin, valider.
3. La navigation latérale donne accès à : **Tableau de bord**, **Réalisations**,
   **Personnalisation**, **Messages**, **Santé**.

---

## 2. Publier une réalisation (pas à pas)

Objectif : une nouvelle page `https://<votre-site>/projects/<slug>` publique,
listée sur `/projets` et dans `sitemap.xml`.

1. **Créer** — `Réalisations` → bouton **Nouvelle réalisation**.
2. **Renseigner l'identité**
   - *Titre* : nom affiché de la réalisation.
   - *Slug (URL)* : laissé vide, il est déduit du titre ; sinon le fixer en
     minuscules-et-tirets (`mon-projet`). Il devient l'URL publique.
   - *Étiquette (tag)*, *Catégorie*, *Année*, *Client* : affichés sur la fiche.
3. **Écrire les textes**
   - *Description* : résumé de 10 à 600 caractères (cartes et meta description).
   - *Présentation*, *Explication*, *Sécurité*, *Performance* : sections de la
     page détail (les deux dernières sont optionnelles).
   - *Technologies* et *Points forts* : une ligne = un élément.
4. **Liens et médias**
   - *Lien du site* / *Lien du code* : URLs complètes (`https://…`).
   - *Vidéo (URL)* et *Vignette vidéo* : optionnels ; la vidéo doit être
     hébergée hors du site (pas de média lourd dans le dépôt).
5. **Enregistrer** (bouton *Créer la réalisation*). La réalisation naît en
   **brouillon** : elle n'est visible ni sur le site ni dans le sitemap.
6. **Ajouter les images** — ouvrir la réalisation → zone *Images* →
   téléverser (passe par ImageKit) ou coller une URL. La **première image** est
   l'aperçu partagé sur les réseaux (Open Graph) : choisir une capture
   représentative (idéalement ~1900×1000, PNG ou JPG).
7. **Vérifier l'aperçu** — lien *Aperçu* disponible depuis la liste des
   réalisations (rendu identique au site final, sans publier).
8. **Publier** — cocher *Publié* puis *Enregistrer*. Effets immédiats :
   - la réalisation apparaît sur `/projets` et dans le carrousel de l'accueil ;
   - `/projects/<slug>` devient publique avec ses balises Open Graph ;
   - elle entre dans `/sitemap.xml` (rafraîchi au maximum toutes les 60 s).

> **Retirer une réalisation** sans la supprimer : décocher *Publié* → elle
> redevient brouillon et disparaît du site au prochain rendu.

### Bonnes pratiques d'image

- Format d'origine PNG ou JPG, l'optimiseur du site sert ensuite du WebP/AVIF
  redimensionné : pas besoin de compresser à la main.
- Éviter les images de plus de ~4000 px de côté.
- Renseigner l'*alt* proposé lors de l'ajout (accessibilité + SEO).

---

## 3. Traiter les messages de contact

Chaque formulaire soumis sur `/contact` arrive dans **Messages** :

- Onglets *Nouveau / Lu / Répondu / Archivé* avec compteurs ; la recherche filtre
  nom, e-mail et contenu.
- L'ouverture d'un message nouveau le passe automatiquement en **Lu**.
- Actions disponibles : *Répondu* (après avoir répondu par e-mail — cliquer
  l'adresse du message ouvre votre client mail), *Archiver*.
- **Note interne** : champ libre visible des seuls admins (pas envoyé au
  visiteur), enregistré via le bouton dédié.
- **Export CSV** : bouton dans la barre d'outils ; fichier ouvert directement
  dans un tableur (accents préservés).
- Le badge de la navigation affiche les non-lus en temps réel.

> Le spam est déjà filtré en amont (honeypot + limitation de débit). Un message
> louche qui serait passé : *Archiver* suffit.

---

## 4. Personnaliser le site

`Personnalisation` permet d'éditer sans toucher au code :

- **Identité** : logo, favicon, couleur d'accent.
- **Hero (accueil)** : badge, titre (mots en accent), sous-titre, boutons.
- **À propos** : mission, vision, chiffres clés.
- **Contact** : e-mail affiché, localisation, disponibilité, liens GitHub /
  LinkedIn (un champ vide masque l'icône au lieu d'afficher un lien mort).
- **Bandeau d'action (CTA)** : titre, bouton, réseaux sociaux.
- **SEO** : nom du site, titre et description par défaut, image de partage.

Chaque formulaire montre un aperçu ; *Enregistrer* met à jour le site public
(au prochain rendu, 60 s au plus).

---

## 5. Surveiller le site : la page « Santé »

`/admin/sante` répond à « tout va bien ? » :

- **Base de données** : connectée / hors ligne + temps de réponse.
- **Erreurs non traitées** : compteur et liste des 50 dernières erreurs
  enregistrées (niveau, source, message, page). Chaque ligne peut être
  **marquée traitée** (ou rouverte).
- **Volumétrie** : réalisations, brouillons, services, témoignages, FAQ, messages.

Les erreurs y arrivent automatiquement : échec d'enregistrement d'un message de
contact, erreur de rendu côté visiteur (page d'erreur remontée), etc. Le badge
« Santé » de la navigation affiche les erreurs non traitées.

---

## 6. Sauvegarde et restauration

### Ce qui est sauvegardé

Les **contenus publics** : réalisations (+ images, technos, points forts),
services, témoignages, FAQ, technologies, réglages du site. Sont **exclus** :
messages de contact (données de visiteurs) et comptes — exportés séparément si
besoin (CSV pour les messages).

### Sauvegarde automatique (hebdomadaire)

Chaque lundi, le workflow GitHub *Sauvegarde des contenus* télécharge deux
fichiers produits par le site lui-même et les archive 90 jours :

- `content-<date>.json` — les données brutes (lisibles, diffables) ;
- `restore-<date>.sql` — script SQL **rejouable**.

Récupération : dépôt GitHub → onglet **Actions** → run *Sauvegarde des
contenus* → section *Artifacts* → télécharger.

### Sauvegarde manuelle (à la demande)

```bash
# Nécessite CRON_SECRET (voir docs/DEPLOIEMENT.md) dans l'environnement ou .env.local
node scripts/backup-content.mjs --out=.backups                       # production
node scripts/backup-content.mjs --site=http://localhost:3110 --out=.backups
```

### Restaurer un contenu

Le script `restore-<date>.sql` remplace les contenus **publiés** par ceux de la
sauvegarde (les brouillons existants ne sont pas touchés). Deux voies :

1. **Éditeur SQL Supabase** (dashboard → SQL Editor) : coller tout le contenu
   du fichier et exécuter.
2. **Ligne de commande** :
   ```bash
   psql "$DATABASE_URL" -f restore-<date>.sql
   ```

Le script est transactionnel : en cas d'erreur, rien n'est appliqué. Après
restauration, les pages publiques se mettent à jour d'elles-mêmes (60 s).

> Test effectué en sprint S7 : après sabotage volontaire (titre écrasé, ligne
> FAQ et image supprimées), le rejeu a restauré l'intégralité des contenus.

---

## 7. Routine recommandée

| Fréquence | Action |
|---|---|
| Après chaque publication | Vérifier la réalisation sur `/projets` et son partage (titre + image) |
| Chaque semaine | Jeter un œil à `/admin/sante` (erreurs à traiter) |
| Chaque lundi (automatique) | Sauvegarde archivée — vérifier le ✔ du workflow |
| Chaque trimestre | Tester une restauration sur une instance locale |

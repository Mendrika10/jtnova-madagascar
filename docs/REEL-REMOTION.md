# Plan — Reel « Nos services » en Remotion (1920×1080 · 30 fps · 30 s)

> Document de planification, rédigé au 2026-10-12 à partir des données **réelles** du
> dépôt (couleurs de `src/app/globals.css`, textes de
> `src/components/services/Services.tsx`, logo `public/images/logo.png`, CI
> `.github/workflows/ci.yml`).
>
> **Mis à jour le 2026-10-13 (passe v2)** : le film passe de 15 s à **30 s**, de cinq
> à **huit scènes**, et gagne des **photos** ainsi qu'une couche de motion design
> (ken burns, masques, reflets, compteurs, bandeaux défilants). Les huit scènes et
> leurs durées vivent maintenant dans `config.scenes.plan` (§4/§5), et tout ce qui
> suit décrit l'état **livré**, pas une intention.
>
> **Mis à jour le 2026-10-13 (passe v3 — « comme PC »)** : le film passe du vertical
> 1080×1920 au **1920×1080 horizontal**, parce qu'il est posé dans les **sections
> « services » du site** et non plus publié comme une story. Il gagne une **scène
> d'ouverture** (logo au centre, curseur qui vient le cliquer — soit **neuf scènes**)
> et perd ses deux ornements de story : le **pied de page `jtnova.mg`** et le **filet
> de progression segmenté**. La durée reste **30,000 s pile** : l'intro (66 images) ne
> s'ajoute pas, elle est prise sur les autres scènes (§5.1). Les mises en page qui
> étaient empilées passent en **colonnes** (bénéfices, réalisations) et les marges
> sûres ne sont plus celles d'Instagram mais les **bords du cadre** (§6).

---

## 0. État d'avancement — mis à jour le 2026-10-13 (passe v3)

| Élément | État |
|---|---|
| `reel/package.json` (famille `@remotion/*` **épinglée à 4.0.535**) | ✅ **créé** |
| `reel/tsconfig.json`, `reel/remotion.config.ts`, `reel/src/{index,Root,Reel}.tsx` (écran de contrôle 1080×1920) | ✅ **créés** |
| Isolation CI : `tsconfig.json` racine, `eslint.config.mjs`, `.gitignore` | ✅ **faite et vérifiée** — à la racine : `npx tsc --noEmit` → **0 erreur**, `npx eslint .` → **0 erreur** (les 5 avertissements préexistants restent, dans des fichiers non touchés) |
| Les 6 ressources d'API utilisées par le code E1 (`registerRoot`, `Composition`, `AbsoluteFill`, `useCurrentFrame`, `useVideoConfig`, `Config.setEntryPoint/setVideoImageFormat/setCodec/setCrf/setOverwriteOutput`) | ✅ **vérifiées** dans les définitions de types **publiées** de `remotion@4.0.535` et `@remotion/cli@4.0.535` (tarballs téléchargés et inspectés) |
| `npm install` dans `reel/` | ✅ **fait** — **258 paquets en 3 min, code retour 0** (`--maxsockets=1 --prefer-online`), `reel/package-lock.json` généré. Contexte à connaître : le registre npm a longtemps **throttlé les métadonnées** depuis cette machine (packuments `@remotion/*` en **60 s / 173 s / 283 s / 430 s**, premier essai bloqué **10 min sans écrire un octet**, figeage total à 2808 lignes de log) alors que le débit brut était excellent (11 Mo/s sur un tarball). Deux échecs à éviter : `--prefer-offline` (échec `ETARGET` sur `source-map-js@^1.2.2`, version pourtant présente) et **pnpm** (erreurs code 23) — leurs fichiers (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) ont été supprimés, **npm est le gestionnaire du projet**. |
| `npx tsc --noEmit` dans `reel/` | ✅ **0 erreur** |
| `npx remotion compositions` | ✅ **`Reel 30 1080x1920 900 (30.00 sec)`** — Chrome Headless Shell (120 Mo) téléchargé au passage |
| Image fixe `reel/out/e1-frame60.png` | ✅ **PNG valide 1080×1920** (72 Ko) : « E1 — ÉCRAN DE CONTRÔLE », « 1080 × 1920 », « 30 fps · 450 images · 15 s », « image 60 / 449 », filet à ~13 % (60/449) |
| **Studio** (`npx remotion studio --port 3111`) | ✅ **HTTP 200**, titre « Reel / reel - Remotion Studio » ; panneau *Compositions* : **Reel** ; *Inspector* : Dimensions **1080 × 1920**, Frame rate **30 fps**, Duration **00:15.00**, sources `Root.tsx:16` et `Reel.tsx:17` ; frise : couche `<AbsoluteFill>`. Capture dans `reel/out/studio-real-chrome.png` (l'écran de contrôle y est affiché). ⚠️ Le `chrome-headless-shell` de Remotion **sans GPU** laisse la prévisualisation grise : c'est un artefact de l'environnement, **Chrome réel** l'affiche correctement. |

| **E2 — fond de marque** (faite le 2026-10-12) | ✅ `reel/src/config.ts` **extrait du bloc de ce document** (les deux restent identiques), `theme.ts` (halo, grille, grain, échelle typo), `fonts.ts` (Outfit), `components/Backdrop.tsx`, `components/Logo.tsx` (pastille blanche : le wordmark est sombre), `Reel.tsx` réécrit, `reel/public/logo.png` copié. Prouves : `npx tsc --noEmit` = **0** · `reel/out/e2-frame60.png` (1080×1920 : fond + halo + grille + grain, logo lisible, mot « construisons » en accent) · dans le Studio, **`document.fonts.check('800 104px Outfit')` = `true`** et le `<h1>` est calculé `Outfit / 800 / 104px` (capture `reel/out/studio-e2.png`). **Décision de mise en page** : `titleLines` passe à **3 lignes** (« Ce que nous / construisons / pour vous ») — en 2 lignes, « vous » tombait seul à 104 px alors que la largeur sûre ne fait que 936 px. Plan **et** code mis à jour ensemble. `Root.tsx` lit aussi **`config.meta`** : les 4 valeurs de format ne sont plus dupliquées (le contrôle `npx remotion compositions` reste à `Reel 30 1080x1920 450 (15.00 sec)`) — la prop `variant` + `calculateMetadata` de §4.1 viendront en E7. |

| **E3 — décor final et zones sûres** (faite le 2026-10-12) | ✅ `components/ProgressBar.tsx` (filet 0→100 % permanent, posé à `bottom: safe.bottom + 10` → bord bas à **1 570 px**, soit 10 px au-dessus de l'overlay d'Instagram), `components/SafeArea.tsx` (bandes hachurées haut/bas/gauche/droite, cadre en tirets, repère `image / total · temps · format`), `Reel.tsx` : prop **`debug`** (défaut `false`), pied remonté de 60 px pour dégager le filet, points de mesure `data-reel="content"` et `data-reel="progress"` ; `Root.tsx` : `defaultProps={{ debug: false }}`. **Prouvé** : `npx tsc --noEmit` = **0** · `reel/out/e3-clean.png` (propre) et `reel/out/e3-debug.png` (guide) consultées · **mesure chiffrée dans le Studio** : logo `220→370`, titre `750→1075`, pied `1467→1520`, filet `1564→1570` → **`toutDansLaZoneSure: true`** (bande sûre `220→1580` × `72→1008`). Défaut trouvé et corrigé : le repère d'image recouvrait le logo, déplacé dans la bande haute. |

| **E4 — scène 1 `Hook` animée** (faite le 2026-10-12) | ✅ `reel/src/components/Hook.tsx` (sur-titre en ressort `pop`, **cascade** des 3 lignes — ressort `smooth` décalé de `motion.staggerFrames`, entrée montée 40 px + flou 8 px → 0 —, **balayage** du mot accentué par `clip-path` gauche → droite avec halo, filet sous le titre, précision), `Reel.tsx` réduit aux couches **permanentes** (fond, logo, pied, progression). **Prouvé** : `npx tsc --noEmit` = **0** · `npx remotion compositions` = `Reel 30 1080x1920 450 (15.00 sec)` · 12 images fixes `reel/out/e4-hook-*.png` et aperçus `reel/out/preview/e4-f*.png` consultés · **mesure au pixel** par le nouveau `reel/scripts/png-bounds.mjs` : **`toutDansLaZoneSure: true` sur les 12 images** et balayage `247→292 / →416 / →614 / →725 / →834` (bord gauche fixe) aux images 22 / 25 / 28 / 30 / 44. Défaut corrigé : le balayage utilisait la courbe `expo` (90 % en 4 images) → passé à `Easing.inOut(Easing.quad)`. |

| **E5 — scènes 2 à 4 `BenefitSlide` animées** (faite le 2026-10-12) | ✅ `components/BenefitSlide.tsx` (numéro « 01 » en ressort `pop`, pictogramme dans sa pastille — ressort `smooth`, montée 40 px + flou 8 px → 0 —, tag, titre du service, phrase-bénéfice, précision, le tout en cascade `motion.staggerFrames`), `components/icons.tsx` (**les 6 pictogrammes** du catalogue en SVG `currentColor`, aucun fichier image), `theme.ts` (échelle des bénéfices **et** motif d'entrée partagé par toutes les scènes), `fonts.ts` (**graisse 700 chargée** — `weightTitle` l'utilise, sinon faux gras), `Reel.tsx` (prop **`scene`** de relecture), `SafeArea.tsx` (700 au lieu de 600, graisse non chargée). **Prouvé** : `npx tsc --noEmit` = **0** · `npx remotion compositions` = `Reel 30 1080x1920 450 (15.00 sec)` · 10 images fixes `reel/out/e5-*.png` + aperçus consultés (numéro, tag, titre, phrase, précision lisibles ; « 03 · Design UI/UX » comme « 01 · Web ») · **mesure au pixel** : `toutDansLaZoneSure: true` sur les **10** images. **Défaut trouvé et corrigé** : `<Sequence>` enveloppe ses enfants dans un `AbsoluteFill` — la scène sortait du flux et venait **par-dessus le logo**, en haut du cadre (`écarts.haut: -189 px`) → `layout="none"`. |

| **Revue Studio des scènes 1 à 4** (faite le 2026-10-13) | ✅ Studio relancé sur les scènes relisables (`npx remotion studio --port 3000`, **HTTP 200**, rebuild à chaud après chaque édition : `Built in 233ms`, aucune erreur) et les 4 scènes relues sur images fixes, aux moments les plus chargés. **Deux densités trouvées et corrigées** : (1) **hook** — à l'image 34, le pinceau finissait de colorier « construisons » *pendant* qu'un filet cyan se dessinait sous le titre → filet **30 → 40**, précision **38 → 48**, donc après la fin du dernier balayage (image 38) ; (2) **bénéfices** — la précision démarrait à l'image 19, dans la cascade, alors que la phrase bougeait encore (mesuré au pixel : **9 px** d'écart à l'image 24, **1 px** à 32) → elle a son **propre départ à l'image 30**, hors cascade. **Prouvé** : `npx tsc --noEmit` = **0** · images de contrôle `reel/out/r1-*.png` **consultées** (image 34 du hook **sans** filet — la bande `1091→1098` est absente et n'apparaît qu'à l'image 44 ; image 34 du bénéfice 1 : phrase **nette** pendant que la précision se pose) · **mesure au pixel** : `toutDansLaZoneSure: true` sur les **9** images de contrôle · **état final inchangé** : image 107 du hook **md5 `2b8e09b2…`** et image 89 du bénéfice 1 **md5 `b6de43db…`**, identiques aux rendus E4/E5 (le réglage ne touche que le minutage, pas la composition posée). Nouveau `scripts/png-thumb.mjs` pour relire une image 1080×1920 à l'écran. |

| **E6 — scène 5 `CtaEnd`** (faite le 2026-10-13) | ✅ `reel/src/components/CtaEnd.tsx` — même format de **scène autonome** que les quatre autres : titre (ressort `smooth`, montée 40 px + flou 8 px), sous-titre (courbe `expo`), **pastille bouton** en ressort **`pop`** (le rebond réservé au bouton, §5.2) et mention « Faites défiler » dont le **chevron respire** (sinusoïde sur l'image courante, période 1,6 s — aucune animation CSS, plan §5.2) ; `theme.ts` : `lighten()` (dégradé du bouton **dérivé de l'accent**, jamais `#00d4ff` en dur : l'accent réglable par l'admin reste la seule source) et deux rôles typographiques (`ctaButton` 50 px, `ctaHint` 44 px — le titre et le sous-titre réutilisent les échelles `title`/`subtitle` du hook) ; `Reel.tsx` : `SceneId` accueille **`"cta"`** (les **5** scènes sont relisibles seules). **Prouvé** : `npx tsc --noEmit` = **0** · 7 images fixes `reel/out/e6-cta-*.png` + `e6b-cta-*.png` **consultées** · **mesure au pixel** : `toutDansLaZoneSure: true` sur les 7, bandes à l'image 52 : titre `605→811` (2 lignes, `485` et `553` px), sous-titre `854→897` (**une** ligne, 832 px sur 936), pastille bouton `954→1068`, mention `1136→1177`, chevron `1220→1238` contre la zone `220→1580` × `72→1008`. **Défauts trouvés et corrigés pendant la passe** : le sous-titre cassait en « …de A à **/ Z** » (le « Z » seul à la ligne, `maxWidth` 820 pour 824 px de texte nécessaires → **900**) et le titre tombait en « Parlons de votre **/ projet** » (752 puis 280 px) → `text-wrap: balance`, qui équilibre les deux lignes (**485 / 553**) sans coupure écrite en dur — une variante peut réécrire le titre. |

| **Passe v2 — 30 s, photos, motion design** (faite le 2026-10-13) | ✅ **Huit scènes, 900 images, 1,1 Mo de photos libres de droit, A4 vrai sur 20 images du film rendu.** Ce qui a changé : **8 scènes** au lieu de 5 (hook, 3 bénéfices, **réalisations**, **chiffres**, **technologies**, CTA) — l'ordre devient une donnée (`config.scenes.plan`) que l'assemblage parcourt, au lieu d'être écrit dans un composant ; **durée × 2** (900 images) et arithmétique recalculée : `132 + 108×3 + 150 + 126 + 114 + 138 = 984`, moins `7 × 12 = 84` → **900** ; **8 photos** téléchargées depuis Pexels (licence commerciale libre, crédits dans `reel/public/images/CREDITS.md` et `reel/src/images.ts`, **1,1 Mo** au total), servies en fond plein cadre (hook, CTA) et en cartes (bénéfices, réalisations) ; **motion design** : ken burns sur toutes les photos, révélation par `clip-path`, reflets qui traversent les cartes et le bouton, **coup de lumière** à l'ouverture de chaque scène, grain et halos **animés**, **compteurs** (48 h, 6), **bandeaux défilants** en sens opposés, anneaux pulsés sous le bouton, **filet de progression segmenté** (un segment par scène) ; **troisième transition** `transitions/wipe.tsx` — un rideau à remise séquentielle, seul geste capable de relier un bloc de texte à un bloc de photos sans superposer deux mises en page. **Défauts trouvés et corrigés dans la passe** : le fondu croisé du rideau superposait le titre de la galerie et la carte du bénéfice 3 (image 414) ; la légende de deux lignes de la galerie débordait sous le repère de position et venait se poser sur le pied de page (image 470 : repère `y 1491-1498, x 480-531`, pied `y 1480-1517, x 427-641`) — la légende est passée **dans** la carte photo ; la sortie d'un projet du carrousel, en courbe `expo`, avait déjà effacé la carte à la moitié du créneau et laissait **sept images vides** (image 470). **Preuves** : `npx tsc --noEmit` → **0** · `npx remotion compositions` → **`Reel 30 1080x1920 900 (30.00 sec)`**, exit 0 · `ffprobe` sur le film rendu → **`duration=30.000000`**, 1080x1920, 30/1, 3,3 Mb/s, **12,4 Mo** · **A4 mesuré sur 20 images extraites du mp4 rendu** (une toutes les 50, plus la dernière) → `toutDansLaZoneSure: true` **20/20**, contenu borné à `y 220 → 1569` · 3 garde-fous éprouvés par patch temporaire (restauration vérifiée au md5 `3f1c50bc…`) : scène rallongée d'une image → **exit 1** (`Arithmétique des durées fausse (plan §5.1) : 985 − 84 = 901 images, alors que meta.durationInFrames = 900`), quatrième bénéfice déclaré → **exit 1** (`scenes.plan déclare 4 scène(s) de bénéfice pour 3 identifiant(s) dans benefitIds`), six transitions pour huit scènes → **exit 1** (`8 scènes ⇒ 7 transitions`). **Nouvel outil** : `reel/scripts/sync-doc-config.mjs` compare le bloc §4 de ce document à `src/config.ts` et sort en erreur à la moindre dérive (les deux font 503 lignes, à l'identique). |

| **E9 — variante `ecommerce`** (faite le 2026-10-13) | ✅ La déclinaison écrite en E2 devient **réellement utilisable** : la prop **`variant`** est branchée (`Reel.tsx` lit `getReelConfig(variant)`, `Root.tsx` la déclare dans `defaultProps` et résout ses `meta` par **`calculateMetadata`** — plan §4.1), et `getReelConfig` **plante** sur un nom inconnu au lieu de retomber en silence sur le film par défaut (la prop vient du CLI, en JSON non typé). **Rien d'autre n'a été touché** : aucun composant, aucune couleur, aucun timing — la déclinaison ne fait que surcharger `config.scenes` (`benefitIds`, `hook.kicker`, `hook.underline`, `cta.title`, `cta.button`). **Prouvé (A5)** : `npx remotion still Reel … --props='{"variant":"ecommerce", …}'` change bien la pub — hook **« E-COMMERCE »** + « 5 étapes, un seul partenaire. » (bandes `648→675` et `1153→1195`, 350 et 566 px contre 366 et 637 pour `services`), bénéfices **Commerce → SEO → Design** (« 01 » + panier, tag `COMMERCE` 261 px contre `WEB` 98 px, « Vendez en ligne sereinement », puis « Soyez trouvé, vite », puis le Design inchangé car présent dans les deux), CTA **« Ouvrez votre boutique »** avec pastille **`jtnova.mg/ecommerce`** (`954→1068`, 650 px contre 355 px) — `toutDansLaZoneSure: true` sur les **5** images · **`npx remotion compositions` = `Reel 30 1080x1920 450 (15.00 sec)`, exit 0** (la variante ne change pas les durées, et `calculateMetadata` n'altère pas A1) · **film par défaut inchangé**, vérifié au md5 : image 107 `2b8e09b2…` et bénéfice 1 image 89 `b6de43db…` · **test négatif** : `--props='{"variant":"ecomerce"}'` → **`Déclinaison inconnue : « ecomerce » — connues : services, ecommerce.`**, code retour **1** (plus de pub silencieusement fausse). |

| **E7 — assemblage `TransitionSeries`** (faite le 2026-10-13) | ✅ Les **5 scènes sont enchaînées** dans `Reel.tsx` : trois `fade()` et **un** glissement latéral — `glide()` de `src/transitions/glide.tsx`, écrit pour la circonstance : le `slide()` de la bibliothèque parcourt toute la largeur et faisait sortir le texte de la zone sûre pendant la transition (mesuré : `écarts.gauche = -72 px`). Le glissement court (40 px, remise séquentielle) laisse A4 vrai **à toutes les images**, transition comprise. Le tout dans une **zone de scène** `position: relative` qui joue le rôle du repère pour les `AbsoluteFill` des présentations — sans elle, les scènes couvriraient tout le cadre par-dessus le logo (exactement le défaut trouvé à E5 avec `<Sequence>`). **Le total n'est pas recopié** : `timelineOf()` (dans `config.ts`) calcule scènes, chevauchements, **total** et `starts`, `getReelConfig` **plante** si `meta.durationInFrames` ne tombe plus juste (§5.1 : « une erreur d'arithmétique de transitions est donc impossible à livrer »), et `calculateMetadata` (Root.tsx) déclare ce total. **`slideFrames` passe de 14 à 12** : §5.1 exige quatre chevauchements égaux (4 × 12 = 48 → 450), un glissement de 14 images ferait 448 et casserait A1/A2 — l'écart est documenté dans `config.ts`. **`ProgressBar` gagne une prop `offset`** : la relecture d'une scène seule pose le filet à son **départ réel** dans le film, sinon l'image relue différait du film sur ce seul filet. **Preuve centrale** : l'image du film assemblé est **au pixel près** celle de la relecture de la scène — md5 identiques pour le hook (44), les bénéfices 1 (film 130 = local 34), 2 (219 = 45), 3 (297 = 45), le CTA (382 = 52 ; 449 = 119) et la variante e-commerce (film 141 = local 45) ; ces décalages **sont** les positions de §5.1 (`0 / 96 / 174 / 252 / 330`). **Prouvé aussi** : `npx tsc --noEmit` = **0** · `npx remotion compositions` = **`Reel 30 1080x1920 450 (15.00 sec)`**, exit 0 · `toutDansLaZoneSure: true` sur les images **posées** *et* sur les six images du glissement mesurées à seuil bas (`--luma=60 --band=400:1500`) · comparatif **outillé** par le nouveau `scripts/png-diff.mjs`. **Les deux garde-fous sont éprouvés** (patch temporaire, puis restauration vérifiée par md5) : une scène rallongée d'une image → `Arithmétique des durées fausse (plan §5.1) : 499 − 48 = 451 images, alors que meta.durationInFrames = 450`, code retour **1** ; une quatrième bénéfice déclarée (total recalculé en conséquence) → `L'assemblage attend trois bénéfices, config.scenes.benefitIds en compte 4`, code retour **1** — le contrôle est en **égalité**, pas en « au moins trois », sinon la fin du film serait vide (§5.1). **Reste à savoir** : le mode `debug: true` place ses guides hors zone, donc la mesure A4 se fait **sans** debug. |

| **Passe v3 — « comme PC » : 16:9, intro cliquée, section du site** (faite le 2026-10-13) | ✅ **Neuf scènes, 1920×1080, 900 images (30,000 s), marges tenues sur 29/29 images du film rendu.** Ce qui a changé : **format** 1080×1920 → **1920×1080** (le film est posé dans les sections « services », sur PC comme sur phone) ; **scène d'ouverture** `IntroLogo` (logo au centre, entrée en ressort `pop`, deux balises pulsées qui épousent la pastille, **curseur** qui entre par la droite et **clique** à l'image 34 — la pastille s'enfonce de 4,5 % puis remonte, une **onde** part du point cliqué, puis le curseur s'écarte et s'efface ; le logo de marque du coin n'apparaît **qu'après** le clic, sinon deux logos se répondraient) ; **retrait** du pied de page `jtnova.mg` **et** du filet de progression (`components/ProgressBar.tsx` **supprimé**, `typeOf().footer` avec) ; **mises en page en colonnes** (bénéfices : photo à gauche / textes à droite ; réalisations : titre à gauche / carrousel à droite ; technologies : fenêtre 936 → **1 500 px** ; chiffres : repères sur **1 240 px** avec libellés alignés à gauche) ; **logo de marque** en haut à gauche, **hors du flux**, pour que le contenu des scènes reste centré au centre exact du cadre. **Durée inchangée à 30,000 s** : l'intro prend 66 images, dont **54 sur les autres scènes** (hook 132→114, galerie 150→138, technologies 114→108) et **12 échangées** entre CTA (126→114) et chiffres (120→**132**) — la note de bas de scène des chiffres n'avait plus que **3 images** de visibilité pleine avant le fondu. **Défauts trouvés et corrigés dans la passe, tous par la mesure ou par l'image** : (1) les ondes du clic partaient du **coin** de la pastille (repère `50 %` manquant) **et** étaient cachées derrière elle — on n'en voyait qu'un arc de quelques pixels ; (2) le logo de marque sortait de la marge pendant sa propre apparition (`y = 82` pour une limite de 90) → il part maintenant **de** la marge ; (3) la scène « chiffres », empilée comme en 9:16, débordait des marges (kicker à `y = 40`) → titre sur **une** ligne et repères sur 1 240 px ; (4) la note de bas de scène des chiffres, désormais lisible sur 13 images pleines. **Preuves** : `npx tsc --noEmit` → **0** · `npx remotion compositions` → **`Reel 30 1920x1080 900 (30.00 sec)`**, exit 0 · `ffprobe` sur le film rendu → **`duration=30.000000`**, `1920x1080`, `30/1`, 3,4 Mb/s, **12 704 881 octets** · **A4 : 29 images extraites du mp4 livré** (une toutes les 45, plus la dernière, plus 8 images de transition) → `toutDansLaZoneSure: true` **29/29**, marge basse minimale **49 px** (`y 941` pour une limite de 990) · **relecture d'une scène ≡ image du film : md5 identiques sur les 8 scènes relisibles** (intro 34, hook 150≡96, bénéfice 1 246≡90, bénéfice 2 342≡90, réalisations 566≡122, chiffres 686≡116, technologies 782≡92, CTA 896≡110) · variante `ecommerce` rejouée (hook et CTA, dans les marges) · **4 garde-fous éprouvés** par patch temporaire, `config.ts` restauré au **md5 `3223d7feb481…`** : durée +1 image → **exit 1** (`997 − 96 = 901 images, alors que meta.durationInFrames = 900`), intro placée en deuxième → **exit 1** (contrôle **nouveau** : « doit être unique et placée en premier »), 4ᵉ bénéfice déclaré → **exit 1**, 7 transitions pour 9 scènes → **exit 1** · A6 relevé à la racine : `tsc` 0, `eslint` 0 erreur, `build` 0 · `png-bounds.mjs` lit désormais les **marges dans `src/config.ts`** au lieu de les recopier (elles avaient changé deux fois sans que le script suive : une mesure qui ne porte pas sur la vraie marge ne mesure rien) · §4 resynchronisé (`--write`, **552 lignes**). **Reste à trancher** : la musique (seule décision de la v1 encore ouverte), la validation des trois chiffres, le ton de la mention du CTA (« Faites défiler pour en savoir plus » est du vocabulaire de *story*, à réécrire pour une section) et le **placement effectif dans les sections services** du site. |

| **S1 — le son : nappe + effets, synthétisés** (faite le 2026-10-13) | ✅ **Le film n'est plus muet, et le son n'est pas acheté.** `reel/scripts/make-audio.mjs` (nouveau, **zéro dépendance**) synthétise **10 fichiers WAV** 48 000 Hz / 16 bits / stéréo dans `reel/public/audio/` : la **nappe** (`music-bed.wav`, **30,000 s exactement** — 15 mesures à 120 BPM, soit la durée du film au bit près) et **9 effets** (`click`, `pop`, `tick`, `whoosh`, `swipe`, `sweep`, `ding`, `impact`, `sparkle`). Décision et raisons en **§2.3** ; **6,5 Mo** de sources, **versionnées** comme les photos. Le montage est dans `reel/src/sound.tsx` (nouveau — chemins, **tous les niveaux** dans `SFX_VOLUMES`, composants `Sfx` / `MusicBed`), les **instants dans chaque scène**, juste à côté de `START` (le son ne peut pas se désynchroniser de son animation), et les **huit passages** une seule fois dans `Reel.tsx` à `timing.starts[index + 1]` selon le type de transition (`config.sound.transitionSfx` : fondu → `whoosh`, glissement → `swipe`, balayage → `sweep`). `config.audio` (jamais utilisé) devient **`config.sound`** ; `npm run render` lance désormais `npm run audio` **avant** de rendre. Le **lecteur du site** (`VideoShowcase`) démarre **muet par défaut** avec une pastille « Activer le son ». **Preuves** : `npx tsc --noEmit` → **0** (reel **et** racine) · `npx eslint` → **0 erreur** · `ffprobe` sur le mp4 livré → piste **`h264 1920x1080 30/1 duration=30.000000`** **et** piste **`aac 48000 Hz stéréo`** (l'AAC pèse 30,016 s : le remplissage de trames AAC, pas une seconde de film en plus) · **niveau réel mesuré en décodant la piste du mp4** → pic **0,941** (−0,53 dBFS, ≈ 0,5 dB de marge), RMS **0,175**, et un profil par seconde qui suit l'arrangement (0,10 s en intro, 0,18 s à l'arrivée du hook, 0,07 s sur le fondu de sortie) · **saturation ?** La relecture d'une scène seule décode à **1,000** — **vérifié comme un artefact de clip court, pas un défaut du mixage** : le **même segment rendu sans la prop `scene`** donne exactement la même lecture, au même débit audio (317 376 contre 317 375 b/s), donc c'est le remplissage de trames AAC d'un fichier de 1,5 s. Le film **livré** (30 s), seul artefact qui compte, a tout de même gagné de la marge : `config.sound.music.volume` **0,45 → 0,38** · **A4 : `toutDansLaZoneSure: true` sur 8 images du film sonorisé** (intro 34, hook 152, bénéfices 246/342, réalisations 566, chiffres 686, technologies 782, CTA 896), marge basse minimale **49 px** — les valeurs exactes de la passe v3 · **le son ne change pas un pixel**, prouvé par patch temporaire (les deux composants remis à `null`), images 152 et 896 **md5 `9e4070d9…` et `095c3525…`** — identiques **à celles du film d'avant le son**, puis `sound.tsx` restauré et l'image 152 re-mesurée au même md5 · **générateur déterministe** : deux exécutions de `make-audio.mjs` → **10/10 fichiers identiques au bit près** (`music-bed.wav` `053cda26…`). Poids du livrable : **13 919 991 octets** (13,9 Mo, +1,2 Mo d'AAC). **Sept de ces neuf effets ont été retirés du montage le jour même, et le niveau de la nappe repris : c'est S1b qui décrit le film livré.** |

| **S1b — sept effets retirés du montage, nappe reprise au niveau qui reste** (faite le 2026-10-13) | ✅ Demande de l'humain : *« enleve le son whoosh ,ding,impact,pop,sweep,swipe,tick, dans le clip car j'aime pas »*. **Les sept sont partis** — `whoosh`, `ding`, `impact`, `pop`, `sweep`, `swipe`, `tick` — et le film ne monte plus que **`click`** (le clac du clic de l'intro) et **`sparkle`** (l'étincelle du logo), les deux seuls qui n'étaient pas nommés dans le retrait. **Conséquence assumée** : `whoosh` / `swipe` / `sweep` **étaient le son des trois types de transition**, donc **les huit passages entre scènes sont muets** — `config.sound` n'a plus de `transitionSfx`, et le bloc `TransitionSfx` de `Reel.tsx` a été **supprimé avec ses effets**, pas laissé en place à ne rien faire. **Ce qui n'a pas été effacé : les recettes.** `scripts/make-audio.mjs` garde ses dix synthèses, une constante `MONTES` dit lesquelles monter, et **le script élague lui-même `public/audio/sfx/`** (`retirés du dossier (plus montés) : ding, impact, pop, sweep, swipe, tick, whoosh`) : **le dossier et le montage ne peuvent donc pas diverger en silence**, et remettre un son = son nom dans `MONTES` + dans `SFX_FILES`, sans réécrire une ligne de synthèse. Le dossier audio passe de **6,5 à 5,7 Mo** — la nappe pèse 5,5 Mo à elle seule, donc ce sont des **octets de confort de montage, pas des octets de film**. **Effet de bord trouvé et corrigé** : la nappe était réglée à **0,38**, valeur choisie pour cohabiter avec `impact`, le pic le plus fort du mixage ; sans lui le film se décodait à **RMS 0,108** (−19,3 dBFS) contre **0,175** juste avant — **4 dB plus faible, sans que personne ne l'ait demandé**. La marge restante a été **calculée, pas estimée** (les trois sources additionnées hors ligne, aux positions exactes du montage : `click` à 34/30 s, `sparkle` à 2/30 s) : à **0,60** le pic source n'est que de **0,492**, soit **6,2 dB de marge**. **Aucun effet sur les images** : ce ne sont que des niveaux. **Preuves** : `npx tsc --noEmit` → **0** · `ffprobe` sur le mp4 livré → piste **`h264 1920x1080 30/1 duration=30.000000`** **et** piste **`aac 48000 Hz stéréo`** · **le son du film égale 0,60 × la nappe, écart 0,000, sur 29 des 30 secondes** — la seule qui diffère est la **première** (0,155 contre 0,149), c'est-à-dire `sparkle` + `click` : **aucun effet retiré ne subsiste dans le mixage**, et c'est une **mesure**, pas une confiance · RMS du film **0,1700** (la même simulation donne 0,1080 pour la version à 0,38, contre 0,1078 mesuré : elle reproduit le rendu au millième) · **pic décodé 0,931 à `t = 0,00008 s`**, sur la **première trame AAC**, là où la nappe est encore muette (fondu d'entrée) — c'est l'**amorçage de l'encodeur**, et il vaut **exactement 0,931 à 0,38 comme à 0,60**, donc il ne dépend pas du niveau du programme ; le pic du **mixage** est de **0,492**, et les pics suivants du film sont tous **≤ 0,395** (`click` à 1,136 s, `sparkle` à 0,203 s) · poids du livrable **inchangé à 13 919 991 octets** (l'AAC en débit moyen rend le même nombre d'octets — surprenant, vérifié deux fois) · le lecteur du site, **muet par défaut**, est inchangé (S1). **Limite** : aucune **écoute humaine** n'a validé ce nouveau niveau — il vient d'un calcul de marge et d'une cible de présence, pas d'une oreille. |

> **Images de preuve** : `reel/out/` est un dossier de travail (ignoré par Git). Les
> images de la v1 (`e4-*`, `e5-*`, `e7-*`…) ont été nettoyées lors de la passe v2 —
> et les scènes ayant changé, elles ne se reproduisent plus à l'identique : **seules
> les images de la v2 font foi**. Toutes se régénèrent avec les commandes du §7 ;
> celles du film rendu (`final-*.png`) sont extraites du mp4 livré, donc elles
> montrent exactement ce qui sera publié.
>
> **Si `reel/node_modules` devait être régénérée**, voici la commande qui a abouti :
>
> ```bash
> cd reel && npm install --no-audit --no-fund --prefer-online --maxsockets=1 \
>   --fetch-timeout=30000 --fetch-retries=10
> ```
>
> **Ne pas mettre `--prefer-offline`** : le cache local est antérieur à
> `source-map-js@1.2.2`, npm échoue alors en `ETARGET` (« No matching version
> found ») alors que cette version **existe** sur le registre.
>
> **À savoir pour le premier lancement** : `npx remotion studio` télécharge en plus
> **Chrome Headless Shell** (~150 Mo) et `npm install` récupère les binaires natifs
> du compositeur. Sur une connexion normale c'est l'affaire de quelques minutes ;
> sur celle-ci, prévoir du temps la première fois. Les fois suivantes sont
> immédiates (tout est en cache).

---

## 1. Objectif

Produire une **composition Remotion** unique, déclinable, qui transforme la section
publique **« Nos services »** en un **film de 30 s prêt à poser dans une section du
site** — horizontal **1920×1080**, donc lisible sur PC comme sur phone — sans passer
par un logiciel de montage. (La v1 visait une story verticale 9:16 pour Instagram ;
la **v3** l'a basculée en 16:9 à la demande, cf. l'entête et le §5.)

| # | Objectif | Mesure |
|---|---|---|
| O1 | Un format unique, exact | mp4 **1920×1080, 30 fps, 30,000 s (900 images)**, vérifié par `ffprobe` |
| O2 | Structuré comme une pub | intro (logo cliqué) **0–1,8 s**, hook **1,8–5,2 s**, 3 bénéfices animés **5,2 → 14,8 s**, réalisations **14,8–19 s**, chiffres **19–23 s**, technologies **23 → 26,2 s**, CTA **26,2–30 s** |
| O3 | Cohérent avec la marque | couleurs et police **identiques au site**, transitions fondu / glissement / balayage |
| O4 | Déclinable sans toucher au code | **tous** les textes, couleurs, timings, durées, photos et variantes vivent dans `config.ts` |
| O5 | Le site Next.js reste intact | CI existante (`tsc`, `eslint`, `next build`) toujours **verte**, relevée par exclusion |
| O6 | Vendre, pas seulement informer | **8 photos libres de droit** (usage commercial, créditées) et une couche de motion design : ken burns, masques, reflets, compteurs, bandeaux défilants |

**Hors périmètre v2** : montage multi-clips vidéo, voix off, sous-titres automatiques,
**audio acheté** ou **sous licence** (le son du film est **synthétisé**, §2.3, donc
hors de cette exclusion), rendu serveur depuis l'admin (voir §11, phase 2).

---

## 2. Décisions techniques (et pourquoi)

| Décision | Choix | Raison |
|---|---|---|
| Emplacement | Dossier **`reel/`** à la racine, **projet npm autonome** (son propre `package.json`, `node_modules`, `tsconfig`) | La CI lance `npx tsc --noEmit` et `npx eslint .` **depuis la racine** et le `tsconfig` racine inclut `**/*.tsx`. Un projet Remotion non isolé ferait échouer la CI (types `@remotion/*` absents) et alourdirait le build Next.js. |
| Version Remotion | `^4.0.535` (dernière stable publiée sur npm à ce jour) | Ligne 4.x stable, `npm view remotion version` → `4.0.535`. La 5.x n'est pas publiée sur npm. |
| React | **19.x en propre** dans `reel/` | Isolé du React du site : aucune contrainte croisée. Remotion 4 accepte React ≥ 16.8. |
| Transitions | `@remotion/transitions` (`TransitionSeries`) + `spring()` | Demande explicite « transitions spring et fade » ; `fade()` et `springTiming()` sont fournis par le paquet officiel. |
| Police | **Outfit** via `@remotion/google-fonts/Outfit` (déjà employée par la page de connexion admin) | Zéro fichier à gérer : la police est embarquée au build, rendu déterministe et hors-ligne. **Écart assumé** : le site public utilise **Satoshi** (CDN Fontshare) — revenir à Satoshi ne demanderait que de remplacer `fonts.ts` et de déposer les fichiers (§11.6). |
| Config | `reel/src/config.ts` = **données pures**, zéro import React | Pourra être produit plus tard par un réglage admin (§11). |
| Audio | **Musique et effets synthétisés** par le projet (`scripts/make-audio.mjs`, §2.3) | Zéro licence, zéro crédit, **reproductible** : le son est un script, pas un fichier acheté. Le montage (positions, niveaux) vit dans `src/sound.tsx` + `config.sound`, et le lecteur du site démarre **muet par défaut**. |
| Livrable | mp4 **hors du dépôt** (`reel/out/`) | `.gitignore` ignore déjà `*.mp4` : aucun binaire lourd ne rentre dans l'historique. |

### 2.1 Licence Remotion — **Free License**, et **aucune démarche à faire**

Remotion est « source-available » (ce n'est pas de l'open source au sens OSI) : son
usage est régi par la Remotion License. Décision : **on reste sous la Free License**,
sans abonnement. Conditions réelles d'éligibilité (source : FAQ de licence de
l'éditeur et `@remotion/licensing`, consultées le **2026-10-12**) :

| Situation de l'entité qui produit | Free License ? |
|---|---|
| Un **particulier**, en usage personnel **ou commercial** | ✅ |
| Une organisation / équipe de **3 personnes ou moins** | ✅ |
| Un organisme **à but non lucratif** | ✅ |
| Une **société immatriculée** avec ≤ 3 personnes (« even if you are incorporated ») | ✅ |
| Une organisation de **4 personnes ou plus** | ❌ Company License obligatoire |

**La démarche, c'est : il n'y en a aucune.** L'éditeur est explicite — « *If you are
eligible, simply get started! You don't have to contact us […] You also don't have to
sign up on remotion.pro* ». Donc **pas de compte, pas de clé de licence, pas de
fichier, rien à installer ni à payer** : l'éligibilité suffit. Et il n'y a **aucune
différence de fonctionnalité** entre Free License et Company License — y compris pour
l'**automatisation** et l'**usage commercial** (produire des Reels pour la marque
Jtnova est un usage commercial accepté).

Les 4 gestes qui restent, dans l'ordre :

1. **Compter l'effectif** de l'entité qui produit (Jtnova). Stagiaires, freelances,
   agences et sous-traitants **travaillant sur le même projet Remotion** s'additionnent
   au seuil de 3 (« *You hire another agency or contractors […] their headcount
   aggregates with yours* »).
2. **Consigner la décision et la date** dans ce document (ligne ci-dessous), pour
   pouvoir la justifier plus tard.
3. **Ne rien installer pour la licence** : en v4, la télémétrie de `@remotion/licensing`
   est **facultative** (« *opt out by simply not passing a licenseKey* ») et le rendu
   aboutit de toute façon. Le paquet n'est utile qu'aux détenteurs d'une Company
   License. Rendu **côté serveur/CLI** ici : aucune télémétrie, rien à configurer.
4. **Surveiller le seuil** — ce n'est pas acquis à vie. Au 4ᵉ membre, la Company
   License devient obligatoire **avant** le rendu suivant : *Creators* 25 $/mois par
   personne qui écrit du Remotion, ou *Automators* 0,01 $/rendu avec 100 $/mois
   minimum (formules publiées à cette date). On reste sur `remotion@4.x` : aucun
   changement d'ici là.

**Décision enregistrée (2026-10-12)** : ☑ producteur = **travailleur indépendant,
1 seule personne** → **Free License retenue, sans compte, sans clé, sans paquet**.
Télémétrie non activée (facultative en v4). À revoir si l'équipe atteint 4 personnes,
ou si un sous-traitant rejoint le projet Remotion.

Deux points de vigilance pour **rester** éligible et pour la suite :

- **Ne pas remettre le projet Remotion à un client** qui l'exploiterait ou continuerait
  à le développer : dans ce cas, son effectif s'ajoute au nôtre pour le seuil de 3, et
  c'est le propriétaire du code qui doit porter la licence. Livrer **le mp4 fini** ne
  pose en revanche aucun problème : « *your client is not a User of the Remotion
  Software, so their headcount does not count* ».
- La licence Remotion **ne couvre pas** les brevets de codec (H.264/AVC, HEVC, AAC) :
  l'éditeur le rappelle explicitement. À garder en tête pour toute diffusion
  professionnelle. Depuis la v3, le film est **servi par le site lui-même** (et non
  publié sur une plateforme qui couvrirait sa propre diffusion) : c'est un point
  d'attention à relever au moment de la mise en ligne, pas un obstacle à la
  livraison du mp4.

### 2.2 Première exécution

`npm install` dans `reel/` télécharge les binaires ; le premier rendu télécharge
**Chrome Headless Shell** (~150–200 Mo) et utilise le **ffmpeg embarqué**. Prévoir
l'espace disque et un premier lancement plus lent — préchauffage possible via
`npx remotion browser ensure`.

**Épinglage des versions** : tous les paquets `@remotion/*` doivent être **à la même
version exacte** que `remotion` (la doc recommande de retirer le `^` : un `^` sur
`@remotion/cli` et `remotion` peut produire deux versions incompatibles). C'est lepoint à respecter au moment d'écrire `reel/package.json`.

### 2.3 Le son — **synthétisé par le projet**, donc sans licence

Décidé le 2026-10-13 : le film n'est plus muet, **et le son n'est pas acheté**.
`reel/scripts/make-audio.mjs` **synthétise** la nappe de fond et les effets en WAV
(48 000 Hz, 16 bits, stéréo) dans `reel/public/audio/`. **Le film n'en monte que
deux** — `click` (le clac du clic de l'intro) et `sparkle` (l'étincelle du logo) —
**et rien du tout sur les transitions** : `whoosh`, `ding`, `impact`, `pop`,
`sweep`, `swipe` et `tick` ont été **retirés du montage le 2026-10-13** (sur
demande : ils ne plaisaient pas). Une transition se fait donc **au silence**, ce
qui n'est pas un oubli — c'est l'état demandé, et c'est pour ça que `config.sound`
n'a plus de `transitionSfx`.

**Leurs recettes sont restées dans le script.** C'est une **caisse à outils plus
large que le montage**, exactement comme `config.services` (six services décrits,
trois bénéfices au film) : `MONTES` dit ce qu'on écrit et ce qu'on garde dans
`public/audio/sfx/`, `SFX` contient toutes les recettes, et **le script élague le
dossier** — donc le contenu du dossier et le montage ne peuvent pas diverger en
silence. Remettre un son = son nom dans `MONTES`, dans `SFX_FILES`
(`src/sound.tsx`) et son `<Sfx>` dans la scène : **aucune ligne de synthèse à
réécrire**. Trois raisons de synthétiser :

1. **Aucune licence, aucun crédit.** Un morceau « libre de droits » a toujours des
   conditions (attribution, usage commercial, durée) qu'il faut relire à chaque
   publication ; ce script n'en a aucune. Même esprit que les photos Pexels (§6.6),
   mais sans même un crédit à porter.
2. **Reproductible.** Tout est déterministe — le bruit vient d'un générateur à
   **graine fixe**, jamais de `Math.random()` au rendu : relancer le script
   régénère les mêmes octets, sur n'importe quelle machine. Un fichier acheté, lui,
   est un binaire opaque dont on ne sait plus, deux ans plus tard, s'il a le droit
   d'être là.
3. **Réglable.** Tempo (120 BPM → **15 mesures = 30,000 s**, exactement la durée du
   film), grille d'accords, sections et niveaux sont des données en clair, en haut
   du script — comme les durées de scène sont des données dans `config.ts`.

Le **montage** est dans `reel/src/sound.tsx` : les chemins des fichiers, **tous les
niveaux** (`SFX_VOLUMES`, un seul chiffre à toucher par effet), et les deux
composants `Sfx` / `MusicBed`. Les **instants**, eux, sont écrits **dans la scène qui
les justifie**, juste à côté des constantes `START` de son animation : l'effet et le
mouvement qui l'appelle sont deux lignes du même fichier, ils ne peuvent pas se
désynchroniser. Les **huit passages entre scènes** faisaient exception (une
transition n'appartient à aucune des deux scènes qu'elle relie : leur effet était
posé **une fois**, dans l'assemblage, à `timing.starts[index + 1]`, l'image exacte
où le chevauchement démarre) — depuis le retrait des trois effets de transition,
**il n'y a plus rien à y poser**, et le bloc a été supprimé avec ses effets.

Deux points de méthode :

- `npm run render` lance `npm run audio` **d'abord** : le mp4 ne peut pas partir
  avec une bande-son périmée.
- Les `<Sequence>` audio sont en **`layout="none"`** (leçon d'E5) : un son ne pose
  **rien** dans le décor, pas même un `AbsoluteFill` vide.

**Poids** : les WAV pèsent **5,7 Mo** dans `reel/public/audio/`, versionnés comme
les photos — ce sont les **sources** du film. Ils **ne sont pas** dans le mp4 : le
rendu ajoute l'AAC correspondant (~1,2 Mo) au film muet d'avant. C'est la **nappe**
qui pèse (5,5 Mo à elle seule) : les effets montés font 170 Kio à eux deux, donc
retirer les sept autres n'a quasiment rien rendu au dépôt — c'est du confort de
montage, pas des octets.

---


## 3. Arborescence cible

```
reel/                             ← projet autonome (jamais importé par Next.js)
├── package.json                  remotion, @remotion/cli, @remotion/transitions,
│                                 @remotion/fonts, react, react-dom, typescript
├── tsconfig.json                 propre au reel (jsx: react-jsx, strict)
├── remotion.config.ts            codec h264, crf 18, imageFormat jpeg
├── public/
│   ├── logo.png                  copie de public/images/logo.png (wordmark)
│   ├── images/                   les 8 photos du film (1,1 Mo au total)
│   │   ├── CREDITS.md            licence Pexels, auteur + URL canonique de chacune
│   │   ├── hero-workspace.jpg    fond plein cadre du hook (portrait, recadré 16:9)
│   │   ├── cta-office.jpg        fond plein cadre du CTA (portrait, recadré 16:9)
│   │   ├── web-site.jpg  app-code.jpg  design-ui.jpg        cartes des bénéfices
│   │   └── work-site.jpg  work-shop.jpg  work-dashboard.jpg  cartes des réalisations
│   ├── audio/                    la nappe + les 2 effets montés (5,7 Mo) — **synthétisés**, §2.3
│   │   ├── music-bed.wav         30,000 s pile (15 × 2 s à 120 BPM) : la durée du film
│   │   └── sfx/                  click  sparkle  (seuls montés ; le script élague)
│   └── logo-blanc.png            variante claire du wordmark (option, cf. §11.1)
├── scripts/
│   ├── make-audio.mjs            ★ synthèse du son (zéro dépendance) : nappe + caisse d'effets,
│   │                             dont seuls `MONTES` sont écrits et gardés au dossier
│   ├── png-bounds.mjs            mesure au pixel : zones sûres, balayage — zéro dépendance
│   ├── png-diff.mjs              écart entre deux images fixes (relecture vs film)
│   ├── png-thumb.mjs             vignette d'une image fixe, pour relire un 1920×1080 à l'écran
│   └── sync-doc-config.mjs       vérifie (et réécrit) le bloc §4 de ce plan contre src/config.ts
├── src/
    ├── index.ts                  registerRoot(RemotionRoot)
    ├── config.ts                 ★ tous les textes, couleurs, durées, plan de montage, variantes
    ├── images.ts                 ★ registre des photos : clé → fichier + crédit (un seul endroit)
    ├── backdrops.ts              quelle photo de fond pour quelle image du film (+ fondu de passage)
    ├── theme.ts                  dérivés de config : échelles typo, dégradés, grain, et tout le
    │                             vocabulaire de mouvement (ken burns, masques, reflets)
    ├── fonts.ts                  loadFont() Outfit (400/700/800) + garde delayRender
    ├── Reel.tsx                  assemblage : décor constant + fond photo + plan de scènes
    │                             + nappe (MusicBed) et les 8 passages sonores
    ├── sound.tsx                 ★ la console de mixage : fichiers, niveaux, Sfx + MusicBed
    ├── Root.tsx                  <Composition id="Reel" … /> + calculateMetadata
    ├── transitions/
    │   ├── glide.tsx             glissement court (40 px) — la zone sûre tient pendant la transition
    │   └── wipe.tsx              balayage : rideau à remise séquentielle (texte → photos)
    └── components/
        ├── Backdrop.tsx          fond #070d1a, halos qui dérivent, grille, grain animé
        ├── Photo.tsx             les deux usages d'une photo : fond plein cadre, carte animée
        ├── CutLight.tsx          coup de lumière à l'ouverture de chaque scène
        ├── IntroLogo.tsx         scène 1 (0–1,8 s) : logo au centre, curseur qui clique
        ├── Hook.tsx              scène 2 (1,8–5,2 s) + sommaire des bénéfices
        ├── BenefitSlide.tsx      scènes 3–5 (5,2–14,8 s) : photo à gauche, textes à droite
        ├── GalleryScene.tsx      scène 6 (14,8–19 s) : titre à gauche, carrousel à droite
        ├── StatsScene.tsx        scène 7 (19–23 s) : 3 repères sur 1 240 px, 2 compteurs
        ├── TechScene.tsx         scène 8 (23–26,2 s) : 2 bandeaux (fenêtre de 1 500 px)
        ├── CtaEnd.tsx            scène 9 (26,2–30 s) : bouton à anneaux pulsés
        ├── Logo.tsx              logo + pastille claire
        ├── SafeArea.tsx          guide de zones sûres (outil, `debug: true`)
        └── icons.tsx             les 6 pictogrammes SVG du site, indexés par nom
```

### 3.1 Modifications **hors** de `reel/` (à faire en premier)

| Fichier | Modification | Pourquoi |
|---|---|---|
| `src/components/projets/VideoShowcase.tsx` + `VideoShowcase.module.css` | lecteur **muet par défaut** + pastille « Activer le son » ✅ **fait** (S1) | le reel a une bande-son : un média posé dans une section est lu **en sourdine** par le navigateur, donc c'est au visiteur de décider d'entendre |
| `tsconfig.json` (racine) | ajouter `"reel"` dans `exclude` ✅ **fait** | sinon `npx tsc --noEmit` (CI) tente de typer le projet Remotion sans ses dépendances → CI rouge |
| `eslint.config.mjs` | ajouter `"reel/**"` dans `globalIgnores(...)` ✅ **fait** | sinon `npx eslint .` (CI) lint le reel avec les règles Next → faux positifs |
| `.gitignore` | ajouter `reel/node_modules`, `reel/out`, `reel/.remotion` ✅ **fait** | ne pas polluer l'historique (`*.mp4` est déjà ignoré globalement) |

> Aucune modification de `package.json` racine, de `next.config.ts` ni d'un composant
> du site : **le reel ne partage pas de code avec le site**, il partage des valeurs
> (couleurs, textes) recopiées dans `config.ts`.

---

## 4. `config.ts` — source unique des contenus

Le fichier ci-dessous est **utilisable tel quel** : les textes sont ceux servis par
le site, les couleurs sont celles de `globals.css`.

> Ce bloc n'est **pas** une illustration : il est vérifié contre le fichier réel.
> `cd reel && node scripts/sync-doc-config.mjs` compare les deux et sort en erreur
> dès qu'ils divergent (`--write` resynchronise). Au 2026-10-13 : 503 lignes
> identiques des deux côtés.

```ts
/**
 * Reel « Nos services » — Jtnova.
 * Toutes les données du film. Aucun import React : ce fichier reste du JSON typé,
 * pour pouvoir être remplacé un jour par un réglage écrit depuis l'admin.
 *
 * Décliner la pub = dupliquer une entrée de `variants` (surcharge partielle).
 *
 * Depuis la v3 (2026-10-13) le film est **horizontal 1920×1080** — il est posé
 * dans les sections « services » du site, sur PC comme sur phone. Il dure toujours
 * **30 s** (900 images) et comporte **neuf scènes** : intro (logo cliqué),
 * hook, 3 bénéfices, réalisations, chiffres, technologies, CTA.
 * L'ordre n'est pas écrit dans un composant : il vit dans `scenes.plan`, et
 * `timelineOf()` en déduit les durées, les chevauchements et le total (§5.1).
 */

export type SpringConfig = { damping: number; mass: number; stiffness: number };

/** Pictogrammes disponibles — résolus dans `components/icons.tsx`. */
export type IconName = "browser" | "code" | "design" | "cart" | "bolt" | "chat";

/**
 * Effets sonores **montés dans le film** — un fichier chacun, synthétisé par
 * `scripts/make-audio.mjs` et posé par `src/sound.tsx`.
 *
 * Le type est déclaré **ici** (comme `IconName`) pour que `config.ts` reste un
 * fichier de données sans dépendance : `sound.tsx` importe ce type, jamais
 * l'inverse.
 *
 * **Il n'y a plus que deux entrées, et c'est un choix de montage, pas une
 * limite de l'outil** : `whoosh`, `ding`, `impact`, `pop`, `sweep`, `swipe` et
 * `tick` ont été **retirés du film le 2026-10-13** (sur demande : ils ne
 * plaisaient pas). Le script sait toujours les fabriquer — la recette de chacun
 * est intacte, seul le montage n'en veut plus ; comme `config.services` en
 * compte six pour trois bénéfices, la caisse à outils est plus large que ce
 * qu'on monte. Les remettre = ajouter leur nom ici, dans `SFX_FILES`
 * (`src/sound.tsx`) et dans `MONTES` (`scripts/make-audio.mjs`).
 */
export type SfxName = "click" | "sparkle";

/**
 * Clés des photos du film — les fichiers et leurs crédits sont dans
 * `reel/src/images.ts` (+ `reel/public/images/CREDITS.md`).
 *
 * Le type est déclaré **ici** pour que le catalogue de services ci-dessous reste
 * typé sans que `config.ts` importe quoi que ce soit.
 */
export type PhotoKey =
  | "hero"
  | "ctaOffice"
  | "webSite"
  | "appCode"
  | "designUi"
  | "workSite"
  | "workShop"
  | "workDashboard";

/** Un service = une entrée du catalogue. `benefitIds` pioche dedans par `id`. */
export type Service = {
  id: string;
  tag: string;
  title: string;
  claim: string;   // la phrase « bénéfice » (celle qui s'affiche en gros)
  detail: string;  // la précision du site (description réelle)
  icon: IconName;
  /** Photo d'illustration de la carte — `null` = dégradé de remplacement. */
  photo: PhotoKey | null;
};

export type BenefitSlide = { service: Service; index: number };

/** Les types de scène du film. L'ordre réel est donné par `scenes.plan` (§5). */
export type SceneKind =
  | "intro"
  | "hook"
  | "benefit"
  | "gallery"
  | "stats"
  | "tech"
  | "cta";

/** Transitions disponibles pour une frontière entre deux scènes (§5.2). */
export type TransitionKind = "fade" | "glide" | "wipe";

/** Une ligne de chiffres : un **compteur** animé, ou un **jeton** textuel. */
export type StatItem =
  | { kind: "count"; to: number; suffix: string; label: string; detail: string }
  | { kind: "token"; value: string; label: string; detail: string };

/** Une carte de la scène « Réalisations ». */
export type WorkItem = { photo: PhotoKey | null; label: string; caption: string };

/**
 * Forme complète de la configuration. Les champs sont des `string` (jamais des
 * littéraux) : c'est précisément ce qui permet aux déclinaisons de réécrire un
 * texte sans casser le typage.
 */
export type ReelConfig = {
  meta: { id: string; fps: number; width: number; height: number; durationInFrames: number };
  brand: { name: string; handle: string; url: string; logo: string; logoMode: "pille" | "light" };
  colors: {
    bg: string; surface: string; text: string; muted: string;
    line: string; accent: string; accentSoft: string; onAccent: string;
  };
  fonts: {
    heading: string; body: string;
    weightHeading: number; weightTitle: number; weightBody: number;
  };
  safeArea: { top: number; bottom: number; left: number; right: number };
  motion: {
    /** Courbe du site : `cubicBezier(0.16, 1, 0.3, 1)` (constante `expo` de Services.tsx). */
    expo: [number, number, number, number];
    smooth: SpringConfig;
    pop: SpringConfig;
    staggerFrames: number;
    /** Vitesse des bandeaux défilants, en **pixels par seconde**. */
    marqueeSpeed: number;
  };
  transitions: {
    /** Durée **commune** des chevauchements : §5.1 exige qu'ils soient égaux. */
    frames: number;
    /** Course du glissement latéral, en pixels — elle doit tenir dans la marge sûre (§5.1). */
    slideDistance: number;
  };
  /**
   * Le son du film. `music` à `null` = film muet (le montage reste valide) ; les
   * niveaux des effets vivent dans `src/sound.tsx` (`SFX_VOLUMES`), pas ici.
   *
   * **Il n'y a plus de `transitionSfx`** : les huit passages entre scènes étaient
   * sonorisés par `whoosh` / `swipe` / `sweep`, les trois effets retirés du film
   * le 2026-10-13. Une transition se fait donc **au silence**, ce qui n'est pas
   * un oubli — c'est l'état demandé.
   */
  sound: {
    music: null | { src: string; volume: number };
  };
  scenes: {
    /** Ordre réel des scènes du film — c'est lui qui décide de tout (§5.1). */
    plan: SceneKind[];
    /** Une durée par type de scène ; un `benefit` par entrée de `benefitIds`. */
    durations: Record<SceneKind, number>;
    /** Une transition par **frontière** : exactement `plan.length − 1` entrées (§5.1). */
    transitions: TransitionKind[];
    hook: { kicker: string; titleLines: string[]; accentWord: string; underline: string };
    /** 3 `id` du catalogue `services` = les 3 bénéfices du film. */
    benefitIds: string[];
    gallery: { kicker: string; title: string; items: WorkItem[] };
    stats: { kicker: string; title: string; items: StatItem[]; footnote: string };
    tech: { kicker: string; title: string; rows: string[][]; footnote: string };
    cta: { title: string; subtitle: string; button: string; hint: string };
  };
  services: Service[];
};

export const config: ReelConfig = {
  /**
   * Cadre de diffusion : **horizontal 1920×1080**, celui d'une section du site.
   * Le poids et la durée se vérifient sur le fichier rendu (`ffprobe`, §8) —
   * changer une de ces quatre valeurs sans re-mesurer, c'est publier autre chose
   * que ce que la section attend.
   */
  meta: {
    id: "Reel",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 900, // 30,000 s exactement
  },

  brand: {
    name: "Jtnova",
    handle: "@jtnova",
    url: "jtnova.mg",
    logo: "logo.png",
    /** "light" = wordmark clair ; "pille" = logo sombre sur pastille claire (comme le site). */
    logoMode: "pille" as "pille" | "light",
  },

  /** Couleurs reprises de `src/app/globals.css` (thème sombre = celui du reel). */
  colors: {
    bg: "#070d1a",
    surface: "#0d1829",
    text: "#e8f4f8",
    muted: "#6b8ca8",
    line: "rgba(0, 180, 216, 0.12)",
    accent: "#00b4d8", // = --color-accent, réglable par l'admin (identity.accent_color)
    accentSoft: "rgba(0, 180, 216, 0.16)",
    onAccent: "#070d1a",
  },

  fonts: {
    heading: "Outfit",
    body: "Outfit",
    weightHeading: 800,
    weightTitle: 700,
    weightBody: 400,
  },

  /**
   * Marges sûres du **placement web** (v3) : le film est posé dans une section,
   * pas dans l'interface d'Instagram — il n'y a donc plus de bandes d'interface à
   * éviter. Ce qu'on garde, ce sont les **bords** : 110 px de chaque côté pour que
   * la largeur utile (1 700 px) reste confortable même si la section est rognée,
   * et 90 px en haut et en bas — le haut laisse la place au logo de marque
   * (pastille de 240 × 110 posée à `safe.left` / `safe.top`).
   */
  safeArea: { top: 90, bottom: 90, left: 110, right: 110 },

  motion: {
    expo: [0.16, 1, 0.3, 1],
    smooth: { damping: 200, mass: 1, stiffness: 100 } as SpringConfig, // sans rebond
    pop: { damping: 12, mass: 0.7, stiffness: 190 } as SpringConfig,    // avec rebond
    staggerFrames: 3,   // décalage entre deux lignes / deux pictos
    /* 90 px/s : les puces de la scène « Technologies » traversent la zone sûre
       en ~10 s. Plus vite, on ne lit plus les noms ; plus lent, le bandeau a
       l'air figé (constaté en Studio à 40 px/s). */
    marqueeSpeed: 90,
  },

  transitions: {
    /* Une **seule** durée pour les sept chevauchements : §5.1 impose qu'ils soient
       égaux, sinon la somme ne tombe plus sur 900 images (critères A1/A2). Changer
       cette valeur oblige à recalculer `meta.durationInFrames` — `getReelConfig`
       refuse de toute façon de rendre un film dont le total ne correspond pas. */
    frames: 12,
    /* Course du glissement latéral : **courte**, pour que la zone sûre tienne
       pendant la transition elle-même. La ligne la plus large d'une scène de
       bénéfice mesure 770 px (`png-bounds` : x = 154 → 924) ; centrée, elle
       dispose de 468 px de chaque côté, soit **83 px** de marge. 40 px laisse donc
       43 px de rab, là où le `slide()` pleine largeur sortait du cadre
       (`écarts.gauche = -72 px`, mesuré). */
    slideDistance: 40,
  },

  /**
   * Le son, tranché le 2026-10-13 (voir `docs/REEL-REMOTION.md` §10) : la musique
   * et les effets sont **synthétisés** par `scripts/make-audio.mjs`, donc sans
   * licence ni crédit à tenir. `music.volume` est le seul réglage de la nappe ;
   * les effets se règlent dans `src/sound.tsx`.
   *
   * **Le film ne monte que deux effets** (`click`, `sparkle`) et **aucun son sur
   * les transitions** : le 2026-10-13, sept effets ont été retirés du montage sur
   * demande — ils restent dans la caisse à outils du script, pas dans le film.
   */
  sound: {
    /*
     * **0,60**, et ce n'est plus un réglage de sécurité mais de présence.
     *
     * Le niveau était contraint tant que le mixage portait les effets : sept
     * effets ont été retirés du film le 2026-10-13, dont `impact`, qui était le
     * pic le plus fort de tout le montage. La marge qu'ils occupaient revient
     * donc à la seule source qui reste — mais elle restait réglée à **0,38**,
     * valeur choisie pour cohabiter avec eux : le film sonnait 4 dB plus faible
     * que nécessaire, sans que personne ne l'ait demandé.
     *
     * **Chiffres, calculés hors ligne en additionnant les trois sources** (la
     * nappe, `click` à 34/30 s, `sparkle` à 2/30 s — les positions réelles du
     * montage), pas estimés : à 0,60 le film donne **RMS 0,170** (−15,4 dBFS)
     * pour un **pic source de 0,492**, soit **6,2 dB de marge**. La simulation
     * reproduit le film livré au millième (RMS 0,1080 calculé contre 0,1078
     * mesuré à 0,38), donc le calcul est fiable.
     *
     * À ne **pas** confondre avec deux lectures trompeuses, toutes deux
     * expliquées : (1) le **pic décodé** du mp4 est à **t = 0,00008 s**, sur la
     * **première trame AAC**, là où la nappe est encore muette (fondu d'entrée) —
     * c'est l'amorçage de l'encodeur, pas le mixage, dont le pic réel est
     * 0,372 ; (2) un rendu de **46 images** décode à 1,000, mais le **même
     * segment rendu sans la prop `scene`** donne exactement la même lecture au
     * même débit (317 kb/s) : c'est le remplissage de trames d'un clip de 1,5 s.
     */
    music: { src: "audio/music-bed.wav", volume: 0.6 },
  },

  scenes: {
    /**
     * Plan de montage — **neuf scènes** (§5). Le premier `benefit` prend le
     * premier `id` de `benefitIds`, le deuxième le second, etc.
     */
    plan: [
      "intro",
      "hook",
      "benefit",
      "benefit",
      "benefit",
      "gallery",
      "stats",
      "tech",
      "cta",
    ],

    /** Durées « pellicule » : la durée visible est amputée des chevauchements (§5.1). */
    durations: {
      intro: 66,    // 2,20 s — logo au centre, curseur, clic
      hook: 114,    // 3,80 s
      benefit: 108, // 3,60 s — × 3
      gallery: 138, // 4,60 s
      stats: 132,   // 4,40 s — la note de bas de scène a besoin de temps (voir plus bas)
      tech: 108,    // 3,60 s
      cta: 114,     // 3,80 s
    },

    /*
     * Pourquoi 132 pour « chiffres » et 114 pour le CTA : la note de bas de scène
     * des chiffres n'entre qu'après le **dernier** compteur (image 76) et doit
     * rester lisible **avant** que le fondu ne commence. Le CTA, lui, a fini ses
     * quatre gestes à l'image 62 sur 114 — il en avait beaucoup trop. Six images
     * ont donc été déplacées de l'un à l'autre, sans changer le total (§5.1).
     */

    /**
     * Une transition par frontière, dans l'ordre du film :
     * intro→hook fondu, hook→b1 fondu, b1→b2 **glissement**, b2→b3 fondu,
     * b3→réalisations **balayage** (rideau), réalisations→chiffres fondu,
     * chiffres→technologies **glissement**, technologies→CTA fondu.
     *
     * Le glissement reste réservé aux passages entre deux scènes bâties pareil
     * (deux bénéfices, deux blocs de contenu dense) ; le balayage marque l'entrée
     * dans la galerie photo. L'intro, elle, ne prend **pas** de balayage : elle
     * n'entre pas en scène, elle s'efface devant le hook.
     */
    transitions: ["fade", "fade", "glide", "fade", "wipe", "fade", "glide", "fade"],

    hook: {
      kicker: "Nos services",
      /** Une entrée = une ligne à l'écran. */
      titleLines: ["Ce que nous", "construisons", "pour vous"],
      /** Mot mis en avant (couleur accent) — doit exister dans titleLines. */
      accentWord: "construisons",
      underline: "6 expertises, un seul partenaire.",
    },

    benefitIds: ["web", "app", "design"],

    gallery: {
      kicker: "Réalisations",
      title: "Des projets qui travaillent pour vous",
      items: [
        {
          photo: "workSite",
          label: "Site vitrine",
          caption: "Rapide, clair, trouvé sur Google",
        },
        {
          photo: "workShop",
          label: "Boutique en ligne",
          caption: "Paiement sécurisé, stocks et commandes suivis",
        },
        {
          photo: "workDashboard",
          label: "Tableau de bord",
          caption: "Vos chiffres, en un coup d'œil",
        },
      ],
    },

    stats: {
      kicker: "En chiffres",
      title: "Ce que ça change pour vous",
      /* Les trois repères reprennent des engagements **déjà écrits sur le site**
         (devis 48 h, 6 expertises, accompagnement de A à Z) : rien n'est
         inventé ici. Une déclinaison peut les réécrire. */
      items: [
        {
          kind: "count",
          to: 48,
          suffix: " h",
          label: "Devis chiffré",
          detail: "à partir de votre brief",
        },
        {
          kind: "count",
          to: 6,
          suffix: "",
          label: "Expertises réunies",
          detail: "web, app, design, commerce, SEO, conseil",
        },
        {
          kind: "token",
          value: "A → Z",
          label: "Accompagnement",
          detail: "de l'idée à la mise en ligne",
        },
      ],
      footnote: "Un seul partenaire, du premier croquis à la mise en ligne.",
    },

    tech: {
      kicker: "Technologies",
      title: "Des outils éprouvés",
      /** Deux bandeaux qui défilent en **sens opposés**. */
      rows: [
        ["Next.js", "React", "TypeScript", "Tailwind", "Node.js", "PostgreSQL"],
        ["Figma", "Supabase", "Vercel", "Stripe", "Git", "Vite"],
      ],
      footnote: "Pas d'effet de mode : ce qui tient en production.",
    },

    cta: {
      title: "Parlons de votre projet",
      subtitle: "Devis en 48 h · accompagnement de A à Z",
      button: "jtnova.mg",
      hint: "Faites défiler pour en savoir plus",
    },
  },

  /** Les 6 services réels du site (textes identiques à Services.tsx). */
  services: [
    { id: "web", tag: "Web", title: "Création de sites web", icon: "browser", photo: "webSite",
      claim: "Des sites qui convertissent",
      detail: "Sites vitrine, landing pages et portails web modernes, rapides et responsive, optimisés pour convertir." },
    { id: "app", tag: "Dev", title: "Applications web", icon: "code", photo: "appCode",
      claim: "Des outils sur mesure",
      detail: "Développement d'applications web sur mesure avec React, Next.js et Node.js pour automatiser vos processus." },
    { id: "design", tag: "Design", title: "Design UI/UX", icon: "design", photo: "designUi",
      claim: "Des interfaces claires",
      detail: "Conception d'interfaces intuitives et esthétiques sous Figma, centrées sur l'expérience utilisateur." },
    { id: "ecommerce", tag: "Commerce", title: "E-commerce", icon: "cart", photo: "workShop",
      claim: "Vendez en ligne sereinement",
      detail: "Boutiques en ligne performantes avec gestion produits, paiements sécurisés et tableaux de bord analytiques." },
    { id: "seo", tag: "SEO", title: "Optimisation & SEO", icon: "bolt", photo: "workDashboard",
      claim: "Soyez trouvé, vite",
      detail: "Audit de performance, Core Web Vitals, référencement naturel pour améliorer votre visibilité en ligne." },
    { id: "conseil", tag: "Conseil", title: "Conseil & Accompagnement", icon: "chat", photo: "hero",
      claim: "Un cap, de A à Z",
      detail: "Stratégie digitale, choix technologiques et accompagnement de A à Z pour concrétiser votre vision." },
  ],
};

/**
 * Surcharge partielle d'une déclinaison : on ne réécrit que ce qui change.
 * `plan`, `durations` et `transitions` sont volontairement **hors** surcharge en
 * v2 : la variante change le **contenu**, pas le montage (§4.1). Un jour où une
 * variante devra durer moins longtemps, il faudra les y ajouter — et la somme
 * §5.1 sera recalculée par `timelineOf`, pas recopiée.
 */
export type ReelVariant = {
  meta?: { id: string; durationInFrames?: number };
  brand?: Partial<ReelConfig["brand"]>;
  colors?: Partial<ReelConfig["colors"]>;
  scenes?: {
    hook?: Partial<ReelConfig["scenes"]["hook"]>;
    benefitIds?: string[];
    gallery?: Partial<ReelConfig["scenes"]["gallery"]>;
    stats?: Partial<ReelConfig["scenes"]["stats"]>;
    tech?: Partial<ReelConfig["scenes"]["tech"]>;
    cta?: Partial<ReelConfig["scenes"]["cta"]>;
  };
};

/** Déclinaisons prêtes : `npx remotion render Reel out/<id>.mp4 --props=…` */
export const variants: Record<string, ReelVariant> = {
  services: {}, // le film par défaut
  ecommerce: {
    meta: { id: "Reel-ecommerce" },
    scenes: {
      benefitIds: ["ecommerce", "seo", "design"],
      hook: { kicker: "E-commerce", underline: "5 étapes, un seul partenaire." },
      gallery: {
        kicker: "Boutiques livrées",
        title: "Des boutiques qui vendent",
        items: [
          { photo: "workShop", label: "Boutique en ligne", caption: "Paiement sécurisé, stocks, commandes" },
          { photo: "workSite", label: "Vitrine produit", caption: "Des fiches qui donnent envie d'acheter" },
          { photo: "workDashboard", label: "Suivi des ventes", caption: "Panier moyen et stocks, en direct" },
        ],
      },
      stats: {
        kicker: "En chiffres",
        title: "Ce que ça change pour vous",
        items: [
          { kind: "count", to: 48, suffix: " h", label: "Devis chiffré", detail: "à partir de votre catalogue" },
          { kind: "count", to: 5, suffix: "", label: "Étapes, une équipe", detail: "du catalogue à la première vente" },
          { kind: "token", value: "A → Z", label: "Accompagnement", detail: "de l'idée à la mise en ligne" },
        ],
      },
      cta: { title: "Ouvrez votre boutique", button: "jtnova.mg/ecommerce" },
    },
  },
};

/**
 * Découpage réel du film : durée de chaque scène, chevauchements et total (§5.1).
 *
 * `TransitionSeries` **soustrait** chaque chevauchement :
 * `total = Σ durées de scène − (nb de scènes − 1) × transitions.frames`.
 * Pour le film par défaut (v3, horizontal) :
 * `66 + 114 + 108×3 + 138 + 132 + 108 + 114 = 996`, moins `8 × 12 = 96` → **900**
 * images (30,000 s à 30 fps).
 *
 * `starts` donne les positions réelles des scènes dans le film — celles de §5.1
 * (`0 / 54 / 156 / 252 / 348 / 444 / 570 / 690 / 786`), qui servent à relire une
 * scène au bon endroit **et** à dater le fond photo et le coup de lumière.
 */
export function timelineOf(conf: Pick<ReelConfig, "scenes" | "transitions">) {
  const { plan, durations, benefitIds } = conf.scenes;
  const { frames: overlap } = conf.transitions;

  const sceneDurations = plan.map((kind) =>
    kind === "benefit" ? durations.benefit : durations[kind],
  );
  void benefitIds;

  const starts: number[] = [];
  let cursor = 0;
  sceneDurations.forEach((duration, index) => {
    starts.push(cursor);
    cursor += duration - (index < sceneDurations.length - 1 ? overlap : 0);
  });

  const scenes = sceneDurations.reduce((sum, duration) => sum + duration, 0);
  const overlaps = overlap * (sceneDurations.length - 1);
  return { starts, sceneDurations, scenes, overlaps, total: scenes - overlaps };
}

/** Les six types de scène connus — sert au contrôle de `plan`. */
const KINDS: SceneKind[] = ["intro", "hook", "benefit", "gallery", "stats", "tech", "cta"];
const TRANSITIONS: TransitionKind[] = ["fade", "glide", "wipe"];

/**
 * Contrôle du plan de montage. Rassemblé ici pour que `getReelConfig` reste
 * lisible, et pour qu'un message d'erreur dise **quoi** corriger.
 */
function checkScenes(conf: ReelConfig) {
  const { plan, transitions, benefitIds } = conf.scenes;

  const unknown = plan.find((kind) => !KINDS.includes(kind));
  if (unknown) {
    throw new Error(
      `Type de scène inconnu dans scenes.plan : « ${String(unknown)} » — connus : ${KINDS.join(", ")}.`,
    );
  }
  const count = (kind: SceneKind) => plan.filter((k) => k === kind).length;
  if (count("hook") !== 1 || count("cta") !== 1) {
    throw new Error(
      `Le film doit avoir exactement une scène « hook » et une « cta », scenes.plan en compte ${count("hook")} et ${count("cta")}.`,
    );
  }
  /* L'intro est **l'ouverture** : elle n'a de sens qu'une fois, et en premier.
     Ailleurs dans le plan, son logo centré et son curseur se liraient comme une
     scène de plus, pas comme un générique d'entrée. */
  if (count("intro") > 1 || (count("intro") === 1 && plan[0] !== "intro")) {
    throw new Error(
      `La scène « intro » doit être unique et placée en premier (scenes.plan en compte ${count("intro")}, première scène = « ${String(plan[0])} »).`,
    );
  }
  /* Égalité, pas « au moins » : `timelineOf` déduit le total du nombre de scènes,
     donc une scène de trop ferait déclarer à la composition plus d'images que
     l'assemblage n'en joue — la fin du film serait vide. */
  if (count("benefit") !== benefitIds.length) {
    throw new Error(
      `scenes.plan déclare ${count("benefit")} scène(s) de bénéfice pour ${benefitIds.length} ` +
        `identifiant(s) dans benefitIds — les deux doivent coïncider (plan §5).`,
    );
  }
  if (transitions.length !== plan.length - 1) {
    throw new Error(
      `Il faut une transition par frontière : ${plan.length} scènes ⇒ ${plan.length - 1} transitions, ` +
        `scenes.transitions en compte ${transitions.length}.`,
    );
  }
  const unknownTransition = transitions.find((kind) => !TRANSITIONS.includes(kind));
  if (unknownTransition) {
    throw new Error(
      `Transition inconnue dans scenes.transitions : « ${String(unknownTransition)} » — connues : ${TRANSITIONS.join(", ")}.`,
    );
  }
}

/** Fusionne le socle et une déclinaison. `benefits` en sort déjà résolus. */
export function getReelConfig(name: keyof typeof variants = "services") {
  const v = variants[name];
  /* Un nom inconnu **plante** au lieu de retomber silencieusement sur le film
     par défaut : la prop `variant` vient de la ligne de commande
     (`--props='{"variant":"ecommerce"}'`), où une faute de frappe produirait
     sinon une autre pub que celle demandée, sans le moindre avertissement. */
  if (!v) {
    throw new Error(
      `Déclinaison inconnue : « ${String(name)} » — connues : ${Object.keys(variants).join(", ")}.`,
    );
  }
  const merged: ReelConfig = {
    ...config,
    meta: { ...config.meta, ...v.meta },
    brand: { ...config.brand, ...v.brand },
    colors: { ...config.colors, ...v.colors },
    scenes: {
      ...config.scenes,
      ...v.scenes,
      hook: { ...config.scenes.hook, ...v.scenes?.hook },
      gallery: { ...config.scenes.gallery, ...v.scenes?.gallery },
      stats: { ...config.scenes.stats, ...v.scenes?.stats },
      tech: { ...config.scenes.tech, ...v.scenes?.tech },
      cta: { ...config.scenes.cta, ...v.scenes?.cta },
      benefitIds: v.scenes?.benefitIds ?? config.scenes.benefitIds,
    },
  };

  checkScenes(merged);

  const benefits: BenefitSlide[] = merged.scenes.benefitIds.map((id, index) => {
    const service = config.services.find((s) => s.id === id);
    if (!service) throw new Error(`Service inconnu dans benefitIds : ${id}`);
    return { service, index };
  });

  const timing = timelineOf(merged);
  /* §5.1 : la durée déclarée doit être **le total calculé**. Toucher à une durée
     de scène ou à un chevauchement sans recalculer `meta.durationInFrames`
     produirait un film plus long ou plus court que ce qu'annoncent A1 et A2 — on
     refuse de le rendre, plutôt que de livrer un « 30 s » qui n'en fait pas 30. */
  if (timing.total !== merged.meta.durationInFrames) {
    throw new Error(
      `Arithmétique des durées fausse (plan §5.1) : ${timing.scenes} − ${timing.overlaps} = ${timing.total} images, alors que meta.durationInFrames = ${merged.meta.durationInFrames}.`,
    );
  }

  return { ...merged, benefits, timing };
}
```

### 4.1 Props de la composition

`Root.tsx` déclare **une seule** composition, avec trois props (`variant` et `debug`
étant fournies par défaut, `scene` restant absente tant qu'on regarde le film) :

| Prop | Type | Rôle |
|---|---|---|
| `variant` | `keyof typeof variants` (défaut `"services"`) | choisit la déclinaison, résolue par `getReelConfig()` — **branchée en E9** : les `meta` de la variante sont résolues par `calculateMetadata`, un nom inconnu plante |
| `debug` | `boolean` (défaut `false`) | affiche le guide de zones sûres et les repères de frames |
| `scene` | `"hook" \| "benefit-1" \| "benefit-2" \| "benefit-3" \| "gallery" \| "stats" \| "tech" \| "cta"` (défaut : absent = le film) | **relecture** : joue une seule scène, dans une `Sequence` `layout="none"`, donc avec **exactement les images locales** de l'assemblage. Sert aux images fixes de revue (`--props='{"scene":"benefit-2"}'`) et à la relecture dans le Studio. Les **8** scènes y sont. Depuis E7, le filet de progression **et le fond photo** y sont posés au **départ réel de la scène** dans le film (`timing.starts`, §5.1) : l'image relue est alors **au pixel près** celle de l'assemblage — vérifié au md5 sur les 5 scènes d'origine **et** sur la variante e-commerce. |

`calculateMetadata` lit `getReelConfig(variant)` et renvoie ses `meta` réelles
(`durationInFrames`, `fps`, `width`, `height`). C'est ce qui garantit A1 et A2 : la
durée déclarée est **le total calculé**, et `ffprobe` vérifie ensuite qu'il vaut bien
30,000 s — une erreur d'arithmétique de transitions est donc impossible à livrer.

**Règle de conception** : aucune couleur, aucun texte métier n'est écrit dans un
composant. Changer un mot = changer `config.ts` (ou une variante), relancer le rendu.

---

## 5. Storyboard

| # | Scène | Durée pellicule | Visible de → à | Contenu |
|---|---|---|---|---|
| 1 | `intro` | 66 i. (2,2 s) | **0 → 1,8 s** | **Le logo au centre du cadre**, entré en ressort `pop`, entouré de deux **balises pulsées** (des cadres arrondis qui épousent la pastille : « c'est cliquable » sans un mot) ; un **curseur** entre par la droite en courbe `expo` et **clique** le logo à l'image 34 — la pastille s'enfonce de 4,5 % puis remonte, une **onde** part du point cliqué, et une **lueur d'accent** reste allumée ; le curseur s'écarte et s'efface ; le logo de marque (coin haut-gauche) **n'apparaît qu'après le clic** — dix images plus tard, sinon deux logos se répondraient dans la même image |
| 2 | `hook` | 114 i. (3,8 s) | **1,8 → 5,2 s** | Sur-titre « Nos services » (pastille + point accent qui respire) ; titre en **3 lignes** (« Ce que nous / construisons / pour vous » — le découpage évite un « vous » orphelin à 104 px ; en 16:9 la largeur utile fait 1 700 px, la colonne de titre reste à 900), entrée **spring** ligne par ligne (montée 40 px + flou 8 px → 0, décalage 3 i.) doublée d'une **révélation par masque** ; mot « construisons » en **couleur accent**, balayé au pinceau puis **halo qui respire** ; filet sous le titre (52) ; **sommaire** des trois bénéfices (pastilles « Web », « Dev », « Design ») à partir de 76 — il annonce la suite ; départs resserrés de 4 à 8 images par rapport à la v2, l'intro ayant pris 66 images au film |
| 3 | `benefit` (Web) | 108 i. (3,6 s) | **5,2 → 8,4 s** | **Carte photo** (`web-site.jpg`) révélée en diagonale, en **ken burns**, traversée d'un **reflet** ; numéro « 01 » incrusté ; pictogramme du service en **pastille qui déborde** le coin bas-gauche ; tag (« Web »), titre, phrase-bénéfice, description courte ; entrée par **fondu** |
| 4 | `benefit` (Dev) | 108 i. (3,6 s) | **8,4 → 11,6 s** | Idem, « 02 », photo `app-code.jpg`, **glissement latéral** court (40 px, `transitions/glide.tsx`) à l'entrée |
| 5 | `benefit` (Design) | 108 i. (3,6 s) | **11,6 → 14,8 s** | Idem, « 03 », photo `design-ui.jpg` |
| 6 | `gallery` | 138 i. (4,6 s) | **14,8 → 19,0 s** | Sur-titre « Réalisations », titre, puis **carrousel de 3 projets** (site vitrine, boutique, tableau de bord) : chaque carte se découvre par la droite pendant que la précédente sort, **libellé et légende posés sur la photo** dans son voile sombre, repère de position sous la carte. Entrée par **balayage** (`transitions/wipe.tsx`) |
| 7 | `stats` | 132 i. (4,4 s) | **19,0 → 23,0 s** | Sur-titre « En chiffres », titre, puis **trois repères** : **48 h** et **6** en **compteurs** animés (avec le trait de mesure qui se remplit *avec* le chiffre) puis **A → Z** découvert par un masque ; note de bas de scène |
| 8 | `tech` | 108 i. (3,6 s) | **23,0 → 26,2 s** | Sur-titre « Technologies », titre, puis **deux bandeaux qui défilent en sens opposés** (Next.js, React, TypeScript, Tailwind, Node.js, PostgreSQL / Figma, Supabase, Vercel, Stripe, Git, Vite), rognés à la zone sûre et fondus sur les bords |
| 9 | `cta` | 114 i. (3,8 s) | **26,2 → 30,0 s** | Fond photo plein cadre (`cta-office.jpg`), logo (pastille claire), « Parlons de votre projet », sous-titre devis 48 h, pastille bouton `jtnova.mg` **avec anneaux pulsés et reflet qui la traverse**, mention « Faites défiler » + chevron qui respire |

Décor constant sur les 30 s : `#070d1a` + deux halos cyan très diffus qui **dérivent**
(deux fois plus longs que le film : on ne les voit pas bouger, on voit que le fond
vit) + grille discrète + **grain animé**. Par-dessus, une couche **photo de fond**
plein cadre sur le hook et le CTA, à **30 % d'opacité sous un voile sombre** —
suffisamment présente pour donner de la matière, suffisamment sombre pour que le
texte garde son contraste et pour que la mesure A4 continue de ne voir que lui.
**Rien ne reste fixe en bas depuis la v3** : le pied de page `jtnova.mg` et le filet
de progression segmenté ont été **retirés** à la demande (l'adresse est déjà dans le
bouton du CTA, et un pied fixe tirait l'œil en fin de film). Le **logo de marque** est
posé en haut à gauche, dans la marge sûre — comme dans la barre du site — et **hors
du flux** : le contenu des scènes reste centré au centre exact du cadre, le logo ne
déplace pas ce centre (il apparaît après le clic de l'intro, cf. scène 1).

**Départs réels, calculés et vérifiés** : `0 / 54 / 156 / 252 / 348 / 444 / 570 /
690 / 786` — ce sont les `starts` de `timelineOf()` (§5.1), ceux qui servent au fond
photo, au coup de lumière et à la relecture d'une scène. L'identité de rendu de E7
(une image du film est **au pixel près** celle de la scène relue, à son décalage
près) tient toujours : le fond photo est lui aussi indexé sur ces départs.

> **Glissement court : la zone sûre tient aussi *pendant* la transition.**
> `slide()` de `@remotion/transitions` déplace la scène sur **toute la largeur** :
> le contenu traversait la marge latérale et se faisait couper par le bord du
> cadre (mesuré avant correction : `écarts.gauche = -72 px`, les deux scènes
> coupées en deux au milieu du mouvement). Il est remplacé par
> `reel/src/transitions/glide.tsx` — même durée (12 i.), mêmes `AbsoluteFill`,
> mais une course de **40 px** (`transitions.slideDistance`) et une **remise
> séquentielle** : la scène qui sort s'éteint sur la première moitié, celle qui
> entre s'allume sur la seconde, chacune parcourant ses 40 px **pendant qu'elle
> est visible**. Le fondu croisé symétrique, essayé d'abord, superposait deux
> mises en page identiques (le « 01 » et le « 02 » se doublaient en « 072 »,
> images 178-182) : ce n'est pas un réglage à corriger, c'est la nature d'un
> fondu croisé sur deux scènes bâties pareil. **Mesuré sur les six images du
> glissement** (`--luma=60 --band=400:1500`, seuil assez bas pour voir le texte
> à 20 % d'opacité) : `toutDansLaZoneSure: true` à chaque image, marge restante
> minimale **43 px** — et les bandes haut/bas de la plateforme restent intactes
> (`haut 0 / bas 11`) comme partout ailleurs.

> Le **logo** de la dernière ligne n'est pas un élément de `CtaEnd` : c'est une **couche
> permanente** de l'assemblage (`Reel.tsx`), déjà affichée au-dessus de chaque scène.
> La scène 5 n'en rend pas un second — sinon l'image finale montrerait **deux**
> logos (et une scène autonome ne peut pas savoir ce que l'assemblage affiche déjà).

### 5.1 Arithmétique des durées (à ne pas casser)

`TransitionSeries` **soustrait** chaque chevauchement de la durée totale :
Total = Σ durées de scène − Σ chevauchements.

```
66 + 114 + 108 + 108 + 108 + 138 + 132 + 108 + 114 = 996 images
8 transitions × 12 images                          =  96 images
996 − 96                                            = 900 images  ✔ = 30,000 s à 30 fps
```

Toute retouche d'une durée ou d'un chevauchement **doit** recalculer cette somme :
c'est le critère d'acceptation n° 1 (§8). Le tableau ci-dessus est la conséquence
directe de ce calcul (positions réelles : `0 / 54 / 156 / 252 / 348 / 444 / 570 /
690 / 786`).

**En v3, l'intro ne rallonge pas le film.** Elle prend ses 66 images sur les autres
scènes, et le partage a été fait **au cas par cas, pas au prorata** : 18 images au
hook (132 → 114), 12 à la galerie (150 → 138), 6 aux technologies (114 → 108), 24 à
l'intro elle-même… et **un échange** entre les deux dernières scènes — `cta` rend 12
images (126 → 114) dont **6 seulement** vont à `stats` (120 → 132 n'est pas un
demi-échange, c'est un besoin mesuré). Pourquoi : la note de bas de scène des
chiffres n'entre qu'après le dernier compteur (image 76) et n'avait plus, avec
120 images, que **3 images** de visibilité pleine avant le fondu de sortie. Le CTA,
lui, a fini ses quatre gestes à l'image 62 sur 114 : il en avait trop.

Depuis la v2, c'est **le plan de montage qui décide** : `scenes.plan` donne l'ordre, et la
somme se déduit du nombre de scènes. `getReelConfig` refuse de rendre le film si
l'un des trois contrôles ne passe pas (§4) — durée totale ≠ `meta.durationInFrames`,
nombre de scènes de bénéfice ≠ `benefitIds`, ou nombre de transitions ≠ nombre de
frontières. Un film dont les durées ne tombent pas juste ne peut donc **pas** être
livré, plutôt que d'être livré avec un « 30 s » qui n'en fait pas 30.

### 5.2 Motion — valeurs alignées sur le site

- Courbe du site (constante `expo` de `Services.tsx`) : `Easing.bezier(0.16, 1, 0.3, 1)`
  → utilisée pour les fondus et les filets.
- Entrées : `spring({ frame, fps, config: smooth })` (sans rebond) pour le titre ;
  `pop` (léger rebond) réservé au bouton CTA et au numéro de bénéfice.
- Cascade : `staggerFrames: 3` entre les lignes du titre, ~2 s pour les pictos.
- **Balayage du mot accentué** (scène 1) : `Easing.inOut(Easing.quad)`, **pas** la courbe
  `expo` — celle-ci atteint 90 % de sa course en 4 images, ce qui donne un pinceau qui
  saute au lieu d'un pinceau qui balaie. L'`expo` reste sur les filets et la précision.
- Sorties : fondu 12 images, jamais de sortie brutale (coupe sèche = amateur).
- **Un seul geste accentué à la fois** (revue du 2026-10-13, reprise en v2) : le filet
  du hook n'entre qu'**après** la fin du balayage (balayage fini à l'image 48 → filet à
  56, précision à 66), et la précision d'un bénéfice n'entre qu'**après** que la
  phrase-bénéfice soit posée (image 52, hors cascade). Deux mouvements cyan simultanés,
  ou une phrase encore floue au-dessus d'une précision déjà nette, se lisent mal à 9:16 :
  l'œil ne sait pas où se poser. Le **sommaire** du hook ne commence qu'à 84, une fois
  le titre et sa précision posés, et un **balayage** de galerie ne se lève qu'une fois la
  scène précédente éteinte (voir ci-dessous).
- **Vocabulaire de mouvement v2** — tout est défini une seule fois dans `theme.ts`, sous
  forme de progressions `0 → 1` que les scènes alimentent avec `useCurrentFrame()` :

| Geste | Où | Ce qu'il fait |
|---|---|---|
| Ken burns | toutes les photos | zoom très lent (1,16 → 1,02) et dérive verticale : personne ne « voit » le mouvement, tout le monde voit que l'image vit |
| Masque (`clip-path`) | titres, cartes photo | révélation en diagonale / par le haut / par la gauche — jamais de `width` animé, donc aucun reflux de mise en page en cours de rendu |
| Reflet | cartes photo, bouton du CTA | bande diagonale claire qui **traverse** la surface (22 % de blanc), bouclée toutes les 44 images sur le bouton |
| Coup de lumière | global, à l'ouverture de chaque scène | bande large, inclinée, qui traverse tout le cadre en 12 images (7 % de blanc maximum : la mesure A4 n'est pas faussée) |
| Compteurs | scène 6 | 0 → 48 et 0 → 6 en 26 images, chiffres à chasse fixe (sinon le bloc tremble), avec un trait de mesure qui se remplit **en même temps** |
| Bandeaux défilants | scène 7 | rangée dessinée **deux fois**, translatée de `−(t × vitesse) mod largeur` : la boucle est invisible au pixel près, et la rangée du bas part d'une largeur entière en arrière pour défiler en sens inverse |
| Anneaux pulsés | bouton du CTA | trois cercles de 120 → 380 px, décalés de 22 images, bouclés sur 66 : ils désignent le bouton sans rien écrire |
| Grain et halos animés | décor | le grain change de position une image sur deux, les halos dérivent sur la durée du film : un fond fixe finit par se lire comme une trame |
| Filet segmenté | bas de la zone sûre | un segment par scène, rempli sur **sa** durée — l'information « il reste trois scènes » passe sans un mot |

- **Remise séquentielle, jamais de fondu croisé sur deux mises en page voisines** — la
  leçon de la v1 est devenue une règle : `glide.tsx` **et** `wipe.tsx` éteignent la scène
  sortante sur la première moitié du passage avant d'allumer l'entrante. Le rideau, lui,
  a d'abord été écrit en fondu croisé et a été **mesuré en échec** : à l'image 414, le
  titre de la galerie se posait par-dessus la carte photo du bénéfice 3 — deux mises en
  page superposées ne se lisent pas, même différentes.
- Interdit : `setTimeout`, `requestAnimationFrame`, toute animation CSS non pilotée
  par `useCurrentFrame()` — le rendu doit être **image par image, reproductible**.

---

## 6. Points de vigilance « plateforme »

1. **Marges sûres** : depuis la v3, le film n'est plus une story mais un **média de
   section** — il n'y a donc plus d'interface de plateforme à éviter. Les marges
   (`safeArea` : **90 px en haut et en bas, 110 px à gauche et à droite**, soit
   **1 700 × 900 px utiles**) gardent les **bords du cadre** : un texte qui touche le
   bord a l'air coupé, même quand il ne l'est pas. À re-vérifier avec `debug: true`
   dans le Studio avant validation.
2. **Lisibilité en petit** : titre ≥ 96 px, texte courant ≥ 44 px, contraste ≥ 4,5:1
   (`#e8f4f8` sur `#070d1a` ≈ 15:1, large). `#6b8ca8` **uniquement** pour du décoratif,
   jamais pour une phrase nécessaire. En v2, le libellé et la légende d'une réalisation
   sont posés **sur la photo** : ils gardent leur plancher de 44 px et s'appuient sur le
   voile sombre qui ferme la carte (`cardVeilOf`) — c'est ce voile qui rend le texte
   lisible, pas la photo.
3. **Ré-encodage / lecture** : le film est lu **dans une page** — H.264 (lu partout),
   30 fps, image fixes, et **muet** (la lecture automatique des navigateurs exige
   `muted`). `yuvj420p` (pleine échelle) est le défaut de Remotion avec
   `imageFormat: jpeg` : c'est ce que produisent la plupart des encodeurs, donc sans
   conséquence tant que personne ne relève de décalage de contraste. Si ça devait
   arriver, le levier est `Config.setVideoImageFormat("png")` — à ne pas changer sans
   l'avoir **observé**, au prix d'un rendu plus lourd.
4. **Poids** : viser **< 16 Mo**. Le fichier livré (v3) pèse **12 704 881 octets**,
   soit **3,4 Mb/s** — 12,7 Mo pour 1 920 × 1 080 et 30 s. Le seuil de la v1 (< 8 Mo)
   valait pour un film de 15 s sur fond uni ; la v2 dure **le double** et porte **des
   photos**. La v3 ne change rien au débit, mais elle change **l'enjeu** : le fichier
   n'est plus publié sur un réseau social (qui le ré-encode et le diffuse par son CDN),
   il est **servi par le site**, donc compté dans le chargement de la page. Le levier
   reste `Config.setCrf` (21–22 divise le poids par deux, au prix des dégradés) — et
   à l'intégration, une **affiche** (`poster`) plus `preload="metadata"` évitent de
   télécharger 12,7 Mo avant que le visiteur ne demande la vidéo.
5. **Logo** : `public/images/logo.png` est un wordmark **sombre** — invisible sur
   `#070d1a`. Deux options : reproduire le traitement du site (pastille claire
   derrière le logo, comme `loginLogoBadge` / `logoBadge`) **ou** produire
   `logo-blanc.png`. Par défaut : `logoMode: "pille"` (aucune retouche d'image).
6. **Photos libres de droit, créditées, et aucune marque tierce.** Les **8 photos** du
   film viennent de **Pexels** (licence : usage commercial libre, aucune attribution
   obligatoire, modification autorisée). Elles sont créditées — auteur, URL canonique,
   date — dans `reel/public/images/CREDITS.md`, et le crédit voyage aussi dans le code
   (`reel/src/images.ts`) : c'est là qu'on remplace une photo. Trois règles de sélection,
   appliquées à la main sur la planche de candidats : **aucune marque lisible** (une
   capture montrant le logo d'un réseau social a été écartée pour ça), **aucune personne
   identifiable dans un contexte sensible** (les photos avec des personnes ne servent que
   de fond assombri ≥ 70 % ou de carte d'illustration, sans texte qui leur prête une
   déclaration), et **aucune capture de réalisation réelle** sans accord du client — les
   cartes « réalisations » sont donc des illustrations, pas des captures de ses projets.

---

## 7. Commandes de travail

```bash
# 1. Installation (une fois)
cd reel && npm install

# 2. Prévisualisation interactive, 1920×1080
npx remotion studio

# 3. Rendu du film par défaut
npx remotion render Reel out/services-reel.mp4 --codec=h264 --crf=18

# 4. Déclinaison (variante définie dans config.ts)
npx remotion render Reel out/reel-ecommerce.mp4 --props='{"variant":"ecommerce"}'
#    … et sa relecture, sans encoder la vidéo :
npx remotion still Reel out/eco-benefit-1.png --frame=45 --props='{"variant":"ecommerce","scene":"benefit-1"}'

# 5. Images fixes pour la relecture (utile en revue, sans lire la vidéo)
npx remotion still Reel out/frame-hook.png --frame=60
npx remotion still Reel out/frame-benefit.png --frame=150
npx remotion still Reel out/frame-cta.png --frame=400

# 6. Relecture d'une scène seule (mêmes images locales qu'à l'assemblage E7)
npx remotion still Reel out/scene-benefit-2.png --frame=45 --props='{"scene":"benefit-2"}'

# 7. Contrôle A4 « rien hors de la zone sûre », mesuré au pixel (aucune dépendance)
#    (sur une image **sans** `debug: true` : les guides du mode debug sont du contenu
#     lumineux hors zone, ils faussent forcément la mesure)
node scripts/png-bounds.mjs out/v2-t100.png              # bbox du contenu visible + verdict
node scripts/png-bounds.mjs out/v2-t100.png --bands      # détail bande par bande
node scripts/png-bounds.mjs out/v2-t100.png --luma=78    # seuil plus bas : légendes, filets pâles
node scripts/png-bounds.mjs out/v2-t100.png --accent=00b4d8 --band=743:1057

# 8. Vignette d'une image fixe, pour la **regarder** (un PNG 1920×1080 pèse ~2,4 Mo)
node scripts/png-thumb.mjs out/k500.png out/preview/k500.png --factor=2

# 9. Relecture d'une scène vs même image du film assemblé (doivent être identiques :
#    la relecture pose le filet **et le fond photo** au départ réel de la scène)
npx remotion still Reel out/film.png --frame=130                       # bénéfice 1, image 34 du film
node scripts/png-diff.mjs out/film.png out/e7b-b1-34.png

# 10. Vérifier la mesure A4 **sur le film rendu**, pas seulement sur des images fixes :
#     le mp4 est l'artefact livré, et ffmpeg sait en extraire n'importe quelle image.
#     (ffmpeg est fourni par Remotion, aucun paquet à installer)
FF=node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe
for f in 0 50 100 150 200 250 300 350 400 450 500 550 600 650 700 750 800 850 890; do
  $FF -y -loglevel error -ss $(node -e "console.log(($f/30).toFixed(4))") \
      -i out/services-reel.mp4 -frames:v 1 out/final-$f.png
  node scripts/png-bounds.mjs out/final-$f.png
done
$FF -y -loglevel error -sseof -0.05 -i out/services-reel.mp4 -frames:v 1 -update 1 out/final-899.png
node scripts/png-bounds.mjs out/final-899.png

# 11. Le bloc `config.ts` du §4 de ce plan est-il toujours le vrai fichier ?
node scripts/sync-doc-config.mjs           # exit 1 si le plan a dérivé
node scripts/sync-doc-config.mjs --write   # resynchronise le bloc depuis src/config.ts
```

---

## 8. Critères d'acceptation (vérifiables, dans l'ordre)

| # | Critère | Preuve |
|---|---|---|
| A1 | La composition est déclarée au bon format | `npx remotion compositions` → `Reel` **1920×1080, 30 fps, 900 images** |
| A2 | Le fichier rendu est exact | `ffprobe out/services-reel.mp4` → piste vidéo `1920x1080`, `30/1`, **`duration=30.000000`** — et, depuis S1, une piste **`aac 48000 Hz stéréo`** (annoncée 30,016 s : remplissage de trames AAC, la vidéo reste à 30,000 s au bit près) |
| A3 | Les 9 temps sont respectés | images fixes aux frames 34 (le clic de l'intro), 100 (hook), 200 / 300 / 400 (3 bénéfices), 500 (réalisations), 620 (chiffres), 740 (technologies), 850 (CTA) — revue visuelle |
| A4 | Contenus dans les marges sûres | **aucune image n'est hors de `safeArea`** (90/990 × 110/1810), mesuré au pixel : **29 images extraites du film rendu** (une toutes les 45, la dernière, plus **8 images de transition**) → `toutDansLaZoneSure: true` **29/29**, marge basse minimale **49 px** (`y 941` pour une limite de 990), marges gauche et droite minimales 0 (le logo est posé exactement sur les marges) et **32 px**. Complété par des images fixes brutes (`remotion still`) sur les moments chargés, qui ont leurs propres contrôles |
| A5 | Déclinable sans code | changer `benefitIds`, `hook.kicker`, la galerie, les chiffres ou le CTA dans une variante suffit à produire une autre pub (aucun composant modifié) |
| A6 | **Le site n'a pas bougé** | `npx tsc --noEmit` → 0 ; `npx eslint .` → 0 erreur ; `npm run build` → 0 (relevés à la racine, après les exclusions du §3.1) |
| A7 | Poids raisonnable | `out/services-reel.mp4` **13,9 Mo < 16 Mo** (seuil relevé en v2 : durée × 2 **et** photos — voir §6.4 ; +1,2 Mo d'AAC depuis que le film est sonorisé, S1) |
| A8 | Aucun binaire dans l'historique | `git status` ne montre ni `reel/node_modules`, ni `reel/out`, ni `.mp4` (les 8 photos de `reel/public/images/`, elles, sont versionnées : ce sont les sources du film, 1,1 Mo) |
| A9 | Le plan ne dérive pas du code | `node scripts/sync-doc-config.mjs` → exit **0** (bloc §4 identique à `src/config.ts`) |

> A2 est le critère « dur » : **900 images / 30,000 s exactement**. C'est lui qui
> attrape les erreurs d'arithmétique de transitions (§5.1).
>
> A4 est mesuré **sur le film rendu** depuis la v2 : une image fixe prouve le rendu
d'une image, le mp4 prouve ce qui sera publié. Le fond photo plein cadre, lui, est
volontairement maintenu **sous le seuil de luminosité** de `png-bounds.mjs` (30 %
d'opacité sous un voile sombre) : c'est ce qui permet à la mesure de continuer de
porter sur le **contenu**, sans avoir à changer d'outil ni à tolérer un trou dans la
vérification.

---

## 9. Découpage en étapes

| Étape | Contenu | Sortie | Poids |
|---|---|---|---|
| E1 | Isolation : `reel/` + `package.json` + `tsconfig` + exclusions racine (`tsconfig`, `eslint`, `.gitignore`) — **terminée** ✅ | **Prouvée** : `tsc` racine 0 · `eslint` 0 erreur · `npm run build` 0 · `npx remotion compositions` = `Reel 30 1080x1920 450 (15.00 sec)` · Studio affichant l'écran de contrôle (§0) | S |
| E2 | `config.ts` + `theme.ts` + `fonts.ts` (Outfit via `@remotion/google-fonts` + `logo.png`) + `Backdrop`/`Logo` — **terminée** ✅ | Le Studio affiche un fond de marque, textes et logo corrects — **prouvé** (capture `reel/out/studio-e2.png`, polices vérifiées par `document.fonts.check`) | S |
| E3 | `ProgressBar` + `SafeArea` (`Backdrop`/`Logo` livrés en E2) — **terminée** ✅ | Décor final, guide de zones sûres vérifié — **prouvé** : `toutDansLaZoneSure: true` (mesure chiffrée, cf. §0) et captures `reel/out/e3-{clean,debug}.png` | M |
| E4 | Scène 1 `Hook` (spring, lignes en cascade, mot accent) — **terminée** ✅ | Hook fini, relu sur image fixe — **prouvé** : cascade visible (ligne 3 floue à l'image 18), balayage mesuré gauche → droite (`247→292` … `247→834`), `toutDansLaZoneSure: true` sur 12 images fixes (script `reel/scripts/png-bounds.mjs`) | M |
| E5 | Scènes 2–4 `BenefitSlide` (numéro, picto, tag, titre, phrase, description) — **terminée** ✅ | 3 bénéfices animés — **prouvé** : `components/BenefitSlide.tsx` + `components/icons.tsx` (6 pictos SVG), cascade mesurée à l'image, `toutDansLaZoneSure: true` sur 10 images fixes, hook inchangé au md5 près | M |
| E6 | Scène 5 `CtaEnd` (titre, bouton, mention — le logo reste la couche permanente de `Reel.tsx`) — **terminée** ✅ | Dernière scène — **prouvé** : `components/CtaEnd.tsx` (scène autonome, bouton en `pop`, chevron qui respire), `"cta"` relisible seul, `toutDansLaZoneSure: true` sur 7 images fixes, sous-titre ramené à **une** ligne et titre équilibré par `text-wrap: balance` | S |
| E7 | Assemblage `TransitionSeries` + calcul des durées (§5.1) — **terminée** ✅ | **450 images** confirmées par `compositions` — **prouvé** : 5 scènes enchaînées dans une **zone de scène** `position: relative` (les scènes ne sortent plus par-dessus le logo, comme à E5), 3 fondus + 1 **glissement court** (`src/transitions/glide.tsx`, 40 px : A4 vrai même pendant la transition), total **calculé** par `timelineOf()` et **vérifié** dans `getReelConfig` (une erreur d'arithmétique ne peut plus être livrée), relecture d'une scène **identique au pixel** à l'image du film (md5 sur les 5 scènes + la variante), `toutDansLaZoneSure: true` sur les images posées **et** sur celles du glissement | M |
| E8 | Rendu + contrôles A1→A8 — **terminée le 2026-10-13** ✅ | **Prouvée** : `out/services-reel.mp4` rendu (12,4 Mo), `ffprobe` → `duration=30.000000`, 1080x1920, 30/1, 3,3 Mb/s · A4 relevé sur **20 images du film rendu** · A6 relevé à la racine (`tsc`, `eslint`, `build`) | S |
| E9 | Déclinaisons (2ᵉ variante réelle dans `config.ts`) — **terminée** ✅ | Preuve A5 — **prouvée** : prop `variant` + `calculateMetadata` branchées, `--props='{"variant":"ecommerce"}'` change hook, 3 bénéfices et CTA **sans toucher à un composant**, `toutDansLaZoneSure: true` sur 5 images, film par défaut inchangé au md5, et un nom de variante inconnu **plante** au lieu de rendre la mauvaise pub | S |

| **V2 — passe « pub moderne »** (faite le 2026-10-13) ✅ | **Contenu** : 8 photos libres de droit téléchargées, créditées et servies en fond (hook, CTA) et en cartes (bénéfices, réalisations) · **durée portée à 30 s** (900 images) avec l'arithmétique recalculée · **trois scènes nouvelles** (réalisations, chiffres, technologies) · **motion design** : ken burns, masques, reflets, coup de lumière, grain et halos animés, compteurs, bandeaux défilants, anneaux pulsés, filet segmenté · **troisième transition** (`wipe.tsx`) · **outil** `sync-doc-config.mjs`. **Preuves** : `tsc` 0 · `compositions` → **900 (30.00 sec)** · `ffprobe` → **30.000000** · A4 **20/20** sur le film rendu · 3 garde-fous éprouvés par patch temporaire (exit 1, restauration au md5) · 3 défauts réels trouvés **et corrigés** pendant la passe (rideau en fondu croisé, légende débordant sur le pied de page, créneau de carrousel à demi vide) | L |

E1 → E8 = premier Reel livrable (15 s). E9 = déclinaison. **V2 = la passe « pub
moderne »** demandée le 2026-10-13 : 30 s, photos, motion design. **V3 = la mise en
section** : 16:9 horizontal, neuf scènes (intro cliquée), marges de section, sans pied
de page ni filet de progression.

---

## 10. Ce qui reste à trancher avant de coder

1. ~~Licence Remotion~~ — **tranché le 2026-10-12** : producteur indépendant,
   1 personne → **Free License**, aucune démarche (§2.1).
2. ~~Police~~ — **tranché le 2026-10-12** : **Outfit** via
   `@remotion/google-fonts` (zéro fichier à gérer ; écart assumé avec Satoshi).
3. ~~Les 3 bénéfices~~ — **tranché et écrit** : sites web / applications web /
   design UI/UX (`config.scenes.benefitIds`).
4. ~~Ton du hook~~ — **tranché** : « Ce que nous construisons pour vous » (titre du
   site), complété en v2 par le **sommaire** des trois bénéfices.
5. ~~Musique~~ — **tranché le 2026-10-13** : le film est **sonorisé** (nappe +
   deux effets, les autres sept ayant été retirés du montage le jour même),
   **synthétisés** par `scripts/make-audio.mjs` et non achetés (§2.3). Et
   le point qui rendait le silence défendable en v3 est **traité, pas contourné** :
   un média posé dans une section est lu par le navigateur **en sourdine**
   (`autoplay` + `muted`), donc le lecteur du site (`VideoShowcase`) démarre **muet
   par défaut** et affiche une pastille **« Activer le son »** — le visiteur choisit
   d'entendre, ce qui est aussi la seule façon dont le son *peut* démarrer.
6. **Les trois chiffres** de la scène 6 (« 48 h », « 6 », « A → Z ») reprennent des
   engagements **déjà écrits sur le site** : devis en 48 h, 6 expertises,
   accompagnement de A à Z. Rien n'est inventé, mais ces trois repères sont
   **affichés en grand** : à valider (ou à réécrire dans `config.ts`) avant une
   publication large.
7. **Contenu du CTA** : la mention « Faites défiler pour en savoir plus » est du
   vocabulaire de *story* — dans une section du site, le visiteur a déjà le doigt sur
   la page et rien ne « défile » sous la vidéo. À réécrire (par exemple vers ce que
   fait le bouton : « Parlons de votre projet »). L'URL, elle, n'est **plus affichée
   deux fois** : le pied de page a été retiré en v3, il ne reste que la pastille du
   bouton. Les deux points de la v1 sont donc réduits à un seul, de contenu.
8. **Photos** : les 8 photos sont des **illustrations libres de droit**, pas les
   projets du client (ses réalisations ne sont pas publiées sans accord, §6.6).
   Les remplacer par des captures réelles est une amélioration à programmer, pas un
   défaut du film.

---

## 11. Suites possibles (hors v1)

1. **Wordmark clair** : produire `logo-blanc.png` pour un logo net sur fond sombre.
2. **B-roll** : remplacer tout ou partie des 8 photos par des **captures de
   réalisations réelles** (ImageKit) — le film gagnerait en preuve ce qu'il perd en
   effort de sélection. Un seul endroit à toucher (`reel/src/images.ts`), et la clé
   d'une photo peut être passée à `null` le temps de la remplacer (dégradé de repli,
   le film se rend quand même).
3. **Sous-titres brûlés** : les Reels se regardent souvent sans le son — un fichier
   `.srt` séparé ou des sous-titres incrustés depuis `config.ts`.
4. **Rendu depuis l'admin** : une page `/admin/communication` qui écrit la config
   en base, puis déclenche un rendu — soit **local** (Simple, gratuit, mais un poste
   doit tourner), soit **Remotion Lambda** (AWS, payant à la seconde, aucun poste
   requis). À n'ouvrir qu'après validation du film lui-même.
5. **Autres déclinaisons** : un Reel par page du site (Réalisations, À propos,
   Témoignages) en changeant uniquement `config.ts`.
6. **Revenir à Satoshi** (fidélité totale au site) : télécharger les fichiers depuis
   Fontshare, les déposer dans `reel/public/fonts/`, charger via `loadFont()` de
   `@remotion/fonts` et passer `fonts.heading`/`fonts.body` à `"Satoshi"` — un seul
   fichier touché (`fonts.ts`) plus une ligne de config.

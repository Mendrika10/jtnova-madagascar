import { createHmac, randomUUID } from "node:crypto";

/**
 * Intégration ImageKit (sprint S4bis) : les images des réalisations sont
 * envoyées DIRECTEMENT du navigateur vers ImageKit. Le serveur ne fait que
 * **signer** les envois — aucun fichier ne le traverse, donc aucune limite de
 * taille liée à une fonction serverless.
 *
 * ⚠️ La clé privée n'est lue QUE dans ce module (serveur). Elle ne doit jamais
 * apparaître dans une réponse HTTP ni dans le bundle client.
 */

export type ImageKitConfig = {
  urlEndpoint: string;
  publicKey: string;
  privateKey: string;
};

export type ImageKitAuthParams = {
  token: string;
  expire: number;
  signature: string;
};

/**
 * Configuration complète, ou `null` si une variable manque. Retourner `null`
 * plutôt que lever permet au site public de continuer à fonctionner (seul
 * l'upload d'images est indisponible — F4bis.8).
 */
export function getImageKitConfig(): ImageKitConfig | null {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim();
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.trim();
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();
  if (!urlEndpoint || !publicKey || !privateKey) return null;
  return { urlEndpoint, publicKey, privateKey };
}

/**
 * Paramètres d'authentification d'un envoi navigateur → ImageKit.
 *
 * Algorithme officiel : `signature` = HMAC-SHA1(`token` + `expire`, clé privée),
 * en hexadécimal minuscule ; `expire` en **secondes** epoch ; `token` doit être
 * **unique par envoi** (V4 UUID), sinon ImageKit renvoie une erreur de
 * validation — c'est pourquoi la route en génère un à chaque appel.
 */
export function signImageKitUpload(privateKey: string): ImageKitAuthParams {
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes
  const signature = createHmac("sha1", privateKey)
    .update(`${token}${expire}`)
    .digest("hex");
  return { token, expire, signature };
}

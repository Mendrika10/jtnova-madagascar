/**
 * S8 — identité de l'e-mail de notification d'un message de contact.
 *
 * Chaque notification part avec un en-tête propriétaire `X-Jtnova-Contact-Id`
 * portant l'identifiant (UUID) de la ligne `contact_messages`. C'est ce lien,
 * posé à l'envoi (voir `email.ts`) et relu dans la boîte (voir `mail-sync.ts`),
 * qui permet de savoir si l'e-mail correspondant à un message de l'admin a
 * été **lu** dans la boîte Gmail.
 *
 * Ce module n'a **aucune dépendance** : il est importable par la Server Action
 * du contact (qui ne doit pas embarquer le client IMAP) comme par le module de
 * synchronisation.
 */

/** En-tête de corrélation. Les en-têtes `X-*` traversent les relais SMTP. */
export const CONTACT_MAIL_HEADER = "X-Jtnova-Contact-Id";

const CONTACT_MAIL_DOMAIN = "jtnova-madagascar";

/**
 * `Message-ID` posé sur la notification. Il sert de trace lisible ; la
 * recherche en IMAP se fait sur `CONTACT_MAIL_HEADER`, car un relais (Gmail
 * compris) peut réécrire le `Message-ID`.
 */
export function contactMailMessageId(messageId: string): string {
  return `<contact-${messageId}@${CONTACT_MAIL_DOMAIN}>`;
}

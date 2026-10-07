import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * F6.5/F6.6 — e-mails du formulaire de contact via **Gmail SMTP**
 * (choix de l'humain du 2026-10-07, en remplacement de Resend prévu au plan).
 *
 * Dégradation gracieuse (même modèle qu'ImageKit, F4bis.8) : sans variables
 * SMTP configurées — ou en cas d'échec d'envoi — l'application ne plante
 * **jamais** : la soumission reste un succès (le message est en base) et
 * l'e-mail sauté est journalisé côté serveur.
 *
 * Secret : `SMTP_PASS` est un mot de passe d'application Google — serveur
 * uniquement, jamais dans le dépôt ni le chat ; révocable à tout moment.
 */

export type MailPayload = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function fromAddress(): string {
  const user = process.env.SMTP_USER ?? "no-reply@jtnova.local";
  const name = process.env.CONTACT_FROM_NAME ?? "Jtnova";
  return `"${name}" <${user}>`;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!smtpConfigured()) return null;
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT ?? 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER as string,
      pass: process.env.SMTP_PASS as string,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Échappe les valeurs utilisateur avant de les injecter dans un e-mail HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

/**
 * Envoie un e-mail et renvoie le résultat — **ne lance jamais d'exception** :
 * l'appelant (soumission du contact) ne doit jamais échouer à cause du mail.
 */
export async function sendMail(
  payload: MailPayload,
): Promise<{ sent: boolean; reason?: string }> {
  const tx = getTransporter();
  if (!tx) return { sent: false, reason: "smtp-not-configured" };
  try {
    await tx.sendMail({ from: fromAddress(), ...payload });
    return { sent: true };
  } catch (error) {
    console.error(
      "[email] envoi SMTP échoué :",
      error instanceof Error ? error.message : error,
    );
    return { sent: false, reason: "smtp-error" };
  }
}

function mailShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#0b0d17;color:#e7e9f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#12152a;border:1px solid #2a2f52;border-radius:12px;padding:24px;">
      <h1 style="font-size:18px;margin:0 0 16px;color:#ffffff;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:24px;font-size:12px;color:#8b90b0;">Jtnova — Madagascar</p>
    </div>
  </body>
</html>`;
}

/** F6.5 — notification adressée à l'administrateur. Destinataire :
 * `CONTACT_TO_EMAIL`, sinon le compte SMTP lui-même (le Gmail de l'humain). */
export async function sendContactNotification(message: {
  name: string;
  email: string;
  message: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
  if (!to) return { sent: false, reason: "no-recipient" };
  const body = `
    <p style="margin:0 0 12px;">Nouvelle demande de contact reçue sur le site.</p>
    <p style="margin:0 0 4px;"><strong>Nom :</strong> ${escapeHtml(message.name)}</p>
    <p style="margin:0 0 12px;"><strong>E-mail :</strong> ${escapeHtml(message.email)}</p>
    <div style="background:#0b0d17;border:1px solid #2a2f52;border-radius:8px;padding:12px;white-space:pre-wrap;">${escapeHtml(message.message)}</div>`;
  return sendMail({
    to,
    replyTo: message.email,
    subject: `Contact — ${message.name}`,
    html: mailShell("Nouvelle demande de contact", body),
  });
}

/** F6.6 — accusé de réception à l'expéditeur (activé par défaut,
 * désactivable avec `CONTACT_AUTOREPLY=0`). */
export async function sendContactAutoreply(contact: {
  name: string;
  email: string;
}): Promise<{ sent: boolean; reason?: string }> {
  if (process.env.CONTACT_AUTOREPLY === "0") {
    return { sent: false, reason: "disabled" };
  }
  const firstName = contact.name.trim().split(/\s+/)[0] || "bonjour";
  const body = `
    <p style="margin:0 0 12px;">Bonjour ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 12px;">Nous avons bien reçu votre message. Nous revenons vers vous dans les plus brefs délais — généralement sous 24 à 48 heures.</p>
    <p style="margin:0;">Merci de votre confiance,<br />L'équipe Jtnova</p>`;
  return sendMail({
    to: contact.email,
    subject: "Nous avons bien reçu votre message — Jtnova",
    html: mailShell("Message bien reçu", body),
  });
}

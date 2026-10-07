import { ImapFlow } from "imapflow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { CONTACT_MAIL_HEADER } from "./contact-mail";
import { errorMessage } from "./observability";

/**
 * S8 — passage automatique en « lu » d'un message de contact lorsque l'e-mail
 * de notification qui lui correspond a été lu dans la boîte Gmail de Jtnova.
 *
 * **Pourquoi une lecture IMAP ?** L'envoi se fait en SMTP (`email.ts`), un
 * canal qui n'écoute rien : l'application ne saurait jamais, sinon, qu'un
 * e-mail a été lu. On interroge donc la boîte en IMAP — avec le même mot de
 * passe d'application Google que l'envoi — et on lit le drapeau `\Seen`, que
 * Gmail pose dès que le message est ouvert.
 *
 * **Déclenchement** : à l'ouverture de l'espace `/admin` (layout) et de la
 * liste des messages. C'est instantané, gratuit et ne demande **aucun secret
 * supplémentaire** — contrairement à un cron, qui devrait écrire en base avec
 * la clé `service_role`. Le travail est mutualisé et limité dans le temps
 * (voir `syncContactReadStatuses`), et la fonction ne lève **jamais** : une
 * panne IMAP n'a aucun effet sur l'admin.
 *
 * **Limite connue** : seule la boîte du compte IMAP (`IMAP_USER`, par défaut
 * `SMTP_USER`) est interrogée. Si `CONTACT_TO_EMAIL` désigne une seconde
 * boîte, lire le message dans **cette** boîte ne suffit pas : le statut suit
 * la copie reçue par le compte SMTP (documenté dans `docs/GUIDE-ADMIN.md`).
 */

/** Nombre de messages « nouveaux » examinés par passage (borne le coût). */
const MAX_PER_RUN = 50;

/** Délais courts : la boîte ne doit jamais ralentir l'admin. */
const IMAP_TIMEOUTS = {
  connectionTimeout: 4_000,
  greetingTimeout: 4_000,
  socketTimeout: 8_000,
};

export type SyncReason =
  | "ok"
  | "not-configured"
  | "nothing-to-check"
  | "throttled"
  | "mailbox-error";

export type SyncOutcome = {
  status: "synced" | "skipped";
  reason: SyncReason;
  /** Messages « nouveaux » examinés. */
  checked: number;
  /** Messages effectivement passés en « lu ». */
  markedRead: number;
};

export type ImapConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

/**
 * Réglages IMAP. Les identifiants par défaut sont ceux de l'envoi (mot de
 * passe d'application Google) : la fonctionnalité marche donc dès que
 * `SMTP_USER`/`SMTP_PASS` sont posés, sans variable en plus. `IMAP_USER` /
 * `IMAP_PASS` permettent de viser une autre boîte.
 */
export function imapConfig(): ImapConfig | null {
  const user = (process.env.IMAP_USER || process.env.SMTP_USER || "").trim();
  const pass = (process.env.IMAP_PASS || process.env.SMTP_PASS || "").trim();
  if (!user || !pass) return null;
  const port = Number(process.env.IMAP_PORT ?? 993);
  const secure =
    (process.env.IMAP_SECURE ?? "").trim() === ""
      ? port === 993
      : process.env.IMAP_SECURE!.trim() !== "0";
  return {
    host: (process.env.IMAP_HOST || "imap.gmail.com").trim(),
    port,
    secure,
    user,
    pass,
  };
}

/** Nombre de secondes minimales entre deux interrogations de la boîte. */
function minIntervalMs(): number {
  const seconds = Number(process.env.IMAP_SYNC_MIN_INTERVAL_SEC ?? 60);
  return (Number.isFinite(seconds) && seconds >= 0 ? seconds : 60) * 1000;
}

/**
 * Sonde injectable : reçoit des valeurs d'en-tête et renvoie celles dont
 * l'e-mail est marqué lu. Le test l'utilise pour vérifier la chaîne complète
 * (lecture des messages « nouveaux » → mise à jour en « lu ») sans boîte
 * réelle ; la production utilise `probeMailbox`.
 */
export type SeenProbe = (values: string[]) => Promise<Set<string>>;

/** Interroge la boîte : recherche l'en-tête de corrélation puis lit `\Seen`. */
export async function probeMailbox(values: string[]): Promise<Set<string>> {
  const config = imapConfig();
  if (!config) throw new Error("IMAP non configuré");

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    logger: false,
    ...IMAP_TIMEOUTS,
  });
  // Sans écouteur `error`, une coupure de socket ferait planter le process.
  client.on("error", (error: unknown) => {
    console.error("[mail-sync] erreur IMAP :", errorMessage(error));
  });

  const seen = new Set<string>();
  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      for (const value of values) {
        const found = await client.search(
          { header: { [CONTACT_MAIL_HEADER]: value } },
          { uid: true },
        );
        if (!found || found.length === 0) continue;
        const message = await client.fetchOne(
          found[0]!,
          { flags: true },
          { uid: true },
        );
        if (message && message.flags?.has("\\Seen")) seen.add(value);
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
  return seen;
}

async function runSync(
  supabase: SupabaseClient<Database>,
  probe: SeenProbe | undefined,
): Promise<SyncOutcome> {
  if (!probe && !imapConfig()) {
    return { status: "skipped", reason: "not-configured", checked: 0, markedRead: 0 };
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(MAX_PER_RUN);

  if (error) {
    console.error("[mail-sync] lecture des messages :", error.message);
    return { status: "skipped", reason: "mailbox-error", checked: 0, markedRead: 0 };
  }

  const ids = (data ?? []).map((row) => row.id);
  if (ids.length === 0) {
    return { status: "synced", reason: "nothing-to-check", checked: 0, markedRead: 0 };
  }

  const seen = await (probe ?? probeMailbox)(ids);
  if (seen.size === 0) {
    return { status: "synced", reason: "ok", checked: ids.length, markedRead: 0 };
  }

  // `.eq("status", "new")` : un statut changé entre-temps par l'admin
  // (« répondu », « archivé ») n'est jamais écrasé.
  const { error: updateError } = await supabase
    .from("contact_messages")
    .update({ status: "read" })
    .in("id", [...seen])
    .eq("status", "new");

  if (updateError) {
    console.error("[mail-sync] mise à jour des statuts :", updateError.message);
    return {
      status: "skipped",
      reason: "mailbox-error",
      checked: ids.length,
      markedRead: 0,
    };
  }

  return {
    status: "synced",
    reason: "ok",
    checked: ids.length,
    markedRead: seen.size,
  };
}

let inflight: Promise<SyncOutcome> | null = null;
let lastOutcome: SyncOutcome | null = null;
let lastRunAt = 0;

/**
 * Aligne les statuts sur la boîte mail. Appelée depuis le layout admin et la
 * liste des messages : les deux attendent la **même** promesse (aucune
 * connexion IMAP en double pour un même rendu) et partagent un délai minimal
 * entre deux interrogations, pour qu'un rechargement ne relance pas la boîte.
 *
 * Ne lève jamais : les erreurs sont journalisées et renvoyées dans le
 * résultat (`reason: "mailbox-error"`).
 */
export async function syncContactReadStatuses(
  supabase: SupabaseClient<Database>,
  options: { probe?: SeenProbe; force?: boolean } = {},
): Promise<SyncOutcome> {
  const bypassCache = options.force === true || Boolean(options.probe);
  if (!bypassCache && lastOutcome && Date.now() - lastRunAt < minIntervalMs()) {
    return { ...lastOutcome, status: "skipped", reason: "throttled" };
  }
  if (inflight) return inflight;

  inflight = runSync(supabase, options.probe)
    .catch((error: unknown) => {
      console.error("[mail-sync] échec de la synchronisation :", errorMessage(error));
      return {
        status: "skipped",
        reason: "mailbox-error",
        checked: 0,
        markedRead: 0,
      } satisfies SyncOutcome;
    })
    .finally(() => {
      lastRunAt = Date.now();
      inflight = null;
    });

  const outcome = await inflight;
  lastOutcome = outcome;
  return outcome;
}

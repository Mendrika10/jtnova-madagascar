/**
 * F7.7 — télécharge une sauvegarde des contenus publics.
 *
 * Le script ne parle qu'au point d'entrée `/api/export` du site (protégé par
 * `CRON_SECRET`) : aucun identifiant Supabase n'est nécessaire, et la
 * génération du JSON comme du SQL reste côté serveur (source unique).
 *
 * Usage :
 *   node scripts/backup-content.mjs                       # site par défaut
 *   node scripts/backup-content.mjs --site=http://localhost:3110
 *   node scripts/backup-content.mjs --out=.backups        # dossier de sortie
 *   node scripts/backup-content.mjs --secret=…            # sinon CRON_SECRET
 *
 * Produit : `<out>/content-<AAAA-MM-JJ>.json` et `<out>/restore-<AAAA-MM-JJ>.sql`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.replace(/^--/, "").split("=");
      return [k, rest.join("=")];
    }),
);

/** Lecture minimaliste de `.env.local` (aucune dépendance). */
function envFromFile(name) {
  if (!existsSync(name)) return {};
  const out = {};
  for (const line of readFileSync(name, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const fileEnv = { ...envFromFile(".env.local"), ...envFromFile(".env") };
const secret = args.secret || process.env.CRON_SECRET || fileEnv.CRON_SECRET;
const site = (
  args.site ||
  process.env.SITE_URL ||
  fileEnv.NEXT_PUBLIC_SITE_URL ||
  "https://jtnova-madagascar.vercel.app"
).replace(/\/$/, "");
const outDir = args.out || ".backups";

if (!secret) {
  console.error(
    "CRON_SECRET absent (--secret, variable d'environnement ou .env.local).",
  );
  process.exit(1);
}

const day = new Date().toISOString().slice(0, 10);

async function download(format, target) {
  const url = `${site}/api/export${format === "sql" ? "?format=sql" : ""}`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${secret}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${url} → HTTP ${res.status} : ${body.slice(0, 300)}`);
  }
  const text = await res.text();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, target), text, "utf8");
  return text.length;
}

try {
  const jsonSize = await download("json", `content-${day}.json`);
  const sqlSize = await download("sql", `restore-${day}.sql`);
  console.log(
    `Sauvegarde écrite dans ${outDir}/ : content-${day}.json (${(jsonSize / 1024).toFixed(1)} Ko), restore-${day}.sql (${(sqlSize / 1024).toFixed(1)} Ko) depuis ${site}`,
  );
} catch (error) {
  console.error(`Échec de la sauvegarde : ${error.message}`);
  process.exit(1);
}

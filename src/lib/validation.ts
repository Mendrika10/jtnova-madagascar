import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximum ${max} caractères`)
    .optional()
    .default("");

const optionalUrl = z
  .string()
  .trim()
  .max(1000, "URL trop longue")
  .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "URL invalide (http:// ou https://)")
  .optional()
  .default("");

/** Champs du formulaire admin d'une réalisation (F4.9). */
export const projectFormSchema = z.object({
  title: z.string().trim().min(2, "Titre trop court").max(200, "Titre trop long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug obligatoire")
    .max(120, "Slug trop long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide : minuscules, chiffres et tirets uniquement"),
  tag: optionalText(80),
  category: optionalText(80),
  year: optionalText(20),
  description: z
    .string()
    .trim()
    .min(10, "Description trop courte")
    .max(600, "Description trop longue"),
  presentation: optionalText(4000),
  explication: optionalText(6000),
  security: optionalText(4000),
  performance: optionalText(4000),
  client_name: optionalText(120),
  live_url: optionalUrl,
  repo_url: optionalUrl,
  video_url: optionalUrl,
  video_poster: optionalText(1000),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

/** Découpe un textarea « une ligne = un élément » en liste nettoyée. */
export function parseLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Projet Remotion du Reel : projet npm autonome (son propre tsconfig et ses
    // propres dépendances). Le lint Next.js ne s'y applique pas — il est vérifié
    // par `npm run typecheck` depuis `reel/`. Voir `docs/REEL-REMOTION.md` §3.1.
    "reel/**",
  ]),
]);

export default eslintConfig;

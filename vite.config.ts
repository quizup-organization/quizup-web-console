import { readFileSync, writeFileSync } from "node:fs"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
) as { version: string }

/** Identifiant unique de build : détecte un nouveau déploiement (bannière de mise à jour). */
const buildId = Date.now().toString(36)

/** Émet `/version.json` (version + buildId) pour que le client détecte un nouveau build. */
function versionFile(): Plugin {
  return {
    name: "quizup-version-file",
    apply: "build",
    writeBundle(options) {
      const outDir = options.dir ?? path.resolve(import.meta.dirname, "dist")
      writeFileSync(
        path.join(outDir, "version.json"),
        JSON.stringify({ version, buildId }),
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), versionFile()],
  // Le redirect OIDC local est déclaré sur 5174 (`.env.development`) : port fixe requis.
  server: {
    port: 5174,
    strictPort: true,
  },
  // Version + build de l'app injectés au build (Réglages, détection de mise à jour).
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    // Pas de découpage manuel (`advancedChunks`) : il créait un cycle de chunks
    // session → vendor → react en 1.6.0, et le runtime Rolldown finissait dans
    // `session` → `TypeError: e is not a function` au boot (page blanche).
    chunkSizeWarningLimit: 600,
  },
})

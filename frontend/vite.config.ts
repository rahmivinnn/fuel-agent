import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
// runtimeErrorOverlay is optional and can cause issues outside Replit

// Resolve current directory robustly in ESM
const metaDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(metaDir, "src"),
    },
  },
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

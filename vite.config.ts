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
      "@": path.resolve(metaDir, "client", "src"),
      "@shared": path.resolve(metaDir, "shared"),
      "@assets": path.resolve(metaDir, "attached_assets"),
    },
  },
  // Use absolute paths so build writes to monorepo-level dist/public
  root: path.resolve(metaDir, "client"),
  publicDir: path.resolve(metaDir, "public"),
  build: {
    outDir: path.resolve(metaDir, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

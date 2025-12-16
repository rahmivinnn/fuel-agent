import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Minimal Vite config for mobile preview with simpler path resolution.
export default defineConfig({
  plugins: [react()],
  root: path.resolve(process.cwd(), "client"),
  publicDir: path.resolve(process.cwd(), "public"),
  build: {
    outDir: path.resolve(process.cwd(), "dist/public"),
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
});
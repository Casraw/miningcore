import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// During local development we proxy /api and /notifications to the live pool
// server so the dashboard talks to real data without CORS headaches.
// Override the target with VITE_API_TARGET when needed.
const apiTarget = process.env.VITE_API_TARGET ?? "https://new.mining-pool.io";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
      "/notifications": {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});

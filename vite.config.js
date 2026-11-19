import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Repo ist ein Projekt-Page: https://shulmanager.github.io/schulmanager.github.io/
  base: "/schulmanager.github.io/",
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  build: {
    outDir: "dist",
  },
});

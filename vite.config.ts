import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

/**
 * Drops the analytics <script> tag from index.html when
 * VITE_ANALYTICS_ENDPOINT is not configured. Without this, Vite leaves the
 * literal "%VITE_ANALYTICS_ENDPOINT%" placeholder in the built HTML, and the
 * browser requests /%VITE_ANALYTICS_ENDPOINT%/umami, producing console errors
 * on every page load.
 */
function optionalAnalyticsPlugin(): Plugin {
  let analyticsConfigured = false;
  return {
    name: "optional-analytics",
    configResolved(config) {
      analyticsConfigured = Boolean(config.env.VITE_ANALYTICS_ENDPOINT);
    },
    transformIndexHtml(html) {
      if (analyticsConfigured) return html;
      return html.replace(/<script[^>]*%VITE_ANALYTICS_ENDPOINT%[^>]*>\s*<\/script>/g, "");
    },
  };
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), optionalAnalyticsPlugin()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

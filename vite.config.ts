import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

// Project site lives at https://<user>.github.io/test-auth/
export default defineConfig({
  base: "/test-auth/",
  plugins: [
    react(),
    tailwindcss(),
    {
      // GitHub Pages has no SPA rewrite: a hard refresh or the post-login
      // redirect would 404. Ship a 404.html that is a copy of index.html so
      // the app shell always boots and MSAL can finish the redirect.
      name: "spa-404-fallback",
      closeBundle() {
        const dist = resolve(process.cwd(), "dist");
        copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
      },
    },
  ],
});

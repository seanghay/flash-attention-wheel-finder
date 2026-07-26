import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // GitHub Pages serves a project site from /<repo>/. CI sets BASE_PATH; local
  // dev and custom domains fall back to the root.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
})

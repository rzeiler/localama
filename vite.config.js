import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  base: "/page-creator/",
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate", // Service Worker automatisch aktualisieren
      includeAssets: ["favicon.svg", "robots.txt"], // weitere Assets
      manifest: {
        name: "localama",
         id: "/localama/",
        short_name: "localama",
        description: "Chat App mit Ollama",
        theme_color: "#ffffff",
         display: "standalone",
        start_url: "/localama/", 
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})

import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages project site: https://<user>.github.io/vitamin-tracker/
export default defineConfig({
  base: '/vitamin-tracker/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Vitamin Tracker',
        short_name: 'Витамины',
        description: 'Трекер приёма витаминов',
        theme_color: '#2f6b4f',
        background_color: '#f4f7f4',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ru',
        start_url: '/vitamin-tracker/',
        scope: '/vitamin-tracker/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})

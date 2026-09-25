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
        name: 'Водоросли',
        short_name: 'Водоросли',
        description: 'Спирулина и хлорелла через день',
        theme_color: '#E8F2EE',
        background_color: '#E8F2EE',
        display: 'standalone',
        display_override: ['standalone', 'fullscreen'],
        orientation: 'portrait',
        lang: 'ru',
        start_url: '/vitamin-tracker/',
        scope: '/vitamin-tracker/',
        categories: ['health', 'lifestyle'],
        prefer_related_applications: false,
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

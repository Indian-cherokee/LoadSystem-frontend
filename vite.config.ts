import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    mkcert({
      hosts: ['localhost', '127.0.0.1'],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            // Кеширование изображений с MinIO и других внешних источников
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 дней
              },
            },
          },
          {
            // Кеширование API запросов к бэкенду
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 минут
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      manifest: {
        name: 'Load System',
        short_name: 'LoadSystem',
        description: 'Система расчета нагрузок на строительные конструкции',
        theme_color: '#fdc300',
        background_color: '#FFFFFF',
        start_url: '/',
        display: 'standalone',
        icons: [
          { src: 'logo/icons8-l-48.png', type: 'image/png', sizes: '48x48' },
          { src: 'logo/icons8-l-96.png', type: 'image/png', sizes: '96x96', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

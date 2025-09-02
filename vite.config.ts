import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/candy-match-game-for-kids/',
      build: {
        target: ['es2020', 'chrome64', 'firefox67', 'safari13.1'],
        cssTarget: 'chrome64',
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        legacy({
          targets: ['defaults', 'not IE 11', 'ios_saf >= 13.4'],
          additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
          renderLegacyChunks: true,
          polyfills: [
            'es.symbol',
            'es.array.filter',
            'es.promise',
            'es.promise.finally',
          ],
        }),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'icon-*.png', 'fonts/*.woff2', 'fonts/*.woff'],
          manifest: {
            name: 'Sweet Swap Saga',
            short_name: 'Sweet Swap',
            description: 'A fun candy matching game for kids',
            theme_color: '#FF6B9D',
            background_color: '#FFE4E1',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/candy-match-game-for-kids/',
            start_url: '/candy-match-game-for-kids/',
            categories: ['games', 'entertainment'],
            prefer_related_applications: false,
            icons: [
              {
                src: 'icon-72x72.png',
                sizes: '72x72',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'icon-128x128.png',
                sizes: '128x128',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'icon-144x144.png',
                sizes: '144x144',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'icon-384x384.png',
                sizes: '384x384',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  }
                }
              }
            ]
          }
        })
      ]
    };
});

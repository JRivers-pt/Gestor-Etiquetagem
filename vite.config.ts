import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // ESTA PARTE É NOVA: Força o PWA a funcionar em localhost
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Gestor de Etiquetagem',
        short_name: 'GestorEtiquetagem',
        description: 'Sistema Industrial Híbrido',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'landscape', 
        icons: [
          {
            src: 'favicon.ico', // Vamos usar o favicon temporariamente pois não temos os pngs
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
})
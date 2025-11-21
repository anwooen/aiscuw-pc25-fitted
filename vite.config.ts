import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: {
      '/api': {
        target: 'https://fitted-uw-wardrobe.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  worker: {
    format: 'es', // Use ES module format for Web Workers (required for code-splitting)
  },
  build: {
    rollupOptions: {
      external: ['/api/**'],
    },
  },
})

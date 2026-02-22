import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    https: false
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons', 'react-icons'],
          utils: ['axios', 'html5-qrcode', 'docx-preview'],
          datepicker: ['react-datepicker']
        }
      }
    }
  }
})

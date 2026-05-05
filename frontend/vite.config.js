import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: process.env.PORT || 5173,
    host: '0.0.0.0',
  },
  preview: {
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
  },
})
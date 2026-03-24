import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcPath = path.resolve(__dirname, 'src').split(path.sep).join('/')

// GitHub Pages serves projects from "/<repo>/".
// When deployed via Actions, we set BASE_PATH to "/harvested-mvp/".
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? '/',
  resolve: {
    alias: { '@': srcPath },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

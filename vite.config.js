import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// base 경로: GitHub Pages 프로젝트 하위(/phi-lab-homepage/). custom domain 시 '/'.
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [
    tailwindcss(),
    reactRouter(),
  ],
})

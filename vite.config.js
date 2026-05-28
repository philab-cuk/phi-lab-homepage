import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base 경로:
// - GitHub Pages 프로젝트 페이지(guboc11.github.io/phi-lab-homepage/) 는 하위 경로.
//   → CI 에서 VITE_BASE=/phi-lab-homepage/ 주입.
// - custom domain(philabcuk.org) 으로 cutover 하면 최상위 → VITE_BASE 미설정 = '/'.
const base = process.env.VITE_BASE || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
  ],
})

// 빌드된 SPA(dist)를 vite preview 로 띄우고, 헤드리스 chromium 으로 공개
// 경로를 방문해 데이터까지 채워진 HTML 을 dist/<route>/index.html 로 굳힌다.
// /admin/*, /posts/* 는 제외 — 브라우저에서 동작하는 CSR/SPA 로 남김.
import { preview } from 'vite'
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

const ROUTES = [
  '/',
  '/about',
  '/members',
  '/professor',
  '/research',
  '/publications',
  '/lectures',
]
const DIST = 'dist'
const PORT = 4173

const server = await preview({ preview: { port: PORT, strictPort: true } })
const base = `http://localhost:${PORT}`

// SPA 원본 셸을 fallback 용으로 백업 (prerender 가 index.html 을 덮기 전에).
const indexPath = join(DIST, 'index.html')
const fallbackPath = join(DIST, 'spa-fallback.html')
if (existsSync(indexPath) && !existsSync(fallbackPath)) {
  copyFileSync(indexPath, fallbackPath)
  console.log('saved SPA fallback → dist/spa-fallback.html')
}

const browser = await chromium.launch()
const page = await browser.newPage()

let failed = 0
for (const route of ROUTES) {
  try {
    await page.goto(base + route, { waitUntil: 'networkidle', timeout: 20000 })
    // 데이터 로딩 완료 대기: '로딩 중' 문구 사라지고 h1 존재.
    await page
      .waitForFunction(
        () => !document.body.innerText.includes('로딩 중') && !!document.querySelector('h1'),
        { timeout: 15000 },
      )
      .catch(() => console.warn(`  (warn) ${route}: 로딩 대기 타임아웃`))
    await page.waitForTimeout(300)

    const html = await page.content()
    const outPath = route === '/' ? indexPath : join(DIST, route, 'index.html')
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, '<!DOCTYPE html>\n' + html)
    console.log(`prerendered ${route} → ${outPath} (${(html.length / 1024).toFixed(1)} KB)`)
  } catch (e) {
    failed++
    console.error(`FAILED ${route}: ${e.message}`)
  }
}

await browser.close()
await server.httpServer.close()

// SPA fallback: 정적 호스팅에서 prerender 안 된 경로(/admin/*, /posts/*)나
// 직접진입/새로고침 시 빈 셸을 돌려주도록 404.html 로 둔다 (GitHub Pages 규약).
if (existsSync(fallbackPath)) {
  copyFileSync(fallbackPath, join(DIST, '404.html'))
  console.log('wrote SPA fallback → dist/404.html')
}

if (failed) {
  console.error(`\n${failed} route(s) failed`)
  process.exit(1)
}
console.log('\nprerender done')

import { test, expect } from '@playwright/test'

// E1-news-1 — 뉴스 목록/상세가 렌더되고 콘솔 에러가 없다 (라이브 깨짐 스모크).
// 데이터가 있으면 첫 소식 상세로 들어가 NewsItem(useParams + usePageMeta)까지 확인한다.
test('E1-news-1: 뉴스 목록/상세가 렌더되고 콘솔 에러가 없다', async ({ page }) => {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/news')
  await expect(page.getByRole('heading', { name: 'News', exact: true })).toBeVisible({ timeout: 15000 })

  const firstCard = page.locator('a[href^="/news/"]').first()
  if (await firstCard.count()) {
    await firstCard.click()
    await expect(page).toHaveURL(/\/news\/.+/)
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })
  }

  expect(errors, `콘솔 에러: ${errors.join('\n')}`).toEqual([])
})

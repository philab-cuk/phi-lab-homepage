import { test, expect } from '@playwright/test'

// E1-news-1 — 뉴스 목록이 렌더되고 콘솔 에러가 없다 (라이브 깨짐 스모크).
// 데이터가 있으면 카드가, 없으면 안내 문구가 뜬다 — 어느 쪽이든 Layout/라우트가
// 크래시 없이 렌더되는지 확인한다.
test('E1-news-1: 뉴스 목록이 렌더되고 콘솔 에러가 없다', async ({ page }) => {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/news')
  await expect(page.getByRole('heading', { name: 'News', exact: true })).toBeVisible({ timeout: 15000 })

  expect(errors, `콘솔 에러: ${errors.join('\n')}`).toEqual([])
})

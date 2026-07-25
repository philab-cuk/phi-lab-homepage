import { test, expect } from '@playwright/test'

// E1-schedule-1 — 비로그인 방문자에게 Schedule 이 안내 화면으로 뜨고 콘솔 에러가 없다.
// (로그인 뒤 캘린더는 자격증명이 필요해 여기서 다루지 않는다. 날짜 계산은
//  tests/unit/schedules-dates.test.js 가 검증한다.)
test('E1-schedule-1: 비로그인 Schedule 게이트가 렌더되고 콘솔 에러가 없다', async ({ page }) => {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/schedule')
  await expect(page.getByRole('heading', { name: 'Schedule', exact: true })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('로그인이 필요합니다')).toBeVisible()

  // 비로그인에게는 Schedule 메뉴가 노출되지 않아야 한다.
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Schedule' })).toHaveCount(0)

  expect(errors, `콘솔 에러: ${errors.join('\n')}`).toEqual([])
})

import { describe, it, expect } from 'vitest'
import {
  CATEGORIES, CATEGORY_MAP, ymd, parseYmd, addDays, datesInRange, formatRange,
} from '../../app/lib/schedules'

// 날짜 계산은 캘린더의 유일한 '조용히 틀릴 수 있는' 부분이라 고정 테스트를 둔다.
// 특히 KST(UTC+9)에서 toISOString() 을 쓰면 하루가 밀리는데, 그 회귀를 막는 게 목적.

describe('ymd / parseYmd (시간대 안전성)', () => {
  it('로컬 날짜를 0 패딩해 포맷한다', () => {
    expect(ymd(new Date(2026, 6, 1))).toBe('2026-07-01')
    expect(ymd(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('왕복해도 날짜가 밀리지 않는다 (KST 회귀 방지)', () => {
    for (const s of ['2026-01-01', '2026-07-21', '2026-12-31', '2024-02-29']) {
      expect(ymd(parseYmd(s))).toBe(s)
    }
  })

  it('parseYmd 는 로컬 자정으로 해석한다', () => {
    const d = parseYmd('2026-07-21')
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 6, 21, 0])
  })
})

describe('addDays', () => {
  it('월·연 경계를 넘는다', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29') // 윤년
  })
})

describe('datesInRange', () => {
  it('종료일이 없으면 하루', () => {
    expect(datesInRange('2026-07-21', null)).toEqual(['2026-07-21'])
    expect(datesInRange('2026-07-21', '')).toEqual(['2026-07-21'])
  })

  it('여러 날은 양 끝을 포함해 펼친다', () => {
    expect(datesInRange('2026-07-06', '2026-07-09'))
      .toEqual(['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09'])
  })

  it('월 경계를 넘는 기간도 이어진다', () => {
    expect(datesInRange('2026-07-30', '2026-08-02'))
      .toEqual(['2026-07-30', '2026-07-31', '2026-08-01', '2026-08-02'])
  })

  it('종료일이 시작일보다 앞서면 하루로 처리한다', () => {
    expect(datesInRange('2026-07-21', '2026-07-01')).toEqual(['2026-07-21'])
  })
})

describe('formatRange', () => {
  it('하루 / 여러 날을 구분해 표기한다', () => {
    expect(formatRange('2026-07-21', null)).toBe('2026. 7. 21.')
    expect(formatRange('2026-07-06', '2026-07-11')).toBe('2026. 7. 6. – 7. 11.')
    expect(formatRange('2026-12-30', '2027-01-02')).toBe('2026. 12. 30. – 2027. 1. 2.')
  })
})

describe('카테고리', () => {
  it('6종이며 값이 중복되지 않는다', () => {
    expect(CATEGORIES).toHaveLength(6)
    expect(new Set(CATEGORIES.map((c) => c.value)).size).toBe(6)
  })

  it('개인일정(부재중)이 포함된다', () => {
    expect(CATEGORY_MAP.personal?.label).toBe('개인일정(부재중)')
  })

  it('모든 카테고리에 색이 있다', () => {
    for (const c of CATEGORIES) expect(c.color).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

import { CATEGORY_MAP, datesInRange, todayYmd, ymd } from '../lib/schedules'
import { holidayName } from '../lib/holidays'

// 붉은 날(공휴일·일요일) / 토요일 칸 배경 — 아주 옅은 투명 톤.
const BG_HOLIDAY = 'rgba(199, 58, 58, 0.055)'
const BG_SATURDAY = 'rgba(47, 95, 208, 0.05)'
const FG_HOLIDAY = '#c73a3a'
const FG_SATURDAY = '#2f5fd0'

// 월간 캘린더 그리드 — 외부 라이브러리 없이 Date 계산만 사용.
// 여러 날 일정은 기간 내 각 날짜에 반복 표시한다(막대 렌더링은 하지 않음).
//
// props
//   year, month(0-11)  표시할 달
//   events             [{ id, title, category, startsOn, endsOn, ... }]
//   onSelectEvent(ev)  일정 클릭 → 상세
//   onSelectDay(date)  '+N'(넘친 일정)·모바일 점 클릭 → 그날 목록
//   maxPerDay          한 칸에 제목까지 보여줄 최대 개수

const DOW = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar({
  year,
  month,
  events = [],
  onSelectEvent,
  onSelectDay,
  maxPerDay = 2,
}) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const rows = Math.ceil((firstWeekday + lastDate) / 7)
  const today = todayYmd()

  const byDate = {}
  for (const ev of events) {
    for (const d of datesInRange(ev.startsOn, ev.endsOn)) {
      if (!byDate[d]) byDate[d] = []
      byDate[d].push(ev)
    }
  }

  const cells = []
  for (let i = 0; i < rows * 7; i++) {
    const day = i - firstWeekday + 1
    cells.push(day >= 1 && day <= lastDate ? day : null)
  }

  return (
    <div>
      <div className="grid grid-cols-7 pb-1.5 text-[13px]">
        {DOW.map((d, i) => (
          <div
            key={d}
            className="text-center"
            style={{ color: i === 0 ? FG_HOLIDAY : i === 6 ? FG_SATURDAY : undefined }}
          >
            <span className={i === 0 || i === 6 ? '' : 'text-meta'}>{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px border border-rule bg-rule">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="min-h-[86px] bg-[#fafafa] sm:min-h-[104px]" />
          const date = ymd(new Date(year, month, day))
          const items = byDate[date] ?? []
          const shown = items.slice(0, maxPerDay)
          const extra = items.length - shown.length
          const isToday = date === today
          const dow = (firstWeekday + day - 1) % 7
          const holiday = holidayName(date)
          const isRed = !!holiday || dow === 0
          const isSat = dow === 6 && !isRed

          return (
            <div
              key={i}
              className="min-h-[86px] p-1.5 sm:min-h-[104px]"
              style={{ background: isRed ? BG_HOLIDAY : isSat ? BG_SATURDAY : '#ffffff' }}
            >
              <div className="mb-1 flex items-baseline gap-1.5">
                {isToday ? (
                  <span className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-ink text-[12px] text-white">
                    {day}
                  </span>
                ) : (
                  <span
                    className={`px-0.5 text-[12px] ${isRed || isSat ? '' : 'text-muted'}`}
                    style={{ color: isRed ? FG_HOLIDAY : isSat ? FG_SATURDAY : undefined }}
                  >
                    {day}
                  </span>
                )}
                {holiday && (
                  <span className="truncate text-[11px]" style={{ color: FG_HOLIDAY }}>
                    {holiday}
                  </span>
                )}
              </div>

              {/* 모바일: 좁아서 제목이 안 들어가므로 점만. 누르면 그날 목록. */}
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectDay?.(date)}
                  aria-label={`${month + 1}월 ${day}일 일정 ${items.length}건 보기`}
                  className="flex w-full flex-wrap gap-1 px-0.5 sm:hidden"
                >
                  {items.slice(0, 6).map((ev, k) => (
                    <span
                      key={k}
                      className="inline-block h-[7px] w-[7px] rounded-full"
                      style={{ background: CATEGORY_MAP[ev.category]?.color ?? '#888' }}
                    />
                  ))}
                </button>
              )}

              {/* 데스크톱: 색 점 + 제목 */}
              <div className="hidden sm:block">
                {shown.map((ev, k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onSelectEvent?.(ev)}
                    title={ev.title}
                    className="mb-0.5 flex w-full items-center gap-1.5 px-1 py-px text-left hover:bg-brand-100/60"
                  >
                    <span
                      className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
                      style={{ background: CATEGORY_MAP[ev.category]?.color ?? '#888' }}
                    />
                    <span className="truncate text-[12.5px] leading-snug text-ink">{ev.title}</span>
                  </button>
                ))}
                {extra > 0 && (
                  <button
                    type="button"
                    onClick={() => onSelectDay?.(date)}
                    className="px-1 text-[11.5px] text-meta hover:underline"
                  >
                    +{extra}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

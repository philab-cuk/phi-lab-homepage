import { supabase } from './supabase'

// 연구실 공유 일정(Schedule) — 로그인 구성원 전용.
// 날짜는 전부 'YYYY-MM-DD' 문자열로 다룬다. Date.toISOString() 은 UTC 로 변환돼
// KST(UTC+9)에서 하루 밀리므로 이 파일에서는 절대 쓰지 않는다.

// 카테고리 — DB 의 check 제약(schedules.category)과 반드시 함께 유지할 것.
// 색은 사이트에서 이미 쓰는 팔레트에서 가져와 캘린더만 튀지 않게 했다.
export const CATEGORIES = [
  { value: 'conference', label: '학회', color: '#2f5fd0' },
  { value: 'paper', label: '논문', color: '#c29a2e' },
  { value: 'project', label: '프로젝트', color: '#1d9e75' },
  { value: 'external', label: '외부미팅', color: '#d85a30' },
  { value: 'lab_meeting', label: '랩미팅', color: '#5b9bd5' },
  { value: 'education', label: '교육/행사', color: '#d4537e' },
  { value: 'personal', label: '개인일정(부재중)', color: '#7f77dd' },
]
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

const pad = (n) => String(n).padStart(2, '0')

// Date → 'YYYY-MM-DD' (로컬 기준)
export function ymd(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 'YYYY-MM-DD' → Date (로컬 자정). new Date('2026-07-21') 은 UTC 로 해석되므로 쓰지 않는다.
export function parseYmd(s) {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(s, n) {
  const d = parseYmd(s)
  d.setDate(d.getDate() + n)
  return ymd(d)
}

export function todayYmd() {
  return ymd(new Date())
}

// 시작~종료 사이의 모든 날짜. 종료일이 없거나 시작일 이하면 하루짜리.
export function datesInRange(startsOn, endsOn) {
  const out = [startsOn]
  if (!endsOn || endsOn <= startsOn) return out
  let cur = startsOn
  while (cur < endsOn) {
    cur = addDays(cur, 1)
    out.push(cur)
  }
  return out
}

// '2026. 7. 6. – 7. 11.' / 하루면 '2026. 7. 6.'
export function formatRange(startsOn, endsOn) {
  const s = parseYmd(startsOn)
  const head = `${s.getFullYear()}. ${s.getMonth() + 1}. ${s.getDate()}.`
  if (!endsOn || endsOn <= startsOn) return head
  const e = parseYmd(endsOn)
  const tail =
    e.getFullYear() === s.getFullYear()
      ? `${e.getMonth() + 1}. ${e.getDate()}.`
      : `${e.getFullYear()}. ${e.getMonth() + 1}. ${e.getDate()}.`
  return `${head} – ${tail}`
}

function mapRow(r) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    startsOn: r.starts_on,
    endsOn: r.ends_on,
    ownerEmail: r.owner_email,
    ownerName: r.owner_name,
  }
}

// 전체를 한 번에 불러와 클라이언트에서 달별로 나눈다 — 연구실 규모(연 수백 건)에서는
// 부담이 없고, 달 이동이 재요청 없이 즉시 이뤄진다. 규모가 커지면 기간 필터를 건다.
export async function fetchSchedules() {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('starts_on', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapRow)
}

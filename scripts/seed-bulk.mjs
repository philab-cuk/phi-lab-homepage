// 데모용 대량 시드: posts 20건(published) + news 25건(published).
// 기존 테스트 데이터를 모두 지우고 새로 생성한다. (로컬 dev 전용)
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { ServerBlockNoteEditor } from '@blocknote/server-util'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const ed = ServerBlockNoteEditor.create()
const body = (md) => ed.tryParseMarkdownToBlocks(md)
const BASE = env.VITE_SUPABASE_URL

const { data: au } = await admin.from('admin_users').select('email, display_name')
const nameOf = (email) => (au?.find(u => u.email === email)?.display_name) || '관리자'
const ADMIN = 'admin@philab.org'
const PROF = 'hyojung.kim@catholic.ac.kr'

// 날짜: 기준일에서 days 일 전 (정오)
function daysAgo(days) {
  const base = Date.UTC(2026, 5, 18, 3, 0, 0) // 2026-06-18 12:00 KST 근처
  return new Date(base - days * 86400000).toISOString()
}

// ── POSTS (게시판) — 공지 3 + 일반 17 = 20 ──────────────────────────────────
const postNotices = [
  '[공지] 연구실 인턴 모집 안내',
  '[공지] 2026년 하반기 세미나 일정',
  '[공지] 연구실 안전교육 필수 이수',
]
const postTitles = [
  '[2026년도 후기 대학원생 모집] 심층면접 안내',
  '여름 인턴십 프로그램 신청 받습니다',
  'AI 헬스케어 특강 — 외부 연사 초청',
  '논문 스터디 모임 안내 (매주 금요일)',
  '연구실 워크숍 후기 공유',
  '신규 장비 도입 및 사용 안내',
  'GPU 서버 사용 규칙 업데이트',
  '데이터셋 접근 권한 신청 방법',
  '학회 출장 지원 절차 안내',
  '연구윤리 교육 자료 공유',
  '코드 리뷰 가이드라인 v2',
  '신입생 환영회 및 오리엔테이션',
  '저널 클럽: 이번 주 논문 목록',
  '연구 노트 작성 템플릿 배포',
  '협력기관 공동연구 미팅 일정',
  '장학금 신청 안내 (교내/교외)',
  '연구실 비품 신청 및 정산 방법',
]

const posts = []
postNotices.forEach((t, i) => {
  const email = i % 2 === 0 ? ADMIN : PROF
  posts.push({ id: crypto.randomUUID(), title: t, body_json: null, status: 'published', pinned: true, published_at: daysAgo(100 + i * 5), author_email: email, author_name: nameOf(email), views: 50 + i * 30 })
})
postTitles.forEach((t, i) => {
  const email = i % 3 === 0 ? PROF : ADMIN
  posts.push({ id: crypto.randomUUID(), title: t, body_json: null, status: 'published', pinned: false, published_at: daysAgo(3 + i * 6), author_email: email, author_name: nameOf(email), views: Math.round(200 / (i + 1)) + (i * 7) % 40 })
})
for (const p of posts) {
  p.body_json = await body(`${p.title}\n\n본문 예시입니다. **굵게**, *기울임*, 링크 등 서식이 들어갈 수 있습니다.\n\n- 항목 하나\n- 항목 둘\n\n> 문의는 연구실로 연락 바랍니다.`)
}

// ── NEWS (행사 격자) — 25건, 본문 첫 이미지가 커버 ──────────────────────────
const covers = [
  `${BASE}/storage/v1/object/public/news-images/seed-test/cover-hero.jpg`,
  `${BASE}/storage/v1/object/public/news-images/seed-test/cover-portrait.jpg`,
  `${BASE}/storage/v1/object/public/news-images/seed-test/sample.jpg`,
]
const newsTitles = [
  'ASCE i3CE 2026 Conference 참가', '2026년 1학기 석사학위 논문 최종 심사', '제 9회 PHI Lab 홈커밍데이',
  '신규 학부연구생 합류 안내', 'KOSMI 2026 우수논문상 수상', '연구실 여름 MT 다녀왔습니다',
  '국제 공동연구 협약 체결', 'IEEE EMBC 2026 발표', '카카오헬스케어 산학협력 미팅',
  '대한의료정보학회 춘계학술대회 참가', '신임 박사후연구원 합류', '연구과제 최종평가 우수 선정',
  '학부생 캡스톤 디자인 수상', '랩 세미나 100회 달성', '삼성서울병원 데이터 협력 시작',
  '논문 게재 — Journal of Biomedical Informatics', '연말 송년회 및 시상식', '신규 연구실 이전 완료',
  '여름 인턴 수료식', 'AMIA 2026 포스터 발표', '전남대 공동워크숍 개최',
  '교수님 우수강의상 수상', '연구실 창립 13주년 기념', '신규 GPU 클러스터 구축 완료',
  '졸업생 동문 간담회',
]
const news = []
newsTitles.slice(0, 25).forEach((t, i) => {
  const img = covers[i % covers.length]
  const hasImg = i % 6 !== 5 // 6개마다 1개는 사진 없음(placeholder 확인)
  news.push({ _title: t, _date: daysAgo(2 + i * 9), _img: hasImg ? img : null })
})
const newsRows = []
for (const n of news) {
  const md = (n._img ? `![cover](${n._img})\n\n` : '') + `${n._title}\n\n행사/소식 본문입니다. 자세한 내용은 사진과 함께 확인하세요.`
  newsRows.push({ id: crypto.randomUUID(), title: n._title, body_json: await body(md), status: 'published', published_at: n._date, author_email: ADMIN })
}

// ── 적용: 기존 전부 삭제 후 삽입 ────────────────────────────────────────────
await admin.from('posts').delete().not('id', 'is', null)
await admin.from('news').delete().not('id', 'is', null)
const { error: pe } = await admin.from('posts').insert(posts)
if (pe) { console.error('posts insert 실패:', pe.message); process.exit(1) }
const { error: ne } = await admin.from('news').insert(newsRows)
if (ne) { console.error('news insert 실패:', ne.message); process.exit(1) }
console.log(`✓ posts ${posts.length}건 (공지 ${postNotices.length} + 일반 ${postTitles.length}), news ${newsRows.length}건 시드 완료`)

// 게시판 확인용 posts 시드 (BlockNote 본문 + pinned/author_name/views).
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { ServerBlockNoteEditor } from '@blocknote/server-util'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const ed = ServerBlockNoteEditor.create()
const body = (md) => ed.tryParseMarkdownToBlocks(md)

// 작성자 표시이름 — admin_users 에서 가져옴(없으면 관리자)
const { data: au } = await admin.from('admin_users').select('email, display_name')
const nameOf = (email) => (au?.find(u => u.email === email)?.display_name) || '관리자'

const ADMIN = 'admin@philab.org'
const PROF = 'hyojung.kim@catholic.ac.kr'

const notices = [
  { title: '[공지] 연구실 인턴 모집', email: ADMIN, date: '2026-03-02T09:00:00Z' },
  { title: '[공지] 2026년 세미나 일정 안내', email: PROF, date: '2026-02-20T09:00:00Z' },
]
const normals = [
  { title: '[2026년도 전기 대학원생 모집] 심층면접 안내', email: ADMIN, date: '2026-05-15T09:00:00Z', views: 120 },
  { title: '여름 인턴십 프로그램 신청 받습니다', email: PROF, date: '2026-05-10T09:00:00Z', views: 88 },
  { title: 'AI 헬스케어 특강 — 외부 연사 초청', email: ADMIN, date: '2026-04-28T09:00:00Z', views: 64 },
  { title: '논문 스터디 모임 안내 (매주 금요일)', email: PROF, date: '2026-04-12T09:00:00Z', views: 45 },
  { title: '연구실 워크숍 후기 공유', email: ADMIN, date: '2026-03-30T09:00:00Z', views: 31 },
  { title: '신규 장비 도입 및 사용 안내', email: ADMIN, date: '2026-03-15T09:00:00Z', views: 22 },
]

// 기존 [TEST] posts 정리
await admin.from('posts').delete().like('title', '[TEST%')
// 기존 게시판 시드도 정리(재실행 안전) — 위 제목들과 동일하면 지움
const allTitles = [...notices, ...normals].map(n => n.title)
await admin.from('posts').delete().in('title', allTitles)

const rows = []
for (const n of notices) {
  rows.push({ id: crypto.randomUUID(), title: n.title, body_json: await body(`${n.title}\n\n자세한 내용은 본문을 참고하세요. 문의는 연구실로 연락 바랍니다.`), status: 'published', pinned: true, published_at: n.date, author_email: n.email, author_name: nameOf(n.email), views: 0 })
}
for (const n of normals) {
  rows.push({ id: crypto.randomUUID(), title: n.title, body_json: await body(`${n.title}\n\n본문 예시입니다. **굵게**, *기울임*, 목록 등 서식이 들어갈 수 있습니다.\n\n- 항목 1\n- 항목 2`), status: 'published', pinned: false, published_at: n.date, author_email: n.email, author_name: nameOf(n.email), views: n.views })
}
// draft 1건(미노출 확인용)
rows.push({ id: crypto.randomUUID(), title: '[DRAFT] 비공개 초안 글', body_json: await body('보이면 안 됨'), status: 'draft', pinned: false, published_at: null, author_email: ADMIN, author_name: nameOf(ADMIN), views: 0 })

const { error } = await admin.from('posts').insert(rows)
if (error) { console.error('insert 실패:', error.message); process.exit(1) }
console.log(`✓ posts 게시판 시드: 공지 ${notices.length} + 일반 ${normals.length} + draft 1`)

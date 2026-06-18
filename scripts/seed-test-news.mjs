// 로컬 dev 용 news 테스트 글 시드 (BlockNote 블록 형식, Posts 와 동일).
// 본문 첫 이미지가 격자 커버가 되도록 일부 글에 image 블록을 넣는다.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { ServerBlockNoteEditor } from '@blocknote/server-util'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const BASE = env.VITE_SUPABASE_URL
const IMG1 = `${BASE}/storage/v1/object/public/news-images/seed-test/cover-hero.jpg`
const IMG2 = `${BASE}/storage/v1/object/public/news-images/seed-test/cover-portrait.jpg`
const ed = ServerBlockNoteEditor.create()

// 마크다운으로 작성 → BlockNote 블록으로 변환(설치 버전과 정확히 일치)
async function body(md) { return ed.tryParseMarkdownToBlocks(md) }

const richMd = (img) => `![cover](${img})

이번 소식 본문입니다. **굵게**, *기울임*, [링크](https://philabcuk.org)도 됩니다.

## 소제목

- 항목 하나
- 항목 둘

> 인용 한 줄.`

const rows = [
  { title: 'ASCE i3CE 2026 Conference 참가', date: '2026-06-17T09:00:00Z', md: richMd(IMG1) },
  { title: '2026년 1학기 석사학위 논문 최종 심사', date: '2026-06-11T09:00:00Z', md: richMd(IMG2) },
  { title: '제 9회 PHI Lab 홈커밍데이', date: '2026-05-30T09:00:00Z', md: richMd(IMG1) },
  { title: '신규 학부연구생 합류 안내', date: '2026-05-20T09:00:00Z', md: richMd(IMG2) },
  // 본문에 이미지 없음 → 격자 placeholder 확인용
  { title: '연구실 공지: 여름 세미나 일정 (사진 없음)', date: '2026-05-10T09:00:00Z', md: '사진 없는 소식입니다. 격자에서 placeholder 로 보여야 합니다.' },
]

// 기존 테스트 news 정리 (이전 시드의 한글 제목들 + [TEST] prefix 모두)
await admin.from('news').delete().not('id', 'is', null)

const inserts = []
for (const r of rows) {
  inserts.push({ id: crypto.randomUUID(), title: r.title, body_json: await body(r.md), status: 'published', published_at: r.date, author_email: 'admin@philab.org' })
}
inserts.push({ id: crypto.randomUUID(), title: '[TEST-DRAFT] 비공개 초안', body_json: await body('보이면 안 됨'), status: 'draft', published_at: null, author_email: 'admin@philab.org' })

const { error } = await admin.from('news').insert(inserts)
if (error) { console.error('insert 실패:', error.message); process.exit(1) }
console.log('✓ news', inserts.length, '건 재시드 (published 5 + draft 1, BlockNote 형식)')

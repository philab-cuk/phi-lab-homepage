// 로컬 dev 용 posts 테스트 글 시드 (BlockNote 블록 형식).
// 기존 [TEST] 글을 지우고, 마크다운을 BlockNote 자신에게 변환시켜
// "설치된 버전과 정확히 일치하는" 블록 JSON 으로 재삽입한다.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { ServerBlockNoteEditor } from '@blocknote/server-util'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const IMG = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/post-images/seed-test/body-image.jpg`
const ed = ServerBlockNoteEditor.create()

const richMd = `이 글은 서식 렌더링 검증용입니다. **굵은 글씨**와 *기울임*, 그리고 [링크](https://philabcuk.org)가 들어 있습니다.

## 섹션 제목 (H2)

- 목록 항목 하나
- 목록 항목 둘

> 인용문 블록입니다.

![test image](${IMG})

| 헤더 A | 헤더 B |
| ------ | ------ |
| 셀 1   | 셀 2   |

이미지 아래 마지막 문단.`

const plainMd = `단순한 글입니다. 목록 발췌가 이 문장으로 시작해야 합니다.

두 번째 문단은 발췌에 안 나옵니다.`

const draftMd = `이 글이 공개 목록/상세에 보이면 RLS/필터가 깨진 것.`

const [richBody, plainBody, draftBody] = await Promise.all(
  [richMd, plainMd, draftMd].map(md => ed.tryParseMarkdownToBlocks(md)))
console.log('rich block types:', richBody.map(b => b.type).join(', '))

const { error: delErr } = await admin.from('posts').delete().like('title', '[TEST%')
if (delErr) { console.error('기존 테스트 글 삭제 실패:', delErr.message); process.exit(1) }
console.log('✓ 기존 [TEST] 글 삭제')

const rows = [
  { id: crypto.randomUUID(), title: '[TEST] Rich formatting post', body_json: richBody, status: 'published', published_at: '2026-06-10T10:00:00Z', author_email: 'admin@philab.org' },
  { id: crypto.randomUUID(), title: '[TEST] Plain post', body_json: plainBody, status: 'published', published_at: '2026-06-02T10:00:00Z', author_email: 'admin@philab.org' },
  { id: crypto.randomUUID(), title: '[TEST-DRAFT] 비공개 초안 post', body_json: draftBody, status: 'draft', published_at: null, author_email: 'admin@philab.org' },
]
const { error } = await admin.from('posts').insert(rows)
if (error) { console.error('insert 실패:', error.message); process.exit(1) }
console.log('✓ posts 3건 삽입 (published 2 + draft 1)')
console.log('rich post id:', rows[0].id)

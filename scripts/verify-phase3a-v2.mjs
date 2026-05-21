import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

const newClient = () => createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

let failures = 0
const check = (label, ok, info) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${info != null ? ' — ' + JSON.stringify(info) : ''}`)
  if (!ok) failures++
}

// ----- RLS write 매트릭스: 각 테이블에 valid payload 로 INSERT 시도 → RLS 만 차단되어야 -----
console.log('--- RLS write (researcher, valid payload, RLS 차단 기대) ---')
const sbR = newClient()
await sbR.auth.signInWithPassword({ email: 'researcher@philab.org', password: 'philab123' })

const cases = [
  ['members',     { id: '_v_m', name: 'v', role: 'student', status: 'current' }],
  ['publications', { id: '_v_p', category: 'article', title: 'v', year: 2026 }],
  ['research',    { id: '_v_r', title: 'v', status: 'active' }],
  ['lectures',    { id: '_v_l', title_en: 'v', semester: 'Spring 2026', year: 2026, term: 'Spring', level: 'undergraduate' }],
  ['authors',     { name: 'v' }],
  ['institutions', { name_en: '__v_inst' }],
]
for (const [t, payload] of cases) {
  const { error } = await sbR.from(t).insert(payload)
  const rlsBlocked = !!error && /row-level security/i.test(error.message)
  check(`researcher INSERT ${t} → RLS 차단`, rlsBlocked, { msg: error?.message })
}

// ----- anon: 모든 테이블 SELECT (count head) -> 0행이거나 권한 거부 -----
console.log('\n--- anon SELECT 차단/0행 ---')
const sbA = newClient()
for (const t of ['members','publications','research','lectures','admin_users','invites','authors','publication_authors','institutions','research_affiliations']) {
  const { count, error } = await sbA.from(t).select('*', { count: 'exact', head: true })
  // RLS 가 모두 to authenticated 라 anon 은 행을 못 봐야 → count 0 또는 권한 거부
  const ok = (!error && (count || 0) === 0) || (error && /permission|denied/i.test(error.message))
  check(`anon SELECT ${t}`, ok, { count, err: error?.message })
}

// ----- anon: posts published 만 보여야 -----
console.log('\n--- anon SELECT posts published ---')
{
  // admin 으로 published post 한 개 임시 삽입
  const sb = newClient()
  await sb.auth.signInWithPassword({ email: 'admin@philab.org', password: 'philab123' })
  const { data: ins } = await sb.from('posts').insert({
    title: '__verify_published_post', status: 'published', published_at: new Date().toISOString(),
    author_email: 'admin@philab.org', body_json: { type: 'doc', content: [] },
  }).select().single()
  const { data: insDraft } = await sb.from('posts').insert({
    title: '__verify_draft_post', status: 'draft',
    author_email: 'admin@philab.org', body_json: { type: 'doc', content: [] },
  }).select().single()

  const sbAnon = newClient()
  const { data: anonPosts, error } = await sbAnon.from('posts').select('id, title, status')
  check('anon SELECT posts published 만',
    !error && anonPosts?.length === 1 && anonPosts[0].title === '__verify_published_post',
    { rows: anonPosts?.length, titles: anonPosts?.map(p => p.title), err: error?.message }
  )

  // 정리
  await sb.from('posts').delete().in('id', [ins.id, insDraft.id])
}

console.log()
if (failures === 0) {
  console.log('=== ALL PASS ===')
} else {
  console.log(`=== ${failures} FAILURE(S) ===`)
  process.exit(1)
}

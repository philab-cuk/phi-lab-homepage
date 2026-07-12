// PI(교수) 레코드의 college(단과대) 필드 설정.
// 학과가 단과대(College of Biomedical Sciences and Bioengineering) 소속이 됨.
// 실행: node scripts/set-professor-college.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const COLLEGE = 'College of Biomedical Sciences and Bioengineering'

// PI 식별 — id 'hkim' 우선, 없으면 지도교수/역할 맨 앞.
const { data: rows, error } = await admin
  .from('members')
  .select('id, name, title, department, college, institution, role')
if (error) { console.error('✗ 조회 실패:', error); process.exit(1) }

const pi = rows.find((m) => m.id === 'hkim') || rows.find((m) => m.role === '지도교수') || rows[0]
if (!pi) { console.error('✗ PI 레코드를 찾지 못했습니다'); process.exit(1) }

const { error: updErr } = await admin
  .from('members')
  .update({ college: COLLEGE })
  .eq('id', pi.id)

if (updErr) { console.error('✗ 업데이트 실패:', updErr); process.exit(1) }
console.log(`✓ ${pi.name} (${pi.id}) college 설정 완료`)
console.log(`  title:       ${pi.title}`)
console.log(`  department:  ${pi.department}`)
console.log(`  college:     ${COLLEGE}`)
console.log(`  institution: ${pi.institution}`)

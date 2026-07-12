// PI(교수) 기타 경력 사항 = Professional Service (학회·위원회 활동).
// CV 「기타 경력 사항」을 영어로 변환, 최신순. 기존 CODA 1건은 4건으로 교체.
// members.service (문자열 배열) — admin 편집과 동일한 형식 유지.
// 실행: node scripts/set-professor-service.mjs
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

const SERVICE = [
  'Member, Academic Committee, Korean Society of Medical Informatics (KOSMI) (2026–present)',
  'Member, 2nd Data Disclosure and Utilization Committee, Clinical & Omics Data Archive (CODA), The Korea National Institute of Health (2024–2026)',
  'Committee Member, National Bio Big Data Future Symposium, Digital Healthcare Alliance Forum (2024)',
  'Expert Advisor, Mid- and Long-Term Plan and R&D Planning for Healthcare and AI, The Korea National Institute of Health (2022–2023)',
]

const { error, count } = await admin
  .from('members')
  .update({ service: SERVICE }, { count: 'exact' })
  .eq('id', 'hkim')

if (error) { console.error('✗ 업데이트 실패:', error); process.exit(1) }
console.log(`✓ hkim service 설정 완료 — ${count} row · ${SERVICE.length} 항목`)
SERVICE.forEach((s, i) => console.log(`  ${i + 1}. ${s}`))

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)
// 익명(anon) 키로 — 로그인 안 한 방문자 시뮬레이션
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } })

let fail = 0
const check = (l, ok, info) => { console.log(`${ok?'✓':'✗'} ${l}${info!=null?' — '+JSON.stringify(info):''}`); if(!ok) fail++ }

// members
{
  const { data, error } = await sb.from('members').select('*').order('status').order('display_order')
  check('members (anon)', !error && data.length === 8, { rows: data?.length, err: error?.message })
}
// publications join
{
  const { data, error } = await sb.from('publications')
    .select('*, publication_authors(position, is_pi, is_co_first, is_co_correspond, authors(name, full_name))')
    .order('year', { ascending: false }).order('display_order')
  const sample = data?.[0]
  check('publications + authors join (anon)', !error && data.length === 40 && Array.isArray(sample?.publication_authors), { rows: data?.length, firstAuthors: sample?.publication_authors?.length, err: error?.message })
}
// research join
{
  const { data, error } = await sb.from('research')
    .select('*, research_affiliations(position, department_en, department_ko, institutions(name_en, name_ko, is_internal))')
    .order('status').order('display_order')
  const withAff = data?.find(r => (r.research_affiliations?.length || 0) > 0)
  check('research + affiliations join (anon)', !error && data.length === 19, { rows: data?.length, sampleAff: withAff?.research_affiliations?.[0]?.institutions?.name_en, err: error?.message })
}
// lectures
{
  const { data, error } = await sb.from('lectures').select('*').order('year', { ascending: false }).order('display_order')
  check('lectures (anon)', !error && data.length === 9, { rows: data?.length, err: error?.message })
}
// home stats
{
  const { count: ar } = await sb.from('research').select('id', { count: 'exact', head: true }).eq('status', 'active')
  const { count: pc } = await sb.from('publications').select('id', { count: 'exact', head: true })
  check('home stats (anon)', ar != null && pc === 40, { activeResearch: ar, publications: pc })
}

console.log()
console.log(fail === 0 ? '=== ALL PASS ===' : `=== ${fail} FAIL ===`)
if (fail) process.exit(1)

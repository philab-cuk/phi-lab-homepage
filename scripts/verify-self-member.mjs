import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1)]}))
const anon = () => createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth:{persistSession:false} })
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} })

let fail = 0
const check = (l, ok, info) => { console.log(`${ok?'✓':'✗'} ${l}${info!=null?' — '+JSON.stringify(info):''}`); if(!ok) fail++ }

// 정리 (이전 잔여)
await admin.from('members').delete().in('id', ['_self_r', '_self_other'])

const sb = anon()
await sb.auth.signInWithPassword({ email: 'researcher@philab.org', password: 'philab123' })

// 1. 본인 email 로 insert → 성공
{
  const { error } = await sb.from('members').insert({
    id: '_self_r', email: 'researcher@philab.org', name: 'Self Test R', role: 'student', status: 'current', display_order: 9999,
  })
  check('본인 email insert 성공', !error, error?.message)
}
// 2. 다른 email 로 insert → 차단
{
  const { error } = await sb.from('members').insert({
    id: '_self_other', email: 'someone@else.org', name: 'X', role: 'student', status: 'current',
  })
  check('타인 email insert 차단', !!error && /row-level security/i.test(error.message), { msg: error?.message })
}
// 3. 본인 행 update → 성공
{
  const { error, data } = await sb.from('members').update({ bio_short: '셀프 수정' }).eq('id', '_self_r').select()
  check('본인 행 update 성공', !error && data?.length === 1, { rows: data?.length, err: error?.message })
}
// 4. 다른 사람(hkim) 행 update → 0행 (RLS 차단)
{
  const { error, data } = await sb.from('members').update({ bio_short: 'hijack' }).eq('id', 'hkim').select()
  check('타인 행(hkim) update → 0행', !error && (data?.length||0) === 0, { rows: data?.length, err: error?.message })
}
// 5. 본인 행 email 변경 시도 → 차단 (with_check)
{
  const { error } = await sb.from('members').update({ email: 'changed@x.org' }).eq('id', '_self_r')
  check('본인 행 email 변경 차단', !!error, { msg: error?.message })
}

await sb.auth.signOut()

// 6. editor(admin) 는 여전히 아무 멤버나 관리
{
  const sbA = anon()
  await sbA.auth.signInWithPassword({ email: 'admin@philab.org', password: 'philab123' })
  const { error } = await sbA.from('members').update({ bio_short: 'editor edit' }).eq('id', 'hkim')
  check('editor 는 타인 멤버 update OK', !error, error?.message)
  // 원복
  await admin.from('members').update({ bio_short: (await admin.from('members').select('bio_short').eq('id','hkim').single()).data?.bio_short }).eq('id','hkim')
  await sbA.auth.signOut()
}

// 정리
await admin.from('members').delete().in('id', ['_self_r', '_self_other'])

console.log()
console.log(fail === 0 ? '=== ALL PASS ===' : `=== ${fail} FAIL ===`)
if (fail) process.exit(1)

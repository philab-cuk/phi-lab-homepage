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

// ----- 1. admin 로 콘텐츠 cardinality 점검 -----
console.log('--- admin 콘텐츠 카운트 ---')
const sb = newClient()
const { error: sErr } = await sb.auth.signInWithPassword({ email: 'admin@philab.org', password: 'philab123' })
check('admin signIn', !sErr, sErr?.message)

const tables = [
  ['members', 8],
  ['lectures', 9],
  ['publications', 40],
  ['authors', 79],
  ['publication_authors', 201],
  ['research', 19],
  ['institutions', 8],
  ['research_affiliations', 20],
]
for (const [t, expected] of tables) {
  const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true })
  check(`${t} count = ${expected}`, !error && count === expected, { actual: count, err: error?.message })
}

// ----- 2. CRUD smoke (admin) -----
console.log('\n--- admin CRUD smoke (members) ---')
{
  const tmpId = '_vphase3_member'
  await sb.from('members').delete().eq('id', tmpId)
  const { error: insErr } = await sb.from('members').insert({
    id: tmpId, name: 'Verify Member', role: 'student', status: 'current', display_order: 999,
  })
  check('INSERT', !insErr, insErr?.message)

  const { data: r1 } = await sb.from('members').select('*').eq('id', tmpId).single()
  check('SELECT single', r1?.id === tmpId, { name: r1?.name })

  const { error: updErr } = await sb.from('members').update({ name: 'Updated' }).eq('id', tmpId)
  check('UPDATE', !updErr, updErr?.message)
  const { data: r2 } = await sb.from('members').select('name').eq('id', tmpId).single()
  check('UPDATE reflected', r2?.name === 'Updated', { name: r2?.name })

  const { error: delErr } = await sb.from('members').delete().eq('id', tmpId)
  check('DELETE', !delErr, delErr?.message)
  const { data: r3 } = await sb.from('members').select('id').eq('id', tmpId)
  check('DELETE reflected', r3?.length === 0, { rows: r3?.length })
}

// ----- 3. invites + redeem_invite flow (admin 발급 → 다른 사용자 redeem) -----
console.log('\n--- invites + redeem_invite ---')
{
  // 새 사용자 (testredeem@philab.org) 일단 cleanup
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const { data: ulist } = await admin.auth.admin.listUsers()
  const existing = ulist.users.find(u => u.email === 'testredeem@philab.org')
  if (existing) await admin.auth.admin.deleteUser(existing.id)
  await admin.from('admin_users').delete().eq('email', 'testredeem@philab.org')

  // admin 로 초대 발급
  const { data: inviteRow, error: invErr } = await sb.from('invites').insert({
    intended_email: 'testredeem@philab.org',
    role: 'researcher',
    created_by: 'admin@philab.org',
  }).select().single()
  check('invite insert', !invErr && inviteRow?.token, invErr?.message)
  const inviteToken = inviteRow?.token

  // 새 Auth 사용자 생성
  const { data: newUser } = await admin.auth.admin.createUser({
    email: 'testredeem@philab.org', password: 'philab123', email_confirm: true,
  })
  check('new auth user created', !!newUser?.user, { id: newUser?.user?.id })

  // 그 사용자로 로그인 후 redeem_invite 호출
  const sb2 = newClient()
  await sb2.auth.signInWithPassword({ email: 'testredeem@philab.org', password: 'philab123' })
  const { data: redeem, error: redeemErr } = await sb2.rpc('redeem_invite', { invite_token: inviteToken })
  check('redeem_invite success', !redeemErr && redeem?.success, redeemErr?.message || JSON.stringify(redeem))
  check('redeemed with role researcher', redeem?.role === 'researcher')

  // 두 번 redeem 시도 → invite_already_used
  const { error: redeemErr2 } = await sb2.rpc('redeem_invite', { invite_token: inviteToken })
  check('두 번째 redeem 차단', !!redeemErr2 && /already_used/.test(redeemErr2.message), { msg: redeemErr2?.message })

  // 만료 초대 시도
  const { data: expIv } = await sb.from('invites').insert({
    intended_email: 'expired@philab.org', role: 'researcher', created_by: 'admin@philab.org',
    expires_at: new Date(Date.now() - 1000).toISOString(),
  }).select().single()
  const { error: expRdErr } = await sb2.rpc('redeem_invite', { invite_token: expIv.token })
  check('만료 초대 차단', !!expRdErr, { msg: expRdErr?.message })

  // 이메일 미스매치
  const { data: misIv } = await sb.from('invites').insert({
    intended_email: 'someone@else.org', role: 'researcher', created_by: 'admin@philab.org',
  }).select().single()
  const { error: misErr } = await sb2.rpc('redeem_invite', { invite_token: misIv.token })
  check('이메일 미스매치 차단', !!misErr && /email_mismatch/.test(misErr.message), { msg: misErr?.message })

  // 같은 이메일로 두 번째 초대 발급 → 기존 초대 자동 만료 (트리거)
  const { data: iv1 } = await sb.from('invites').insert({
    intended_email: 'doubleinv@philab.org', role: 'researcher', created_by: 'admin@philab.org',
  }).select().single()
  const before = iv1.expires_at
  await sb.from('invites').insert({
    intended_email: 'doubleinv@philab.org', role: 'researcher', created_by: 'admin@philab.org',
  })
  const { data: iv1After } = await sb.from('invites').select('expires_at').eq('token', iv1.token).single()
  check('이전 초대 자동 만료', new Date(iv1After.expires_at) < new Date(before), { before, after: iv1After.expires_at })

  // 정리
  await sb.from('invites').delete().in('intended_email', ['testredeem@philab.org','expired@philab.org','someone@else.org','doubleinv@philab.org'])
  await admin.from('admin_users').delete().eq('email', 'testredeem@philab.org')
  await admin.auth.admin.deleteUser(newUser.user.id)
}

// ----- 4. RLS write 매트릭스 (researcher 는 content 테이블 write 차단) -----
console.log('\n--- RLS content write 매트릭스 ---')
{
  const sbR = newClient()
  await sbR.auth.signInWithPassword({ email: 'researcher@philab.org', password: 'philab123' })
  for (const t of ['members','publications','research','lectures','authors','institutions','research_affiliations']) {
    const fake = { id: `_v_${t}`, name: 'x', title: 'x', title_en: 'x', semester: 'Spring 2026',
                   year: 2026, term: 'Spring', level: 'undergraduate', name_en: 'x', research_id: 'x', institution_id: '00000000-0000-0000-0000-000000000000', publication_id: 'x', author_id: '00000000-0000-0000-0000-000000000000', position: 0, category: 'article', status: 'current', role: 'student' }
    const { error } = await sbR.from(t).insert(fake)
    check(`researcher INSERT ${t} → 차단`, !!error, { msg: error?.message })
  }
  // researcher 의 SELECT 는 가능
  for (const t of ['members','publications','research','lectures']) {
    const { error, count } = await sbR.from(t).select('id', { count: 'exact', head: true })
    check(`researcher SELECT ${t} 가능`, !error, { count, err: error?.message })
  }
}

// ----- 5. anon 차단 -----
console.log('\n--- anon 권한 ---')
{
  const sbA = newClient()
  for (const t of ['members','publications','research','lectures','admin_users','invites']) {
    const { data, error } = await sbA.from(t).select('id, email').limit(1)
    check(`anon SELECT ${t} 차단/0행`, !error && (data?.length || 0) === 0, { rows: data?.length, err: error?.message })
  }
}

console.log()
if (failures === 0) {
  console.log('=== ALL PASS ===')
} else {
  console.log(`=== ${failures} FAILURE(S) ===`)
  process.exit(1)
}

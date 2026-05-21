import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// .env.local 로드
const envText = readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

const log = (label, ok, data) => {
  const mark = ok ? '✓' : '✗'
  console.log(`${mark} ${label}`)
  if (data !== undefined) console.log('  ', JSON.stringify(data, null, 2).split('\n').join('\n   '))
}

const expect = (cond, msg) => {
  if (!cond) {
    console.error(`✗ EXPECTED: ${msg}`)
    process.exit(1)
  }
}

console.log('=== auth smoke test ===')
console.log('URL:', env.VITE_SUPABASE_URL)
console.log()

// 1. anon 으로 admin_users SELECT 시도 → RLS 차단 (0행)
{
  const { data, error } = await supabase.from('admin_users').select('*')
  log('anon SELECT admin_users (RLS 0행 또는 권한 거부 기대)', !error || error.code === '42501', { rows: data?.length, error: error?.message })
  expect(!error || data?.length === 0, 'anon 으로 admin_users 보이면 안 됨')
}

// 2. 로그인
const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
  email: 'admin@philab.org',
  password: 'philab123',
})
log('signInWithPassword(admin@philab.org)', !signInErr, {
  user_id: signIn?.user?.id,
  email: signIn?.user?.email,
  has_access_token: !!signIn?.session?.access_token,
})
expect(!signInErr, '로그인 성공')

// 3. JWT 의 email claim 확인
const jwt = signIn.session.access_token
const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString())
log('JWT payload', true, {
  email: payload.email,
  role: payload.role,
  exp: new Date(payload.exp * 1000).toISOString(),
})
expect(payload.email === 'admin@philab.org', 'JWT email claim 일치')

// 4. authenticated 로 admin_users SELECT → 본인 행 + 다른 행 모두 보여야 (is_site_editor true)
{
  const { data, error } = await supabase.from('admin_users').select('*').order('added_at')
  log('authenticated SELECT admin_users', !error, { rows: data?.length, sample: data?.slice(0, 3) })
  expect(!error, 'SELECT 에러 없음')
  expect(data.length >= 3, 'is_site_editor=true 라 모든 admin_users 보여야 (3행 이상)')
  expect(data.some(r => r.email === 'admin@philab.org'), '본인 행 포함')
}

// 5. is_site_editor RPC 직접 호출
{
  const { data, error } = await supabase.rpc('is_site_editor')
  log('rpc.is_site_editor()', !error, { result: data })
  expect(!error, 'RPC 호출 가능')
  expect(data === true, 'admin role 이라 is_site_editor=true')
}

// 6. is_whitelist_member RPC 호출
{
  const { data, error } = await supabase.rpc('is_whitelist_member')
  log('rpc.is_whitelist_member()', !error, { result: data })
  expect(data === true, 'admin role 이라 is_whitelist_member=true')
}

// 7. content table SELECT (members) → editors 만 봐도 0행이어야 (아직 시딩 안 됨)
{
  const { data, error } = await supabase.from('members').select('*')
  log('SELECT members (시딩 전이라 0행 기대)', !error, { rows: data?.length })
  expect(!error, 'members SELECT 가능')
  expect(data?.length === 0, '아직 비어있어야')
}

// 8. INSERT 시도 (members 한 행) → RLS write 정책 (is_site_editor) 통과해야
{
  const { data, error } = await supabase.from('members').insert({
    id: '_smoke_test_member',
    name: 'Smoke Test',
    role: 'student',
    status: 'current',
  }).select()
  log('INSERT members (editors write 정책)', !error, { inserted: data?.[0]?.id, error: error?.message })
  expect(!error, 'admin role 으로 INSERT 가능')
  // 청소
  await supabase.from('members').delete().eq('id', '_smoke_test_member')
}

// 9. signOut
{
  const { error } = await supabase.auth.signOut()
  log('signOut', !error)
  expect(!error, 'signOut 성공')
}

console.log()
console.log('=== ALL PASS ===')

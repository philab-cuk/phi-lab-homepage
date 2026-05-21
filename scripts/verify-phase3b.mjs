import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)
const newClient = () => createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } })

let failures = 0
const check = (label, ok, info) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${info != null ? ' — ' + JSON.stringify(info) : ''}`)
  if (!ok) failures++
}

// admin / researcher / alumni 클라이언트 셋업
const accounts = {
  admin: { email: 'admin@philab.org', password: 'philab123' },
  researcher: { email: 'researcher@philab.org', password: 'philab123' },
  alumni: { email: 'alumni@philab.org', password: 'philab123' },
}
async function signedClient(name) {
  const sb = newClient()
  await sb.auth.signInWithPassword(accounts[name])
  return sb
}

// ----- 1. news ID 트리거: YYYY-MM-DD-NNN 자동 부여 -----
console.log('--- news ID trigger ---')
{
  const sb = await signedClient('admin')
  const today = new Date().toISOString().slice(0,10)
  // 2건 연속 insert
  const { data: a, error: ae } = await sb.from('news').insert({
    title: '__v_n_a', body_short: 't', status: 'draft', author_email: 'admin@philab.org', images: [],
  }).select().single()
  const { data: b, error: be } = await sb.from('news').insert({
    title: '__v_n_b', body_short: 't', status: 'draft', author_email: 'admin@philab.org', images: [],
  }).select().single()
  check('news a insert', !ae, ae?.message)
  check('news b insert', !be, be?.message)
  check('news a.id matches YYYY-MM-DD-NNN', /^\d{4}-\d{2}-\d{2}-\d{3}$/.test(a?.id || ''), { id: a?.id })
  check('news b.id matches', /^\d{4}-\d{2}-\d{2}-\d{3}$/.test(b?.id || ''), { id: b?.id })
  // 두 ID 의 NNN 부분 1씩 증가
  const aSeq = parseInt(a.id.slice(-3))
  const bSeq = parseInt(b.id.slice(-3))
  check('NNN sequence +1', bSeq === aSeq + 1, { a: a.id, b: b.id })
  check('id starts with today', a.id.startsWith(today), { id: a.id, today })

  // cleanup
  await sb.from('news').delete().in('id', [a.id, b.id])
}

// ----- 2. posts ID 트리거 -----
console.log('\n--- posts ID trigger ---')
{
  const sb = await signedClient('admin')
  const { data: p1 } = await sb.from('posts').insert({
    title: '__v_p_1', body_json: { type:'doc', content: [] }, status:'draft', author_email:'admin@philab.org',
  }).select().single()
  const { data: p2 } = await sb.from('posts').insert({
    title: '__v_p_2', body_json: { type:'doc', content: [] }, status:'draft', author_email:'admin@philab.org',
  }).select().single()
  check('posts ID YYYY-MM-DD-NNN', /^\d{4}-\d{2}-\d{2}-\d{3}$/.test(p1?.id || '') && /^\d{4}-\d{2}-\d{2}-\d{3}$/.test(p2?.id || ''), { p1: p1?.id, p2: p2?.id })
  const s1 = parseInt(p1.id.slice(-3)); const s2 = parseInt(p2.id.slice(-3))
  check('posts NNN +1', s2 === s1 + 1, { p1: p1.id, p2: p2.id })
  await sb.from('posts').delete().in('id', [p1.id, p2.id])
}

// ----- 3. news.images JSONB 배열 저장/복원 -----
console.log('\n--- news.images JSONB roundtrip ---')
{
  const sb = await signedClient('admin')
  const images = [
    { url: 'https://example.org/a.jpg', path: 'x/a.jpg' },
    { url: 'https://example.org/b.png', path: 'x/b.png' },
  ]
  const { data: n } = await sb.from('news').insert({
    title: '__v_n_img', body_short: 't', status: 'draft', author_email: 'admin@philab.org', images,
  }).select().single()
  const { data: n2 } = await sb.from('news').select('images').eq('id', n.id).single()
  check('images 배열 보존', JSON.stringify(n2.images) === JSON.stringify(images), { stored: n2.images })
  await sb.from('news').delete().eq('id', n.id)
}

// ----- 4. author=self 매트릭스 -----
console.log('\n--- author=self RLS 매트릭스 ---')
{
  // researcher 가 본인 news 만들기 → admin/alumni 가 그 글 수정 시도
  const sbR = await signedClient('researcher')
  const { data: rnews } = await sbR.from('news').insert({
    title: '__v_rsl', body_short: 't', status: 'draft', author_email: 'researcher@philab.org', images: [],
  }).select().single()
  check('researcher 본인 news 생성', !!rnews?.id, { id: rnews?.id })

  // researcher 본인 글 update OK
  const { error: rUpdSelf } = await sbR.from('news').update({ body_short: 'updated' }).eq('id', rnews.id)
  check('researcher 본인 news update OK', !rUpdSelf, rUpdSelf?.message)

  // alumni 가 researcher 글 update 시도 → 0행 update (RLS using 통과 안 함). Supabase 는 0 row affected 로 응답 (에러 X).
  const sbA = await signedClient('alumni')
  const { data: aUpdData, error: aUpdErr } = await sbA.from('news').update({ body_short: 'hijacked' }).eq('id', rnews.id).select()
  check('alumni 가 researcher 글 update → 0행', !aUpdErr && (aUpdData?.length || 0) === 0, { rows: aUpdData?.length, err: aUpdErr?.message })

  // 실제 값 확인
  const sbAdminCheck = await signedClient('admin')
  const { data: still } = await sbAdminCheck.from('news').select('body_short').eq('id', rnews.id).single()
  check('내용 변경 없음 (hijack 차단)', still?.body_short === 'updated', { body_short: still?.body_short })

  // admin 은 누구 글이든 update OK (editors 정책)
  const { error: adminUpdErr } = await sbAdminCheck.from('news').update({ body_short: 'admin-edit' }).eq('id', rnews.id)
  check('admin 가 researcher 글 update OK', !adminUpdErr, adminUpdErr?.message)

  // researcher 가 admin 의 글 만들기 시도 → RLS with_check 차단
  const { error: spoofErr } = await sbR.from('news').insert({
    title: '__v_spoof', body_short: 't', status: 'draft', author_email: 'admin@philab.org', images: [],
  })
  check('researcher 가 author=admin 으로 news insert → 차단', !!spoofErr && /row-level security/i.test(spoofErr.message), { msg: spoofErr?.message })

  // alumni 가 본인 news 삭제 시도 OK (alumni 도 본인 글 권한)
  const { data: alumNews } = await sbA.from('news').insert({
    title: '__v_alu', body_short: 't', status: 'draft', author_email: 'alumni@philab.org', images: [],
  }).select().single()
  const { error: alumDelErr } = await sbA.from('news').delete().eq('id', alumNews.id)
  check('alumni 본인 news 삭제 OK', !alumDelErr, alumDelErr?.message)

  // cleanup
  await sbAdminCheck.from('news').delete().eq('id', rnews.id)
}

// ----- 5. anon 의 posts published 만 + draft 안 보임 -----
console.log('\n--- anon posts published only ---')
{
  const sb = await signedClient('admin')
  const { data: published } = await sb.from('posts').insert({
    title: '__v_pub', body_json: { type:'doc', content:[] }, status: 'published', published_at: new Date().toISOString(), author_email: 'admin@philab.org',
  }).select().single()
  const { data: draft } = await sb.from('posts').insert({
    title: '__v_drf', body_json: { type:'doc', content:[] }, status: 'draft', author_email: 'admin@philab.org',
  }).select().single()

  const sbAnon = newClient()
  const { data: anonRows } = await sbAnon.from('posts').select('id, title, status').in('id', [published.id, draft.id])
  check('anon 은 published 만 보임', anonRows?.length === 1 && anonRows[0].id === published.id, { rows: anonRows })

  await sb.from('posts').delete().in('id', [published.id, draft.id])
}

// ----- 6. Storage 업로드 + 정책 -----
console.log('\n--- storage policies ---')
{
  // admin 으로 news-images 업로드 OK
  const sbAdmin = await signedClient('admin')
  const blob = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' })  // PNG signature
  const path = `_verify/${crypto.randomUUID()}.png`
  const { error: upErr } = await sbAdmin.storage.from('news-images').upload(path, blob, { contentType: 'image/png' })
  check('admin news-images 업로드 OK', !upErr, upErr?.message)
  // public read URL 동작
  const { data: pub } = sbAdmin.storage.from('news-images').getPublicUrl(path)
  const resp = await fetch(pub.publicUrl)
  check('public URL 접근 가능', resp.ok, { status: resp.status })

  // anon 의 업로드 시도 → 차단
  const sbAnon = newClient()
  const { error: anonUpErr } = await sbAnon.storage.from('news-images').upload(`_verify/anon.png`, blob, { contentType: 'image/png' })
  check('anon 업로드 차단', !!anonUpErr, { msg: anonUpErr?.message })

  // researcher 의 news-images 업로드 OK (whitelist 정책)
  const sbR = await signedClient('researcher')
  const { error: rUpErr } = await sbR.storage.from('news-images').upload(`_verify/r-${crypto.randomUUID()}.png`, blob, { contentType: 'image/png' })
  check('researcher news-images 업로드 OK', !rUpErr, rUpErr?.message)

  // researcher 의 profile-photos 업로드 → 차단 (editors 만)
  const { error: rProfErr } = await sbR.storage.from('profile-photos').upload(`_verify/r-${crypto.randomUUID()}.png`, blob, { contentType: 'image/png' })
  check('researcher profile-photos 업로드 차단', !!rProfErr, { msg: rProfErr?.message })

  // 정리 (service_role 로 일괄)
  const adminClient = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  for (const bucket of ['news-images', 'profile-photos']) {
    const { data: list } = await adminClient.storage.from(bucket).list('_verify')
    if (list?.length) {
      await adminClient.storage.from(bucket).remove(list.map(f => `_verify/${f.name}`))
    }
  }
}

console.log()
if (failures === 0) {
  console.log('=== ALL PASS ===')
} else {
  console.log(`=== ${failures} FAILURE(S) ===`)
  process.exit(1)
}

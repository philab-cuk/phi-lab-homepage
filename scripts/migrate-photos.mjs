import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0,i), l.slice(i+1)] }))
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const members = JSON.parse(readFileSync('app/data/members.json', 'utf8'))

// i0.wp.com 의 resize/fit/w/h 쿼리 제거 → 원본 크기
function toOriginal(u) {
  if (!u) return u
  try {
    const url = new URL(u)
    ;['resize', 'fit', 'w', 'h', 'crop'].forEach(p => url.searchParams.delete(p))
    return url.toString()
  } catch { return u }
}

const BUCKET = 'profile-photos'
const all = [...(members.current || []), ...(members.alumni || [])]
let done = 0

for (const m of all) {
  const src = m.photo  // 현재 표시 사진(photo 필드) 기준
  if (!src) { console.log(`- ${m.id}: 사진 없음`); continue }

  let buf, contentType, ext
  if (/^https?:\/\//.test(src)) {
    const orig = toOriginal(src)
    const res = await fetch(orig)
    if (!res.ok) { console.log(`✗ ${m.id}: 다운로드 실패 ${res.status} ${orig}`); continue }
    buf = Buffer.from(await res.arrayBuffer())
    contentType = res.headers.get('content-type') || 'image/jpeg'
    ext = (orig.split('?')[0].split('.').pop() || 'jpg').toLowerCase()
  } else {
    // 로컬 정적 파일 (예: /photos/hkim.jpg) → public 에서 읽기
    const localPath = 'public' + src
    try { buf = readFileSync(localPath) } catch { console.log(`✗ ${m.id}: 로컬 파일 없음 ${localPath}`); continue }
    ext = (src.split('.').pop() || 'jpg').toLowerCase()
    contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
  }

  const path = `${m.id}/profile.${ext}`
  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, buf, { contentType, upsert: true })
  if (upErr) { console.log(`✗ ${m.id}: 업로드 실패 ${upErr.message}`); continue }
  const { data } = admin.storage.from(BUCKET).getPublicUrl(path)
  const { error: dbErr } = await admin.from('members').update({ photo_url: data.publicUrl }).eq('id', m.id)
  if (dbErr) { console.log(`✗ ${m.id}: DB 갱신 실패 ${dbErr.message}`); continue }
  console.log(`✓ ${m.id} (${(buf.length/1024).toFixed(0)}KB) → ${data.publicUrl}`)
  done++
}
console.log(`\n=== ${done}/${all.length} 이전 완료 ===`)

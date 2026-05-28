import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const BUCKET = 'lecture-images'

// i0.wp.com 의 resize/fit/w/h 쿼리 제거 → 원본 크기
function toOriginal(u) {
  if (!u) return u
  try {
    const url = new URL(u)
    ;['resize', 'fit', 'w', 'h', 'crop', 'ssl'].forEach(p => url.searchParams.delete(p))
    return url.toString()
  } catch { return u }
}

const { data: lectures, error } = await admin
  .from('lectures').select('id, images').order('id')
if (error) { console.error('lectures 조회 실패:', error.message); process.exit(1) }

let lecturesTouched = 0, imagesMoved = 0
for (const lec of lectures) {
  const imgs = lec.images || []
  if (!imgs.length) { console.log(`- ${lec.id}: 사진 없음`); continue }

  const newUrls = []
  let idx = 0
  for (const src of imgs) {
    idx++
    // 이미 우리 버킷에 있는 건 그대로 둠 (재실행 안전)
    if (src.includes(`/storage/v1/object/public/${BUCKET}/`)) { newUrls.push(src); continue }

    const orig = toOriginal(src)
    let res
    try { res = await fetch(orig) } catch (e) { console.log(`✗ ${lec.id}[${idx}]: fetch 오류 ${e.message}`); newUrls.push(src); continue }
    if (!res.ok) { console.log(`✗ ${lec.id}[${idx}]: 다운로드 실패 ${res.status} ${orig}`); newUrls.push(src); continue }
    const buf = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const ext = (orig.split('?')[0].split('.').pop() || 'jpg').toLowerCase()

    const path = `${lec.id}/${idx}.${ext}`
    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, buf, { contentType, upsert: true })
    if (upErr) { console.log(`✗ ${lec.id}[${idx}]: 업로드 실패 ${upErr.message}`); newUrls.push(src); continue }
    const { data } = admin.storage.from(BUCKET).getPublicUrl(path)
    newUrls.push(data.publicUrl)
    imagesMoved++
    console.log(`  ✓ ${lec.id}[${idx}] (${(buf.length / 1024).toFixed(0)}KB) → ${path}`)
  }

  const changed = JSON.stringify(newUrls) !== JSON.stringify(imgs)
  if (changed) {
    const { error: dbErr } = await admin.from('lectures').update({ images: newUrls }).eq('id', lec.id)
    if (dbErr) { console.log(`✗ ${lec.id}: DB 갱신 실패 ${dbErr.message}`); continue }
    lecturesTouched++
    console.log(`✓ ${lec.id}: images ${imgs.length}장 갱신`)
  }
}
console.log(`\n=== 강의 ${lecturesTouched}개 갱신, 사진 ${imagesMoved}장 이전 완료 ===`)

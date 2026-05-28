import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const BUCKET = 'page-images'

// id(institutions) → 공식 로고 URL (위키미디어). 확실한 것만.
const LOGOS = {
  '26ac3854-57da-454f-81fc-ac899e3459cf': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Catholic_University_of_Korea_logo.svg', // Catholic Univ.
  '2514b196-c2f6-4ed2-926b-218880e2ec04': 'https://upload.wikimedia.org/wikipedia/en/7/7f/Chonnam_National_University_logo.svg',      // Chonnam Nat'l
  '9f9038b1-a9c3-4299-b8cd-62e5ed738f5d': "https://upload.wikimedia.org/wikipedia/en/4/4a/Sookmyung_Women%27s_University_logo.svg",   // Sookmyung
  '518bfa52-ab1f-4c61-8373-0e74fef00500': 'https://upload.wikimedia.org/wikipedia/commons/d/de/Kakao_CI_yellow.svg',                  // Kakao (Healthcare)
}

let done = 0
for (const [id, url] of Object.entries(LOGOS)) {
  const ext = (url.split('?')[0].split('.').pop() || 'svg').toLowerCase()
  const res = await fetch(url, { headers: { 'User-Agent': 'phi-lab-homepage/1.0 (logo import)' } })
  if (!res.ok) { console.log(`✗ ${id}: 다운로드 실패 ${res.status}`); continue }
  const buf = Buffer.from(await res.arrayBuffer())
  const ctype = ext === 'svg' ? 'image/svg+xml' : (res.headers.get('content-type') || 'image/png')
  const path = `institutions/${id}.${ext}`
  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, buf, { contentType: ctype, upsert: true })
  if (upErr) { console.log(`✗ ${id}: 업로드 실패 ${upErr.message}`); continue }
  const { data } = admin.storage.from(BUCKET).getPublicUrl(path)
  const logo_url = `${data.publicUrl}?v=${Date.now()}`
  const { error: dbErr } = await admin.from('institutions').update({ logo_url }).eq('id', id)
  if (dbErr) { console.log(`✗ ${id}: DB 갱신 실패 ${dbErr.message}`); continue }
  console.log(`✓ ${id} (${(buf.length / 1024).toFixed(0)}KB) → ${path}`)
  done++
}
console.log(`\n=== ${done}/${Object.keys(LOGOS).length} 로고 적용 완료 ===`)

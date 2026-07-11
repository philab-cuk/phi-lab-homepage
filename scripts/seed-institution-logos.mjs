// 협업 기관 로고 일괄 등록 + 신규 기관 추가.
// public/photos/institutions/ 의 이미지를 page-images 버킷(institutions/{id}.jpg)에
// 올리고 logo_url 을 갱신한다. 없는 기관은 새로 만들고, 가톨릭대는 내부 기관 처리.
// 실행: node scripts/seed-institution-logos.mjs  (.env.local 에 SERVICE_ROLE_KEY 필요)
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const log = (label, ok, info) =>
  console.log(`${ok ? '✓' : '✗'} ${label}${info != null ? ' — ' + JSON.stringify(info) : ''}`)

// 파일명(public/photos/institutions/) ↔ DB name_en 매핑. 신규 기관은 name_ko 포함.
const TARGETS = [
  { file: '부천성모.jpg', name_en: "Bucheon St. Mary's Hospital", name_ko: '부천성모병원' },
  { file: '은평성모.jpg', name_en: "Eunpyeong St. Mary's Hospital", name_ko: '은평성모병원' },
  { file: '가톨릭대중앙의료원.jpg', name_en: 'Catholic Medical Center', name_ko: '가톨릭중앙의료원' },
  { file: '삼성서울병원.jpg', name_en: 'Samsung Seoul Hospital', name_ko: '삼성서울병원' },
  { file: '서울대학교.jpg', name_en: 'Seoul National University', name_ko: '서울대학교' },
  { file: '숙명여자대학교.jpg', name_en: "Sookmyung Women's University", name_ko: '숙명여자대학교' },
  { file: '전남대학교.jpg', name_en: 'Chonnam National University', name_ko: '전남대학교' },
  { file: '연세대학교.jpg', name_en: 'Yonsei University', name_ko: '연세대학교' },
]

const { data: existing, error: listErr } = await admin
  .from('institutions')
  .select('id, name_en, name_ko, is_internal')
if (listErr) { console.error('✗ 기관 목록 조회 실패:', listErr); process.exit(1) }

for (const t of TARGETS) {
  let row = existing.find((r) => r.name_en === t.name_en)

  if (!row) {
    row = { id: randomUUID(), name_en: t.name_en, name_ko: t.name_ko, is_internal: false }
    const { error } = await admin.from('institutions').insert(row)
    if (error) { log(`${t.name_en} 신규 등록`, false, error.message); continue }
    log(`${t.name_en} 신규 등록`, true)
  }

  // AdminInstitutions.uploadLogo 와 동일한 경로 규칙: institutions/{id}.{ext}
  const path = `institutions/${row.id}.jpg`
  const bytes = readFileSync(`public/photos/institutions/${t.file}`)
  const { error: upErr } = await admin.storage
    .from('page-images')
    .upload(path, bytes, { contentType: 'image/jpeg', upsert: true })
  if (upErr) { log(`${t.name_en} 로고 업로드`, false, upErr.message); continue }

  const { data: pub } = admin.storage.from('page-images').getPublicUrl(path)
  const { error: updErr } = await admin
    .from('institutions')
    .update({ logo_url: `${pub.publicUrl}?v=${Date.now()}` })
    .eq('id', row.id)
  log(`${t.name_en} 로고 연결`, !updErr, updErr?.message)
}

// 가톨릭대학교 — 소속 기관이므로 협업 목록에서 제외(삭제 아님).
const { error: cukErr, count } = await admin
  .from('institutions')
  .update({ is_internal: true }, { count: 'exact' })
  .eq('name_en', 'The Catholic University of Korea')
log('가톨릭대학교 → 내부 기관 처리', !cukErr, cukErr?.message ?? `${count} row`)

console.log('완료.')

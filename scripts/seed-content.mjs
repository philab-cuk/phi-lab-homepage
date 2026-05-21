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

const members = JSON.parse(readFileSync('src/data/members.json', 'utf8'))
const lectures = JSON.parse(readFileSync('src/data/lectures.json', 'utf8'))
const publications = JSON.parse(readFileSync('src/data/publications.json', 'utf8'))
const research = JSON.parse(readFileSync('src/data/research.json', 'utf8'))

const log = (label, ok, info) =>
  console.log(`${ok ? '✓' : '✗'} ${label}${info != null ? ' — ' + JSON.stringify(info) : ''}`)

const bail = (label, error) => {
  console.error(`✗ ${label}:`, error)
  process.exit(1)
}

// ----- 1. Members ----------------------------------------------------------
{
  const rows = []
  const list = [
    ...(members.current || []).map((m, i) => ({ m, i, status: 'current' })),
    ...(members.alumni  || []).map((m, i) => ({ m, i, status: 'alumni'  })),
  ]
  for (const { m, i, status } of list) {
    rows.push({
      id:                 m.id,
      name:               m.name,
      name_ko:            m.nameKo ?? null,
      role:               m.role,
      title:              m.title ?? null,
      degree:             m.degree ?? null,
      student_number:     m.year ?? null,
      department:         m.department ?? null,
      institution:        m.institution ?? null,
      photo_url:          m.photo ?? m.photoLive ?? null,
      email:              m.email ?? null,
      personal_site:      m.personalSite ?? null,
      linkedin:           m.linkedin ?? null,
      google_scholar:     m.googleScholar ?? null,
      research_interests: m.researchInterests ?? null,
      bio_short:          m.bioShort ?? null,
      bio_full:           m.bioFull ?? null,
      education:          m.education ?? null,
      experience:         m.experience ?? null,
      service:            m.service ?? null,
      status,
      display_order:      i * 10,
    })
  }
  const { error } = await admin.from('members').upsert(rows, { onConflict: 'id' })
  if (error) bail('members upsert', error)
  log('members upsert', true, { count: rows.length })
}

// ----- 2. Lectures ---------------------------------------------------------
function parseSemester(s) {
  // "Spring 2026" / "Fall 2024" / "Winter 2025"
  const m = /^(Spring|Summer|Fall|Winter)\s+(\d{4})$/.exec(String(s).trim())
  if (!m) return { term: 'Fall', year: 1970 }  // fallback
  return { term: m[1], year: Number(m[2]) }
}
{
  const rows = lectures.map((l, i) => {
    const { term, year } = parseSemester(l.semester)
    return {
      id:            l.id,
      code:          l.code ?? null,
      title_en:      l.titleEn,
      title_ko:      l.titleKo ?? null,
      semester:      l.semester,
      year, term,
      level:         l.level,
      language:      l.language ?? null,
      description:   l.description ?? null,
      objectives:    l.objectives ?? null,
      images:        l.images ?? null,
      tags:          l.tags ?? null,
      display_order: i * 10,
    }
  })
  const { error } = await admin.from('lectures').upsert(rows, { onConflict: 'id' })
  if (error) bail('lectures upsert', error)
  log('lectures upsert', true, { count: rows.length })
}

// ----- 3. Institutions + Research + Research_affiliations ------------------
{
  // 모든 institution 수집 + dedup (name_en 키)
  const instMap = new Map()
  for (const r of research) {
    for (const a of (r.affiliations || [])) {
      const key = a.institution
      if (!instMap.has(key)) {
        instMap.set(key, {
          name_en:     a.institution,
          name_ko:     a.institutionKo ?? null,
          is_internal: !!a.isInternal,
        })
      }
    }
  }
  const instRows = [...instMap.values()]
  const { data: instData, error: instErr } = await admin
    .from('institutions')
    .upsert(instRows, { onConflict: 'name_en' })
    .select('id, name_en')
  if (instErr) bail('institutions upsert', instErr)
  log('institutions upsert', true, { count: instData.length })
  const instId = new Map(instData.map(r => [r.name_en, r.id]))

  // research 본문
  const researchRows = research.map((r, i) => ({
    id:              r.id,
    title:           r.title,
    full_title:      r.fullTitle ?? null,
    description_ko:  r.descriptionKo ?? null,
    tags:            r.tagsLive ?? null,
    tags_featured:   r.tagsFeaturedLive ?? null,
    collaborators:   r.collaborators ?? null,
    notes:           r.notes ?? null,
    funding_agency:  r.fundingAgency ?? null,
    featured:        !!r.featured,
    status:          r.status ?? 'active',
    display_order:   i * 10,
  }))
  const { error: rErr } = await admin.from('research').upsert(researchRows, { onConflict: 'id' })
  if (rErr) bail('research upsert', rErr)
  log('research upsert', true, { count: researchRows.length })

  // research_affiliations: 기존 행 지우고 새로 삽입 (간단)
  const affRows = []
  for (const r of research) {
    const affs = r.affiliations || []
    affs.forEach((a, pos) => {
      affRows.push({
        research_id:    r.id,
        institution_id: instId.get(a.institution),
        department_en:  a.department ?? null,
        department_ko:  a.departmentKo ?? null,
        position:       pos,
      })
    })
  }
  // 모든 research_id 의 기존 affiliation 삭제 → 새로 insert (idempotent)
  await admin.from('research_affiliations').delete().in(
    'research_id', research.map(r => r.id),
  )
  if (affRows.length) {
    const { error: affErr } = await admin.from('research_affiliations').insert(affRows)
    if (affErr) bail('research_affiliations insert', affErr)
  }
  log('research_affiliations insert', true, { count: affRows.length })
}

// ----- 4. Publications + Authors + publication_authors ---------------------
{
  // publications 본문
  const pubRows = publications.map((p, i) => ({
    id:            p.id,
    category:      p.category,
    title:         p.title,
    venue:         p.venue ?? null,
    venue_details: p.venueDetails ?? null,
    location:      p.location ?? null,
    date:          p.date ?? null,
    year:          p.year,
    doi:           p.doi ?? null,
    url:           p.url ?? null,
    featured:      !!p.featured,
    display_order: i * 10,
  }))
  const { error: pErr } = await admin.from('publications').upsert(pubRows, { onConflict: 'id' })
  if (pErr) bail('publications upsert', pErr)
  log('publications upsert', true, { count: pubRows.length })

  // authors 처리: name 기준 dedup. member_id 매핑은 nameKo/이름으로는 어려우니 일단 null.
  // 단, "Kim HJ" 또는 "Hyo Jung Kim" 같은 패턴 → hkim 매핑 시도.
  const HKIM_NAMES = new Set(['Kim HJ', 'Hyo Jung Kim', 'H.J. Kim', 'Kim, H.J.'])

  // 모든 author 이름 수집
  const authorNames = new Set()
  for (const p of publications) {
    for (const a of (p.authors || [])) authorNames.add(a.name)
  }

  // 기존 authors 조회
  const { data: existing } = await admin.from('authors').select('id, name')
  const existingMap = new Map((existing || []).map(r => [r.name, r.id]))

  const newAuthorRows = []
  for (const name of authorNames) {
    if (!existingMap.has(name)) {
      newAuthorRows.push({
        name,
        member_id: HKIM_NAMES.has(name) ? 'hkim' : null,
      })
    }
  }
  if (newAuthorRows.length) {
    const { data: ins, error: aErr } = await admin.from('authors').insert(newAuthorRows).select('id, name')
    if (aErr) bail('authors insert', aErr)
    for (const r of ins) existingMap.set(r.name, r.id)
  }
  log('authors insert (new)', true, { count: newAuthorRows.length, total: existingMap.size })

  // publication_authors: publication 별 모든 작가 매핑. 기존 행 삭제 후 재삽입.
  const paRows = []
  for (const p of publications) {
    (p.authors || []).forEach((a, pos) => {
      paRows.push({
        publication_id: p.id,
        author_id:      existingMap.get(a.name),
        position:       pos,
        is_pi:            !!a.isPi,
        is_co_first:      !!a.isCoFirst,
        is_co_correspond: !!a.isCoCorrespond,
      })
    })
  }
  await admin.from('publication_authors').delete().in(
    'publication_id', publications.map(p => p.id),
  )
  if (paRows.length) {
    const { error: paErr } = await admin.from('publication_authors').insert(paRows)
    if (paErr) bail('publication_authors insert', paErr)
  }
  log('publication_authors insert', true, { count: paRows.length })
}

// ----- 5. 최종 카운트 ----------------------------------------------------
{
  const counts = await Promise.all([
    admin.from('members').select('id', { count: 'exact', head: true }),
    admin.from('lectures').select('id', { count: 'exact', head: true }),
    admin.from('publications').select('id', { count: 'exact', head: true }),
    admin.from('authors').select('id', { count: 'exact', head: true }),
    admin.from('publication_authors').select('publication_id', { count: 'exact', head: true }),
    admin.from('research').select('id', { count: 'exact', head: true }),
    admin.from('institutions').select('id', { count: 'exact', head: true }),
    admin.from('research_affiliations').select('research_id', { count: 'exact', head: true }),
  ])
  console.log('\nfinal counts:')
  ;['members','lectures','publications','authors','publication_authors','research','institutions','research_affiliations']
    .forEach((n, i) => console.log(`  ${n}: ${counts[i].count}`))
}

console.log('\n=== seed-content done ===')

import { supabase } from './supabase'

// DB(snake_case) → 기존 공개 페이지가 기대하는 JSON(camelCase) 형태로 변환.
// 표시 순서는 display_order asc 로 LIVE DOM 순서 보존.

// 사이트 내부 절대경로(/photos/..)에 vite base 를 붙인다. 외부 URL(http..)은
// 그대로. base 가 '/' 면 변화 없음, '/phi-lab-homepage/' 면 prefix.
function withBase(path) {
  if (!path) return path
  if (/^https?:\/\//.test(path) || path.startsWith('data:')) return path
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return base + (path.startsWith('/') ? path : '/' + path)
}

// Supabase Storage 이미지 변환: 원본(object URL)을 리사이즈 URL(render/image)로.
// 원본은 Storage 에 그대로 두고, 페이지에선 리사이즈본을 받는다.
// width 만 주면 height 가 원본 유지돼 비율이 깨지므로, width+height 박스 +
// resize=contain 으로 비율을 유지하며 축소한다. storage URL 이 아니면 원본 그대로.
function resized(url, width, height) {
  if (!url || !url.includes('/storage/v1/object/public/')) return url
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') +
    `?width=${width}&height=${height}&resize=contain&quality=80`
}

// ── Members ────────────────────────────────────────────────────────────────
function mapMember(m) {
  return {
    id: m.id,
    name: m.name,
    nameKo: m.name_ko,
    role: m.role,
    title: m.title,
    degree: m.degree,
    year: m.student_number,
    department: m.department,
    institution: m.institution,
    photo: resized(withBase(m.photo_url), 450, 600),
    photoLive: resized(withBase(m.photo_url), 450, 600),
    email: m.email,
    personalSite: m.personal_site,
    linkedin: m.linkedin,
    googleScholar: m.google_scholar,
    researchInterests: m.research_interests ?? [],
    bioShort: m.bio_short,
    bioFull: m.bio_full,
    education: m.education ?? [],
    experience: m.experience ?? [],
    service: m.service ?? [],
    status: m.status,
  }
}

// members.json 과 동일한 { current: [...], alumni: [...] } 구조로 반환.
export async function fetchMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('status')
    .order('created_at')      // 먼저 등록된 사람이 상단
    .order('display_order')   // 동시 등록(시딩)은 LIVE 순서 유지
  if (error) throw error
  const all = (data ?? []).map(mapMember)
  return {
    current: all.filter((m) => m.status === 'current'),
    alumni: all.filter((m) => m.status === 'alumni'),
  }
}

// Professor = members 의 PI (role 기준, 없으면 hkim).
export async function fetchProfessor() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('display_order')
  if (error) throw error
  const list = (data ?? []).map(mapMember)
  return (
    list.find((m) => m.role === 'Principal Investigator') ||
    list.find((m) => m.id === 'hkim') ||
    null
  )
}

// ── Lectures ────────────────────────────────────────────────────────────────
function mapLecture(l) {
  return {
    id: l.id,
    code: l.code,
    titleEn: l.title_en,
    titleKo: l.title_ko,
    semester: l.semester,
    year: l.year,
    term: l.term,
    level: l.level,
    language: l.language,
    description: l.description,
    objectives: l.objectives ?? [],
    images: (l.images ?? []).map(withBase),
    tags: l.tags ?? [],
  }
}

export async function fetchLectures() {
  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .order('year', { ascending: false })
    .order('display_order')
  if (error) throw error
  return (data ?? []).map(mapLecture)
}

// ── Research ────────────────────────────────────────────────────────────────
function mapResearch(r) {
  const affiliations = (r.research_affiliations ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((a) => ({
      institution: a.institutions?.name_en ?? '',
      institutionKo: a.institutions?.name_ko ?? null,
      department: a.department_en,
      departmentKo: a.department_ko,
      isInternal: a.institutions?.is_internal ?? false,
    }))
  return {
    id: r.id,
    title: r.title,
    fullTitle: r.full_title,
    descriptionKo: r.description_ko,
    affiliations,
    tagsLive: r.tags ?? [],
    tagsFeaturedLive: r.tags_featured ?? [],
    collaborators: r.collaborators,
    notes: r.notes,
    fundingAgency: r.funding_agency,
    featured: r.featured,
    status: r.status,
  }
}

export async function fetchResearch() {
  const { data, error } = await supabase
    .from('research')
    .select(
      '*, research_affiliations(position, department_en, department_ko, institutions(name_en, name_ko, is_internal))',
    )
    .order('status')
    .order('display_order')
  if (error) throw error
  return (data ?? []).map(mapResearch)
}

// ── Publications ──────────────────────────────────────────────────────────
function mapPublication(p) {
  const authors = (p.publication_authors ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((pa) => ({
      name: pa.authors?.name ?? '',
      fullName: pa.authors?.full_name ?? null,
      isPi: pa.is_pi,
      coFirst: pa.is_co_first,
      coCorrespond: pa.is_co_correspond,
    }))
  return {
    id: p.id,
    category: p.category,
    title: p.title,
    venue: p.venue,
    venueDetails: p.venue_details,
    location: p.location,
    date: p.date,
    year: p.year,
    doi: p.doi,
    url: p.url,
    featured: p.featured,
    authors,
  }
}

export async function fetchPublications() {
  const { data, error } = await supabase
    .from('publications')
    .select(
      '*, publication_authors(position, is_pi, is_co_first, is_co_correspond, authors(name, full_name))',
    )
    .order('year', { ascending: false })
    .order('display_order')
  if (error) throw error
  return (data ?? []).map(mapPublication)
}

// ── Home 집계 ───────────────────────────────────────────────────────────────
export async function fetchHomeStats() {
  const [{ count: activeResearch }, { count: publications }] = await Promise.all([
    supabase.from('research').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('publications').select('id', { count: 'exact', head: true }),
  ])
  return {
    activeResearchCount: activeResearch ?? 0,
    publicationsCount: publications ?? 0,
  }
}

import { supabase } from './supabase'

// DB(snake_case) → 기존 공개 페이지가 기대하는 JSON(camelCase) 형태로 변환.
// 표시 순서는 display_order asc 로 LIVE DOM 순서 보존.

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
    photo: m.photo_url,
    photoLive: m.photo_url,
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
    .order('display_order')
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
    images: l.images ?? [],
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

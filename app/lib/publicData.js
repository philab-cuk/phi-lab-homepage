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

// Supabase Storage 이미지 변환(render/image)은 Pro 플랜 전용 기능이다.
// Free 플랜(및 로컬 스택)에서는 변환 엔드포인트가 404 → 원본 object URL 그대로 서빙.
// Pro 로 올리면 VITE_SUPABASE_IMAGE_TRANSFORM=true 로 켜서 리사이즈본을 받게 한다.
const IMAGE_TRANSFORM = import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORM === 'true'

function resized(url, width, height) {
  if (!url || !url.includes('/storage/v1/object/public/')) return url
  if (!IMAGE_TRANSFORM) return url // 변환 불가 플랜 → 원본 그대로
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
    joinedAt: m.joined_at,
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
    .order('joined_at', { ascending: true, nullsFirst: true }) // 먼저 합류한 사람이 상단, 합류일 미입력(창립 멤버)은 맨 앞
    .order('display_order')   // 같은 합류일/미입력은 LIVE 순서 유지
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

// 홈 "Collaborating Institutions" — 외부 협력 기관만(내부 PHI Lab 제외), 이름순.
export async function fetchCollaboratingInstitutions() {
  const { data, error } = await supabase
    .from('institutions')
    .select('name_en, name_ko, is_internal, logo_url')
    .eq('is_internal', false)
    .order('name_en')
  if (error) throw error
  return (data ?? []).map((i) => ({ name: i.name_en, logo: withBase(i.logo_url) }))
}

// ── News ────────────────────────────────────────────────────────────────────
// 공개 News 페이지용. 발행(published)된 소식만, 최신이 위로.
// status 필터는 RLS(anon) 에도 있지만, 로그인 상태로 공개 페이지를 볼 때
// draft 가 섞여 보이지 않도록 쿼리에서도 명시한다.
function mapNews(n) {
  return {
    id: n.id,
    title: n.title,
    bodyShort: n.body_short,
    // images jsonb: [{url, path}] (AdminNews 업로드 형식). 문자열이어도 안전 처리.
    images: (n.images ?? []).map((i) => withBase(typeof i === 'string' ? i : i?.url)).filter(Boolean),
    publishedAt: n.published_at,
    authorEmail: n.author_email,
  }
}

export async function fetchNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapNews)
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

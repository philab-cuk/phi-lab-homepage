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
    college: m.college,
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

// member_roles 의 라벨을 sort_order 순서대로 반환. 비로그인도 읽기 허용.
// 첫 번째(=sort_order 가장 앞) 역할을 PI(지도교수)로 간주한다.
export async function fetchRoleOrder() {
  const { data } = await supabase
    .from('member_roles')
    .select('label')
    .order('sort_order')
  return (data ?? []).map((r) => r.label)
}

// members.json 과 동일한 { current, alumni } 구조 + 역할 순서/ PI 라벨 반환.
export async function fetchMembers() {
  const [{ data, error }, roleOrder] = await Promise.all([
    supabase
      .from('members')
      .select('*')
      .order('status')
      .order('joined_at', { ascending: true, nullsFirst: true }) // 먼저 합류한 사람이 상단, 합류일 미입력(창립 멤버)은 맨 앞
      .order('display_order'),   // 같은 합류일/미입력은 LIVE 순서 유지
    fetchRoleOrder(),
  ])
  if (error) throw error
  const all = (data ?? []).map(mapMember)
  return {
    current: all.filter((m) => m.status === 'current'),
    alumni: all.filter((m) => m.status === 'alumni'),
    roleOrder,
    piRole: roleOrder[0] ?? null,   // 역할 목록 맨 앞 = PI
  }
}

// Professor = members 의 PI. 역할 목록 맨 앞(piRole)으로 찾고, 과거 한글 값과
// id('hkim') 까지 순서대로 폴백. 그래도 없으면 null (Professor.jsx 가 안내 표시).
export async function fetchProfessor() {
  const [{ data, error }, roleOrder] = await Promise.all([
    supabase.from('members').select('*').order('display_order'),
    fetchRoleOrder(),
  ])
  if (error) throw error
  const list = (data ?? []).map(mapMember)
  const piRole = roleOrder[0] ?? null
  return (
    (piRole && list.find((m) => m.role === piRole)) ||
    list.find((m) => m.role === '지도교수') ||
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

// 홈 "Collaborating Institutions" — 외부 협력 기관만(내부 PHI Lab·가톨릭대 제외).
// 표시 순서: 아래 우선순위 목록(name_en) 먼저, 나머지는 이름순 뒤에.
// 1행: 성모병원 계열 + 가톨릭중앙의료원 / 2행: 삼성서울·카카오·서울대
// 3행: 숙명여대·전남대·연세대.
const INSTITUTION_DISPLAY_ORDER = [
  "Bucheon St. Mary's Hospital",
  "Eunpyeong St. Mary's Hospital",
  'Catholic Medical Center',
  'Samsung Seoul Hospital',
  'Kakao Healthcare',
  'Seoul National University',
  "Sookmyung Women's University",
  'Chonnam National University',
  'Yonsei University',
]

export async function fetchCollaboratingInstitutions() {
  const { data, error } = await supabase
    .from('institutions')
    .select('name_en, name_ko, is_internal, logo_url')
    .eq('is_internal', false)
    .order('name_en')
  if (error) throw error
  const rank = (n) => {
    const i = INSTITUTION_DISPLAY_ORDER.indexOf(n)
    return i === -1 ? INSTITUTION_DISPLAY_ORDER.length : i
  }
  return (data ?? [])
    .sort((a, b) => rank(a.name_en) - rank(b.name_en) || a.name_en.localeCompare(b.name_en))
    .map((i) => ({ name: i.name_en, logo: withBase(i.logo_url) }))
}

// ── News ────────────────────────────────────────────────────────────────────
// 공개 News 페이지용. 발행(published)된 소식만, 최신이 위로.
// status 필터는 RLS(anon) 에도 있지만, 로그인 상태로 공개 페이지를 볼 때
// draft 가 섞여 보이지 않도록 쿼리에서도 명시한다.
// body_json(BlockNote 블록 배열)에서 첫 image 블록의 URL 추출 → 격자 커버.
function coverFromBody(blocks) {
  if (!Array.isArray(blocks)) return null
  const img = blocks.find((b) => b.type === 'image' && b.props?.url)
  return img ? withBase(img.props.url) : null
}

function mapNews(n) {
  return {
    id: n.id,
    title: n.title,
    bodyJson: n.body_json,           // Posts 와 동일한 리치 본문(BlockNote)
    cover: coverFromBody(n.body_json), // 격자 썸네일 = 본문 첫 이미지
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

// 단건(상세 페이지용). 없거나 draft 면 null — 'News not found' 처리용.
export async function fetchNewsItem(id) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  return data ? mapNews(data) : null
}

// ── Gallery (Lab Life) ──────────────────────────────────────────────────────
export async function fetchGallery() {
  // 앨범 '안'의 사진은 과거→현재(taken_on 오름차순, 없으면 뒤로). 앨범 '간' 순서는
  // Gallery 컴포넌트에서 created_at 역순으로 따로 정렬하므로 이 정렬과 무관하다.
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('taken_on', { ascending: true, nullsFirst: false })
    .order('display_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((g) => ({
    id: g.id,
    imageUrl: g.image_url,
    caption: g.caption,
    album: g.album,
    takenOn: g.taken_on,
    createdAt: g.created_at,
  }))
}

// ── Posts (게시판) ───────────────────────────────────────────────────────────
// 공개 Posts — published 만. News 와 같은 이중 방어(쿼리에도 필터).
// 작성자는 이메일이 아니라 display_name(예: 관리자)만 노출한다.

export async function fetchPosts() {
  // author_name 은 저장 시 복사된 표시이름(admin_users 는 anon 이 못 읽음)
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, published_at, views, pinned, author_name')
    .eq('status', 'published')
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    authorName: p.author_name || '관리자',
    publishedAt: p.published_at,
    views: p.views ?? 0,
    pinned: !!p.pinned,
  }))
}

// 단건. 없거나 draft(익명에겐 RLS 로도 안 보임)면 null — 상세 페이지의
// 'Post not found' 처리용.
export async function fetchPost(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, body_json, published_at, views, author_name')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    title: data.title,
    bodyJson: data.body_json,
    authorName: data.author_name || '관리자',
    publishedAt: data.published_at,
    views: data.views ?? 0,
  }
}

// 상세 조회 시 조회수 +1 (익명 가능 — SECURITY DEFINER RPC).
export async function incrementPostViews(id) {
  await supabase.rpc('increment_post_views', { p_id: id })
}

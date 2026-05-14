import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import researchData from '../data/research.json'
import publicationsData from '../data/publications.json'
import lecturesData from '../data/lectures.json'
import membersData from '../data/members.json'

// ─── Constants ────────────────────────────────────────────────────────────

const COLLABORATING_INSTITUTIONS = [
  'Samsung Medical Center',
  'Kakao Healthcare',
  "Eunpyeong St. Mary's Hospital",
  "Bucheon St. Mary's Hospital",
  "Sookmyung Women's University",
  'Chonnam National University',
  'University of Cincinnati',
  'Harvard University',
  'Tufts University',
  'Sungkyunkwan University (SKKU)',
]

const PI = membersData.current.find((m) => m.role === 'Principal Investigator')
const STUDENTS = membersData.current.filter((m) => m.role !== 'Principal Investigator')

// ─── Round-03 styled sub-components ──────────────────────────────────────

function HomeSectionHeader({ children }) {
  return (
    <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-[3px] border-brand-700 pl-3">
      {children}
    </h2>
  )
}

function ViewAllLink({ to, label }) {
  return (
    <p className="text-sm text-gray-400 mt-4">
      <Link to={to} className="text-brand-700 hover:underline">
        {label} →
      </Link>
    </p>
  )
}

function HomeProjectCard({ project }) {
  return (
    <article className="bg-white border border-gray-200 p-5">
      {project.affiliation && (
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
          {project.affiliation}
        </p>
      )}
      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">
        {project.title}
        {project.titleKo && (
          <>
            <br />
            <span className="font-normal text-gray-500">{project.titleKo}</span>
          </>
        )}
      </h3>
      <p className="text-gray-600 text-xs leading-relaxed mb-3">{project.description}</p>
      <div>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block text-xs font-medium border border-gray-300 text-gray-600 px-2 py-[2px] mr-1 mt-1"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

// Year badge — newest year is vivid brand blue (LIVE site colour),
// older years rotate through distinct hues that also fade with age,
// 5+ years back drops to muted gray as "history".
function yearBadgeClass(age) {
  if (age <= 0) return 'bg-brand-700 text-white'      // 0y — brand blue
  if (age === 1) return 'bg-emerald-600 text-white'   // 1y — emerald
  if (age === 2) return 'bg-amber-500 text-white'     // 2y — amber
  if (age === 3) return 'bg-violet-400 text-white'    // 3y — violet
  if (age === 4) return 'bg-rose-300 text-rose-900'   // 4y — rose, fading
  return 'bg-gray-300 text-gray-700'                  // 5y+ — gray history
}

function YearBadge({ year, latestYear }) {
  const age = latestYear - year
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-sm mr-2 ${yearBadgeClass(age)}`}>
      {year}
    </span>
  )
}

function HomePubItem({ pub, latestYear }) {
  const link = pub.doi ? `https://doi.org/${pub.doi}` : pub.url
  return (
    <div className="py-3.5 border-b border-gray-200 last:border-b-0 leading-relaxed">
      <YearBadge year={pub.year} latestYear={latestYear} />
      {pub.authors.map((a, i) => (
        <span key={`${a.name}-${i}`}>
          {a.isPi ? <strong>{a.name}</strong> : a.name}
          {a.coFirst && <sup>†</sup>}
          {i < pub.authors.length - 1 && ', '}
        </span>
      ))}
      . "{pub.title}." <em>{pub.venue}</em>
      {pub.venueDetails && `, ${pub.venueDetails}`}.
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-xs text-brand-700 hover:underline"
        >
          [{pub.doi ? 'DOI' : 'Link'}]
        </a>
      )}
    </div>
  )
}

function HomePIBlock() {
  return (
    <div className="bg-white border border-gray-200 p-6 mb-6 flex gap-6 items-start">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-gray-200">
        <img src={PI.photo} alt={PI.name} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0">
        <h3 className="font-bold text-gray-900 text-base mb-0.5">
          <Link to="/professor" className="hover:text-brand-700 hover:underline transition-colors">
            {PI.name}, {PI.degree.includes('Ph.D.') ? 'PhD' : PI.degree}
          </Link>
        </h3>
        <p className="text-sm text-gray-600 mb-0.5">{PI.title}</p>
        <p className="text-sm text-gray-500 mb-2">
          {PI.department}, {PI.institution}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">{PI.bioShort}</p>
        <p className="text-xs">
          <a href={`mailto:${PI.email}`} className="text-brand-700 hover:underline">
            {PI.email}
          </a>
        </p>
      </div>
    </div>
  )
}

function HomeStudentChip({ member }) {
  return (
    <Link
      to={`/members#${member.id}`}
      className="block bg-white border border-gray-200 p-4 text-center hover:border-brand-300 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-2 ring-1 ring-gray-200">
        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
      </div>
      <p className="text-sm font-medium text-gray-900">{member.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>
    </Link>
  )
}

function HomeLectureItem({ course }) {
  return (
    <li className="flex gap-2 leading-snug">
      <span className="text-gray-300 mt-0.5">—</span>
      <span className="text-sm text-gray-700">
        {course.titleKo}{' '}
        <span className="text-gray-400">({course.titleEn})</span>{' '}
        {course.level === 'graduate' && (
          <span className="text-xs text-gray-400 ml-1">Graduate</span>
        )}
      </span>
    </li>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────

// Hero copy & section labels — preserved from prof's WP site (philabcuk.org).
const HERO = {
  kicker: 'PHI Lab @ CUK — Precision & Provenance Health Informatics',
  headline:
    'Contribute to digital healthcare innovation with data-intensive approaches based on real-world demands',
  tagline: 'from precision medicine to social determinants of health',
  cta: 'Learn more',
}

const STATS_LABELS = {
  projects: 'Active Projects',
  publications: 'Publications',
  collaborators: 'Collaborating Institutions',
}

const SECTION_TITLES = {
  researchAreas: 'Research Areas',
  activeProjects: 'Current Research',
  recentPublications: 'Recent Publications',
  labMembers: 'Lab Members',
  lectures: 'Recent Lectures',
  about: 'About the Lab',
}

const VIEW_ALL = {
  projects: 'View all projects',
  publications: 'View all publications',
  members: 'View all members',
  lectures: 'View all lectures',
  about: 'Read more',
}

const PILLARS = {
  kr: {
    title: 'Knowledge Representation',
    body: 'Data modeling, biomedical ontology, clinical data engineering, pipeline construction, and governance for precision medicine. Includes clinical genome data modeling (cGDM) and interoperability frameworks.',
  },
  rwd: {
    title: 'Real-World Data (RWD)',
    body: 'Secondary use of electronic health records (EHR), clinical data warehouses (CDW), FAERS, and Korean claims data (HIRA). Registry construction, cohort definition, and data quality management for multi-institutional studies.',
  },
  rwe: {
    title: 'Real-World Evidence (RWE)',
    body: 'Scientific data processing for evidence generation and causal inference. Pharmacovigilance signal detection, treatment effectiveness evaluation, and integration of social determinants of health with clinical outcomes.',
  },
}

const ABOUT_BODY =
  'PHI (Precision & Provenance Health Informatics) Lab at The Catholic University of Korea advances precision medicine and digital healthcare through data-driven interdisciplinary research — spanning EHR engineering, real-world evidence generation, and information structure design.'

export default function Home() {
  // Stats (computed from JSON)
  const activeProjectsCount = researchData.filter((p) => p.status === 'active').length
  // Stats strip + Recent Publications section both restrict to peer-reviewed articles only
  // (presentations live on the dedicated /publications page).
  const articles = publicationsData.filter((p) => p.category === 'article')
  const publicationsCount = articles.length
  const collaboratorsCount = `${COLLABORATING_INSTITUTIONS.length}+`

  // Body data slices
  const featuredProjects = researchData.filter((p) => p.status === 'active').slice(0, 4)
  const recentPubs = [...articles].sort((a, b) => b.year - a.year).slice(0, 5)
  const latestYear = recentPubs.length > 0 ? Math.max(...recentPubs.map((p) => p.year)) : null

  // Lectures: most recent semester only
  const semesterRank = (s) => {
    const [term, year] = s.split(' ')
    const r = { Spring: 0, Summer: 1, Fall: 2 }
    return parseInt(year) * 10 + (r[term] ?? 5)
  }
  const sortedSemesters = [
    ...new Set(lecturesData.map((c) => c.semester)),
  ].sort((a, b) => semesterRank(b) - semesterRank(a))
  const currentSemester = sortedSemesters[0]
  const currentLectures = lecturesData.filter((c) => c.semester === currentSemester)

  return (
    <>
      {/* ── Hero (kept as-is per design hybrid) ───────────────────── */}
      <section
        className="relative text-white overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[#3576b6]/40 pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-44">
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-amber-300 mb-8">
            {HERO.kicker}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8 max-w-5xl drop-shadow-sm">
            {HERO.headline}
          </h1>
          <p className="italic text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-3xl">
            {HERO.tagline}
          </p>
          <a
            href="#research-areas"
            className="inline-block bg-amber-400 hover:bg-amber-300 text-gray-900 font-semibold px-8 py-3.5 rounded-md transition-colors text-base shadow-sm"
          >
            {HERO.cta}
          </a>
        </div>
      </section>

      {/* ── Stats inline strip (palette cleanser between hero and body) ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-500">
          <div>
            <span className="text-xl font-bold text-gray-900">{activeProjectsCount}</span>
            &nbsp;{STATS_LABELS.projects}
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <div>
            <span className="text-xl font-bold text-gray-900">{publicationsCount}</span>
            &nbsp;{STATS_LABELS.publications}
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <div>
            <span className="text-xl font-bold text-gray-900">{collaboratorsCount}</span>
            &nbsp;{STATS_LABELS.collaborators}
          </div>
        </div>
      </section>

      {/* ── 1. Research Areas (3 pillars) ───────────────────────── */}
      <section id="research-areas" className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{SECTION_TITLES.researchAreas}</HomeSectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['kr', 'rwd', 'rwe'].map((k) => (
              <div key={k}>
                <h3 className="font-semibold text-gray-900 mb-2">{PILLARS[k].title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{PILLARS[k].body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Active Projects ───────────────────────────────────── */}
      <section className="bg-[#f8fafc] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{SECTION_TITLES.activeProjects}</HomeSectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredProjects.map((project) => (
              <HomeProjectCard key={project.id} project={project} />
            ))}
          </div>
          <ViewAllLink to="/research" label={VIEW_ALL.projects} />
        </div>
      </section>

      {/* ── 3. Recent Publications ────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{SECTION_TITLES.recentPublications}</HomeSectionHeader>
          <div>
            {recentPubs.map((pub) => (
              <HomePubItem key={pub.id} pub={pub} latestYear={latestYear} />
            ))}
          </div>
          <ViewAllLink to="/publications" label={VIEW_ALL.publications} />
        </div>
      </section>

      {/* ── 4. Lab Members ────────────────────────────────────── */}
      <section className="bg-[#f8fafc] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{SECTION_TITLES.labMembers}</HomeSectionHeader>

          <HomePIBlock />

          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Undergraduate Researchers
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {STUDENTS.map((s) => (
              <HomeStudentChip key={s.id} member={s} />
            ))}
          </div>
          <ViewAllLink to="/members" label={VIEW_ALL.members} />
        </div>
      </section>

      {/* ── 5. Lectures (most recent semester) ─────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{SECTION_TITLES.lectures}</HomeSectionHeader>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {currentSemester}
          </h3>
          <ul className="space-y-2">
            {currentLectures.map((c) => (
              <HomeLectureItem key={c.id} course={c} />
            ))}
          </ul>
          <ViewAllLink to="/lectures" label={VIEW_ALL.lectures} />
        </div>
      </section>

      {/* ── 6. About / Contact ──────────────────────────────────── */}
      <section id="about" className="bg-[#f8fafc] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{SECTION_TITLES.about}</HomeSectionHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <p className="text-gray-700 leading-relaxed mb-4">{ABOUT_BODY}</p>
              <ViewAllLink to="/about" label={VIEW_ALL.about} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Contact
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Department of Biomedical Software Engineering<br />
                The Catholic University of Korea<br />
                43, Jibong-ro, Bucheon<br />
                14662, Gyeonggi-do, South Korea
              </p>
              <p className="text-sm mt-3">
                <a
                  href={`mailto:${PI.email}`}
                  className="text-brand-700 hover:underline inline-flex items-center gap-1"
                >
                  <Mail size={13} />
                  {PI.email}
                </a>
              </p>

              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-5 mb-3">
                Collaborating Institutions
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {COLLABORATING_INSTITUTIONS.join(' · ')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

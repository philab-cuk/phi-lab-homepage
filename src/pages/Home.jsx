import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useLanguage } from '../i18n/useLanguage.js'
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

function YearBadge({ year, latest }) {
  const cls = latest
    ? 'bg-brand-700 text-white'
    : 'bg-gray-400 text-white'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-sm mr-2 ${cls}`}>{year}</span>
  )
}

function HomePubItem({ pub, latestYear }) {
  const isLatest = pub.year === latestYear
  const link = pub.doi ? `https://doi.org/${pub.doi}` : pub.url
  return (
    <div className="py-3.5 border-b border-gray-200 last:border-b-0 leading-relaxed">
      <YearBadge year={pub.year} latest={isLatest} />
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
          {PI.name}, {PI.degree.includes('Ph.D.') ? 'PhD' : PI.degree}
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
    <div className="bg-white border border-gray-200 p-4 text-center">
      <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-2 ring-1 ring-gray-200">
        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
      </div>
      <p className="text-sm font-medium text-gray-900">{member.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>
    </div>
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

export default function Home() {
  const { t } = useLanguage()
  const h = t.hero
  const home = t.home

  // Stats (computed from JSON)
  const activeProjectsCount = researchData.filter((p) => p.status === 'active').length
  const publicationsCount = publicationsData.length
  const collaboratorsCount = `${COLLABORATING_INSTITUTIONS.length}+`

  // Body data slices
  const featuredProjects = researchData.filter((p) => p.status === 'active').slice(0, 8)
  const recentPubs = [...publicationsData].sort((a, b) => b.year - a.year).slice(0, 8)
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
            {h.kicker}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8 max-w-5xl drop-shadow-sm">
            {h.headline}
          </h1>
          <p className="italic text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-3xl">
            {h.tagline}
          </p>
          <a
            href="#research-areas"
            className="inline-block bg-amber-400 hover:bg-amber-300 text-gray-900 font-semibold px-8 py-3.5 rounded-md transition-colors text-base shadow-sm"
          >
            {h.cta}
          </a>
        </div>
      </section>

      {/* ── Stats inline strip (palette cleanser between hero and body) ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-500">
          <div>
            <span className="text-xl font-bold text-gray-900">{activeProjectsCount}</span>
            &nbsp;{home.stats.projects}
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <div>
            <span className="text-xl font-bold text-gray-900">{publicationsCount}</span>
            &nbsp;{home.stats.publications}
          </div>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <div>
            <span className="text-xl font-bold text-gray-900">{collaboratorsCount}</span>
            &nbsp;{home.stats.collaborators}
          </div>
        </div>
      </section>

      {/* ── 1. Research Areas (3 pillars) ───────────────────────── */}
      <section id="research-areas" className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{home.sections.researchAreas}</HomeSectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['kr', 'rwd', 'rwe'].map((k) => (
              <div key={k}>
                <h3 className="font-semibold text-gray-900 mb-2">{home.pillars[k].title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{home.pillars[k].body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Active Projects ───────────────────────────────────── */}
      <section className="bg-[#f8fafc] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{home.sections.activeProjects}</HomeSectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredProjects.map((project) => (
              <HomeProjectCard key={project.id} project={project} />
            ))}
          </div>
          <ViewAllLink to="/research" label={home.viewAll.projects} />
        </div>
      </section>

      {/* ── 3. Recent Publications ────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{home.sections.recentPublications}</HomeSectionHeader>
          <div>
            {recentPubs.map((pub) => (
              <HomePubItem key={pub.id} pub={pub} latestYear={latestYear} />
            ))}
          </div>
          <ViewAllLink to="/publications" label={home.viewAll.publications} />
        </div>
      </section>

      {/* ── 4. Lab Members ────────────────────────────────────── */}
      <section className="bg-[#f8fafc] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{home.sections.labMembers}</HomeSectionHeader>

          <HomePIBlock />

          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {home.members.students}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {STUDENTS.map((s) => (
              <HomeStudentChip key={s.id} member={s} />
            ))}
          </div>
          <ViewAllLink to="/members" label={home.viewAll.members} />
        </div>
      </section>

      {/* ── 5. Lectures (most recent semester) ─────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{home.sections.lectures}</HomeSectionHeader>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {currentSemester}
          </h3>
          <ul className="space-y-2">
            {currentLectures.map((c) => (
              <HomeLectureItem key={c.id} course={c} />
            ))}
          </ul>
          <ViewAllLink to="/lectures" label={home.viewAll.lectures} />
        </div>
      </section>

      {/* ── 6. About / Contact ──────────────────────────────────── */}
      <section id="about" className="bg-[#f8fafc] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HomeSectionHeader>{home.sections.about}</HomeSectionHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <p className="text-gray-700 leading-relaxed mb-4">{home.about.body}</p>
              <ViewAllLink to="/about" label={home.viewAll.about} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {home.about.contact}
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
                {home.about.collaborators}
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

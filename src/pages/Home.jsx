import { Link } from 'react-router-dom'
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

// LIVE verbatim — philabcuk.org Home, do not paraphrase or expand.
const HERO = {
  kicker: 'PHI Lab @ CUK — Precision & Provenance Health Informatics',
  headline:
    'Contribute to digital healthcare innovation with data-intensive approaches based on real-world demands',
  tagline: 'from precision medicine to social determinants of health',
}

// LIVE verbatim — casing and grammar preserved as-is ('representation' lc,
// 'Real-world' hy, 'We deciphering').
const PILLARS = [
  {
    title: 'Knowledge representation',
    body: 'Data modeling, Data engineering, Pipeline construction, Data management & governance.',
  },
  {
    title: 'Real-world Data (RWD)',
    body: 'Secondary use of real-world data including EHR/CDW data, public big data repositories such as FAERS.',
  },
  {
    title: 'Real-world Evidence (RWE)',
    body: 'We deciphering scientific data processing, analytics methods for systematic evidence generation.',
  },
]

// LIVE verbatim — philabcuk.org/about/ first English paragraph. Curly U+2019.
const ABOUT_BODY =
  'PHI (Precision & Provenance Health Informatics Lab) at the Catholic University of Korea is dedicated to advancing precision medicine and digital healthcare through data-driven interdisciplinary research. The lab’s work spans from public data to EHR (Electronic Health Records) data, emphasizing the utilization of trustworthy data, knowledge generation via data science, and supporting decision-making through data-based digital healthcare systems.'

function ViewAllLink({ to, label }) {
  return (
    <p className="my-2 text-[15px]">
      <Link to={to}>{label} →</Link>
    </p>
  )
}

function PubItem({ pub }) {
  const link = pub.doi ? `https://doi.org/${pub.doi}` : pub.url
  return (
    <li className="my-2 list-none">
      <span className="text-meta text-[15px]">{pub.year}</span>{' '}
      {pub.authors.map((a, i) => (
        <span key={`${a.name}-${i}`}>
          {a.isPi ? <strong>{a.name}</strong> : a.name}
          {a.coFirst && <sup>†</sup>}
          {i < pub.authors.length - 1 && ', '}
        </span>
      ))}
      . &ldquo;{pub.title}.&rdquo; <em>{pub.venue}</em>
      {pub.venueDetails && `, ${pub.venueDetails}`}.
      {link && (
        <>
          {' '}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px]"
          >
            [{pub.doi ? 'DOI' : 'Link'}]
          </a>
        </>
      )}
    </li>
  )
}

export default function Home() {
  const activeProjectsCount = researchData.filter((p) => p.status === 'active').length
  const articles = publicationsData.filter((p) => p.category === 'article')
  const publicationsCount = publicationsData.length
  const collaboratorsCount = COLLABORATING_INSTITUTIONS.length

  // research.json 배열 순서 = LIVE phi-card DOM 순서. 자체 정렬 없이 첫 4건 노출.
  const featuredProjects = researchData
    .filter((p) => p.status === 'active')
    .slice(0, 4)
  const recentPubs = [...articles].sort((a, b) => b.year - a.year).slice(0, 5)

  const semesterRank = (s) => {
    const [term, year] = s.split(' ')
    const r = { Spring: 0, Summer: 1, Fall: 2 }
    return parseInt(year) * 10 + (r[term] ?? 5)
  }
  const sortedSemesters = [...new Set(lecturesData.map((c) => c.semester))].sort(
    (a, b) => semesterRank(b) - semesterRank(a),
  )
  const currentSemester = sortedSemesters[0]
  const currentLectures = lecturesData.filter((c) => c.semester === currentSemester)

  return (
    <div className="mx-auto max-w-[820px] px-6 py-12">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <p className="text-meta text-[15px] my-0">{HERO.kicker}</p>
      <h1 className="mt-1">{HERO.headline}</h1>
      <p className="italic text-muted">{HERO.tagline}</p>
      <p className="text-[15px] text-meta mt-4">
        {activeProjectsCount} current research · {publicationsCount} publications ·{' '}
        {collaboratorsCount} collaborating institutions
      </p>

      {/* ── Research Areas (3 pillars) ───────────────────────────── */}
      <h2>Research</h2>
      {PILLARS.map((p) => (
        <div key={p.title} className="my-4">
          <p className="my-0 font-semibold text-ink">{p.title}</p>
          <p className="my-0 text-muted">{p.body}</p>
        </div>
      ))}

      {/* ── Current Research ─────────────────────────────────────── */}
      <h2>Current Research</h2>
      <ul className="list-none pl-0 m-0">
        {featuredProjects.map((project) => {
          const kicker = (project.affiliations ?? [])
            .map((a) => a.institution)
            .join(' · ')
          return (
            <li key={project.id} className="my-3">
              {kicker && <p className="my-0 text-meta text-[15px]">{kicker}</p>}
              <p className="my-0">
                <span className="font-semibold text-ink">{project.title}</span>
                {project.descriptionKo && (
                  <span className="text-muted"> — {project.descriptionKo}</span>
                )}
              </p>
            </li>
          )
        })}
      </ul>
      <ViewAllLink to="/research" label="View all projects" />

      {/* ── Recent Publications ──────────────────────────────────── */}
      <h2>Recent Publications</h2>
      <ol className="list-none pl-0 m-0">
        {recentPubs.map((pub) => (
          <PubItem key={pub.id} pub={pub} />
        ))}
      </ol>
      <ViewAllLink to="/publications" label="View all publications" />

      {/* ── Featured Quote (LIVE block, no decorative band) ──────── */}
      {/* Author spelling corrected to 'McCandless' (LIVE shows 'Maccandless'). */}
      <blockquote className="my-10 not-italic border-l-2 border-rule pl-4">
        <p className="my-0 text-xl font-semibold text-ink">
          &ldquo;Data is the new soil, not oil.&rdquo;
        </p>
        <footer className="my-1 text-[15px] text-meta">
          David McCandless (Author of Information is Beautiful)
        </footer>
      </blockquote>
      <p>Oil is valuable and tradable.</p>
      <p>
        Data only becomes valuable with considerable effort. In the data-driven era,
        the effectiveness of AI machines depends on the granularity and precision of the data.
      </p>
      <p>
        We focus on optimal informative transformation with the right application, so that could
        be a medium that bridges the gap between raw data and actionable knowledge.
      </p>

      {/* ── Lab Members ──────────────────────────────────────────── */}
      <h2>Lab Members</h2>
      <p>
        <Link to="/professor">
          <strong>{PI.name}</strong>, {PI.degree.includes('Ph.D.') ? 'PhD' : PI.degree}
        </Link>{' '}
        — {PI.title}, {PI.department}, {PI.institution}.
      </p>
      {PI.bioShort && <p className="text-muted">{PI.bioShort}</p>}
      {STUDENTS.length > 0 && (
        <p>
          <span className="text-meta">Undergraduate researchers: </span>
          {STUDENTS.map((s, i) => (
            <span key={s.id}>
              {i > 0 && ', '}
              <Link to={`/members#${s.id}`}>{s.name}</Link>
            </span>
          ))}
          .
        </p>
      )}
      <ViewAllLink to="/members" label="View all members" />

      {/* ── Recent Lectures ──────────────────────────────────────── */}
      <h2>Recent Lectures</h2>
      <p className="text-meta text-[15px] my-1">{currentSemester}</p>
      <ul>
        {currentLectures.map((c) => (
          <li key={c.id}>
            {c.titleKo} <span className="text-muted">({c.titleEn})</span>
            {c.level === 'graduate' && (
              <span className="text-meta text-[15px]"> · Graduate</span>
            )}
          </li>
        ))}
      </ul>
      <ViewAllLink to="/lectures" label="View all lectures" />

      {/* ── About preview ────────────────────────────────────────── */}
      <h2>About the Lab</h2>
      <p>{ABOUT_BODY}</p>
      <ViewAllLink to="/about" label="Read more" />
    </div>
  )
}

import researchData from '../data/research.json'
import publicationsData from '../data/publications.json'

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

export default function Home() {
  const activeProjectsCount = researchData.filter((p) => p.status === 'active').length
  const publicationsCount = publicationsData.length
  const collaboratorsCount = COLLABORATING_INSTITUTIONS.length

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

      {/* ── Featured Quote ───────────────────────────────────────── */}
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

      {/* ── Collaborating Institutions ────────────────────────────── */}
      <h2>Collaborating Institutions</h2>
      <ul className="list-none pl-0 m-0">
        {COLLABORATING_INSTITUTIONS.map((inst) => (
          <li key={inst} className="my-1">
            {inst}
          </li>
        ))}
      </ul>
    </div>
  )
}

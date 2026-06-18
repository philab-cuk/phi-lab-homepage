import { useLoaderData } from 'react-router'
import { fetchHomeStats, fetchCollaboratingInstitutions } from '../lib/publicData'

export async function loader() {
  const [stats, collaborators] = await Promise.all([
    fetchHomeStats(),
    fetchCollaboratingInstitutions(),
  ])
  return { ...stats, collaborators }
}

// ─── Constants ────────────────────────────────────────────────────────────

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
  const data = useLoaderData()
  const collaborators = data.collaborators
  const collaboratorsCount = collaborators.length
  const activeProjectsCount = data.activeResearchCount
  const publicationsCount = data.publicationsCount

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <p className="text-meta text-[15px] my-0">{HERO.kicker}</p>
      <h1 className="mt-1 text-[2.1rem]">{HERO.headline}</h1>
      <p className="italic text-muted text-[1.2rem]">{HERO.tagline}</p>
      <p className="text-[15px] text-meta mt-4">
        {activeProjectsCount} current research · {publicationsCount} publications ·{' '}
        {collaboratorsCount} collaborating institutions
      </p>

      {/* ── Research Areas (3 pillars) ───────────────────────────── */}
      <h2>Research</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {PILLARS.map((p) => (
          <div key={p.title} className="border border-rule rounded-lg p-5">
            <p className="my-0 font-semibold text-ink">{p.title}</p>
            <p className="mt-2 mb-0 text-muted text-[15px] leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>

      {/* ── Featured Quote ───────────────────────────────────────── */}
      {/* Author spelling corrected to 'McCandless' (LIVE shows 'Maccandless'). */}
      <blockquote className="my-10 not-italic border-l-2 border-rule pl-4">
        <p className="my-0 text-[2rem] leading-tight font-semibold text-ink">
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {collaborators.map((inst) => (
          <div key={inst.name} className="flex flex-col items-center justify-center gap-2 border border-rule rounded-lg p-4 min-h-[7rem] text-center">
            {inst.logo && <img src={inst.logo} alt={inst.name} className="max-h-11 max-w-full w-auto object-contain" />}
            <span className="text-muted text-[12px] leading-tight">{inst.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

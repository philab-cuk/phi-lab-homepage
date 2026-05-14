import { useState } from 'react'
import {
  Brain,
  Database,
  Shield,
  Network,
  Microscope,
  BarChart2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
} from 'lucide-react'
import researchData from '../data/research.json'

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP = {
  brain: Brain,
  database: Database,
  shield: Shield,
  network: Network,
  microscope: Microscope,
  chart: BarChart2,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ProjectIcon({ icon, size = 22, className = '' }) {
  const Icon = ICON_MAP[icon] ?? FlaskConical
  return <Icon size={size} className={className} />
}

function StatusBadge({ status }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Completed
    </span>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

// TODO(ui-redesign): LIVE phi-card 구조(기관 그룹별 + Featured 위계 + phi-collab 라인) 재현
function ProjectCard({ project }) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-brand-200 transition-all group flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
          <ProjectIcon icon={project.icon} className="text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <StatusBadge status={project.status} />
          </div>
          <h3 className="font-bold text-gray-900 text-lg leading-snug">{project.title}</h3>
        </div>
      </div>

      {/* Description (Korean, LIVE phi-card-sub) */}
      {project.descriptionKo && (
        <p className="text-gray-500 text-sm leading-relaxed">{project.descriptionKo}</p>
      )}

      {/* Funding */}
      {project.fundingAgency && (
        <p className="text-xs text-brand-700 font-medium">
          Funded by: <span className="font-semibold">{project.fundingAgency}</span>
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {(project.tagsLive ?? []).map((tag) => (
          <span
            key={tag}
            className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

// ─── Section divider ─────────────────────────────────────────────────────────

function SectionDivider({ label, count }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
        {count} {count === 1 ? 'project' : 'projects'}
      </span>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Research() {
  const [completedOpen, setCompletedOpen] = useState(false)

  const active = researchData.filter((p) => p.status === 'active')
  const completed = researchData.filter((p) => p.status === 'completed')

  return (
    <>
      {/* ── Page Header ── */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-600 opacity-20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-brand-500 opacity-15 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 relative">
          <span className="inline-flex items-center gap-1.5 bg-brand-600/40 border border-brand-400/40 text-brand-100 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <Microscope size={13} />
            Our Research
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Research Projects</h1>
          <p className="text-brand-200 text-base max-w-xl leading-relaxed mb-6">
            Our work spans clinical NLP, data provenance, federated learning, and precision
            medicine — bridging computational methods with real-world clinical challenges.
          </p>
          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm text-brand-100">
            <span>
              <strong className="text-white text-xl font-bold">{active.length}</strong>{' '}
              Active Projects
            </span>
            <span>
              <strong className="text-white text-xl font-bold">{completed.length}</strong>{' '}
              Completed Projects
            </span>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Active projects */}
        <section className="mb-14">
          <SectionDivider label="Active Projects" count={active.length} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {active.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Completed projects — collapsible */}
        {completed.length > 0 && (
          <section>
            <button
              onClick={() => setCompletedOpen((prev) => !prev)}
              className="w-full flex items-center gap-3 mb-6 group"
              aria-expanded={completedOpen}
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 whitespace-nowrap group-hover:text-brand-600 transition-colors">
                Completed Projects
              </span>
              <div className="flex-1 h-px bg-gray-200 group-hover:bg-brand-200 transition-colors" />
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap group-hover:text-brand-600 transition-colors">
                {completed.length} {completed.length === 1 ? 'project' : 'projects'}
              </span>
              <span className="text-gray-400 group-hover:text-brand-600 transition-colors flex-shrink-0">
                {completedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {completedOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {completed.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  )
}

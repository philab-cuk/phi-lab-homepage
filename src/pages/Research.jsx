import { useState } from 'react'
import researchData from '../data/research.json'

// ─── LIVE phi-* token mapping (docs/phi-lab-content/05_research.md §phi-* CSS) ──

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: '연구실', label: 'PHI Lab' },
  { key: '카카오', label: '카카오헬스케어' },
  { key: '은평성모', label: '은평성모병원' },
  { key: '부천성모', label: '부천성모병원' },
  { key: '삼성서울', label: '삼성서울병원' },
  { key: '숙명여대', label: '숙명여자대학교' },
  { key: '전남대', label: '전남대학교' },
  { key: 'rwd', label: 'RWD / HIRA' },
]

// research.json institutionKo → LIVE data-inst group key (LIVE has no 가톨릭 filter button)
const GROUP_KEY = {
  'PHI Lab': '연구실',
  '가톨릭': '가톨릭',
  '카카오헬스케어': '카카오',
  '은평성모': '은평성모',
  '부천성모': '부천성모',
  '삼성서울': '삼성서울',
  '숙명여대': '숙명여대',
  '전남대': '전남대',
}

// LIVE phi-card border-left color (3px solid) by group key
const CARD_BORDER_LEFT = {
  '연구실': '#378ADD',
  '가톨릭': '#378ADD',
  '카카오': '#FAC775',
  '은평성모': '#5DCAA5',
  '부천성모': '#5DCAA5',
  '삼성서울': '#D4537E',
  '숙명여대': '#AFA9EC',
  '전남대': '#F0997B',
}

// LIVE phi-ib-* badge (bg + text) by group key
const BADGE_STYLE = {
  '연구실': 'bg-[#E6F1FB] text-[#185FA5]',
  '가톨릭': 'bg-[#E6F1FB] text-[#185FA5]',
  '카카오': 'bg-[#FAEEDA] text-[#854F0B]',
  '은평성모': 'bg-[#E1F5EE] text-[#0F6E56]',
  '부천성모': 'bg-[#E1F5EE] text-[#0F6E56]',
  '삼성서울': 'bg-[#FBEAF0] text-[#993556]',
  '숙명여대': 'bg-[#EEEDFE] text-[#534AB7]',
  '전남대': 'bg-[#FAECE7] text-[#993C1D]',
}

// LIVE phi-tag color class by tag value (only specific tags have colors)
const TAG_STYLE = {
  RWD: 'bg-[#EAF3DE] text-[#3B6D11]',
  HIRA: 'bg-[#E6F1FB] text-[#185FA5]',
  FAERS: 'bg-[#FAEEDA] text-[#854F0B]',
  LLM: 'bg-[#EEEDFE] text-[#534AB7]',
  ML: 'bg-[#EEEDFE] text-[#534AB7]',
  'Multi-inst.': 'bg-[#FBEAF0] text-[#993556]',
}
const TAG_DEFAULT = 'bg-[#f3f3f3] text-[#555]'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function badgeLabel(affiliation) {
  return affiliation.departmentKo
    ? `${affiliation.institutionKo} · ${affiliation.departmentKo}`
    : affiliation.institutionKo
}

function matchesFilter(project, filterKey) {
  if (filterKey === 'all') return true
  if (filterKey === 'rwd') {
    const tags = project.tagsLive ?? []
    return tags.includes('RWD') || tags.includes('HIRA')
  }
  return (project.affiliations ?? []).some(
    (a) => GROUP_KEY[a.institutionKo] === filterKey,
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InstitutionBadge({ affiliation }) {
  const group = GROUP_KEY[affiliation.institutionKo]
  const cls = BADGE_STYLE[group] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`text-[11px] font-medium px-2 py-[3px] rounded-md inline-block ${cls}`}>
      {badgeLabel(affiliation)}
    </span>
  )
}

function TagChip({ tag }) {
  const cls = TAG_STYLE[tag] ?? TAG_DEFAULT
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-md inline-block ${cls}`}>
      {tag}
    </span>
  )
}

function PhiCard({ project }) {
  const primaryGroup = GROUP_KEY[project.affiliations?.[0]?.institutionKo]
  const borderColor = CARD_BORDER_LEFT[primaryGroup] ?? '#bbb'
  const collabText =
    project.notes ?? project.collaborators?.international?.join(' · ')
  return (
    <article
      className="bg-white border border-[#e8e8e8] hover:border-[#bbb] rounded-xl px-[1.1rem] py-4 flex flex-col gap-2 min-w-0 [word-break:keep-all] transition-colors"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex flex-wrap gap-1">
        {(project.affiliations ?? []).map((a, i) => (
          <InstitutionBadge key={i} affiliation={a} />
        ))}
      </div>
      <h3 className="text-[13px] font-semibold text-[#111] leading-[1.45]">
        {project.title}
      </h3>
      {project.descriptionKo && (
        <p className="text-[11px] text-[#555] leading-[1.5]">{project.descriptionKo}</p>
      )}
      <div className="flex flex-wrap gap-1">
        {(project.tagsLive ?? []).map((tag) => (
          <TagChip key={tag} tag={tag} />
        ))}
      </div>
      {collabText && (
        <p className="text-[10px] text-[#888] leading-[1.5]">{collabText}</p>
      )}
    </article>
  )
}

function FeaturedInitiative({ project }) {
  // MOMENTUM uses fullTitle (LIVE Featured paragraph); AI-Trajectory uses title (the only LIVE title slot)
  const heading = project.fullTitle ?? project.title
  const hashtags = (project.tagsFeaturedLive ?? []).map((t) => `#${t}`).join(' ')
  return (
    <article className="py-3">
      <p className="font-bold text-gray-900 text-base md:text-lg leading-snug">
        {heading}
      </p>
      {(hashtags || project.notes) && (
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {hashtags}
          {project.notes && (
            <>
              {hashtags && ' '}
              <em className="text-gray-500">{project.notes}</em>
            </>
          )}
        </p>
      )}
    </article>
  )
}

function FilterBar({ activeFilter, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {FILTERS.map((f) => {
        const isOn = activeFilter === f.key
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onChange(f.key)}
            className={`text-xs px-3 py-[5px] rounded-full border transition-colors cursor-pointer ${
              isOn
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-transparent text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Research() {
  const [activeFilter, setActiveFilter] = useState('all')

  // Featured: LIVE Major Research Initiatives (MOMENTUM, AI-Trajectory)
  const featured = researchData.filter((p) => p.featured)

  // Grid: every item with a LIVE phi-card surface (i.e. has descriptionKo).
  // AI-Trajectory has no grid card on LIVE, so descriptionKo is null and it
  // is excluded from grid. MOMENTUM appears in both Featured and grid per LIVE.
  const gridSource = researchData.filter((p) => p.descriptionKo != null)
  const gridFiltered = gridSource.filter((p) => matchesFilter(p, activeFilter))

  return (
    <>
      {/* Page title band — LIVE renders just <h1 class="entry-title">Current Research</h1> */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Current Research</h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Featured / Major Research Initiatives — LIVE paragraph-style, no section header */}
        <section className="mb-8 space-y-1 border-b border-gray-200 pb-6">
          {featured.map((p) => (
            <FeaturedInitiative key={p.id} project={p} />
          ))}
        </section>

        {/* Filter bar + count */}
        <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} />
        <p className="text-xs text-gray-400 mb-4">{gridFiltered.length} projects</p>

        {/* Grid — LIVE phi-grid is repeat(2, 1fr) on all viewports; we relax to 1-col on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {gridFiltered.map((p) => (
            <PhiCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </>
  )
}

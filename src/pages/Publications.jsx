import { useState, useMemo } from 'react'
import { Search, Copy, Check, ExternalLink, BookOpen, FileText, Layers } from 'lucide-react'
import publicationsData from '../data/publications.json'

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_YEARS = ['All', 2026, 2025, 2024, 2023, 2022, 2021, 2020]

const TYPE_CONFIG = {
  journal: {
    label: 'Journal',
    icon: BookOpen,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    activeBg: 'bg-emerald-600',
  },
  conference: {
    label: 'Conference',
    icon: Layers,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    activeBg: 'bg-blue-600',
  },
  workshop: {
    label: 'Workshop',
    icon: FileText,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    activeBg: 'bg-amber-500',
  },
}

// ─── BibTeX generation ────────────────────────────────────────────────────────

function buildBibtex(pub) {
  const citeKey = pub.id
  const firstAuthorLast = pub.authors[0].split(' ').pop()
  const authorStr = pub.authors.join(' and ')
  const doiLine = pub.doi ? `  doi       = {${pub.doi}},\n` : ''

  if (pub.type === 'journal') {
    return `@article{${citeKey},\n  author    = {${authorStr}},\n  title     = {{${pub.title}}},\n  journal   = {${pub.venue}},\n  year      = {${pub.year}},\n${doiLine}}`
  }
  return `@inproceedings{${citeKey},\n  author    = {${authorStr}},\n  title     = {{${pub.title}}},\n  booktitle = {${pub.venue}},\n  year      = {${pub.year}},\n${doiLine}}`
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type]
  if (!cfg) return null
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function KeywordTag({ tag }) {
  return (
    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
      {tag}
    </span>
  )
}

function CopyBibtexButton({ pub }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const bibtex = buildBibtex(pub)
    navigator.clipboard.writeText(bibtex).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy BibTeX"
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
      }`}
    >
      {copied ? (
        <>
          <Check size={12} />
          Copied!
        </>
      ) : (
        <>
          <Copy size={12} />
          BibTeX
        </>
      )}
    </button>
  )
}

function PublicationCard({ pub }) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
      {/* Title */}
      <h3 className="font-bold text-gray-900 text-base leading-snug mb-1.5">{pub.title}</h3>

      {/* Authors */}
      <p className="text-gray-600 text-sm mb-1">{pub.authors.join(', ')}</p>

      {/* Venue + year + type badge */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-gray-500 text-sm italic">{pub.venue}</span>
        <span className="text-gray-400 text-sm">&middot; {pub.year}</span>
        <TypeBadge type={pub.type} />
      </div>

      {/* Abstract */}
      <p className="text-gray-500 text-sm leading-relaxed mb-3">{pub.abstract}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {pub.tags.map((tag) => (
          <KeywordTag key={tag} tag={tag} />
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <CopyBibtexButton pub={pub} />
        {pub.doi && (
          <a
            href={`https://doi.org/${pub.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            <ExternalLink size={12} />
            DOI
          </a>
        )}
      </div>
    </article>
  )
}

function YearGroup({ year, pubs }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg font-bold text-blue-800">{year}</span>
        <div className="flex-1 h-px bg-blue-100" />
        <span className="text-xs text-gray-400 font-medium">
          {pubs.length} {pubs.length === 1 ? 'publication' : 'publications'}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {pubs.map((pub) => (
          <PublicationCard key={pub.id} pub={pub} />
        ))}
      </div>
    </section>
  )
}

function TypeFilterButton({ type, active, count, onClick }) {
  const cfg = type === 'All' ? null : TYPE_CONFIG[type.toLowerCase()]
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
        active
          ? cfg
            ? `${cfg.activeBg} text-white border-transparent shadow-sm`
            : 'bg-blue-700 text-white border-transparent shadow-sm'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
      }`}
    >
      {cfg && (() => { const Icon = cfg.icon; return <Icon size={13} /> })()}
      {type}
      <span
        className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold ${
          active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Publications() {
  const [yearFilter, setYearFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [query, setQuery] = useState('')

  // Derived counts for type filter buttons (ignoring type filter itself)
  const typeCounts = useMemo(() => {
    const base = publicationsData.filter((p) => {
      const matchYear = yearFilter === 'All' || p.year === yearFilter
      const matchQuery =
        query === '' ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.authors.some((a) => a.toLowerCase().includes(query.toLowerCase())) ||
        p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
        p.venue.toLowerCase().includes(query.toLowerCase())
      return matchYear && matchQuery
    })
    return {
      All: base.length,
      Journal: base.filter((p) => p.type === 'journal').length,
      Conference: base.filter((p) => p.type === 'conference').length,
      Workshop: base.filter((p) => p.type === 'workshop').length,
    }
  }, [yearFilter, query])

  // Filtered list
  const filtered = useMemo(() => {
    return publicationsData.filter((p) => {
      const matchYear = yearFilter === 'All' || p.year === yearFilter
      const matchType = typeFilter === 'All' || p.type === typeFilter.toLowerCase()
      const q = query.toLowerCase()
      const matchQuery =
        q === '' ||
        p.title.toLowerCase().includes(q) ||
        p.authors.some((a) => a.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.venue.toLowerCase().includes(q)
      return matchYear && matchType && matchQuery
    })
  }, [yearFilter, typeFilter, query])

  // Group by year descending
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((p) => {
      if (!map[p.year]) map[p.year] = []
      map[p.year].push(p)
    })
    return Object.entries(map)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, pubs]) => ({ year: Number(year), pubs }))
  }, [filtered])

  const typeOptions = ['All', 'Journal', 'Conference', 'Workshop']

  return (
    <>
      {/* ── Page Header ── */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 relative">
          <span className="inline-flex items-center gap-1.5 bg-blue-600/40 border border-blue-400/40 text-blue-100 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <BookOpen size={13} />
            Research Output
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Publications</h1>
          <p className="text-blue-200 text-base max-w-xl leading-relaxed">
            Peer-reviewed research from the PHI Lab spanning health informatics, clinical NLP,
            EHR data provenance, and privacy-preserving AI.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-blue-100">
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-300" />
              <strong className="text-white">{publicationsData.filter((p) => p.type === 'journal').length}</strong> Journal Articles
            </span>
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-blue-300" />
              <strong className="text-white">{publicationsData.filter((p) => p.type === 'conference').length}</strong> Conference Papers
            </span>
            <span className="flex items-center gap-1.5">
              <FileText size={14} className="text-blue-300" />
              <strong className="text-white">{publicationsData.filter((p) => p.type === 'workshop').length}</strong> Workshop Papers
            </span>
          </div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center gap-4">

          {/* Search */}
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, tag…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
            />
          </div>

          {/* Year */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => {
                const v = e.target.value
                setYearFilter(v === 'All' ? 'All' : Number(v))
              }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700"
            >
              {ALL_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {typeOptions.map((t) => (
              <TypeFilterButton
                key={t}
                type={t}
                active={typeFilter === t}
                count={typeCounts[t] ?? 0}
                onClick={() => setTypeFilter(t)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl">

        {/* Count display */}
        <p className="text-sm text-gray-500 mb-8">
          Showing{' '}
          <span className="font-semibold text-gray-800">{filtered.length}</span>{' '}
          of{' '}
          <span className="font-semibold text-gray-800">{publicationsData.length}</span>{' '}
          publication{publicationsData.length !== 1 ? 's' : ''}
          {(yearFilter !== 'All' || typeFilter !== 'All' || query) && (
            <button
              onClick={() => { setYearFilter('All'); setTypeFilter('All'); setQuery('') }}
              className="ml-3 text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </p>

        {/* Results */}
        {grouped.length > 0 ? (
          <div className="flex flex-col gap-12">
            {grouped.map(({ year, pubs }) => (
              <YearGroup key={year} year={year} pubs={pubs} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <Search size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No publications found</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Try adjusting your search term, year, or publication type filter.
            </p>
            <button
              onClick={() => { setYearFilter('All'); setTypeFilter('All'); setQuery('') }}
              className="mt-5 inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </>
  )
}

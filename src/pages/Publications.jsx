import { useState, useMemo } from 'react'
import { Search, Copy, Check, ExternalLink, BookOpen } from 'lucide-react'
import publicationsData from '../data/publications.json'

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_YEARS_OPTION = 'All'

// LIVE-faithful uppercase headings + per-category badge styling.
const CATEGORY_LABEL = {
  'article': 'ARTICLE, PEER-REVIEWED',
  'international-presentation': 'INTERNATIONAL PRESENTATION',
  'national-presentation': 'NATIONAL PRESENTATION',
}
const CATEGORY_BADGE = {
  'article': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'international-presentation': 'bg-violet-100 text-violet-800 border-violet-200',
  'national-presentation': 'bg-amber-100 text-amber-800 border-amber-200',
}

// ─── BibTeX generation (per-category) ───────────────────────────────────────

function buildBibtex(pub) {
  const citeKey = pub.id
  const authorStr = pub.authors.map((a) => a.name).join(' and ')
  const doiLine = pub.doi ? `  doi          = {${pub.doi}},\n` : ''
  const urlLine = !pub.doi && pub.url ? `  url          = {${pub.url}},\n` : ''

  if (pub.category === 'article') {
    return (
      `@article{${citeKey},\n` +
      `  author       = {${authorStr}},\n` +
      `  title        = {{${pub.title}}},\n` +
      `  journal      = {${pub.venue}},\n` +
      `  year         = {${pub.year}},\n` +
      doiLine + urlLine +
      `}`
    )
  }
  // Presentation → @misc with howpublished + venue + location + date
  const howpublishedParts = [pub.venue]
  if (pub.location) howpublishedParts.push(pub.location)
  if (pub.date) howpublishedParts.push(pub.date)
  const howpublished = howpublishedParts.join(', ')
  return (
    `@misc{${citeKey},\n` +
    `  author       = {${authorStr}},\n` +
    `  title        = {{${pub.title}}},\n` +
    `  howpublished = {${howpublished}},\n` +
    `  year         = {${pub.year}},\n` +
    `  note         = {${pub.category === 'international-presentation' ? 'International presentation' : 'National presentation'}},\n` +
    `}`
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AuthorList({ authors }) {
  return (
    <>
      {authors.map((a, i) => (
        <span key={`${a.name}-${i}`}>
          {a.isPi ? <strong className="text-gray-800">{a.name}</strong> : a.name}
          {a.coFirst && <sup>†</sup>}
          {i < authors.length - 1 && ', '}
        </span>
      ))}
    </>
  )
}

function CategoryBadge({ category }) {
  const cls = CATEGORY_BADGE[category] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  const label = CATEGORY_LABEL[category] ?? category
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${cls}`}
    >
      {label}
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
          : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-600'
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
  const isArticle = pub.category === 'article'
  return (
    <article className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-200 transition-all">
      {/* Category badge + year */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <CategoryBadge category={pub.category} />
        <span className="text-gray-400 text-xs font-medium">{pub.year}</span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-base leading-snug mb-1.5">{pub.title}</h3>

      {/* Authors */}
      <p className="text-gray-600 text-sm mb-1">
        <AuthorList authors={pub.authors} />
      </p>

      {/* Venue + (article: venueDetails / presentation: location + date) */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
        <span className="text-gray-500 text-sm italic">{pub.venue}</span>
        {isArticle && pub.venueDetails && (
          <span className="text-gray-400 text-sm">{pub.venueDetails}</span>
        )}
        {!isArticle && pub.location && (
          <span className="text-gray-400 text-sm">· {pub.location}</span>
        )}
        {!isArticle && pub.date && (
          <span className="text-gray-400 text-sm">· {pub.date}</span>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <CopyBibtexButton pub={pub} />
        {pub.doi && (
          <a
            href={`https://doi.org/${pub.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-600 transition-colors"
          >
            <ExternalLink size={12} />
            DOI
          </a>
        )}
        {!pub.doi && pub.url && (
          <a
            href={pub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-600 transition-colors"
          >
            <ExternalLink size={12} />
            Link
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
        <span className="text-lg font-bold text-brand-800">{year}</span>
        <div className="flex-1 h-px bg-brand-100" />
        <span className="text-xs text-gray-400 font-medium">
          {pubs.length} {pubs.length === 1 ? 'entry' : 'entries'}
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Publications() {
  const [yearFilter, setYearFilter] = useState(ALL_YEARS_OPTION)
  const [query, setQuery] = useState('')

  // Counts per category (for header summary)
  const counts = useMemo(() => {
    const c = { article: 0, intl: 0, national: 0 }
    publicationsData.forEach((p) => {
      if (p.category === 'article') c.article++
      else if (p.category === 'international-presentation') c.intl++
      else if (p.category === 'national-presentation') c.national++
    })
    return c
  }, [])

  // All distinct years (descending)
  const years = useMemo(() => {
    const set = new Set(publicationsData.map((p) => p.year))
    return [...set].sort((a, b) => b - a)
  }, [])

  // Filtered list — search across title / authors / venue / location
  const filtered = useMemo(() => {
    return publicationsData.filter((p) => {
      const matchYear = yearFilter === ALL_YEARS_OPTION || p.year === yearFilter
      const q = query.toLowerCase().trim()
      const matchQuery =
        q === '' ||
        p.title.toLowerCase().includes(q) ||
        p.authors.some((a) => a.name.toLowerCase().includes(q)) ||
        p.venue.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q))
      return matchYear && matchQuery
    })
  }, [yearFilter, query])

  // Group by year descending (sub-sort within: article first, then int'l, then national)
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((p) => {
      if (!map[p.year]) map[p.year] = []
      map[p.year].push(p)
    })
    const order = { 'article': 0, 'international-presentation': 1, 'national-presentation': 2 }
    return Object.entries(map)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, pubs]) => ({
        year: Number(year),
        pubs: pubs.sort((a, b) => (order[a.category] ?? 9) - (order[b.category] ?? 9)),
      }))
  }, [filtered])

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 relative">
          <span className="inline-flex items-center gap-1.5 bg-brand-600/40 border border-brand-400/40 text-brand-100 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <BookOpen size={13} />
            Research Output
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Publications</h1>
          <p className="text-brand-200 text-base max-w-xl leading-relaxed">
            Peer-reviewed research and conference presentations from the PHI Lab spanning health
            informatics, clinical NLP, EHR data provenance, and pharmacovigilance.
          </p>
          <p className="mt-6 text-sm text-brand-100">
            <strong className="text-white">{counts.article}</strong> articles, peer-reviewed &middot;{' '}
            <strong className="text-white">{counts.intl}</strong> international presentations &middot;{' '}
            <strong className="text-white">{counts.national}</strong> national presentations
          </p>
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
              placeholder="Search title, author, venue, location…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder-gray-400"
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
                setYearFilter(v === ALL_YEARS_OPTION ? ALL_YEARS_OPTION : Number(v))
              }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-700"
            >
              <option value={ALL_YEARS_OPTION}>All</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Count display */}
        <p className="text-sm text-gray-500 mb-8">
          Showing{' '}
          <span className="font-semibold text-gray-800">{filtered.length}</span>{' '}
          of{' '}
          <span className="font-semibold text-gray-800">{publicationsData.length}</span>{' '}
          {publicationsData.length === 1 ? 'entry' : 'entries'}
          {(yearFilter !== ALL_YEARS_OPTION || query) && (
            <button
              onClick={() => { setYearFilter(ALL_YEARS_OPTION); setQuery('') }}
              className="ml-3 text-brand-600 hover:text-brand-800 font-medium underline underline-offset-2"
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
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Search size={24} className="text-brand-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No entries found</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Try adjusting your search term or year filter.
            </p>
            <button
              onClick={() => { setYearFilter(ALL_YEARS_OPTION); setQuery('') }}
              className="mt-5 inline-flex items-center gap-2 bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-800 transition-colors text-sm"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </>
  )
}

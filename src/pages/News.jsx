import { useState } from 'react'
import {
  Trophy,
  BookOpen,
  UsersRound,
  Briefcase,
  CalendarDays,
  ExternalLink,
  Newspaper,
} from 'lucide-react'
import newsData from '../data/news.json'

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  award: {
    label: 'Award',
    icon: Trophy,
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
    activeBg: 'bg-yellow-500',
    timelineLine: 'bg-yellow-200',
  },
  publication: {
    label: 'Publication',
    icon: BookOpen,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    activeBg: 'bg-blue-600',
    timelineLine: 'bg-blue-200',
  },
  conference: {
    label: 'Conference',
    icon: UsersRound,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    activeBg: 'bg-purple-600',
    timelineLine: 'bg-purple-200',
  },
  hiring: {
    label: 'Hiring',
    icon: Briefcase,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    activeBg: 'bg-emerald-600',
    timelineLine: 'bg-emerald-200',
  },
  event: {
    label: 'Event',
    icon: CalendarDays,
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-400',
    activeBg: 'bg-orange-500',
    timelineLine: 'bg-orange-200',
  },
}

const ALL_CATEGORIES = ['all', 'award', 'publication', 'conference', 'hiring', 'event']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

function CategoryBadge({ category, size = 'sm' }) {
  const cfg = CATEGORY_CONFIG[category]
  if (!cfg) return null
  const Icon = cfg.icon
  const sizeClass = size === 'xs' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-0.5 gap-1.5'
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClass}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

// ─── Filter button ────────────────────────────────────────────────────────────

function FilterButton({ category, active, count, onClick }) {
  const isAll = category === 'all'
  const cfg = isAll ? null : CATEGORY_CONFIG[category]
  const Icon = cfg?.icon

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all whitespace-nowrap ${
        active
          ? isAll
            ? 'bg-blue-700 text-white border-transparent shadow-sm'
            : `${cfg.activeBg} text-white border-transparent shadow-sm`
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
      }`}
    >
      {Icon && <Icon size={13} />}
      {isAll ? 'All' : cfg.label}
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

// ─── Timeline item ────────────────────────────────────────────────────────────

function TimelineItem({ item, isLast }) {
  const cfg = CATEGORY_CONFIG[item.category]

  return (
    <div className="relative flex gap-0 md:gap-8">
      {/* ── Left column: date (desktop) ── */}
      <div className="hidden md:flex flex-col items-end w-40 flex-shrink-0 pt-1">
        <time
          dateTime={item.date}
          className="text-sm font-semibold text-gray-500 text-right leading-tight"
        >
          {formatDate(item.date)}
        </time>
      </div>

      {/* ── Center: timeline line + dot ── */}
      <div className="flex flex-col items-center flex-shrink-0 relative">
        {/* Dot */}
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 border-white ring-2 mt-1 flex-shrink-0 z-10 ${
            cfg ? cfg.dot : 'bg-gray-400'
          }`}
          style={{ boxShadow: '0 0 0 2px #e5e7eb' }}
        />
        {/* Vertical line */}
        {!isLast && (
          <div className="w-0.5 bg-gray-200 flex-1 mt-1 min-h-8" />
        )}
      </div>

      {/* ── Right column: card ── */}
      <div className="flex-1 pb-10">
        {/* Mobile date */}
        <time
          dateTime={item.date}
          className="md:hidden flex items-center gap-1 text-xs text-gray-400 font-medium mb-2 -mt-0.5"
        >
          <CalendarDays size={12} />
          {formatDate(item.date)}
        </time>

        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <CategoryBadge category={item.category} />
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-2">{item.title}</h3>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>

          {/* Optional link */}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Learn more
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function News() {
  const [activeCategory, setActiveCategory] = useState('all')

  // Sort by date descending
  const sorted = [...newsData].sort((a, b) => b.date.localeCompare(a.date))

  // Category counts (based on full list)
  const counts = ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'all'
      ? sorted.length
      : sorted.filter((n) => n.category === cat).length
    return acc
  }, {})

  const filtered =
    activeCategory === 'all'
      ? sorted
      : sorted.filter((n) => n.category === activeCategory)

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
        <div aria-hidden="true" className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-600 opacity-20 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 relative">
          <span className="inline-flex items-center gap-1.5 bg-blue-600/40 border border-blue-400/40 text-blue-100 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <Newspaper size={13} />
            Lab Updates
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            News &amp; Announcements
          </h1>
          <p className="text-blue-200 text-base max-w-xl leading-relaxed">
            Stay up to date with the latest awards, publications, conference appearances, hiring
            opportunities, and events from the PHI Lab.
          </p>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            {ALL_CATEGORIES.map((cat) => (
              <FilterButton
                key={cat}
                category={cat}
                active={activeCategory === cat}
                count={counts[cat]}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Result count */}
        <p className="text-sm text-gray-500 mb-10">
          Showing{' '}
          <span className="font-semibold text-gray-800">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'item' : 'items'}
          {activeCategory !== 'all' && (
            <>
              {' '}in category{' '}
              <span className="font-semibold text-gray-800">
                {CATEGORY_CONFIG[activeCategory]?.label}
              </span>
              <button
                onClick={() => setActiveCategory('all')}
                className="ml-3 text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 text-xs"
              >
                Clear filter
              </button>
            </>
          )}
        </p>

        {filtered.length > 0 ? (
          <div className="relative">
            {filtered.map((item, idx) => (
              <TimelineItem
                key={item.id}
                item={item}
                isLast={idx === filtered.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <Newspaper size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No items found</h3>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              There are no news items in this category yet.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-5 inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm"
            >
              Show all
            </button>
          </div>
        )}
      </div>
    </>
  )
}

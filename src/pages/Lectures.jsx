import { useState, useEffect, createContext, useContext } from 'react'
import { BookOpen, GraduationCap, Tag, Code2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import lecturesData from '../data/lectures.json'

// Context lets nested CourseImages open the page-level lightbox without
// prop-drilling through SemesterSection → CourseCard.
const LightboxContext = createContext(() => {})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Order semesters newest-first. */
function semesterOrder(s) {
  const [term, year] = s.split(' ')
  const termRank = { Spring: 0, Summer: 1, Fall: 2 }
  return parseInt(year) * 10 + (termRank[term] ?? 5)
}

// LIVE Korean semester heading shown beside the English form.
// Map: Spring→1학기, Summer→여름학기, Fall→2학기.
const SEMESTER_KO = {
  'Spring 2026': '2026학년도 1학기',
  'Fall 2025': '2025학년도 2학기',
  'Spring 2025': '2025학년도 1학기',
}

function groupBySemester(courses) {
  const map = {}
  for (const course of courses) {
    if (!map[course.semester]) map[course.semester] = []
    map[course.semester].push(course)
  }
  return Object.entries(map).sort(([a], [b]) => semesterOrder(b) - semesterOrder(a))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const levelMeta = {
  graduate: {
    label: 'Graduate',
    className: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
  undergraduate: {
    label: 'Undergraduate',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
}

function LevelBadge({ level }) {
  const meta = levelMeta[level] ?? { label: level, className: 'bg-gray-100 text-gray-600' }
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.className}`}
    >
      <GraduationCap size={11} />
      {meta.label}
    </span>
  )
}

function LanguageBadge({ language }) {
  if (!language) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
      <Code2 size={11} />
      {language}
    </span>
  )
}

// Render images: 1 = full width, 2-3 = grid of equal columns.
// Each image is a button; clicking opens the page-level lightbox at that
// index, and the lightbox lets the user step through siblings.
function CourseImages({ images }) {
  const openLightbox = useContext(LightboxContext)
  if (!images || images.length === 0) return null
  const count = images.length
  const gridCls =
    count === 1
      ? 'grid grid-cols-1'
      : count === 2
        ? 'grid grid-cols-2 gap-2'
        : 'grid grid-cols-3 gap-2'
  return (
    <div className={`${gridCls} mb-4 rounded-lg overflow-hidden`}>
      {images.map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => openLightbox(images, i)}
          aria-label="Enlarge image"
          className="block w-full p-0 m-0 border-0 bg-transparent cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <img
            src={src}
            alt=""
            role="presentation"
            loading="lazy"
            decoding="async"
            className={
              count === 1
                ? 'w-full h-auto object-cover hover:opacity-95 transition-opacity'
                : 'w-full aspect-square object-cover hover:opacity-95 transition-opacity'
            }
          />
        </button>
      ))}
    </div>
  )
}

// Full-screen lightbox overlay with prev/next navigation.
// state: { images: string[], index: number } | null
// Backdrop click / X / Escape close. Left/right arrow keys + on-screen
// chevron buttons step through `images` (wraps around at edges).
function Lightbox({ state, setState, onClose }) {
  useEffect(() => {
    if (!state) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') setState((s) => s && { ...s, index: (s.index - 1 + s.images.length) % s.images.length })
      else if (e.key === 'ArrowRight') setState((s) => s && { ...s, index: (s.index + 1) % s.images.length })
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [state, setState, onClose])

  if (!state) return null
  const { images, index } = state
  const total = images.length
  const hasMultiple = total > 1
  const goPrev = () => setState((s) => s && { ...s, index: (s.index - 1 + s.images.length) % s.images.length })
  const goNext = () => setState((s) => s && { ...s, index: (s.index + 1) % s.images.length })

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8 cursor-zoom-out"
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
      >
        <X size={22} />
      </button>

      {/* Prev */}
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          aria-label="Previous image"
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Next */}
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goNext() }}
          aria-label="Next image"
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Index counter */}
      {hasMultiple && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium select-none">
          {index + 1} / {total}
        </p>
      )}

      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain shadow-2xl cursor-default"
      />
    </div>
  )
}

function CourseCard({ course }) {
  const { code, titleEn, titleKo, level, language, description, objectives, images, tags } = course
  const paragraphs = description ? description.split('\n\n').filter(Boolean) : []

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-brand-200 transition-all group flex flex-col">
      {/* Images */}
      <CourseImages images={images} />

      {/* Header row */}
      <div className="flex flex-wrap items-start gap-2 mb-3">
        {code && (
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded font-mono">
            {code}
          </span>
        )}
        <LevelBadge level={level} />
        <LanguageBadge language={language} />
      </div>

      {/* Title (KO + EN) */}
      <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1">{titleKo}</h3>
      <p className="text-gray-500 text-sm leading-snug mb-4">{titleEn}</p>

      {/* Description paragraphs */}
      {paragraphs.length > 0 && (
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed mb-4">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {/* Objectives bullets */}
      {objectives && objectives.length > 0 && (
        <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed space-y-1 mb-4 marker:text-brand-600">
          {objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full"
          >
            <Tag size={9} />
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function SemesterSection({ semester, courses }) {
  const ko = SEMESTER_KO[semester]
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-800">{semester}</h2>
        {ko && <span className="text-sm text-gray-500">{ko}</span>}
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">
          {courses.length} {courses.length === 1 ? 'course' : 'courses'}
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Lectures() {
  const grouped = groupBySemester(lecturesData)
  // lightbox state: { images: string[], index: number } | null
  const [lightbox, setLightbox] = useState(null)
  const openLightbox = (images, index) => setLightbox({ images, index })

  const gradCount = lecturesData.filter((c) => c.level === 'graduate').length
  const undergradCount = lecturesData.filter((c) => c.level === 'undergraduate').length

  return (
    <LightboxContext.Provider value={openLightbox}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Page header */}
      <div className="mb-12">
        <span className="inline-block bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          Teaching
        </span>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Lectures &amp; Courses
        </h1>
        <div className="w-16 h-1 bg-brand-600 rounded mb-5" />
        <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
          Courses taught by PHI Lab faculty and researchers, spanning graduate seminars and
          undergraduate modules in health informatics, biomedical data science, and clinical AI.
        </p>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3 mt-6">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm shadow-sm">
            <BookOpen size={14} className="text-brand-600" />
            <span className="font-semibold text-gray-800">{lecturesData.length}</span>
            <span className="text-gray-500">Total Courses</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm shadow-sm">
            <GraduationCap size={14} className="text-purple-600" />
            <span className="font-semibold text-gray-800">{gradCount}</span>
            <span className="text-gray-500">Graduate</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm shadow-sm">
            <GraduationCap size={14} className="text-green-600" />
            <span className="font-semibold text-gray-800">{undergradCount}</span>
            <span className="text-gray-500">Undergraduate</span>
          </div>
        </div>
      </div>

      {/* Semester-grouped sections */}
      <div className="flex flex-col gap-14">
        {grouped.map(([semester, courses]) => (
          <SemesterSection key={semester} semester={semester} courses={courses} />
        ))}
      </div>
      </div>
      <Lightbox state={lightbox} setState={setLightbox} onClose={() => setLightbox(null)} />
    </LightboxContext.Provider>
  )
}

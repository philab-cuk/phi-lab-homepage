import { Fragment } from 'react'
import { Mail, ExternalLink } from 'lucide-react'
import membersData from '../data/members.json'

const PI = membersData.current.find((m) => m.role === 'Principal Investigator')

const CATEGORY_LABELS = {
  academic: 'Academic Experience',
  technical: 'Technical Leadership & Hands-On Experience',
  clinical: 'Clinical Experience',
}
const CATEGORY_ORDER = ['academic', 'technical', 'clinical']

// Organisation highlights — LIVE site marks affiliations with coloured
// backgrounds for quick scanning. Order: longest phrase first so a longer
// match wins over any shorter substring.
const ORG_HIGHLIGHTS = [
  { phrase: 'Yonsei University Health System', className: 'bg-sky-300 text-gray-900 font-semibold px-1 rounded-sm' },
  { phrase: 'Samsung Medical Center', className: 'bg-gray-200 text-gray-900 font-semibold px-1 rounded-sm' },
  { phrase: 'Sungkyunkwan University', className: 'bg-gray-200 text-gray-900 font-semibold px-1 rounded-sm' },
  { phrase: 'Kakaohealthcare', className: 'bg-amber-200 text-gray-900 font-semibold px-1 rounded-sm' },
]

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
const HIGHLIGHT_RE = new RegExp(
  `(${ORG_HIGHLIGHTS.map((h) => escapeRegex(h.phrase)).join('|')})`,
  'g'
)

function highlightOrg(text) {
  if (!text) return text
  return text.split(HIGHLIGHT_RE).map((part, i) => {
    const match = ORG_HIGHLIGHTS.find((h) => h.phrase === part)
    if (match) {
      return (
        <mark key={i} className={match.className}>
          {part}
        </mark>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

function ExperienceCard({ item }) {
  return (
    <li className="border-l-2 border-brand-200 pl-4 py-3">
      <p className="leading-snug">
        <span className="font-bold text-gray-900 text-lg md:text-xl">{item.role}</span>
        <span className="text-gray-500 text-base font-medium ml-2">({item.period})</span>
      </p>
      <p className="text-gray-700 text-base leading-snug mt-1">{highlightOrg(item.organization)}</p>
      {item.location && <p className="text-gray-500 text-sm mt-0.5">{item.location}</p>}
      {item.focus && (
        <p className="text-gray-800 text-base mt-2">
          <span className="font-semibold">Focus:</span> {item.focus}
        </p>
      )}
      {item.details && item.details.length > 0 && (
        <div className="mt-2">
          <p className="text-gray-800 text-base font-semibold">Details:</p>
          <ul className="list-disc list-inside text-gray-700 text-base leading-relaxed mt-1 space-y-1">
            {item.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      {item.externalLinks && item.externalLinks.length > 0 && (
        <ul className="mt-3 space-y-1">
          {item.externalLinks.map((link, i) => (
            <li key={i}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-900 hover:underline"
              >
                <ExternalLink size={14} />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

function ExperienceGroup({ category, items }) {
  return (
    <div className="mb-10 last:mb-0">
      <h3 className="text-base md:text-lg font-semibold uppercase tracking-wide text-brand-700 mb-4 border-b border-brand-100 pb-2">
        {CATEGORY_LABELS[category] ?? 'Experience'}
      </h3>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <ExperienceCard key={i} item={item} />
        ))}
      </ul>
    </div>
  )
}

export default function Professor() {
  // Group experience by category, preserving CATEGORY_ORDER
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: PI.experience.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0)

  // Fallback: any item without a known category goes into a generic group
  const ungrouped = PI.experience.filter((e) => !CATEGORY_ORDER.includes(e.category))

  // Split bioFull into paragraphs
  const bioParagraphs = PI.bioFull.split('\n\n')

  return (
    <>
      {/* ── Page-title band ── */}
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
        <div aria-hidden="true" className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-600 opacity-20 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Professor</h1>
        </div>
      </section>

      {/* ── Profile Card (photo + bio + interests) ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Profile card — photo floated on md+ so bio text wraps around it */}
          <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-6 sm:p-10 overflow-hidden">
            {/* Photo + contact (floated left on md+) */}
            <aside className="md:float-left md:mr-8 md:mb-4 mb-6 flex flex-col items-center gap-4 md:max-w-[220px] md:w-auto w-full">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden ring-4 ring-brand-100 shadow-md">
                <img src={PI.photo} alt={`Prof. ${PI.name}`} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${PI.email}`}
                  aria-label="Email"
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-brand-50 hover:text-brand-600 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <Mail size={16} />
                </a>
                {PI.personalSite && (
                  <a
                    href={PI.personalSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Personal site"
                    className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-brand-50 hover:text-brand-600 flex items-center justify-center text-gray-500 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>

              <div className="text-center text-sm text-gray-600 space-y-1">
                <p>
                  <a href={`mailto:${PI.email}`} className="hover:text-brand-700 break-all">
                    {PI.email}
                  </a>
                </p>
                {PI.personalSite && (
                  <p>
                    <a
                      href={PI.personalSite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 hover:underline break-all"
                    >
                      sites.google.com/view/hyojungkim
                    </a>
                  </p>
                )}
              </div>
            </aside>

            {/* Header + Bio — flows naturally; wraps under the floated photo on md+ */}
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
              {PI.name}
            </h2>
            <p className="text-gray-700 text-lg">
              {PI.title}, {PI.department}
            </p>
            <p className="text-gray-500 text-base mt-1 mb-6">{PI.institution}</p>

            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Bio and Accomplishments
            </h2>

            <div className="space-y-5 text-gray-800 text-lg leading-relaxed">
              {bioParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Work Experience (only standalone heading on LIVE besides BIO) ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-gray-900 mb-6 pb-2 border-b border-gray-200">
            Work Experience
          </h2>
          {grouped.map((g) => (
            <ExperienceGroup key={g.category} category={g.category} items={g.items} />
          ))}
          {ungrouped.length > 0 && (
            <ExperienceGroup category="other" items={ungrouped} />
          )}
        </div>
      </section>
    </>
  )
}

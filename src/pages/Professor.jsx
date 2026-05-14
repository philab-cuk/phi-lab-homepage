import {
  Mail,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Award,
} from 'lucide-react'
import membersData from '../data/members.json'

const PI = membersData.current.find((m) => m.role === 'Principal Investigator')

const CATEGORY_LABELS = {
  academic: 'Academic Experience',
  technical: 'Technical Leadership & Hands-On Experience',
  clinical: 'Clinical Experience',
}
const CATEGORY_ORDER = ['academic', 'technical', 'clinical']

function ResearchTag({ label }) {
  return (
    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
      {label}
    </span>
  )
}

function ExperienceCard({ item }) {
  return (
    <li className="border-l-2 border-blue-200 pl-4 py-2">
      <p className="text-gray-400 text-xs font-medium">{item.period}</p>
      <p className="font-semibold text-gray-800 text-sm leading-snug">{item.role}</p>
      <p className="text-gray-500 text-sm leading-snug">{item.organization}</p>
      {item.location && <p className="text-gray-400 text-xs mt-0.5">{item.location}</p>}
      {item.focus && (
        <p className="text-gray-700 text-sm mt-2">
          <span className="font-semibold">Focus:</span> {item.focus}
        </p>
      )}
      {item.details && item.details.length > 0 && (
        <div className="mt-2">
          <p className="text-gray-700 text-sm font-semibold">Details:</p>
          <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed mt-1 space-y-0.5">
            {item.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      {item.externalLinks && item.externalLinks.length > 0 && (
        <ul className="mt-2 space-y-1">
          {item.externalLinks.map((link, i) => (
            <li key={i}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 hover:underline"
              >
                <ExternalLink size={12} />
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
    <div className="mb-8 last:mb-0">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3 border-b border-blue-100 pb-1">
        {CATEGORY_LABELS[category] ?? 'Experience'}
      </h3>
      <ul className="space-y-3">
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
            <GraduationCap size={13} />
            Principal Investigator
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            {PI.name}
            {PI.nameKo && (
              <span className="text-blue-200 text-3xl md:text-4xl font-medium ml-3">({PI.nameKo})</span>
            )}
          </h1>
          <p className="text-blue-200 text-base">
            {PI.title} — {PI.department}
          </p>
          <p className="text-blue-200 text-sm mt-1">{PI.institution}</p>
        </div>
      </section>

      {/* ── Profile Card (photo + bio + interests) ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-10 flex flex-col lg:flex-row gap-10 items-start">
            {/* Photo */}
            <div className="flex-shrink-0 flex flex-col items-center gap-4">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden ring-4 ring-blue-100 shadow-md">
                <img src={PI.photo} alt={`Prof. ${PI.name}`} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${PI.email}`}
                  aria-label="Email"
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <Mail size={16} />
                </a>
                {PI.personalSite && (
                  <a
                    href={PI.personalSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Personal site"
                    className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                <a href={`mailto:${PI.email}`} className="hover:text-blue-700">
                  {PI.email}
                </a>
              </p>
            </div>

            {/* Bio + interests */}
            <div className="flex-1 min-w-0">
              <p className="text-blue-700 font-semibold text-sm mb-2">{PI.degree}</p>

              <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                {bioParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Research Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {PI.researchInterests.map((area) => (
                    <ResearchTag key={area} label={area} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Education & Experience ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Education */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap size={20} className="text-blue-700" />
                <h2 className="text-xl font-bold text-gray-900">Education</h2>
              </div>
              <ul className="space-y-3">
                {PI.education.map((ed, i) => (
                  <li key={i} className="border-l-2 border-blue-200 pl-4 py-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {ed.degree} in {ed.field}
                    </p>
                    <p className="text-gray-500 text-sm">{ed.institution}</p>
                    {ed.period && <p className="text-gray-400 text-xs mt-0.5">{ed.period}</p>}
                  </li>
                ))}
              </ul>
            </div>

            {/* Experience grouped by category */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Briefcase size={20} className="text-blue-700" />
                <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
              </div>
              {grouped.map((g) => (
                <ExperienceGroup key={g.category} category={g.category} items={g.items} />
              ))}
              {ungrouped.length > 0 && (
                <ExperienceGroup category="other" items={ungrouped} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Service ── */}
      {PI.service && PI.service.length > 0 && (
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-center gap-2 mb-5">
              <Award size={20} className="text-blue-700" />
              <h2 className="text-xl font-bold text-gray-900">Service</h2>
            </div>
            <ul className="space-y-2 text-gray-700 text-sm leading-relaxed">
              {PI.service.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gray-300">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}

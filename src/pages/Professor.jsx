import {
  Mail,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Award,
} from 'lucide-react'
import membersData from '../data/members.json'

const PI = membersData.current.find((m) => m.role === 'Principal Investigator')

function ResearchTag({ label }) {
  return (
    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
      {label}
    </span>
  )
}

export default function Professor() {
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

              <div className="space-y-3 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {PI.bioFull}
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

            {/* Experience */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Briefcase size={20} className="text-blue-700" />
                <h2 className="text-xl font-bold text-gray-900">Professional Experience</h2>
              </div>
              <ul className="space-y-3">
                {PI.experience.map((ex, i) => (
                  <li key={i} className="border-l-2 border-blue-200 pl-4 py-1">
                    <p className="text-gray-400 text-xs font-medium">{ex.period}</p>
                    <p className="font-semibold text-gray-800 text-sm leading-snug">{ex.role}</p>
                    <p className="text-gray-500 text-sm leading-snug">{ex.organization}</p>
                    {ex.location && <p className="text-gray-400 text-xs mt-0.5">{ex.location}</p>}
                  </li>
                ))}
              </ul>
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

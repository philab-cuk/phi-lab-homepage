import {
  Mail,
  ExternalLink,
  MapPin,
  Target,
  Eye,
  Users,
  Lightbulb,
  GraduationCap,
  Briefcase,
  Award,
} from 'lucide-react'
import membersData from '../data/members.json'

const PI = membersData.current.find((m) => m.role === 'Principal Investigator')

// ─── Static lab content (sourced from docs/phi-lab-content/06_about.md) ─────

const LAB_DESCRIPTION_EN =
  "PHI (Precision & Provenance Health Informatics Lab) at the Catholic University of Korea is dedicated to advancing precision medicine and digital healthcare through data-driven interdisciplinary research. The lab's work spans from public data to EHR (Electronic Health Records) data, emphasizing the utilization of trustworthy data, knowledge generation via data science, and supporting decision-making through data-based digital healthcare systems. The lab collaborates with various medical institutions and schools both domestically and internationally to engage in vibrant research activities — including engineering real-world data (RWD), constructing data pipelines, generating real-world evidence (RWE), and designing information structures."

const LAB_VALUES = [
  {
    icon: Lightbulb,
    title: 'Trustworthy Data',
    description:
      'We prioritize data quality, provenance, and reproducibility — the foundation of meaningful clinical evidence.',
  },
  {
    icon: Users,
    title: 'Interdisciplinary Collaboration',
    description:
      'Our research bridges nursing, medicine, computer science, and policy — across institutions in Korea and abroad.',
  },
  {
    icon: Target,
    title: 'Real-World Impact',
    description:
      'Every project is grounded in a concrete clinical question — measured by adoption in healthcare settings, not benchmarks.',
  },
  {
    icon: Eye,
    title: 'Knowledge to Action',
    description:
      'We design information structures that bridge raw data and actionable knowledge for clinicians and policymakers.',
  },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function ResearchTag({ label }) {
  return (
    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
      {label}
    </span>
  )
}

function ValueCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex gap-4 hover:shadow-sm hover:border-blue-200 transition-all">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-base mb-1">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <div className="mb-10">
      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
        {label}
      </span>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      {subtitle && <p className="text-gray-500 text-base leading-relaxed max-w-2xl">{subtitle}</p>}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function About() {
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
            About PHI Lab
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Precision &amp; Provenance<br className="hidden sm:block" /> Health Informatics Lab
          </h1>
          <p className="text-blue-200 text-base max-w-2xl leading-relaxed">
            PHI (φ) Lab at The Catholic University of Korea — advancing precision medicine and
            digital healthcare through data-driven interdisciplinary research.
          </p>
        </div>
      </section>

      {/* ── Mission / Description ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <SectionHeader label="Who We Are" title="Mission" />
          <p className="text-gray-700 text-base leading-relaxed">{LAB_DESCRIPTION_EN}</p>
        </div>
      </section>

      {/* ── Professor profile ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeader label="Principal Investigator" title="Meet the Lab Director" />

          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-10 flex flex-col lg:flex-row gap-10 items-start">
            {/* Photo */}
            <div className="flex-shrink-0 flex flex-col items-center gap-4">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden ring-4 ring-blue-100 shadow-md">
                <img
                  src={PI.photo}
                  alt={`Prof. ${PI.name}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Quick links */}
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
            </div>

            {/* Bio */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-blue-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  <GraduationCap size={12} />
                  Principal Investigator
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-1">
                {PI.name}
                {PI.nameKo && <span className="text-gray-400 text-2xl font-medium ml-2">({PI.nameKo})</span>}
              </h2>
              <p className="text-blue-600 font-semibold text-sm mt-1">
                {PI.title} — {PI.department}
              </p>
              <p className="text-gray-500 text-sm font-medium mt-0.5">{PI.institution}</p>

              <div className="mt-5 space-y-3 text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {PI.bioFull}
              </div>

              {/* Research areas */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Research Areas
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
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Education */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap size={20} className="text-blue-700" />
                <h3 className="text-xl font-bold text-gray-900">Education</h3>
              </div>
              <ul className="space-y-3">
                {PI.education.map((ed, i) => (
                  <li key={i} className="border-l-2 border-blue-100 pl-4 py-1">
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
                <h3 className="text-xl font-bold text-gray-900">Professional Experience</h3>
              </div>
              <ul className="space-y-3">
                {PI.experience.map((ex, i) => (
                  <li key={i} className="border-l-2 border-blue-100 pl-4 py-1">
                    <p className="text-gray-400 text-xs font-medium">{ex.period}</p>
                    <p className="font-semibold text-gray-800 text-sm leading-snug">{ex.role}</p>
                    <p className="text-gray-500 text-sm leading-snug">{ex.organization}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Service */}
          {PI.service && PI.service.length > 0 && (
            <div className="mt-10 pt-10 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Award size={20} className="text-blue-700" />
                <h3 className="text-xl font-bold text-gray-900">Service</h3>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm leading-relaxed">
                {PI.service.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-gray-300">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ── Lab Values ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeader
            label="What We Stand For"
            title="Lab Values"
            subtitle="The principles that shape how we choose problems, build systems, and collaborate."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LAB_VALUES.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact & Location ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeader
            label="Get in Touch"
            title="Contact &amp; Location"
            subtitle="We welcome inquiries from prospective students, collaborators, and industry partners."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact details */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" />
                  Contact Information
                </h3>
                <address className="not-italic text-sm text-gray-600 space-y-2">
                  <p className="font-semibold text-gray-800">Prof. {PI.name}</p>
                  <p>{PI.department}</p>
                  <p>{PI.institution}</p>
                  <p className="pt-2">
                    <a
                      href={`mailto:${PI.email}`}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      {PI.email}
                    </a>
                  </p>
                  {PI.personalSite && (
                    <p>
                      <a
                        href={PI.personalSite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Personal site ↗
                      </a>
                    </p>
                  )}
                </address>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  Prospective Students
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  We welcome motivated students and researchers passionate about health informatics,
                  clinical AI, and real-world data engineering. Please email Prof. Kim with your CV
                  and a brief research statement.
                </p>
                <a
                  href={`mailto:${PI.email}?subject=Prospective%20Student%20Inquiry`}
                  className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm shadow-sm"
                >
                  <Mail size={14} />
                  Send Application Inquiry
                </a>
              </div>
            </div>

            {/* Address card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center gap-4 p-10 min-h-64">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin size={28} className="text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-base">The Catholic University of Korea</p>
                  <p className="text-gray-500 text-sm mt-1">Bucheon Campus</p>
                </div>
              </div>
              <div className="p-5 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <address className="not-italic text-sm text-gray-600 leading-relaxed">
                    Department of Biomedical Software Engineering<br />
                    The Catholic University of Korea<br />
                    43, Jibong-ro, Bucheon<br />
                    14662, Gyeonggi-do<br />
                    South Korea
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

import {
  Mail,
  BookOpen,
  Link2,
  MapPin,
  Target,
  Eye,
  Users,
  Lightbulb,
  GraduationCap,
} from 'lucide-react'

// ─── Static data ─────────────────────────────────────────────────────────────

const RESEARCH_AREAS = [
  'Clinical Natural Language Processing',
  'Data Provenance Engineering',
  'Federated Learning for Healthcare',
  'EHR Phenotyping',
  'Precision Medicine',
  'Trustworthy & Explainable AI',
  'Large Language Models in Clinical Settings',
  'Biomedical Knowledge Graphs',
]

const LAB_VALUES = [
  {
    icon: Lightbulb,
    title: 'Rigorous Science',
    description:
      'We hold our work to the highest standards of methodological rigour, reproducibility, and transparency.',
  },
  {
    icon: Users,
    title: 'Collaborative Spirit',
    description:
      'Great health AI research requires clinicians, informaticians, and engineers working shoulder-to-shoulder.',
  },
  {
    icon: Target,
    title: 'Clinical Impact',
    description:
      'Every project is grounded in a concrete clinical need — we measure success by real-world adoption and patient benefit.',
  },
  {
    icon: Eye,
    title: 'Ethical Responsibility',
    description:
      'We proactively address fairness, privacy, and accountability in every system we build.',
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
          <p className="text-blue-200 text-base max-w-xl leading-relaxed">
            We develop trustworthy, data-driven computational methods that advance clinical
            decision-making, improve patient outcomes, and make AI in healthcare transparent and
            accountable.
          </p>
        </div>
      </section>

      {/* ── Professor profile ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeader
          label="Principal Investigator"
          title="Meet the Lab Director"
        />

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-10 flex flex-col lg:flex-row gap-10 items-start">
          {/* Photo */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden ring-4 ring-blue-100 shadow-md">
              <img
                src="https://api.dicebear.com/7.x/initials/svg?seed=Hyojung%20Kim&backgroundColor=1d4ed8&fontFamily=Arial&fontSize=40&fontWeight=700&textColor=ffffff"
                alt="Prof. Hyojung Kim"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-3">
              <a
                href="mailto:hyojung.kim@ucalgary.ca"
                aria-label="Email"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://scholar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Scholar"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors"
              >
                <BookOpen size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors"
              >
                <Link2 size={16} />
              </a>
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
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">Prof. Hyojung Kim</h2>
            <p className="text-blue-600 font-semibold text-sm mt-1">
              Associate Professor — Department of Health Informatics
            </p>
            <p className="text-gray-500 text-sm font-medium mt-0.5">
              University of Calgary, Calgary, Alberta, Canada
            </p>

            <div className="mt-5 space-y-3 text-gray-600 text-sm leading-relaxed">
              <p>
                Prof. Hyojung Kim leads the Precision &amp; Provenance Health Informatics (PHI) Lab
                at the University of Calgary. Her research sits at the intersection of clinical
                informatics, machine learning, and software engineering, with a particular focus on
                building AI systems that are not only accurate but also traceable, reproducible, and
                safe for deployment in real clinical environments.
              </p>
              <p>
                She received her Ph.D. in Biomedical Informatics from Stanford University and held a
                postdoctoral fellowship at MIT CSAIL before joining the University of Calgary faculty
                in 2018. Her work has been funded by CIHR, NSERC, Alberta Innovates, and the
                Canadian Cancer Society, and has appeared in JAMIA, npj Digital Medicine, and the
                AMIA Annual Symposium, among other leading venues.
              </p>
              <p>
                Prof. Kim serves on the editorial board of the Journal of Biomedical Informatics and
                regularly reviews for Nature Medicine, Cell Systems, and major AI/ML conferences. She
                is passionate about mentoring the next generation of health informatics researchers
                and actively recruits motivated PhD students and postdoctoral fellows.
              </p>
            </div>

            {/* Research areas */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Research Areas
              </p>
              <div className="flex flex-wrap gap-2">
                {RESEARCH_AREAS.map((area) => (
                  <ResearchTag key={area} label={area} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeader
            label="Who We Are"
            title="Mission &amp; Vision"
            subtitle="PHI Lab is driven by a shared belief that health AI can only fulfil its promise when it is trustworthy, transparent, and grounded in genuine clinical need."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl border border-blue-100 p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center mb-5">
                <Target size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                To advance the science and practice of health informatics by creating AI methods
                that are clinically meaningful, computationally rigorous, and ethically
                responsible. We partner with clinicians, health systems, and policymakers to
                translate research into tools that improve patient care at scale.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl border border-blue-100 p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-5">
                <Eye size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                A future in which every clinical AI system leaves a transparent, auditable trail —
                from raw data collection to patient-facing recommendation — ensuring that
                physicians, patients, and regulators can always understand, verify, and trust
                the decisions being made on their behalf.
              </p>
            </div>
          </div>

          {/* Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LAB_VALUES.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact & Location ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                <p className="font-semibold text-gray-800">Prof. Hyojung Kim</p>
                <p>Department of Health Informatics</p>
                <p>Cumming School of Medicine</p>
                <p>University of Calgary</p>
                <p className="pt-2">
                  <a
                    href="mailto:hyojung.kim@ucalgary.ca"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    hyojung.kim@ucalgary.ca
                  </a>
                </p>
                <p>
                  <a
                    href="tel:+14031234567"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    +1 (403) 123-4567
                  </a>
                </p>
              </address>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 text-base mb-4 flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                Prospective Students
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                We are always looking for motivated PhD students and postdoctoral researchers with
                strong backgrounds in machine learning, biomedical informatics, or software
                engineering. Please email Prof. Kim with your CV, a brief research statement, and
                your transcript.
              </p>
              <a
                href="mailto:hyojung.kim@ucalgary.ca?subject=Prospective%20Student%20Inquiry"
                className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm shadow-sm"
              >
                <Mail size={14} />
                Send Application Inquiry
              </a>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            {/* Styled map placeholder */}
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center gap-4 p-10 min-h-64">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin size={28} className="text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-base">University of Calgary</p>
                <p className="text-gray-500 text-sm mt-1">Health Sciences Centre</p>
              </div>
            </div>
            {/* Address block */}
            <div className="p-5 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <address className="not-italic text-sm text-gray-600 leading-relaxed">
                  PHI Lab — Room HSC 3330<br />
                  Health Sciences Centre<br />
                  3330 Hospital Drive NW<br />
                  Calgary, Alberta T2N 4N1<br />
                  Canada
                </address>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

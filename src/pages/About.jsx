import { Mail, MapPin, Target, Eye, Users, Lightbulb } from 'lucide-react'

const PI_EMAIL = 'hyojung.kim@catholic.ac.kr'

// ─── Lab content (sourced from docs/phi-lab-content/06_about.md) ────────────

const LAB_DESCRIPTION_EN =
  "PHI (Precision & Provenance Health Informatics Lab) at the Catholic University of Korea is dedicated to advancing precision medicine and digital healthcare through data-driven interdisciplinary research. The lab's work spans from public data to EHR (Electronic Health Records) data, emphasizing the utilization of trustworthy data, knowledge generation via data science, and supporting decision-making through data-based digital healthcare systems. The lab collaborates with various medical institutions and schools both domestically and internationally to engage in vibrant research activities — including engineering real-world data (RWD), constructing data pipelines, generating real-world evidence (RWE), and designing information structures."

const LAB_DESCRIPTION_KO =
  '가톨릭대학교 PHI(φ, Precision & Provenance Health Informatics Lab) 연구실에서는 정밀의료와 디지털 헬스케어 구현을 위한 데이터 기반 다학제연구를 수행합니다. 공공데이터부터 EHR 데이터까지 포괄적으로 연구하며, 신뢰할 수 있는 데이터의 활용, 데이터 과학을 통한 지식 창출, 의사결정을 지원하는 데이터 기반 디지털 헬스케어 시스템 전반을 연구합니다. 국내외 의료기관 및 학교들과 교류하며 실세계데이터(RWD) 엔지니어링, 데이터 파이프라인 구축, 실사용 근거(RWE) 창출, 정보구조 설계 연구를 활발히 수행하고 있습니다.'

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
      {subtitle && (
        <p className="text-gray-500 text-base leading-relaxed max-w-2xl">{subtitle}</p>
      )}
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
            About Lab
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

      {/* ── Lab Description (EN + KO) ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <SectionHeader label="Who We Are" title="About the Lab" />
          <p className="text-gray-700 text-base leading-relaxed mb-8">{LAB_DESCRIPTION_EN}</p>
          <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-6">
            {LAB_DESCRIPTION_KO}
          </p>
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
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 text-base mb-4 flex items-center gap-2">
                <Mail size={16} className="text-blue-600" />
                Contact Information
              </h3>
              <address className="not-italic text-sm text-gray-600 space-y-2">
                <p className="font-semibold text-gray-800">Prof. Hyo Jung Kim</p>
                <p>Department of Biomedical Software Engineering</p>
                <p>The Catholic University of Korea</p>
                <p className="pt-2">
                  <a
                    href={`mailto:${PI_EMAIL}`}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {PI_EMAIL}
                  </a>
                </p>
              </address>
              <a
                href={`mailto:${PI_EMAIL}?subject=Lab%20Inquiry`}
                className="mt-5 inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm shadow-sm"
              >
                <Mail size={14} />
                Send Inquiry
              </a>
            </div>

            {/* Address card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center gap-4 p-10 min-h-64">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin size={28} className="text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-base">
                    The Catholic University of Korea
                  </p>
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

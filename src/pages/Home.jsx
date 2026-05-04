import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Users,
  Microscope,
  Calendar,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// ─── Data ────────────────────────────────────────────────────────────────────

const researchHighlights = [
  {
    icon: <Microscope size={24} className="text-blue-600" />,
    title: 'Clinical NLP & Information Extraction',
    description:
      'Developing transformer-based models to extract structured clinical knowledge from unstructured EHR narratives, supporting automated phenotyping and cohort identification.',
    tags: ['NLP', 'EHR', 'Phenotyping'],
  },
  {
    icon: <BookOpen size={24} className="text-blue-600" />,
    title: 'Data Provenance in Health AI',
    description:
      'Building provenance-aware pipelines that track the lineage of clinical data from collection through ML inference, enabling reproducible and auditable AI-assisted diagnoses.',
    tags: ['Provenance', 'Reproducibility', 'Explainability'],
  },
  {
    icon: <Users size={24} className="text-blue-600" />,
    title: 'Precision Medicine & Patient Stratification',
    description:
      'Integrating multi-modal biomedical data — genomics, imaging, and clinical notes — to identify patient subgroups for targeted therapeutic strategies.',
    tags: ['Genomics', 'Multi-modal', 'Stratification'],
  },
]

const recentPublications = [
  {
    title:
      'Provenance-Aware Clinical Decision Support: A Framework for Traceable AI Recommendations',
    authors: 'Kim H., Park S., Lee J., et al.',
    venue: 'Journal of the American Medical Informatics Association (JAMIA)',
    year: '2025',
    doi: '#',
  },
  {
    title:
      'Federated Learning for Privacy-Preserving EHR Phenotyping Across Institutional Boundaries',
    authors: 'Kim H., Choi Y., Ryu D., et al.',
    venue: 'npj Digital Medicine',
    year: '2024',
    doi: '#',
  },
  {
    title:
      'Benchmarking Large Language Models on Clinical Named Entity Recognition in Korean and English EHRs',
    authors: 'Lee J., Kim H., Han K., et al.',
    venue: 'AMIA Annual Symposium Proceedings',
    year: '2024',
    doi: '#',
  },
]

const newsItems = [
  {
    date: 'April 28, 2025',
    category: 'Award',
    title: 'PHI Lab receives NIH R01 Grant for Clinical Provenance Research',
    body: 'We are thrilled to announce that our lab has been awarded an NIH R01 grant to develop provenance-aware frameworks for clinical AI systems over the next four years.',
  },
  {
    date: 'March 15, 2025',
    category: 'New Member',
    title: 'Welcome to three new PhD students joining PHI Lab in Spring 2025',
    body: 'PHI Lab welcomes three exceptional doctoral students who will be contributing to our clinical NLP, federated learning, and health data governance projects.',
  },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ label, title, subtitle }) {
  return (
    <div className="text-center mb-12">
      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
        {label}
      </span>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
      {subtitle && <p className="text-gray-500 max-w-2xl mx-auto text-base">{subtitle}</p>}
    </div>
  )
}

function ResearchCard({ icon, title, description, tags }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group">
      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function PublicationItem({ title, authors, venue, year, doi }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-blue-200 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{title}</h3>
          <p className="text-gray-500 text-xs mb-1">{authors}</p>
          <p className="text-blue-600 text-xs font-medium">
            {venue} &middot; {year}
          </p>
        </div>
        <a
          href={doi}
          className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors mt-0.5"
          aria-label="View publication"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  )
}

const categoryColors = {
  Award: 'bg-yellow-50 text-yellow-700',
  'New Member': 'bg-green-50 text-green-700',
  Publication: 'bg-blue-50 text-blue-700',
  Event: 'bg-purple-50 text-purple-700',
}

function NewsCard({ date, category, title, body }) {
  const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-600'
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm hover:border-blue-200 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colorClass}`}>
          {category}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar size={12} />
          {date}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 text-base mb-2 leading-snug">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useLanguage()
  const h = t.hero

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        {/* Decorative grid overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-600 opacity-30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <div className="max-w-3xl">
            <span className="inline-block bg-blue-600/40 border border-blue-400/40 text-blue-100 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              {h.badge}
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
              {h.title}
            </h1>
            <p className="text-blue-100 text-xl md:text-2xl font-medium mb-3 leading-snug">
              {h.subtitle}
            </p>
            <p className="text-blue-200 text-base mb-2">
              {h.lead}{' '}
              <span className="font-semibold text-white">{h.leadName}</span>
            </p>
            <p className="text-blue-200/80 text-sm mb-10 max-w-xl leading-relaxed">
              {h.body}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/research"
                className="inline-flex items-center gap-2 bg-white text-blue-800 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-sm"
              >
                {h.ctaResearch} <ArrowRight size={16} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-blue-700/50 border border-blue-400/50 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600/50 transition-colors text-sm"
              >
                {h.ctaAbout} <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '12+', label: 'Lab Members' },
              { value: '40+', label: 'Publications' },
              { value: '5', label: 'Active Projects' },
              { value: '$3M+', label: 'Research Funding' },
            ].map(({ value, label }) => (
              <div key={label}>
                <dt className="text-3xl font-extrabold text-blue-700">{value}</dt>
                <dd className="text-sm text-gray-500 mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Research Highlights ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="What We Do"
            title="Research Highlights"
            subtitle="Our work spans clinical NLP, data provenance, and precision medicine — bridging computational methods with real-world clinical challenges."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {researchHighlights.map((card) => (
              <ResearchCard key={card.title} {...card} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/research"
              className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 text-sm transition-colors"
            >
              View all research areas <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recent Publications ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Latest Work"
            title="Recent Publications"
            subtitle="Peer-reviewed research published in leading journals and conferences in medical informatics and AI."
          />
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {recentPublications.map((pub) => (
              <PublicationItem key={pub.title} {...pub} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/publications"
              className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 text-sm transition-colors"
            >
              Browse all publications <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── News ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Updates"
            title="News &amp; Announcements"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {newsItems.map((item) => (
              <NewsCard key={item.title} {...item} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 text-sm transition-colors"
            >
              See all news <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-blue-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Interested in Joining PHI Lab?</h2>
          <p className="text-blue-200 text-base leading-relaxed mb-8">
            We are always looking for motivated PhD students, postdocs, and research collaborators
            passionate about health informatics and AI.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 bg-white text-blue-800 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm shadow-sm"
          >
            Learn More <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}

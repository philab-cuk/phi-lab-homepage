import { useState } from 'react'
import { Mail, Link2, BookOpen, GraduationCap, Users, Building2 } from 'lucide-react'
import membersData from '../data/members.json'

// ─── Helpers ────────────────────────────────────────────────────────────────

const TABS = ['Current Members', 'Alumni']

function SocialLink({ href, icon: Icon, label }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-gray-400 hover:text-brand-600 transition-colors"
    >
      <Icon size={15} />
    </a>
  )
}

function ResearchTag({ tag }) {
  return (
    <span className="inline-block bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
      {tag}
    </span>
  )
}

// ─── Professor Card ──────────────────────────────────────────────────────────

function ProfessorCard({ member }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="flex-shrink-0">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-brand-100 shadow-sm">
          <img
            src={member.photo}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 bg-brand-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <GraduationCap size={12} />
            {member.title}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">{member.name}</h2>
        <p className="text-brand-600 font-medium text-sm mt-0.5">{member.degree}</p>

        {member.bioShort && (
          <p className="text-gray-500 text-sm leading-relaxed mt-3 max-w-2xl">{member.bioShort}</p>
        )}

        {/* Research interests */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {member.researchInterests.map((tag) => (
            <ResearchTag key={tag} tag={tag} />
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 mt-4">
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-brand-600 text-xs font-medium transition-colors"
          >
            <Mail size={14} />
            {member.email}
          </a>
          <div className="flex items-center gap-3">
            <SocialLink href={member.googleScholar} icon={BookOpen} label="Google Scholar" />
            <SocialLink href={member.linkedin} icon={Link2} label="LinkedIn" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Student Card ─────────────────────────────────────────────────────────────

function StudentCard({ member }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:shadow-md hover:border-brand-200 transition-all group">
      {/* Photo + name row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-gray-100 group-hover:ring-brand-100 transition-all flex-shrink-0">
          <img
            src={member.photo}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
            {member.name}
          </h3>
          <p className="text-brand-600 text-xs font-medium mt-0.5">{member.degree}</p>
          {member.year && (
            <p className="text-gray-400 text-xs mt-0.5">Year {member.year}</p>
          )}
        </div>
      </div>

      {/* Research interest tags */}
      <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
        {member.researchInterests.map((tag) => (
          <ResearchTag key={tag} tag={tag} />
        ))}
      </div>

      {/* Footer: email + socials */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {member.email ? (
          <a
            href={`mailto:${member.email}`}
            className="flex items-center gap-1.5 text-gray-500 hover:text-brand-600 transition-colors text-xs truncate"
            aria-label={`Email ${member.name}`}
          >
            <Mail size={13} className="flex-shrink-0" />
            <span className="truncate">{member.email}</span>
          </a>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <SocialLink href={member.googleScholar} icon={BookOpen} label="Google Scholar" />
          <SocialLink href={member.linkedin} icon={Link2} label="LinkedIn" />
        </div>
      </div>
    </div>
  )
}

// ─── Alumni Row ───────────────────────────────────────────────────────────────

function AlumnusRow({ member }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:shadow-sm hover:border-brand-200 transition-all group">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-gray-100 group-hover:ring-brand-100 transition-all flex-shrink-0">
        <img
          src={member.photo}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="font-semibold text-gray-900 text-base">{member.name}</h3>
          <span className="text-gray-400 text-xs">{member.degree} &middot; {member.graduatedYear}</span>
        </div>

        <p className="text-xs text-brand-600 font-medium mt-0.5">{member.role}</p>

        {member.currentAffiliation && (
          <div className="flex items-center gap-1 mt-1.5 text-gray-500 text-xs">
            <Building2 size={12} className="flex-shrink-0 text-gray-400" />
            {member.currentAffiliation}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2">
          {member.researchInterests.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Social links */}
      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        <SocialLink href={member.googleScholar} icon={BookOpen} label="Google Scholar" />
        <SocialLink href={member.linkedin} icon={Link2} label="LinkedIn" />
      </div>
    </div>
  )
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabButton({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-brand-700 text-white shadow-sm'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-200 hover:text-brand-700'
      }`}
    >
      {label}
      <span
        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-bold ${
          active ? 'bg-brand-600 text-brand-100' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Members() {
  const [activeTab, setActiveTab] = useState(TABS[0])

  const professor = membersData.current.find((m) => m.role === 'Principal Investigator')
  const students = membersData.current.filter((m) => m.role !== 'Principal Investigator')
  const alumni = membersData.alumni

  return (
    <>
      {/* ── Page Header ── */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
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
            <Users size={13} />
            Our Team
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Lab Members</h1>
          <p className="text-brand-200 text-base max-w-xl leading-relaxed">
            Meet the researchers and students who make PHI Lab's mission possible — advancing
            health informatics through rigorous, collaborative science.
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Tab Switcher ── */}
        <div className="flex items-center gap-3 mb-10">
          <TabButton
            label="Current Members"
            active={activeTab === 'Current Members'}
            count={membersData.current.length}
            onClick={() => setActiveTab('Current Members')}
          />
          <TabButton
            label="Alumni"
            active={activeTab === 'Alumni'}
            count={alumni.length}
            onClick={() => setActiveTab('Alumni')}
          />
        </div>

        {/* ── Current Members Tab ── */}
        {activeTab === 'Current Members' && (
          <div>
            {/* Professor */}
            {professor && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Faculty
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <ProfessorCard member={professor} />
              </div>
            )}

            {/* Students */}
            {students.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Students
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {students.map((member) => (
                    <StudentCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Alumni Tab ── */}
        {activeTab === 'Alumni' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {alumni.length} {alumni.length === 1 ? 'Graduate' : 'Graduates'}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="flex flex-col gap-4 max-w-4xl">
              {alumni.map((member) => (
                <AlumnusRow key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Join CTA ── */}
      <section className="bg-brand-800 text-white mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Interested in Joining PHI Lab?</h2>
          <p className="text-brand-200 text-sm leading-relaxed mb-6 max-w-xl mx-auto">
            We welcome motivated students and researchers passionate about health informatics,
            clinical AI, and data provenance. Reach out to learn about open positions.
          </p>
          <a
            href="mailto:hyojung.kim@catholic.ac.kr"
            className="inline-flex items-center gap-2 bg-white text-brand-800 font-semibold px-7 py-3 rounded-lg hover:bg-brand-50 transition-colors text-sm shadow-sm"
          >
            <Mail size={15} />
            Get in Touch
          </a>
        </div>
      </section>
    </>
  )
}

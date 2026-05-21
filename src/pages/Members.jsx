import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import membersData from '../data/members.json'

const TABS = ['Current Members', 'Alumni']

function SocialLine({ member }) {
  const items = []
  if (member.email) {
    items.push(
      <a key="email" href={`mailto:${member.email}`}>
        {member.email}
      </a>,
    )
  }
  if (member.googleScholar) {
    items.push(
      <a key="gs" href={member.googleScholar} target="_blank" rel="noopener noreferrer">
        Google Scholar
      </a>,
    )
  }
  if (member.linkedin) {
    items.push(
      <a key="li" href={member.linkedin} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>,
    )
  }
  if (items.length === 0) return null
  return (
    <p className="my-2 text-[15px]">
      {items.map((el, i) => (
        <span key={i}>
          {i > 0 && ' · '}
          {el}
        </span>
      ))}
    </p>
  )
}

function ResearchInterests({ tags }) {
  if (!tags || tags.length === 0) return null
  return (
    <p className="my-1 text-[15px] text-muted">
      <span className="text-meta">Research interests:</span> {tags.join(', ')}
    </p>
  )
}

function ProfessorRow({ member }) {
  return (
    <div
      id={member.id}
      className="flex flex-col sm:flex-row gap-6 items-start scroll-mt-24 mt-6"
    >
      <img
        src={member.photoLive ?? member.photo}
        alt={member.name}
        className="w-40 sm:w-44 aspect-[3/4] object-cover flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="my-0 text-xl font-semibold text-ink">{member.name}</p>
        <p className="my-0 text-muted">{member.title}</p>
        <p className="my-0 text-muted">{member.degree}</p>
        {member.bioShort && <p className="text-muted">{member.bioShort}</p>}
        <ResearchInterests tags={member.researchInterests} />
        <SocialLine member={member} />
      </div>
    </div>
  )
}

function StudentRow({ member }) {
  return (
    <div
      id={member.id}
      className="flex flex-col sm:flex-row gap-6 items-start scroll-mt-24 py-6 border-b border-rule last:border-b-0"
    >
      <img
        src={member.photo}
        alt={member.name}
        loading="lazy"
        decoding="async"
        className="w-32 sm:w-36 aspect-[3/4] object-cover flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="my-0 text-lg font-semibold text-ink">{member.name}</p>
        <p className="my-0 text-muted">{member.degree}</p>
        <ResearchInterests tags={member.researchInterests} />
        <SocialLine member={member} />
      </div>
    </div>
  )
}

function AlumnusItem({ member }) {
  return (
    <div
      id={member.id}
      className="scroll-mt-24 py-4 border-b border-rule last:border-b-0"
    >
      <p className="my-0">
        <span className="font-semibold text-ink">{member.name}</span>
        <span className="text-muted">
          {' '}· {member.degree} · {member.graduatedYear}
        </span>
      </p>
      {member.role && <p className="my-0 text-muted text-[15px]">{member.role}</p>}
      {member.currentAffiliation && (
        <p className="my-0 text-muted text-[15px]">Now: {member.currentAffiliation}</p>
      )}
      {(member.googleScholar || member.linkedin) && (
        <p className="my-1 text-[15px]">
          {member.googleScholar && (
            <a href={member.googleScholar} target="_blank" rel="noopener noreferrer">
              Google Scholar
            </a>
          )}
          {member.googleScholar && member.linkedin && ' · '}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
        </p>
      )}
    </div>
  )
}

function TabLink({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`mr-6 text-[15px] ${
        active
          ? 'text-ink underline underline-offset-[6px] decoration-1'
          : 'text-muted hover:underline'
      }`}
    >
      {label} <span className="text-meta">({count})</span>
    </button>
  )
}

export default function Members() {
  const [activeTab, setActiveTab] = useState(TABS[0])
  const location = useLocation()

  const professor = membersData.current.find((m) => m.role === 'Principal Investigator')
  const students = membersData.current.filter((m) => m.role !== 'Principal Investigator')
  const alumni = membersData.alumni

  // Hash navigation: if URL has #<id>, force the tab that contains that
  // member into view, then smooth-scroll to the card.
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    const inAlumni = alumni.some((m) => m.id === id)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(inAlumni ? 'Alumni' : 'Current Members')
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash, alumni])

  return (
    <div className="mx-auto max-w-[800px] px-6 py-12">
      <h1>Members</h1>

      <div className="mt-6 border-b border-rule pb-3">
        <TabLink
          label="Current Members"
          active={activeTab === 'Current Members'}
          count={membersData.current.length}
          onClick={() => setActiveTab('Current Members')}
        />
        <TabLink
          label="Alumni"
          active={activeTab === 'Alumni'}
          count={alumni.length}
          onClick={() => setActiveTab('Alumni')}
        />
      </div>

      {activeTab === 'Current Members' && (
        <>
          {professor && (
            <>
              <h2>Principal Investigator</h2>
              <ProfessorRow member={professor} />
            </>
          )}
          {students.length > 0 && (
            <>
              <h2>Undergraduate Researchers</h2>
              <div>
                {students.map((member) => (
                  <StudentRow key={member.id} member={member} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'Alumni' && (
        <>
          <h2>
            {alumni.length} {alumni.length === 1 ? 'Graduate' : 'Graduates'}
          </h2>
          <div>
            {alumni.map((member) => (
              <AlumnusItem key={member.id} member={member} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

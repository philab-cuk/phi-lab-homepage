import { useEffect, useState } from 'react'
import { useLocation, useLoaderData } from 'react-router'
import { fetchMembers } from '../lib/publicData'
import SocialLinks, { normalizeUrl } from '../components/SocialLinks'

// CSR: 브라우저에서 로드 — admin 저장이 재배포 없이 즉시 반영된다.
export async function clientLoader() {
  return fetchMembers()
}

const TABS = ['Current Members', 'Alumni']

// 개인 홈페이지가 등록돼 있으면 사진 자체가 링크가 된다(없으면 그냥 이미지).
function MemberPhoto({ member, live = false }) {
  const img = (
    <img
      src={live ? (member.photoLive ?? member.photo) : member.photo}
      alt={member.name}
      loading={live ? undefined : 'lazy'}
      decoding={live ? undefined : 'async'}
      className="w-40 sm:w-44 aspect-[3/4] object-cover flex-shrink-0"
    />
  )
  const href = normalizeUrl(member.personalSite)
  if (!href) return img
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${member.name} — Personal site`}
      className="block flex-shrink-0 transition-opacity hover:opacity-85"
    >
      {img}
    </a>
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

// 이름 표기 — 한글 이름 진하게/크게, 그 옆에 영문 이름 연하게.
// 한글 이름이 없으면 영문만 진하게.
function MemberName({ member, korClass = 'text-xl', engClass = 'text-base' }) {
  const ko = member.nameKo
  const en = member.name
  if (!ko) return <span className={`font-bold text-ink ${korClass}`}>{en}</span>
  return (
    <span className="inline-flex items-baseline gap-2 flex-wrap">
      <span className={`font-bold text-ink ${korClass}`}>{ko}</span>
      {en && <span className={`font-normal text-muted ${engClass}`}>{en}</span>}
    </span>
  )
}

function ProfessorRow({ member }) {
  return (
    <div
      id={member.id}
      className="flex flex-col sm:flex-row gap-6 items-start scroll-mt-24 mt-6"
    >
      <MemberPhoto member={member} live />
      <div className="min-w-0">
        <p className="my-0"><MemberName member={member} korClass="text-2xl" engClass="text-lg" /></p>
        <p className="my-0 text-muted">{member.title}</p>
        <p className="my-0 text-muted">{member.degree}</p>
        {member.bioShort && <p className="text-muted">{member.bioShort}</p>}
        <ResearchInterests tags={member.researchInterests} />
        <SocialLinks member={member} />
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
      <MemberPhoto member={member} />
      <div className="min-w-0">
        <p className="my-0 flex items-center gap-2.5">
          <span className="inline-block h-[18px] w-[4px] rounded-full shrink-0" style={{ background: '#5b9bd5' }} aria-hidden="true" />
          <MemberName member={member} korClass="text-xl" engClass="text-base" />
        </p>
        <p className="my-0 text-muted">{member.degree}</p>
        <ResearchInterests tags={member.researchInterests} />
        <SocialLinks member={member} />
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
        <MemberName member={member} korClass="text-lg" engClass="text-[15px]" />
        <span className="text-muted">
          {' '}· {member.degree} · {member.graduatedYear}
        </span>
      </p>
      {member.role && <p className="my-0 text-muted text-[15px]">{member.role}</p>}
      {member.currentAffiliation && (
        <p className="my-0 text-muted text-[15px]">Now: {member.currentAffiliation}</p>
      )}
      <SocialLinks member={member} showEmail={false} className="my-1" />
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
  const data = useLoaderData() ?? {}
  const location = useLocation()

  const { current = [], alumni = [], roleOrder = [], piRole } = data
  // PI(역할 목록 맨 앞)는 별도 섹션. 과거 한글 값('지도교수')도 함께 인정.
  const isPi = (m) => m.role === piRole || m.role === '지도교수'
  const professor = current.find(isPi)
  const rest = current.filter((m) => !isPi(m))

  // 역할별 그룹 — member_roles 의 순서대로, 목록에 없는 역할은 맨 뒤에 등장 순서로.
  const seen = new Set()
  const orderedRoles = [
    ...roleOrder.filter((r) => r !== piRole),
    ...rest.map((m) => m.role).filter((r) => r && !roleOrder.includes(r)),
  ].filter((r) => (seen.has(r) ? false : seen.add(r)))
  const groups = orderedRoles
    .map((role) => ({ role, members: rest.filter((m) => m.role === role) }))
    .filter((g) => g.members.length > 0)
  const noRole = rest.filter((m) => !m.role)   // 역할 미지정

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
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1>Members</h1>

      <div className="mt-6 border-b border-rule pb-3">
        <TabLink
          label="Current Members"
          active={activeTab === 'Current Members'}
          count={current.length}
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
              <h2>{professor.role || piRole || 'Principal Investigator'}</h2>
              <ProfessorRow member={professor} />
            </>
          )}
          {groups.map((g) => (
            <section key={g.role}>
              <h2>{g.role}</h2>
              <div>
                {g.members.map((member) => (
                  <StudentRow key={member.id} member={member} />
                ))}
              </div>
            </section>
          ))}
          {noRole.length > 0 && (
            <section>
              <h2>Members</h2>
              <div>
                {noRole.map((member) => (
                  <StudentRow key={member.id} member={member} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {activeTab === 'Alumni' && (
        <>
          <h2>
            졸업생 {alumni.length}명
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

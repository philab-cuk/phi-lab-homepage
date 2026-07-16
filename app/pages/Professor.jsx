import { useLoaderData } from 'react-router'
import { fetchProfessor } from '../lib/publicData'

// CSR: 브라우저에서 로드 — admin 저장이 재배포 없이 즉시 반영된다.
export async function clientLoader() {
  return fetchProfessor()
}

const CATEGORY_LABELS = {
  academic: 'Academic Experience',
  technical: 'Technical Leadership & Hands-On Experience',
  clinical: 'Clinical Experience',
}
const CATEGORY_ORDER = ['academic', 'technical', 'clinical']

function ExperienceItem({ item }) {
  return (
    <li className="my-6 list-none">
      <p className="my-0">
        <span className="font-semibold text-ink">{item.role}</span>
        <span className="text-muted"> ({item.period})</span>
      </p>
      <p className="my-0 text-muted">{item.organization}</p>
      {item.location && <p className="my-0 text-meta text-[15px]">{item.location}</p>}
      {item.focus && (
        <p className="mt-1 mb-0">
          <span className="font-semibold">Focus:</span> {item.focus}
        </p>
      )}
      {item.details && item.details.length > 0 && (
        <ul className="mt-1 mb-0">
          {item.details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
      {item.externalLinks && item.externalLinks.length > 0 && (
        <p className="mt-1 mb-0 text-[15px]">
          {item.externalLinks.map((link, i) => (
            <span key={i}>
              {i > 0 && ' · '}
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </span>
          ))}
        </p>
      )}
    </li>
  )
}

// 대제목(h2) — 딥네이비 + 골드 세로바 액센트(홈 'Research' 모티프와 통일).
function SectionH2({ children }) {
  return (
    <h2 className="flex items-center gap-3">
      <span className="inline-block h-[20px] w-[4px] rounded-full bg-gold-600" aria-hidden="true" />
      <span className="text-brand-900">{children}</span>
    </h2>
  )
}

// 소제목(h3) — 네이비 + 은은한 골드 그라데이션 밑줄.
function SubHeading({ children }) {
  return (
    <>
      <h3 className="my-0 text-brand-700">{children}</h3>
      <div
        className="mt-1 mb-3 h-[2px] max-w-[340px]"
        style={{ background: 'linear-gradient(90deg, #e7d6a6, transparent)' }}
        aria-hidden="true"
      />
    </>
  )
}

function ExperienceGroup({ category, items }) {
  return (
    <section className="mt-8">
      <SubHeading>{CATEGORY_LABELS[category] ?? 'Experience'}</SubHeading>
      <ul className="list-none pl-0 m-0">
        {items.map((item, i) => (
          <ExperienceItem key={i} item={item} />
        ))}
      </ul>
    </section>
  )
}

export default function Professor() {
  const PI = useLoaderData()

  // PI 미등록(또는 역할 매칭 실패) 시 크래시 대신 안내.
  if (!PI) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <h1>Professor</h1>
        <p className="text-muted">
          교수 정보가 아직 등록되지 않았습니다. 관리자(Members)에서 역할 목록 맨 위
          역할(예: Principal Investigator)을 가진 멤버를 추가해 주세요.
        </p>
      </div>
    )
  }

  const experience = PI.experience ?? []
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: experience.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0)

  const ungrouped = experience.filter((e) => !CATEGORY_ORDER.includes(e.category))
  const bioParagraphs = (PI.bioFull ?? '').split('\n\n')

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1>Professor</h1>

      <div className="flex flex-col sm:flex-row gap-6 items-start mt-6 mb-4">
        <img
          src={PI.photo}
          alt={`Prof. ${PI.name}`}
          className="w-40 sm:w-44 aspect-[3/4] object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="my-0">
            {PI.nameKo ? (
              <span className="inline-flex items-baseline gap-2 flex-wrap">
                <span className="font-bold text-ink text-2xl">{PI.nameKo}</span>
                <span className="font-normal text-muted text-lg">{PI.name}</span>
              </span>
            ) : (
              <span className="font-bold text-ink text-2xl">{PI.name}</span>
            )}
          </p>
          {/* 직함 한 줄 — 굵게·한 사이즈 크게. 아래에 부서·단과대·대학을 각 줄로. */}
          <p className="mt-1 mb-0 font-semibold text-ink text-lg">{PI.title}</p>
          <p className="my-0 text-muted">{PI.department}</p>
          {PI.college && <p className="my-0 text-muted">{PI.college}</p>}
          <p className="my-0 text-muted">{PI.institution}</p>
          <p className="mt-3 mb-0 text-[15px]">
            <a href={`mailto:${PI.email}`}>{PI.email}</a>
            {PI.personalSite && (
              <>
                {' · '}
                <a href={PI.personalSite} target="_blank" rel="noopener noreferrer">
                  Personal site
                </a>
              </>
            )}
          </p>
        </div>
      </div>

      <SectionH2>Bio and Accomplishments</SectionH2>
      {bioParagraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      <SectionH2>Work Experience</SectionH2>
      {grouped.map((g) => (
        <ExperienceGroup key={g.category} category={g.category} items={g.items} />
      ))}
      {ungrouped.length > 0 && (
        <ExperienceGroup category="other" items={ungrouped} />
      )}

      {PI.service && PI.service.length > 0 && (
        <section className="mt-8">
          <SectionH2>Professional Service</SectionH2>
          <ul className="list-disc pl-5 marker:text-meta mt-3">
            {PI.service.map((s, i) => (
              <li key={i} className="my-1.5">{s}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

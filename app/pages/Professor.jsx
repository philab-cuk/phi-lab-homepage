import { useLoaderData } from 'react-router'
import { fetchProfessor } from '../lib/publicData'

export async function loader() {
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

function ExperienceGroup({ category, items }) {
  return (
    <section className="mt-8">
      <h3>{CATEGORY_LABELS[category] ?? 'Experience'}</h3>
      <hr className="my-2" />
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
          className="w-40 h-40 object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="my-0 text-xl font-semibold text-ink">{PI.name}</p>
          <p className="my-0 text-muted">
            {PI.title}, {PI.department}
          </p>
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

      <h2>Bio and Accomplishments</h2>
      {bioParagraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      <h2>Work Experience</h2>
      {grouped.map((g) => (
        <ExperienceGroup key={g.category} category={g.category} items={g.items} />
      ))}
      {ungrouped.length > 0 && (
        <ExperienceGroup category="other" items={ungrouped} />
      )}
    </div>
  )
}

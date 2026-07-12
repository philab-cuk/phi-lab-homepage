import { EVENTS } from '../data/events'

// 행사 페이지 — 연구실이 주최한 학술 행사 목록. 정적 데이터(app/data/events.js).
const ROLE_LABEL = {
  Host: 'Host',
  'Co-host': 'Co-host',
  Organizer: 'Organizer',
}

// '2026.03.14' / '2026' 모두 정렬되도록 숫자만 뽑아 비교.
function dateKey(d) {
  return Number((d || '').replace(/\D/g, '').padEnd(8, '0'))
}

function EventItem({ event }) {
  const { title, fullName, role, date, venue, description, link, image, images, speaker, agenda, program, sponsor } = event
  const meta = [role && (ROLE_LABEL[role] ?? role), date, venue].filter(Boolean)
  const header = (
    <>
      <span className="font-semibold text-ink text-lg">{title}</span>
      {fullName && <span className="text-muted"> — {fullName}</span>}
    </>
  )
  return (
    <article className="py-6 border-b border-rule last:border-b-0">
      <p className="my-0">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">
            {header}
          </a>
        ) : (
          header
        )}
      </p>
      {meta.length > 0 && (
        <p className="my-1 text-[15px] text-meta">{meta.join(' · ')}</p>
      )}
      {description && <p className="mt-2 mb-0 text-muted leading-relaxed">{description}</p>}

      {speaker && (
        <p className="mt-3 mb-0 text-[15px]">
          <span className="font-semibold text-ink">Speaker</span>
          {' · '}
          {speaker.name}
          {speaker.affiliation && <span className="text-muted"> — {speaker.affiliation}</span>}
        </p>
      )}

      {agenda && agenda.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {agenda.map((a) => (
            <div key={a.day} className="flex gap-3 text-[15px]">
              <span className="shrink-0 min-w-[54px] font-semibold text-brand-700">{a.day}</span>
              <span className="text-muted">{a.title}</span>
            </div>
          ))}
        </div>
      )}

      {(program || sponsor) && (
        <p className="mt-3 mb-0 text-[13px] text-meta">
          {[program, sponsor].filter(Boolean).join(' · ')}
        </p>
      )}

      {image && (
        <div className="mt-3 max-w-[320px]">
          <img
            src={import.meta.env.BASE_URL + image}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-auto object-cover rounded-lg border border-rule"
          />
        </div>
      )}

      {/* 여러 장 사진 — 높이 고정 썸네일이 가로로 배열(비율 달라도 정렬). */}
      {images && images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <img
              key={i}
              src={import.meta.env.BASE_URL + src}
              alt={`${title} ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="h-[150px] w-auto max-w-full object-cover rounded-lg border border-rule"
            />
          ))}
        </div>
      )}
    </article>
  )
}

export default function Events() {
  const events = [...EVENTS].sort((a, b) => dateKey(b.date) - dateKey(a.date))

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1>Events</h1>
      <p className="text-muted">
        Academic events hosted and organized by the PHI Lab — conferences, workshops,
        and symposia bringing together researchers across health informatics and AI.
      </p>

      {events.length > 0 ? (
        <div className="mt-6">
          {events.map((e) => (
            <EventItem key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <p className="text-muted py-10">No events to display yet.</p>
      )}
    </div>
  )
}

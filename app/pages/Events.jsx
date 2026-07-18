import { useState } from 'react'
import { EVENTS } from '../data/events'
import { usePageMeta } from '../lib/usePageMeta'
import Lightbox from '../components/Lightbox'

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

// images 항목은 'path' 문자열 또는 { src, caption } 객체 둘 다 허용.
function normalizeImage(img) {
  return typeof img === 'string' ? { src: img, caption: '' } : img
}

function EventItem({ event, onOpenImage }) {
  const { title, fullName, role, date, venue, description, link, images, speaker, agenda, program, sponsor } = event
  const meta = [role && (ROLE_LABEL[role] ?? role), date, venue].filter(Boolean)
  const imgs = (images || []).map(normalizeImage)
  const header = (
    <>
      <span className="font-semibold text-ink text-lg">{title}</span>
      {fullName && <span className="text-muted"> — {fullName}</span>}
    </>
  )
  return (
    <article className="py-6 border-b border-rule last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="inline-block h-[18px] w-[4px] rounded-full bg-gold-600 shrink-0" aria-hidden="true" />
        <p className="my-0">
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">
              {header}
            </a>
          ) : (
            header
          )}
        </p>
      </div>
      <div
        className="mt-1.5 h-[2px] max-w-[380px]"
        style={{ background: 'linear-gradient(90deg, #e7d6a6, transparent)' }}
        aria-hidden="true"
      />
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

      {/* 여러 장 사진 — 높이 고정 썸네일이 가로로 배열, 클릭 시 확대. caption 있으면 아래 표시. */}
      {imgs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {imgs.map((img, i) => (
            <figure key={i} className="m-0">
              <button
                type="button"
                onClick={() =>
                  onOpenImage(
                    imgs.map((m) => ({ src: import.meta.env.BASE_URL + m.src, caption: m.caption })),
                    i,
                  )
                }
                aria-label={img.caption ? `Enlarge: ${img.caption}` : `Enlarge image ${i + 1}`}
                className="block p-0 m-0 cursor-zoom-in focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <img
                  src={import.meta.env.BASE_URL + img.src}
                  alt={img.caption || `${title} ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="h-[150px] w-auto max-w-full object-cover rounded-lg border border-rule"
                />
              </button>
              {img.caption && (
                <figcaption className="mt-1.5 text-[13px] text-meta">{img.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </article>
  )
}

export default function Events() {
  const events = [...EVENTS].sort((a, b) => dateKey(b.date) - dateKey(a.date))
  const [lightbox, setLightbox] = useState(null)
  usePageMeta({ title: 'Events' })
  const openImage = (images, index) => setLightbox({ images, index })

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
            <EventItem key={e.id} event={e} onOpenImage={openImage} />
          ))}
        </div>
      ) : (
        <p className="text-muted py-10">No events to display yet.</p>
      )}

      <Lightbox state={lightbox} setState={setLightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}

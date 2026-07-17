import { useEffect, useState } from 'react'
import { fetchGallery } from '../lib/publicData'
import Lightbox from '../components/Lightbox'

// Gallery — 연구실 문화·사람(Lab Life) 사진. 앨범별 묶음 + 클릭 확대(라이트박스).
// CSR: admin 업로드가 재배포 없이 즉시 반영되도록 공개 loader 대신 클라이언트 fetch.

function albumDate(items) {
  const dates = items.map((i) => i.takenOn).filter(Boolean).sort()
  if (!dates.length) return ''
  const d = new Date(dates[dates.length - 1])
  return `${d.getFullYear()}. ${d.getMonth() + 1}.`
}

export default function Gallery() {
  const [items, setItems] = useState(null) // null=로딩, []=없음
  const [error, setError] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    let alive = true
    fetchGallery()
      .then((data) => { if (alive) setItems(data) })
      .catch((e) => { if (alive) setError(e) })
    return () => { alive = false }
  }, [])

  // 앨범별 묶음. album 없으면 'Lab Life'.
  // 앨범 '간' 순서 = 업로드(created_at) 역순 → 최신 앨범이 위로.
  //   대표 시각 = 그 앨범에서 가장 최근 업로드된 사진의 created_at(ISO 문자열, 사전순=시간순).
  // 앨범 '안'의 사진은 fetch 순서(촬영일 과거→현재) 유지.
  const groups = (() => {
    if (!items) return []
    const map = new Map()
    for (const it of items) {
      const key = it.album || 'Lab Life'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(it)
    }
    const latest = (arr) => arr.reduce((m, it) => (it.createdAt > m ? it.createdAt : m), '')
    return [...map.entries()].sort(([, a], [, b]) => (latest(a) < latest(b) ? 1 : latest(a) > latest(b) ? -1 : 0))
  })()

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="mb-1">Gallery</h1>
        <p className="my-0 text-muted">Life in the PHI Lab</p>
      </header>

      {error && <p className="text-muted">Failed to load gallery. Please try again later.</p>}
      {!error && items === null && <p className="text-muted">Loading…</p>}
      {!error && items?.length === 0 && <p className="text-muted">No photos yet.</p>}

      {groups.map(([album, arr], gi) => {
        const images = arr.map((it) => ({ src: it.imageUrl, caption: it.caption }))
        return (
          <section key={album} className={gi === 0 ? '' : 'mt-12'}>
            <h2 className="mb-4 flex items-center gap-3">
              <span className="inline-block h-[20px] w-[4px] rounded-full bg-gold-600" aria-hidden="true" />
              <span className="text-brand-900">{album}</span>
              {albumDate(arr) && (
                <span className="text-muted text-[15px] font-normal">· {albumDate(arr)}</span>
              )}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {arr.map((it, i) => (
                <figure key={it.id} className="m-0">
                  <button
                    type="button"
                    onClick={() => setLightbox({ images, index: i })}
                    aria-label={it.caption ? `Enlarge: ${it.caption}` : 'Enlarge photo'}
                    className="block w-full cursor-zoom-in p-0 focus:outline-none focus:ring-1 focus:ring-ink"
                  >
                    <img
                      src={it.imageUrl}
                      alt={it.caption || ''}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full rounded-lg border border-rule object-cover transition-opacity hover:opacity-90"
                    />
                  </button>
                  {it.caption && (
                    <figcaption className="mt-1.5 line-clamp-2 text-[13px] text-meta">{it.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )
      })}

      <Lightbox state={lightbox} setState={setLightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}

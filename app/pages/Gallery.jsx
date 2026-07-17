import { useEffect, useState } from 'react'
import { fetchGallery } from '../lib/publicData'

// Gallery — 연구실 문화·사람(Lab Life) 사진. 앨범별 묶음 + 클릭 확대(라이트박스).
// CSR: admin 업로드가 재배포 없이 즉시 반영되도록 공개 loader 대신 클라이언트 fetch.

function albumDate(items) {
  const dates = items.map((i) => i.takenOn).filter(Boolean).sort()
  if (!dates.length) return ''
  const d = new Date(dates[dates.length - 1])
  return `${d.getFullYear()}. ${d.getMonth() + 1}.`
}

function Lightbox({ state, setState, onClose }) {
  useEffect(() => {
    if (!state) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft')
        setState((s) => s && { ...s, index: (s.index - 1 + s.images.length) % s.images.length })
      else if (e.key === 'ArrowRight')
        setState((s) => s && { ...s, index: (s.index + 1) % s.images.length })
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [state, setState, onClose])

  if (!state) return null
  const { images, index } = state
  const total = images.length
  const many = total > 1
  const cur = images[index]
  const go = (d) => setState((s) => s && { ...s, index: (s.index + d + s.images.length) % s.images.length })

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8 cursor-zoom-out"
    >
      <button type="button" onClick={onClose} aria-label="Close"
        className="absolute top-3 right-4 text-white text-3xl leading-none px-2 py-1 hover:opacity-80">×</button>
      {many && (
        <button type="button" onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Previous"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white text-4xl leading-none px-2 py-1 hover:opacity-80">‹</button>
      )}
      {many && (
        <button type="button" onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Next"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white text-4xl leading-none px-2 py-1 hover:opacity-80">›</button>
      )}
      <figure className="m-0 flex max-h-full max-w-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img src={cur.src} alt={cur.caption || ''} className="max-h-[85vh] max-w-full object-contain" />
        {(cur.caption || many) && (
          <figcaption className="mt-3 select-none text-center text-sm text-white/85">
            {cur.caption}
            {cur.caption && many && '  ·  '}
            {many && `${index + 1} / ${total}`}
          </figcaption>
        )}
      </figure>
    </div>
  )
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

  // 앨범별 묶음 — fetch 순서(최신 촬영일 우선) 유지. album 없으면 'Lab Life'.
  const groups = (() => {
    if (!items) return []
    const map = new Map()
    for (const it of items) {
      const key = it.album || 'Lab Life'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(it)
    }
    return [...map.entries()]
  })()

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1 className="text-center">Gallery</h1>
      <p className="mx-auto max-w-[640px] text-center text-muted">
        Life in the PHI Lab — moments from our research journey, gatherings, and milestones.
      </p>

      {error && <p className="mt-8 text-muted">Failed to load gallery. Please try again later.</p>}
      {!error && items === null && <p className="mt-8 text-muted">Loading…</p>}
      {!error && items?.length === 0 && <p className="mt-8 text-muted">No photos yet.</p>}

      {groups.map(([album, arr]) => {
        const images = arr.map((it) => ({ src: it.imageUrl, caption: it.caption }))
        return (
          <section key={album} className="mt-12">
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

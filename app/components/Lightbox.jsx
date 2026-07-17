import { useEffect } from 'react'

// 공용 라이트박스 — Gallery / Events / Teaching 이 공유.
// state: { images: [{ src, caption? }], index } | null
// 화살표/ESC 로 이동·닫기, 바깥/× 클릭 시 닫힘. caption 있으면 하단에 표시.
export default function Lightbox({ state, setState, onClose }) {
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
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [state, setState, onClose])

  if (!state) return null
  const { images, index } = state
  const total = images.length
  const hasMultiple = total > 1
  const current = images[index]
  const go = (d) => setState((s) => s && { ...s, index: (s.index + d + s.images.length) % s.images.length })

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8 cursor-zoom-out"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-4 text-white text-3xl leading-none px-2 py-1 hover:opacity-80"
      >
        ×
      </button>

      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); go(-1) }}
          aria-label="Previous image"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white text-4xl leading-none px-2 py-1 hover:opacity-80"
        >
          ‹
        </button>
      )}
      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); go(1) }}
          aria-label="Next image"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white text-4xl leading-none px-2 py-1 hover:opacity-80"
        >
          ›
        </button>
      )}

      <figure className="max-w-full max-h-full m-0 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={current.src}
          alt={current.caption || ''}
          className="max-w-full max-h-[85vh] object-contain cursor-default"
        />
        {(current.caption || hasMultiple) && (
          <figcaption className="mt-3 text-white/85 text-sm select-none text-center">
            {current.caption}
            {current.caption && hasMultiple && '  ·  '}
            {hasMultiple && `${index + 1} / ${total}`}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

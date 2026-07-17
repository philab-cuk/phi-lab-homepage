import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchNews } from '../lib/publicData'
import { formatNewsDate } from '../components/NewsCard'

// News 목록 — 3열 격자(사진·제목·날짜). 칸 클릭 → 상세(/news/:id).
// CSR: 소식은 admin 에서 올리는 즉시 반영되어야 해서 SSG(prerender)에서 제외.

// 본문에 이미지가 없는 소식의 기본 카드 이미지(가대 시그니처: 딥네이비 우주 + 골드 네트워크).
const DEFAULT_COVER = import.meta.env.BASE_URL + 'card-news-default.jpg'

function NewsGridCard({ item }) {
  const cover = item.cover
  return (
    <Link to={`/news/${item.id}`} className="group block no-underline text-ink">
      <div className="aspect-[4/3] overflow-hidden border border-rule bg-[#0b1730]">
        {cover ? (
          <img
            src={cover}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
          />
        ) : (
          // 기본 이미지 + 은은한 랩 워드마크(좌상단 어두운 영역).
          <div className="relative h-full w-full">
            <img
              src={DEFAULT_COVER}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
            />
            <div className="pointer-events-none absolute inset-0 p-4 sm:p-5">
              <span
                className="block text-[13px] font-semibold tracking-wide"
                style={{ color: 'rgba(231,214,166,0.80)', textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}
              >
                PHI Lab
              </span>
              <span
                className="mt-0.5 block text-[8.5px] uppercase tracking-[0.18em]"
                style={{ color: 'rgba(255,255,255,0.42)', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
              >
                The Catholic University of Korea
              </span>
            </div>
          </div>
        )}
      </div>
      <h2 className="mt-3 mb-0 text-[1.05rem] leading-snug line-clamp-2 group-hover:underline">
        {item.title}
      </h2>
      <p className="my-1 text-meta text-[14px]">{formatNewsDate(item.publishedAt)}</p>
    </Link>
  )
}

export default function News() {
  const [items, setItems] = useState(null) // null=로딩, []=없음
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    fetchNews()
      .then((data) => { if (alive) setItems(data) })
      .catch((e) => { if (alive) setError(e) })
    return () => { alive = false }
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1 className="text-center">News</h1>

      {error && (
        <p className="text-muted">Failed to load news. Please try again later.</p>
      )}
      {!error && items === null && <p className="text-muted">Loading…</p>}
      {!error && items?.length === 0 && <p className="text-muted">No news yet.</p>}

      {items?.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsGridCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchNews } from '../lib/publicData'
import { formatNewsDate } from '../components/NewsCard'

// News 목록 — 3열 격자(사진·제목·날짜). 칸 클릭 → 상세(/news/:id).
// CSR: 소식은 admin 에서 올리는 즉시 반영되어야 해서 SSG(prerender)에서 제외.

function NewsGridCard({ item }) {
  const cover = item.cover
  return (
    <Link to={`/news/${item.id}`} className="group block no-underline text-ink">
      <div className="aspect-[4/3] overflow-hidden border border-rule bg-[#f3f3f3]">
        {cover ? (
          <img
            src={cover}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-meta text-[14px]">
            {item.title}
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

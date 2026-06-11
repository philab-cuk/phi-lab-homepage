import { useEffect, useState } from 'react'
import { fetchNews } from '../lib/publicData'
import NewsCard from '../components/NewsCard'

// News 는 일부러 SSG(prerender) 대상에서 뺐다 — 소식은 admin 에서 올리는
// 즉시 보여야 해서, 빌드 없이 방문 시점에 불러온다(CSR).
// 카드 모양은 admin 미리보기와 공유하는 NewsCard 가 단일 출처.

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
    <div className="mx-auto max-w-[820px] px-6 py-12">
      <h1>News</h1>

      {error && (
        <p className="text-muted">Failed to load news. Please try again later.</p>
      )}
      {!error && items === null && <p className="text-muted">Loading…</p>}
      {!error && items?.length === 0 && <p className="text-muted">No news yet.</p>}

      {items?.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  )
}

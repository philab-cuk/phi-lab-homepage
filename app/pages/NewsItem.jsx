import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { fetchNewsItem } from '../lib/publicData'
import NewsCard from '../components/NewsCard'

// News 상세 — CSR(목록과 같은 사유). 전체 내용은 NewsCard(목록 격자가 아닌
// 전체 뷰)로 렌더 — admin 미리보기와 같은 부품을 공유한다.

export default function NewsItem() {
  const { id } = useParams()
  const [item, setItem] = useState(undefined) // undefined=로딩, null=없음
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setItem(undefined)
    fetchNewsItem(id)
      .then((data) => { if (alive) setItem(data) })
      .catch((e) => { if (alive) setError(e) })
    return () => { alive = false }
  }, [id])

  if (error) {
    return (
      <div className="mx-auto max-w-[820px] px-6 py-12">
        <p className="text-muted">Failed to load the news. Please try again later.</p>
      </div>
    )
  }
  if (item === undefined) {
    return (
      <div className="mx-auto max-w-[820px] px-6 py-12">
        <p className="text-muted">Loading…</p>
      </div>
    )
  }
  if (item === null) {
    return (
      <div className="mx-auto max-w-[820px] px-6 py-12">
        <h1>News not found</h1>
        <p className="text-muted">
          The news does not exist or is not published.{' '}
          <Link to="/news">Back to News</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 py-12">
      <NewsCard item={item} />
      <p className="mt-8">
        <Link to="/news">← Back to News</Link>
      </p>
    </div>
  )
}

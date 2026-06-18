import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchPosts } from '../lib/publicData'
import { formatNewsDate } from '../components/NewsCard'

// Posts 목록 — News 와 같은 CSR. 글을 올리면 재배포 없이 즉시 반영되어야
// 해서 SSG(prerender)에서 의도적으로 제외한다. 장문이라 본문은 상세에서.

export default function Posts() {
  const [items, setItems] = useState(null) // null=로딩, []=없음
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    fetchPosts()
      .then((data) => { if (alive) setItems(data) })
      .catch((e) => { if (alive) setError(e) })
    return () => { alive = false }
  }, [])

  return (
    <div className="mx-auto max-w-[820px] px-6 py-12">
      <h1>Posts</h1>

      {error && (
        <p className="text-muted">Failed to load posts. Please try again later.</p>
      )}
      {!error && items === null && <p className="text-muted">Loading…</p>}
      {!error && items?.length === 0 && <p className="text-muted">No posts yet.</p>}

      {items?.map((post) => (
        <article key={post.id} className="border-b border-rule py-5">
          <p className="my-0 text-meta text-[14px]">{formatNewsDate(post.publishedAt)}</p>
          <h2 className="mt-1 mb-0 text-[1.15rem]">
            <Link to={`/posts/${post.id}`} className="text-ink hover:underline">
              {post.title}
            </Link>
          </h2>
          {post.excerpt && <p className="mt-2 mb-0 text-muted">{post.excerpt}</p>}
        </article>
      ))}
    </div>
  )
}

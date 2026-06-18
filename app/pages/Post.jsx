import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { fetchPost, incrementPostViews } from '../lib/publicData'
import { formatNewsDate } from '../components/NewsCard'
import PostBody from '../components/PostBody'

// Posts 상세 — CSR(목록과 같은 사유). 본문은 PostBody(BlockNote 변환)로 렌더.

export default function Post() {
  const { id } = useParams()
  const [post, setPost] = useState(undefined) // undefined=로딩, null=없음
  const [error, setError] = useState(null)
  const countedRef = useRef(null) // 같은 글에서 조회수 중복 증가 방지(StrictMode/재렌더)

  useEffect(() => {
    let alive = true
    setPost(undefined)
    fetchPost(id)
      .then((data) => { if (alive) setPost(data) })
      .catch((e) => { if (alive) setError(e) })
    // 조회수 +1 — 글당 1회만
    if (id && countedRef.current !== id) {
      countedRef.current = id
      incrementPostViews(id).catch(() => {})
    }
    return () => { alive = false }
  }, [id])

  if (error) {
    return (
      <div className="mx-auto max-w-[820px] px-6 py-12">
        <p className="text-muted">Failed to load the post. Please try again later.</p>
      </div>
    )
  }
  if (post === undefined) {
    return (
      <div className="mx-auto max-w-[820px] px-6 py-12">
        <p className="text-muted">Loading…</p>
      </div>
    )
  }
  if (post === null) {
    return (
      <div className="mx-auto max-w-[820px] px-6 py-12">
        <h1>Post not found</h1>
        <p className="text-muted">
          The post does not exist or is not published.{' '}
          <Link to="/posts">Back to Posts</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 py-12">
      <p className="my-0 text-meta text-[14px]">{formatNewsDate(post.publishedAt)}</p>
      <h1 className="mt-1">{post.title}</h1>
      <PostBody json={post.bodyJson} />
      <p className="mt-10">
        <Link to="/posts">← Back to Posts</Link>
      </p>
    </div>
  )
}

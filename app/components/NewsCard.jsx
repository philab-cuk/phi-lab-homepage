import PostBody from './PostBody'

// 소식 "전체 보기" — News 상세 페이지(/news/:id)에서 쓴다.
// 본문은 Posts 와 동일한 BlockNote 본문이라 PostBody 로 렌더한다.
// 입력: { title, publishedAt, bodyJson }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatNewsDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export default function NewsCard({ item }) {
  return (
    <article>
      <p className="my-0 text-meta text-[14px]">{formatNewsDate(item.publishedAt)}</p>
      <h1 className="mt-1 mb-2">{item.title}</h1>
      <PostBody json={item.bodyJson} />
    </article>
  )
}

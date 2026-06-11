// 소식 카드 — 공개 News 페이지와 admin 미리보기가 공유하는 단일 모양.
// 입력: { title, bodyShort, publishedAt, images: [url] } (camelCase, 사진은 URL 배열)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatNewsDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function NewsImages({ images, title }) {
  if (!images.length) return null
  const gridCls = images.length === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2'
  return (
    <div className={`${gridCls} gap-2 mt-3`}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={images.length > 1 ? `${title} (${i + 1})` : title}
          className="w-full max-h-[420px] object-contain rounded border border-rule bg-white"
          loading="lazy"
        />
      ))}
    </div>
  )
}

export default function NewsCard({ item }) {
  return (
    <article className="border border-rule rounded-lg p-5 my-4">
      <p className="my-0 text-meta text-[14px]">{formatNewsDate(item.publishedAt)}</p>
      <h2 className="mt-1 mb-0 text-[1.15rem]">{item.title}</h2>
      {item.bodyShort && (
        <p className="mt-2 mb-0 text-muted whitespace-pre-line">{item.bodyShort}</p>
      )}
      <NewsImages images={item.images ?? []} title={item.title} />
    </article>
  )
}

import { useMemo, useState } from 'react'
import { useLoaderData } from 'react-router'
import { fetchPublications } from '../lib/publicData'
import { BOOKS, PATENTS, PI_NAMES } from '../data/scholarly-works'

// CSR: 브라우저에서 로드 — admin 저장이 재배포 없이 즉시 반영된다.
export async function clientLoader() {
  return fetchPublications()
}

// 3-tier copy fallback so it works on non-secure contexts (http LAN preview).
async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      /* fall through */
    }
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '0'
    ta.style.left = '0'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    if (ok) return true
  } catch {
    /* fall through */
  }
  window.prompt('Copy this text manually:', text)
  return false
}

const CATEGORY_LABEL = {
  article: 'Article, peer-reviewed',
  'international-presentation': 'International presentation',
  'national-presentation': 'National presentation',
}

function buildBibtex(pub) {
  const citeKey = pub.id
  const authorStr = pub.authors.map((a) => a.name).join(' and ')
  const doiLine = pub.doi ? `  doi          = {${pub.doi}},\n` : ''
  const urlLine = !pub.doi && pub.url ? `  url          = {${pub.url}},\n` : ''

  if (pub.category === 'article') {
    return (
      `@article{${citeKey},\n` +
      `  author       = {${authorStr}},\n` +
      `  title        = {{${pub.title}}},\n` +
      `  journal      = {${pub.venue}},\n` +
      `  year         = {${pub.year}},\n` +
      doiLine +
      urlLine +
      `}`
    )
  }
  const howpublishedParts = [pub.venue]
  if (pub.location) howpublishedParts.push(pub.location)
  if (pub.date) howpublishedParts.push(pub.date)
  const howpublished = howpublishedParts.join(', ')
  return (
    `@misc{${citeKey},\n` +
    `  author       = {${authorStr}},\n` +
    `  title        = {{${pub.title}}},\n` +
    `  howpublished = {${howpublished}},\n` +
    `  year         = {${pub.year}},\n` +
    `  note         = {${pub.category === 'international-presentation' ? 'International presentation' : 'National presentation'}},\n` +
    `}`
  )
}

function AuthorList({ authors }) {
  return (
    <>
      {authors.map((a, i) => (
        <span key={`${a.name}-${i}`}>
          {a.isPi ? <strong>{a.name}</strong> : a.name}
          {a.coFirst && <sup>†</sup>}
          {i < authors.length - 1 && ', '}
        </span>
      ))}
    </>
  )
}

function CopyBibtex({ pub }) {
  const [copied, setCopied] = useState(false)
  async function onClick() {
    const ok = await copyToClipboard(buildBibtex(pub))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button onClick={onClick} className="hover:underline">
      {copied ? 'Copied' : 'BibTeX'}
    </button>
  )
}

function PubItem({ pub }) {
  const isArticle = pub.category === 'article'
  const link = pub.doi ? `https://doi.org/${pub.doi}` : pub.url
  return (
    <article className="py-4 border-b border-rule last:border-b-0">
      {/* 인용 줄(큰 글씨) 전체에 DOI/원문 링크를 녹임 — 링크 있으면 줄 전체가 클릭 */}
      {(() => {
        const cite = (
          <>
            <AuthorList authors={pub.authors} /> ({pub.year}).{' '}
            <strong className="text-ink">{pub.title}</strong>.{' '}
            <em>{pub.venue}</em>
            {isArticle && pub.venueDetails && <>, {pub.venueDetails}</>}
            {!isArticle && pub.location && <>, {pub.location}</>}
            {!isArticle && pub.date && <>, {pub.date}</>}
            .
          </>
        )
        return link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="block my-0 text-ink no-underline hover:underline">
            {cite}
          </a>
        ) : (
          <p className="my-0">{cite}</p>
        )
      })()}
      <p className="my-1 text-[15px] text-meta">
        {CATEGORY_LABEL[pub.category]}
        {' · '}
        <CopyBibtex pub={pub} />
      </p>
    </article>
  )
}

function YearGroup({ year, pubs }) {
  return (
    <section className="mt-10">
      <h2 className="my-2">{year}</h2>
      <hr className="my-2" />
      {pubs.map((pub) => (
        <PubItem key={pub.id} pub={pub} />
      ))}
    </section>
  )
}

// 저자/발명자 목록 — PI 이름은 굵게(논문 AuthorList 와 동일 규칙).
function NameList({ names }) {
  return (
    <>
      {names.map((n, i) => (
        <span key={`${n}-${i}`}>
          {PI_NAMES.includes(n) ? <strong>{n}</strong> : n}
          {i < names.length - 1 && ', '}
        </span>
      ))}
    </>
  )
}

function BookItem({ book }) {
  return (
    <article className="py-4 border-b border-rule last:border-b-0">
      <p className="my-0">
        <NameList names={book.authors} /> ({book.year}).{' '}
        <strong className="text-ink">{book.titleEn}</strong>
        {book.titleKo && <span className="text-muted"> ({book.titleKo})</span>}.{' '}
        <em>{book.publisherEn}</em>
        {book.publisherKo && <span className="text-muted"> ({book.publisherKo})</span>}
        {book.seriesEn && (
          <>
            , {book.seriesEn}
            {book.seriesKo && <span className="text-muted"> ({book.seriesKo})</span>}
          </>
        )}
        .
      </p>
      <p className="my-1 text-[15px] text-meta">
        Book
        {book.pages && <> · {book.pages} pp.</>}
        {book.isbn && <> · ISBN {book.isbn}</>}
        {book.date && <> · {book.date}</>}
      </p>
    </article>
  )
}

const PATENT_STATUS = {
  registered: { label: 'Registered', numberLabel: 'Reg.' },
  filed: { label: 'Filed', numberLabel: 'App.' },
}

function PatentItem({ patent }) {
  const status = PATENT_STATUS[patent.status] ?? PATENT_STATUS.filed
  return (
    <article className="py-4 border-b border-rule last:border-b-0">
      <p className="my-0">
        <NameList names={patent.inventors} /> ({patent.year}).{' '}
        <strong className="text-ink">{patent.titleKo}</strong>
        {patent.titleEn && (
          <>
            {' '}
            <span className="text-muted">({patent.titleEn})</span>
          </>
        )}
        . <em>{patent.assignee}</em>.
      </p>
      <p className="my-1 text-[15px] text-meta">
        <span
          className={`mr-2 rounded px-1.5 py-0.5 text-[13px] ${
            patent.status === 'registered'
              ? 'bg-brand-50 text-brand-800'
              : 'bg-beige-50 text-wgray-700'
          }`}
        >
          {status.label}
        </span>
        {status.numberLabel} {patent.number}
        {patent.date && <> · {patent.date}</>}
      </p>
    </article>
  )
}

function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`mr-6 text-[15px] ${
        active
          ? 'text-brand-700 underline underline-offset-[6px] decoration-[1.5px]'
          : 'text-muted hover:underline'
      }`}
    >
      {label} <span className="text-meta">({count})</span>
    </button>
  )
}

const TABS = ['Papers', 'Books', 'Patents']

export default function Publications() {
  const publicationsData = useLoaderData()
  const [activeTab, setActiveTab] = useState('Papers')

  const counts = useMemo(() => {
    const c = { article: 0, intl: 0, national: 0 }
    ;(publicationsData ?? []).forEach((p) => {
      if (p.category === 'article') c.article++
      else if (p.category === 'international-presentation') c.intl++
      else if (p.category === 'national-presentation') c.national++
    })
    return c
  }, [publicationsData])

  const papersCount = (publicationsData ?? []).length

  const grouped = useMemo(() => {
    const map = {}
    ;(publicationsData ?? []).forEach((p) => {
      if (!map[p.year]) map[p.year] = []
      map[p.year].push(p)
    })
    const order = {
      article: 0,
      'international-presentation': 1,
      'national-presentation': 2,
    }
    return Object.entries(map)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, pubs]) => ({
        year: Number(year),
        pubs: pubs.sort((a, b) => (order[a.category] ?? 9) - (order[b.category] ?? 9)),
      }))
  }, [publicationsData])

  const booksByYear = useMemo(
    () => [...BOOKS].sort((a, b) => b.year - a.year),
    [],
  )
  const patentsByYear = useMemo(
    () => [...PATENTS].sort((a, b) => b.year - a.year),
    [],
  )

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1>Publications</h1>
      <p className="text-muted">
        Peer-reviewed research, books, and patents from the PHI Lab spanning
        health informatics, clinical NLP, EHR data provenance, and pharmacovigilance.
      </p>

      <div className="mt-6 border-b border-rule pb-3">
        <TabButton
          label="Papers"
          count={papersCount}
          active={activeTab === 'Papers'}
          onClick={() => setActiveTab('Papers')}
        />
        <TabButton
          label="Books"
          count={BOOKS.length}
          active={activeTab === 'Books'}
          onClick={() => setActiveTab('Books')}
        />
        <TabButton
          label="Patents"
          count={PATENTS.length}
          active={activeTab === 'Patents'}
          onClick={() => setActiveTab('Patents')}
        />
      </div>

      {activeTab === 'Papers' && (
        <>
          <p className="mt-4 text-[15px] text-meta">
            {counts.article} articles, peer-reviewed · {counts.intl} international
            presentations · {counts.national} national presentations
          </p>
          {grouped.length > 0 ? (
            grouped.map(({ year, pubs }) => (
              <YearGroup key={year} year={year} pubs={pubs} />
            ))
          ) : (
            <p className="text-muted py-10">No entries found.</p>
          )}
        </>
      )}

      {activeTab === 'Books' && (
        <section className="mt-6">
          {booksByYear.length > 0 ? (
            booksByYear.map((book) => <BookItem key={book.id} book={book} />)
          ) : (
            <p className="text-muted py-10">No entries found.</p>
          )}
        </section>
      )}

      {activeTab === 'Patents' && (
        <section className="mt-6">
          {patentsByYear.length > 0 ? (
            patentsByYear.map((patent) => <PatentItem key={patent.id} patent={patent} />)
          ) : (
            <p className="text-muted py-10">No entries found.</p>
          )}
        </section>
      )}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useLoaderData } from 'react-router'
import { fetchPublications } from '../lib/publicData'

export async function loader() {
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
      <p className="my-0">
        <AuthorList authors={pub.authors} /> ({pub.year}).{' '}
        <strong className="text-ink">{pub.title}</strong>.{' '}
        <em>{pub.venue}</em>
        {isArticle && pub.venueDetails && <>, {pub.venueDetails}</>}
        {!isArticle && pub.location && <>, {pub.location}</>}
        {!isArticle && pub.date && <>, {pub.date}</>}
        .
      </p>
      <p className="my-1 text-[15px] text-meta">
        {CATEGORY_LABEL[pub.category]}
        {link && (
          <>
            {' · '}
            <a href={link} target="_blank" rel="noopener noreferrer">
              {pub.doi ? 'DOI' : 'Link'}
            </a>
          </>
        )}
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

export default function Publications() {
  const publicationsData = useLoaderData()

  const counts = useMemo(() => {
    const c = { article: 0, intl: 0, national: 0 }
    ;(publicationsData ?? []).forEach((p) => {
      if (p.category === 'article') c.article++
      else if (p.category === 'international-presentation') c.intl++
      else if (p.category === 'national-presentation') c.national++
    })
    return c
  }, [publicationsData])

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

  return (
    <div className="mx-auto max-w-[820px] px-6 py-12">
      <h1>Publications</h1>
      <p className="text-muted">
        Peer-reviewed research and conference presentations from the PHI Lab spanning
        health informatics, clinical NLP, EHR data provenance, and pharmacovigilance.
      </p>
      <p className="text-[15px] text-meta">
        {counts.article} articles, peer-reviewed · {counts.intl} international
        presentations · {counts.national} national presentations
      </p>

      {grouped.length > 0 ? (
        grouped.map(({ year, pubs }) => (
          <YearGroup key={year} year={year} pubs={pubs} />
        ))
      ) : (
        <p className="text-muted py-10">No entries found. Try adjusting your search.</p>
      )}
    </div>
  )
}

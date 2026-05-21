// DOI / BibTeX → publications row 변환

/** CrossRef public API 로 DOI 조회. */
export async function fetchByDoi(doi) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi.trim())}`
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`CrossRef ${res.status}`)
  const json = await res.json()
  const m = json.message
  const year = m.issued?.['date-parts']?.[0]?.[0] || m.published?.['date-parts']?.[0]?.[0]
  const date = (m.issued?.['date-parts']?.[0] || []).join('-')
  const authors = (m.author || []).map(a => ({
    name: [a.family, a.given?.[0] ? a.given.split(/\s+/).map(x => x[0]).join('') : null].filter(Boolean).join(' '),
    full_name: [a.given, a.family].filter(Boolean).join(' '),
  }))
  return {
    title: Array.isArray(m.title) ? m.title[0] : m.title,
    venue: Array.isArray(m['container-title']) ? m['container-title'][0] : m['container-title'],
    venue_details: [m.volume && `${m.volume}`, m.issue && `(${m.issue})`, m.page].filter(Boolean).join(''),
    year: Number(year),
    date,
    doi: m.DOI,
    url: m.URL,
    authors,
  }
}

/** 단순 BibTeX 파서. 일반적 필드만. */
export function parseBibtex(text) {
  // 첫 entry 만 처리
  const m = /@\w+\s*\{\s*([^,]+),([\s\S]+)\}\s*$/.exec(text.trim())
  if (!m) throw new Error('BibTeX 형식이 아닙니다')
  const body = m[2]
  const fields = {}
  // field = "value" 또는 field = {value} (브레이스 nesting 지원)
  const re = /(\w+)\s*=\s*(?:\{((?:[^{}]|\{[^{}]*\})*)\}|"([^"]*)")\s*,?/g
  let mm
  while ((mm = re.exec(body))) {
    fields[mm[1].toLowerCase()] = (mm[2] ?? mm[3]).replace(/\s+/g, ' ').trim()
  }
  const authors = (fields.author || '').split(/\s+and\s+/i).filter(Boolean).map(name => {
    // "Family, Given" → "Family G"
    let display = name
    if (name.includes(',')) {
      const [fam, giv] = name.split(',').map(s => s.trim())
      const initials = giv.split(/\s+/).map(p => p[0]).filter(Boolean).join('')
      display = `${fam} ${initials}`
    }
    return { name: display, full_name: name }
  })
  return {
    title: fields.title,
    venue: fields.journal || fields.booktitle,
    venue_details: [fields.volume, fields.number && `(${fields.number})`, fields.pages].filter(Boolean).join(''),
    year: fields.year ? Number(fields.year) : null,
    doi: fields.doi || null,
    url: fields.url || null,
    authors,
  }
}

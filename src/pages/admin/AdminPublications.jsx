import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchByDoi, parseBibtex } from '../../lib/publications-import'
import { PageHeader, Button, Table, Modal, Field, TextInput, TextArea, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

const CATEGORIES = [
  { value: 'article', label: 'Article' },
  { value: 'international-presentation', label: 'International presentation' },
  { value: 'national-presentation', label: 'National presentation' },
]

function emptyPub() {
  return {
    id: '', category: 'article', title: '', venue: null, venue_details: null,
    location: null, date: null, year: new Date().getFullYear(), doi: null, url: null,
    featured: false, display_order: 0,
    _authors: [],
  }
}

function slugFromTitle(t, year) {
  if (!t) return ''
  const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
  return year ? `${slug}-${year}` : slug
}

export default function AdminPublications() {
  const [rows, setRows] = useState([])
  const [authors, setAuthors] = useState([])
  const [tab, setTab] = useState('article')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [importMode, setImportMode] = useState(null)  // 'doi' | 'bibtex' | null
  const [importInput, setImportInput] = useState('')
  const [importing, setImporting] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

  async function load() {
    setLoading(true); setError(null)
    const [{ data: p, error: pErr }, { data: pa }, { data: a }] = await Promise.all([
      supabase.from('publications').select('*').order('year', { ascending: false }).order('display_order'),
      supabase.from('publication_authors').select('publication_id, author_id, position, is_pi, is_co_first, is_co_correspond').order('position'),
      supabase.from('authors').select('id, name, full_name, member_id').order('name'),
    ])
    if (pErr) { setError(pErr); setLoading(false); return }
    const byPub = new Map()
    for (const x of (pa || [])) {
      if (!byPub.has(x.publication_id)) byPub.set(x.publication_id, [])
      byPub.get(x.publication_id).push(x)
    }
    setRows((p || []).map(x => ({ ...x, _authors: byPub.get(x.id) || [] })))
    setAuthors(a || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = rows.filter(r => r.category === tab)
  const authorById = new Map(authors.map(a => [a.id, a]))

  async function save() {
    setError(null)
    try {
      const payload = {
        id: edit.id, category: edit.category, title: edit.title,
        venue: edit.venue, venue_details: edit.venue_details, location: edit.location,
        date: edit.date, year: Number(edit.year), doi: edit.doi, url: edit.url,
        featured: !!edit.featured, display_order: edit.display_order || 0,
      }
      if (!payload.id || !payload.title || !payload.category || !payload.year) throw new Error('id / title / category / year 필수')

      const op = isNew
        ? supabase.from('publications').insert(payload)
        : supabase.from('publications').update(payload).eq('id', payload.id)
      const { error: pErr } = await op
      if (pErr) throw pErr

      // authors: 이름 기준 lookup + 없으면 insert
      const authorRows = edit._authors  // [{ name, full_name, is_pi, is_co_first, is_co_correspond }]
      const newAuthors = []
      const resolvedIds = []
      for (const a of authorRows) {
        const existing = authors.find(x => x.name === a.name)
        if (existing) {
          resolvedIds.push(existing.id)
        } else {
          newAuthors.push({ name: a.name, full_name: a.full_name || null })
          resolvedIds.push(null)
        }
      }
      let inserted = []
      if (newAuthors.length) {
        const { data, error: aErr } = await supabase.from('authors').insert(newAuthors).select('id, name')
        if (aErr) throw aErr
        inserted = data
      }
      const finalIds = resolvedIds.map((id, i) => id ?? inserted.find(x => x.name === authorRows[i].name).id)

      // publication_authors 재구성
      await supabase.from('publication_authors').delete().eq('publication_id', payload.id)
      if (authorRows.length) {
        const paRows = authorRows.map((a, i) => ({
          publication_id: payload.id,
          author_id: finalIds[i],
          position: i,
          is_pi: !!a.is_pi,
          is_co_first: !!a.is_co_first,
          is_co_correspond: !!a.is_co_correspond,
        }))
        const { error: paErr } = await supabase.from('publication_authors').insert(paRows)
        if (paErr) throw paErr
      }
      setEdit(null); load()
    } catch (e) { setError(e) }
  }

  async function del(row) {
    if (!(await confirm(`출판물 "${row.title}" 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('publications').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  function openEdit(row) {
    setIsNew(false)
    const auths = row._authors.map(pa => {
      const a = authorById.get(pa.author_id)
      return {
        name: a?.name || '?',
        full_name: a?.full_name || '',
        is_pi: pa.is_pi, is_co_first: pa.is_co_first, is_co_correspond: pa.is_co_correspond,
      }
    })
    setEdit({ ...row, _authors: auths })
  }

  function openNew() {
    setIsNew(true)
    setEdit(emptyPub())
  }

  async function doImport() {
    setError(null); setImporting(true)
    try {
      const result = importMode === 'doi'
        ? await fetchByDoi(importInput)
        : parseBibtex(importInput)
      // 새 publication 으로 폼에 채움 — 사용자가 id 정해서 저장
      setImportMode(null); setImportInput('')
      setIsNew(true)
      setEdit({
        ...emptyPub(),
        id: slugFromTitle(result.title, result.year),
        category: 'article',
        title: result.title || '',
        venue: result.venue || null,
        venue_details: result.venue_details || null,
        year: result.year || new Date().getFullYear(),
        date: result.date || null,
        doi: result.doi || null,
        url: result.url || null,
        _authors: (result.authors || []).map(a => ({ ...a, is_pi: false, is_co_first: false, is_co_correspond: false })),
      })
    } catch (e) {
      setError(e)
    } finally {
      setImporting(false)
    }
  }

  function moveAuthor(i, dir) {
    const next = [...edit._authors]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setEdit({ ...edit, _authors: next })
  }
  function removeAuthor(i) {
    const next = edit._authors.filter((_, k) => k !== i)
    setEdit({ ...edit, _authors: next })
  }
  function addAuthor() {
    setEdit({ ...edit, _authors: [...edit._authors, { name: '', full_name: '', is_pi: false, is_co_first: false, is_co_correspond: false }] })
  }

  return (
    <div>
      <PageHeader
        title="Publications"
        subtitle={`${rows.length}개 (authors ${authors.length})`}
        actions={
          <>
            {CATEGORIES.map(c => (
              <Button key={c.value} onClick={() => setTab(c.value)} primary={tab === c.value}>
                {c.label} ({rows.filter(r => r.category === c.value).length})
              </Button>
            ))}
            <Button onClick={() => { setImportMode('doi'); setImportInput('') }}>DOI import</Button>
            <Button onClick={() => { setImportMode('bibtex'); setImportInput('') }}>BibTeX import</Button>
            {deleteModeToggle}
            <Button primary onClick={openNew}>+ 새 출판물</Button>
          </>
        }
      />
      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          columns={[
            { key: 'year', label: 'Year' },
            { key: 'title', label: 'Title', render: r => <>
              <div style={{ fontWeight: 500 }}>{r.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>
                {r._authors.slice(0,5).map(pa => authorById.get(pa.author_id)?.name).join(', ')}{r._authors.length > 5 ? ` (+${r._authors.length - 5})` : ''}
              </div>
            </> },
            { key: 'venue', label: 'Venue', render: r => <>{r.venue}{r.venue_details ? <span style={{ color: '#666' }}> · {r.venue_details}</span> : null}</> },
            { key: 'doi', label: 'DOI', render: r => r.doi ? <code style={{ fontSize: '0.7rem' }}>{r.doi}</code> : '' },
            {
              key: 'actions', label: '', render: r => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button onClick={() => openEdit(r)}>편집</Button>
                  <Button danger disabled={!deleteMode} onClick={() => del(r)}>삭제</Button>
                </div>
              )
            },
          ]}
          rows={filtered}
        />
      )}

      {/* import modal */}
      <Modal
        open={!!importMode}
        onClose={() => setImportMode(null)}
        title={importMode === 'doi' ? 'DOI import' : 'BibTeX import'}
        footer={<><Button onClick={() => setImportMode(null)}>취소</Button><Button primary disabled={!importInput || importing} onClick={doImport}>{importing ? '가져오는 중…' : '가져오기'}</Button></>}
      >
        {importMode === 'doi' ? (
          <Field label="DOI" hint="예: 10.1234/jmir.5678">
            <TextInput value={importInput} onChange={e => setImportInput(e.target.value)} placeholder="10.xxxx/..." />
          </Field>
        ) : (
          <Field label="BibTeX">
            <TextArea rows={10} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }} value={importInput} onChange={e => setImportInput(e.target.value)} />
          </Field>
        )}
        <div style={{ fontSize: '0.75rem', color: '#666' }}>
          가져온 결과는 편집 폼에 자동으로 채워집니다. ID/카테고리/저자 PI 체크 등을 확인 후 저장하세요.
        </div>
      </Modal>

      {/* edit modal */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit ? (isNew ? '새 출판물' : `Edit: ${edit.id}`) : ''}
        footer={<><Button onClick={() => setEdit(null)}>취소</Button><Button primary onClick={save}>저장</Button></>}
      >
        {edit && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
            <Field label="ID (slug)"><TextInput value={edit.id} disabled={!isNew} onChange={e => setEdit({...edit, id: e.target.value})} /></Field>
            <Field label="Category"><Select value={edit.category} options={CATEGORIES} onChange={e => setEdit({...edit, category: e.target.value})} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Title"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value})} /></Field>
            </div>
            <Field label="Venue"><TextInput value={edit.venue||''} onChange={e => setEdit({...edit, venue: e.target.value || null})} /></Field>
            <Field label="Venue details"><TextInput value={edit.venue_details||''} onChange={e => setEdit({...edit, venue_details: e.target.value || null})} /></Field>
            <Field label="Year"><TextInput type="number" value={edit.year||0} onChange={e => setEdit({...edit, year: Number(e.target.value)||0})} /></Field>
            <Field label="Date (원문)"><TextInput value={edit.date||''} onChange={e => setEdit({...edit, date: e.target.value || null})} /></Field>
            <Field label="Location"><TextInput value={edit.location||''} onChange={e => setEdit({...edit, location: e.target.value || null})} /></Field>
            <Field label="DOI"><TextInput value={edit.doi||''} onChange={e => setEdit({...edit, doi: e.target.value || null})} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="URL"><TextInput value={edit.url||''} onChange={e => setEdit({...edit, url: e.target.value || null})} /></Field>
            </div>
            <Field label="Featured"><Select value={edit.featured?'true':'false'} options={['true','false']} onChange={e => setEdit({...edit, featured: e.target.value==='true'})} /></Field>
            <Field label="Display order"><TextInput type="number" value={edit.display_order||0} onChange={e => setEdit({...edit, display_order: Number(e.target.value)||0})} /></Field>

            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '0.875rem' }}>Authors ({edit._authors.length})</strong>
                <Button onClick={addAuthor}>+ 저자 추가</Button>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                {edit._authors.map((a, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 1fr auto auto auto auto auto', gap: '0.25rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{i + 1}</span>
                    <TextInput placeholder="name (Kim HJ)" value={a.name} onChange={e => { const next = [...edit._authors]; next[i] = {...a, name: e.target.value}; setEdit({...edit, _authors: next}) }} />
                    <TextInput placeholder="full name (Hyo Jung Kim)" value={a.full_name||''} onChange={e => { const next = [...edit._authors]; next[i] = {...a, full_name: e.target.value}; setEdit({...edit, _authors: next}) }} />
                    <label style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input type="checkbox" checked={!!a.is_pi} onChange={e => { const next = [...edit._authors]; next[i] = {...a, is_pi: e.target.checked}; setEdit({...edit, _authors: next}) }} />PI
                    </label>
                    <label style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input type="checkbox" checked={!!a.is_co_first} onChange={e => { const next = [...edit._authors]; next[i] = {...a, is_co_first: e.target.checked}; setEdit({...edit, _authors: next}) }} />Co-1st
                    </label>
                    <label style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input type="checkbox" checked={!!a.is_co_correspond} onChange={e => { const next = [...edit._authors]; next[i] = {...a, is_co_correspond: e.target.checked}; setEdit({...edit, _authors: next}) }} />Co-corr
                    </label>
                    <Button onClick={() => moveAuthor(i, -1)} disabled={i === 0}>↑</Button>
                    <Button onClick={() => moveAuthor(i, 1)} disabled={i === edit._authors.length - 1}>↓</Button>
                    <Button danger onClick={() => removeAuthor(i)}>×</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

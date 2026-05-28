import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Table, Modal, Field, TextInput, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'
import RichTextEditor from '../../components/admin/RichTextEditor'

const STATUSES = ['draft', 'published']

const SUGGESTED_SLUGS = ['home', 'about', 'professor']

function emptyPage(email) {
  return {
    slug: '', title: null, body_json: { type: 'doc', content: [{ type: 'paragraph' }] },
    status: 'draft', updated_by: email,
  }
}

export default function AdminPages() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

  async function load() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from('pages').select('*').order('slug')
    if (error) setError(error)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    setError(null)
    try {
      if (!edit.slug) throw new Error('slug 필수')
      const payload = {
        slug: edit.slug.trim().toLowerCase(),
        title: edit.title || null,
        body_json: edit.body_json || null,
        status: edit.status,
        updated_by: user.email,
        published_at: edit.status === 'published' && !edit.published_at ? new Date().toISOString() : edit.published_at,
      }
      const op = isNew
        ? supabase.from('pages').insert(payload)
        : supabase.from('pages').update(payload).eq('slug', edit.slug)
      const { error } = await op
      if (error) throw error
      setEdit(null); load()
    } catch (e) { setError(e) }
  }

  async function del(row) {
    if (!(await confirm(`페이지 "${row.slug}" 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('pages').delete().eq('slug', row.slug)
    if (error) { setError(error); return }
    load()
  }

  function quickNew(slug) {
    setIsNew(true)
    setEdit({ ...emptyPage(user.email), slug })
  }

  const existingSlugs = new Set(rows.map(r => r.slug))
  const suggestNew = SUGGESTED_SLUGS.filter(s => !existingSlugs.has(s))

  return (
    <div>
      <PageHeader
        title="Pages"
        subtitle={`${rows.length}개 · 공개 페이지 본문 (about/home/professor 등)`}
        actions={<>{deleteModeToggle}<Button primary onClick={() => { setIsNew(true); setEdit(emptyPage(user.email)) }}>+ 새 페이지</Button></>}
      />
      <ErrorBanner error={error} />

      {suggestNew.length > 0 && (
        <div style={{ background: '#f6f6f6', padding: '0.5rem 0.75rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          제안 slug:{' '}
          {suggestNew.map(s => (
            <button key={s} onClick={() => quickNew(s)} style={{ background: '#fff', border: '1px solid #ccc', padding: '0.2rem 0.5rem', margin: '0 0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}>
              + {s}
            </button>
          ))}
        </div>
      )}

      {loading ? <div>로딩 중…</div> : (
        <Table
          columns={[
            { key: 'slug', label: 'Slug', render: r => <code>{r.slug}</code> },
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status', render: r => r.status === 'published'
              ? <span style={{ color: '#080' }}>● {r.status}</span>
              : <span style={{ color: '#888' }}>○ {r.status}</span> },
            { key: 'updated_by', label: 'Updated by' },
            { key: 'updated_at', label: 'Updated at', render: r => r.updated_at ? new Date(r.updated_at).toISOString().slice(0,10) : '' },
            {
              key: 'actions', label: '', render: r => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button onClick={() => { setIsNew(false); setEdit({ ...r }) }}>편집</Button>
                  <Button danger disabled={!deleteMode} onClick={() => del(r)}>삭제</Button>
                </div>
              )
            },
          ]}
          rows={rows}
        />
      )}

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit ? (isNew ? '새 페이지' : `Edit: ${edit.slug}`) : ''}
        footer={<><Button onClick={() => setEdit(null)}>취소</Button><Button primary onClick={save}>저장</Button></>}
      >
        {edit && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem 1rem' }}>
              <Field label="Slug" hint="URL 마지막 segment. 변경 불가."><TextInput value={edit.slug} disabled={!isNew} onChange={e => setEdit({...edit, slug: e.target.value})} /></Field>
              <Field label="Title (옵션)"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value || null})} /></Field>
            </div>
            <Field label="Body">
              <RichTextEditor
                value={edit.body_json}
                onChange={(json) => setEdit({...edit, body_json: json})}
                bucket="page-images"
                entityKey={edit.slug || '_temp'}
              />
            </Field>
            <Field label="Status">
              <Select value={edit.status} options={STATUSES} onChange={e => setEdit({...edit, status: e.target.value})} />
            </Field>
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

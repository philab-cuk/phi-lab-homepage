import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Table, Modal, Field, TextInput, Select, ErrorBanner, useConfirm } from '../../components/admin/AdminUI'
import RichTextEditor from '../../components/admin/RichTextEditor'

const STATUSES = ['draft', 'published']

function emptyPost(email) {
  return {
    title: '', body_json: { type: 'doc', content: [{ type: 'paragraph' }] },
    status: 'draft', author_email: email,
  }
}

export default function AdminPosts() {
  const { user, isEditor } = useAuth()
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState(isEditor ? 'all' : 'mine')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [confirm, confirmUI] = useConfirm()

  async function load() {
    setLoading(true); setError(null)
    let q = supabase.from('posts').select('*').order('created_at', { ascending: false })
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    if (filter === 'mine') q = q.eq('author_email', user.email)
    const { data, error } = await q
    if (error) setError(error)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [filter, statusFilter, user?.email])

  async function save() {
    setError(null)
    try {
      if (!edit.title) throw new Error('title 필수')
      const payload = {
        title: edit.title,
        body_json: edit.body_json || null,
        status: edit.status,
        author_email: edit.author_email,
        published_at: edit.status === 'published' && !edit.published_at ? new Date().toISOString() : edit.published_at,
      }
      const op = isNew
        ? supabase.from('posts').insert(payload)
        : supabase.from('posts').update(payload).eq('id', edit.id)
      const { error } = await op
      if (error) throw error
      setEdit(null); load()
    } catch (e) { setError(e) }
  }

  async function del(row) {
    if (!(await confirm(`게시글 "${row.title}" 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('posts').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  return (
    <div>
      <PageHeader
        title="Posts"
        subtitle={`${rows.length}건`}
        actions={
          <>
            {isEditor && (<>
              <Button onClick={() => setFilter('mine')} primary={filter==='mine'}>내 글</Button>
              <Button onClick={() => setFilter('all')} primary={filter==='all'}>전체</Button>
            </>)}
            <Button onClick={() => setStatusFilter('all')} primary={statusFilter==='all'}>All</Button>
            <Button onClick={() => setStatusFilter('published')} primary={statusFilter==='published'}>Published</Button>
            <Button onClick={() => setStatusFilter('draft')} primary={statusFilter==='draft'}>Draft</Button>
            <Button primary onClick={() => { setIsNew(true); setEdit(emptyPost(user.email)) }}>+ 새 글</Button>
          </>
        }
      />
      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          columns={[
            { key: 'id', label: 'ID', render: r => <code style={{ fontSize: '0.7rem' }}>{r.id}</code> },
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status', render: r => r.status === 'published'
              ? <span style={{ color: '#080' }}>● {r.status}</span>
              : <span style={{ color: '#888' }}>○ {r.status}</span> },
            { key: 'author_email', label: 'Author' },
            { key: 'published_at', label: 'Published', render: r => r.published_at ? new Date(r.published_at).toISOString().slice(0,10) : '' },
            {
              key: 'actions', label: '', render: r => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button onClick={() => { setIsNew(false); setEdit({ ...r }) }}>편집</Button>
                  <Button danger onClick={() => del(r)}>삭제</Button>
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
        title={edit ? (isNew ? '새 글' : `Edit: ${edit.id}`) : ''}
        footer={<><Button onClick={() => setEdit(null)}>취소</Button><Button primary onClick={save}>저장</Button></>}
      >
        {edit && (
          <div>
            <Field label="Title"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value})} /></Field>
            <Field label="Body">
              <RichTextEditor
                value={edit.body_json}
                onChange={(json) => setEdit({...edit, body_json: json})}
                bucket="post-images"
                entityKey={edit.id || '_temp'}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
              <Field label="Status"><Select value={edit.status} options={STATUSES} onChange={e => setEdit({...edit, status: e.target.value})} /></Field>
              <Field label="Author email" hint="본인 이메일이 아니면 RLS 차단"><TextInput value={edit.author_email} onChange={e => setEdit({...edit, author_email: e.target.value})} disabled={!isEditor} /></Field>
            </div>
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

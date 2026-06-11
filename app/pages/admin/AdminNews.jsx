import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Table, Modal, Field, TextInput, TextArea, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'
import NewsCard from '../../components/NewsCard'

// DB 행(snake_case, images=[{url,path}]) → 공개 카드 입력(camelCase, url 배열)
function toCardItem(r) {
  return {
    title: r.title,
    bodyShort: r.body_short,
    publishedAt: r.published_at,
    images: (r.images || []).map((i) => (typeof i === 'string' ? i : i?.url)).filter(Boolean),
  }
}

const STATUSES = ['draft', 'published']

function emptyNews(email) {
  return {
    title: '', body_short: null, images: [],
    status: 'draft', author_email: email,
  }
}

export default function AdminNews() {
  const { user, isEditor } = useAuth()
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('mine')  // 'mine' | 'all' (editor 전용)
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [preview, setPreview] = useState(null) // 클릭한 행을 공개 카드 모양으로 미리보기
  const [uploading, setUploading] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()
  const fileInputRef = useRef(null)

  async function load() {
    setLoading(true); setError(null)
    let q = supabase.from('news').select('*').order('created_at', { ascending: false })
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
      const payload = {
        title: edit.title,
        body_short: edit.body_short || null,
        images: edit.images || [],
        status: edit.status,
        author_email: edit.author_email,
        published_at: edit.status === 'published' && !edit.published_at ? new Date().toISOString() : edit.published_at,
      }
      if (!payload.title) throw new Error('title 필수')
      const op = isNew
        ? supabase.from('news').insert(payload)
        : supabase.from('news').update(payload).eq('id', edit.id)
      const { error } = await op
      if (error) throw error
      setEdit(null); load()
    } catch (e) { setError(e) }
  }

  async function del(row) {
    if (!(await confirm(`뉴스 "${row.title}" 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('news').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  async function handleImageUpload(file) {
    setError(null)
    setUploading(true)
    try {
      const entityKey = edit.id || '_temp'
      const ext = (file.name.split('.').pop() || 'png').toLowerCase()
      if (!['jpg','jpeg','png','webp'].includes(ext)) throw new Error('jpg/png/webp 만 허용')
      if (file.size > 10 * 1024 * 1024) throw new Error('10MB 초과')
      const path = `${entityKey}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage.from('news-images').upload(path, file, { contentType: file.type })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('news-images').getPublicUrl(path)
      setEdit({ ...edit, images: [...(edit.images || []), { url: data.publicUrl, path }] })
    } catch (e) { setError(e) }
    finally { setUploading(false) }
  }

  function removeImage(idx) {
    const next = (edit.images || []).filter((_, i) => i !== idx)
    setEdit({ ...edit, images: next })
  }

  function moveImage(idx, dir) {
    const next = [...(edit.images || [])]
    const j = idx + dir
    if (j < 0 || j >= next.length) return
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setEdit({ ...edit, images: next })
  }

  return (
    <div>
      <PageHeader
        title="News"
        subtitle={`${rows.length}건`}
        actions={
          <>
            {isEditor && (
              <>
                <Button onClick={() => setFilter('mine')} primary={filter==='mine'}>내 글</Button>
                <Button onClick={() => setFilter('all')} primary={filter==='all'}>전체</Button>
              </>
            )}
            <Button onClick={() => setStatusFilter('all')} primary={statusFilter==='all'}>All</Button>
            <Button onClick={() => setStatusFilter('published')} primary={statusFilter==='published'}>Published</Button>
            <Button onClick={() => setStatusFilter('draft')} primary={statusFilter==='draft'}>Draft</Button>
            {deleteModeToggle}
            <Button primary onClick={() => { setIsNew(true); setEdit(emptyNews(user.email)) }}>+ 새 뉴스</Button>
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
            { key: 'images', label: '#img', render: r => (r.images || []).length },
            { key: 'published_at', label: 'Published', render: r => r.published_at ? new Date(r.published_at).toISOString().slice(0,10) : '' },
            {
              key: 'actions', label: '', render: r => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button onClick={() => { setIsNew(false); setEdit({ ...r, images: r.images || [] }) }}>편집</Button>
                  <Button danger disabled={!deleteMode} onClick={() => del(r)}>삭제</Button>
                </div>
              )
            },
          ]}
          rows={rows}
          onRowClick={(r) => setPreview(r)}
        />
      )}

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit ? (isNew ? '새 뉴스' : `Edit: ${edit.id}`) : ''}
        footer={<><Button onClick={() => setEdit(null)}>취소</Button><Button primary onClick={save}>저장</Button></>}
      >
        {edit && (
          <div>
            <Field label="Title"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value})} /></Field>
            <Field label="Body (plain text, 짧게)"><TextArea rows={4} value={edit.body_short||''} onChange={e => setEdit({...edit, body_short: e.target.value || null})} /></Field>

            <Field label={`Images (${(edit.images||[]).length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {(edit.images || []).map((img, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f6f6f6', padding: '0.25rem' }}>
                    <img src={img.url} alt="" style={{ width: 48, height: 48, objectFit: 'cover' }} />
                    <code style={{ flex: 1, fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.path || img.url}</code>
                    <Button onClick={() => moveImage(i, -1)} disabled={i===0}>↑</Button>
                    <Button onClick={() => moveImage(i, 1)} disabled={i===edit.images.length-1}>↓</Button>
                    <Button danger onClick={() => removeImage(i)}>×</Button>
                  </div>
                ))}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => {
                const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''
              }} />
              <div style={{ marginTop: '0.5rem' }}>
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? '업로드 중…' : '+ 이미지 추가'}
                </Button>
              </div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
              <Field label="Status"><Select value={edit.status} options={STATUSES} onChange={e => setEdit({...edit, status: e.target.value})} /></Field>
              <Field label="Author email" hint="본인 이메일이 아니면 RLS 로 차단됩니다."><TextInput value={edit.author_email} onChange={e => setEdit({...edit, author_email: e.target.value})} disabled={!isEditor} /></Field>
            </div>
          </div>
        )}
      </Modal>

      {/* 미리보기 — 공개 News 페이지와 같은 NewsCard 로 렌더 */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="미리보기"
        footer={<Button onClick={() => setPreview(null)}>닫기</Button>}
      >
        {preview && (
          <div style={{ maxWidth: 640 }}>
            {preview.status === 'draft' && (
              <div style={{ background: '#fff8e1', border: '1px solid #e6c656', color: '#7a5c00', padding: '0.4rem 0.6rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                draft — 공개 페이지에는 아직 안 보입니다. 발행(published)하면 이 모양으로 나옵니다.
              </div>
            )}
            <NewsCard item={toCardItem(preview)} />
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

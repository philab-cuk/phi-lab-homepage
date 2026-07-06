import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Table, Modal, Field, TextInput, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'
import BlockNoteEditor from '../../components/admin/BlockNoteEditor'
import PostBody from '../../components/PostBody'
import { formatNewsDate } from '../../components/NewsCard'

const STATUSES = [{ value: 'draft', label: '초안' }, { value: 'published', label: '발행' }]

// body_json 은 BlockNote 블록 배열. null 이면 에디터가 빈 문서로 시작.
// (옛 TipTap {type:'doc'} 형식은 폐기 — Array.isArray 로 구분된다)
function emptyPost(email) {
  return {
    title: '', body_json: null,
    status: 'draft', author_email: email, pinned: false,
  }
}

export default function AdminPosts() {
  const { user, isEditor, profile } = useAuth()
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState(isEditor ? 'all' : 'mine')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [editing, setEditing] = useState(false) // 한 모달 안에서 보기(false)/편집(true) 전환
  const [original, setOriginal] = useState(null) // 편집 취소 시 되돌릴 원본 스냅샷
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

  function openView(row) { setIsNew(false); setEditing(false); setOriginal({ ...row }); setEdit({ ...row }) }
  function openEdit(row) { setIsNew(false); setEditing(true); setOriginal({ ...row }); setEdit({ ...row }) }
  function openNew() { setIsNew(true); setEditing(true); setOriginal(null); setEdit(emptyPost(user.email)) }
  function closeModal() { setEdit(null); setEditing(false) }
  // 편집 취소: 새 글이면 닫고, 기존 글이면 미저장 변경 버리고 보기 모드로 복귀
  function cancelEdit() { if (isNew) closeModal(); else { setEdit(original); setEditing(false) } }

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
      // 작성자 표시이름 채우기(공개 목록용 — anon 이 admin_users 못 읽으므로 복사)
      let author_name
      if (edit.author_email === user.email) author_name = profile?.display_name || edit.author_email
      else {
        const { data: au } = await supabase.from('admin_users').select('display_name').eq('email', edit.author_email).maybeSingle()
        author_name = au?.display_name || edit.author_email
      }
      const payload = {
        title: edit.title,
        body_json: edit.body_json || null,
        status: edit.status,
        author_email: edit.author_email,
        author_name,
        pinned: !!edit.pinned,
        published_at: edit.status === 'published' && !edit.published_at ? new Date().toISOString() : edit.published_at,
      }
      const op = isNew
        ? supabase.from('posts').insert(payload)
        : supabase.from('posts').update(payload).eq('id', edit.id)
      const { error } = await op
      if (error) throw error
      closeModal(); load()
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
            <Button onClick={() => setStatusFilter('all')} primary={statusFilter==='all'}>전체</Button>
            <Button onClick={() => setStatusFilter('published')} primary={statusFilter==='published'}>발행</Button>
            <Button onClick={() => setStatusFilter('draft')} primary={statusFilter==='draft'}>초안</Button>
            {deleteModeToggle}
            <Button primary onClick={openNew}>+ 새 글</Button>
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
                  <Button onClick={() => openEdit(r)}>편집</Button>
                  <Button danger disabled={!deleteMode} onClick={() => del(r)}>삭제</Button>
                </div>
              )
            },
          ]}
          rows={rows}
          onRowClick={openView}
        />
      )}

      {/* 보기/편집 통합 모달 — 기본은 보기(메타+본문 렌더), '편집하기' 누르면 편집 폼 */}
      <Modal
        open={!!edit}
        onClose={closeModal}
        width={920}
        fixedHeight
        title={editing ? (isNew ? '새 글' : `Edit: ${edit?.id}`) : '미리보기'}
        mode={editing ? (isNew ? 'new' : 'edit') : 'view'}
        headerActions={editing
          ? <><Button primary onClick={save}>저장</Button><Button onClick={cancelEdit}>취소</Button></>
          : <><Button primary onClick={() => setEditing(true)}>편집하기</Button><Button onClick={closeModal}>닫기</Button></>}
      >
        {edit && (editing ? (
          <div>
            {/* 발행 설정(메타) — 본문이 아니라 publishing 정보라 제목 위에 모은다. */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem 1rem', background: '#f7f7f7', padding: '0.6rem 0.75rem', borderRadius: 4, marginBottom: '0.9rem' }}>
              <Field label="상태"><Select value={edit.status} options={STATUSES} onChange={e => setEdit({...edit, status: e.target.value})} /></Field>
              <Field label="공지 고정" hint="켜면 목록 맨 위 Notice 로 고정.">
                <Select value={edit.pinned ? 'true' : 'false'} options={[{value:'false',label:'일반'},{value:'true',label:'공지(Notice)'}]} onChange={e => setEdit({...edit, pinned: e.target.value === 'true'})} />
              </Field>
              <Field label="Author email" hint="본인 이메일이 아니면 RLS 차단"><TextInput value={edit.author_email} onChange={e => setEdit({...edit, author_email: e.target.value})} disabled={!isEditor} /></Field>
            </div>

            <Field label="Title"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value})} /></Field>
            {/* Body 는 Field(label 래퍼)를 쓰면 안 됨 — label 이 contenteditable 의
                클릭 포커스를 가로채 타이핑이 안 된다(Vimium 등 키보드 확장 발동). */}
            <div style={{ marginBottom: '0.6rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#444', marginBottom: '0.2rem' }}>Body</span>
              <BlockNoteEditor
                value={edit.body_json}
                onChange={(blocks) => setEdit({...edit, body_json: blocks})}
                entityKey={edit.id || '_temp'}
              />
              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>
                {"'/' 를 입력하면 블록 메뉴(제목·목록·이미지 등)가 열립니다."}
              </div>
            </div>
          </div>
        ) : (
          // 보기 모드 — 메타 / 제목 / 본문을 시각적으로 분리
          <div style={{ maxWidth: 772, margin: '0 auto' }}>
            {edit.status === 'draft' && (
              <div style={{ background: '#fff8e1', border: '1px solid #e6c656', color: '#7a5c00', padding: '0.4rem 0.6rem', fontSize: '0.8rem', marginBottom: '0.8rem', borderRadius: 4 }}>
                초안 — 공개 페이지에는 아직 안 보입니다. 발행하면 이 모양으로 나옵니다.
              </div>
            )}
            {/* 헤더(메타 + 제목)를 한 묶음으로, 본문과는 구분선으로 분리 */}
            <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem', marginBottom: '1.4rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', color: '#999', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                <span style={{ display: 'inline-block', padding: '0.1rem 0.55rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: edit.status === 'published' ? '#e6f4ea' : '#f0f0f0', color: edit.status === 'published' ? '#1a7f37' : '#777' }}>
                  {edit.status === 'published' ? '발행' : '초안'}
                </span>
                {edit.pinned && <span style={{ display: 'inline-block', padding: '0.1rem 0.55rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: '#fdecea', color: '#c0392b' }}>공지</span>}
                <span>{formatNewsDate(edit.published_at) || '—'}</span>
                <span style={{ color: '#ccc' }}>·</span>
                <span>{edit.author_name || edit.author_email || '—'}</span>
                <span style={{ color: '#ccc' }}>·</span>
                <span>조회 {edit.views ?? 0}</span>
              </div>
              <h1 style={{ margin: 0, fontSize: '1.7rem', lineHeight: 1.3 }}>{edit.title}</h1>
            </div>
            <PostBody json={edit.body_json} />
          </div>
        ))}
      </Modal>
      {confirmUI}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Table, Modal, Field, TextInput, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

// Gallery(Lab Life) 관리 — 사진 업로드 + 캡션·앨범·촬영일·순서. News 패턴 기반.
function emptyItem(email) {
  return { image_url: '', caption: '', album: '', taken_on: '', display_order: 0, created_by: email }
}

function dateToInput(v) {
  return v ? String(v).slice(0, 10) : ''
}

export default function AdminGallery() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [albumFilter, setAlbumFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)   // 저장 시 업로드할 파일
  const [previewUrl, setPreviewUrl] = useState(null)     // 로컬 미리보기(objectURL)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

  function openNew() { setIsNew(true); setPendingFile(null); setPreviewUrl(null); setEdit(emptyItem(user.email)) }
  function openEdit(row) { setIsNew(false); setPendingFile(null); setPreviewUrl(null); setEdit({ ...row }) }
  function closeModal() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setEdit(null); setPendingFile(null); setPreviewUrl(null)
  }
  function onSelectFile(file) {
    if (!file) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // 전체를 한 번만 불러오고 필터는 클라이언트에서 — 앨범 목록이 필터에 따라
  // 줄어드는 문제를 피하고, 소량 데이터라 성능 부담도 없다.
  async function load() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from('gallery').select('*')
      .order('taken_on', { ascending: false, nullsFirst: false })
      .order('display_order', { ascending: true })
    if (error) setError(error)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  // 앨범 목록·필터는 전체 rows 기준. 앨범이 많아져도 드롭다운이라 공간 일정.
  const albums = [...new Set(rows.map((r) => r.album).filter(Boolean))].sort()
  const hasUnfiled = rows.some((r) => !r.album)
  const visibleRows =
    albumFilter === 'all' ? rows
    : albumFilter === '(none)' ? rows.filter((r) => !r.album)
    : rows.filter((r) => r.album === albumFilter)

  async function uploadImage() {
    const ext = (pendingFile.name.split('.').pop() || 'jpg').toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error('jpg/png/webp 만 허용')
    if (pendingFile.size > 10 * 1024 * 1024) throw new Error('10MB 초과')
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage.from('gallery-images')
      .upload(path, pendingFile, { contentType: pendingFile.type })
    if (upErr) throw new Error('업로드 실패: ' + upErr.message)
    const { data } = supabase.storage.from('gallery-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function save() {
    if (savingRef.current) return
    if (isNew && !pendingFile) { setError(new Error('사진을 선택하세요')); return }
    savingRef.current = true
    setSaving(true); setError(null)
    try {
      let image_url = edit.image_url
      if (pendingFile) image_url = await uploadImage()

      const payload = {
        image_url,
        caption: edit.caption || null,
        album: edit.album?.trim() || null,
        taken_on: edit.taken_on || null,
        display_order: Number(edit.display_order) || 0,
      }
      if (isNew) {
        const { error } = await supabase.from('gallery').insert({ ...payload, created_by: user.email })
        if (error) throw error
      } else {
        const { error } = await supabase.from('gallery').update(payload).eq('id', edit.id)
        if (error) throw error
      }
      closeModal(); load()
    } catch (e) { setError(e) } finally { savingRef.current = false; setSaving(false) }
  }

  async function del(row) {
    if (!(await confirm('이 사진을 삭제하시겠습니까?'))) return
    const { error } = await supabase.from('gallery').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle={albumFilter === 'all' ? `${rows.length}장` : `${visibleRows.length}장 / 전체 ${rows.length}`}
        actions={
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#888' }}>앨범</span>
              <Select
                value={albumFilter}
                onChange={(e) => setAlbumFilter(e.target.value)}
                options={[
                  { value: 'all', label: `전체 (${rows.length})` },
                  ...(hasUnfiled ? [{ value: '(none)', label: '(미분류)' }] : []),
                  ...albums.map((a) => ({ value: a, label: a })),
                ]}
                style={{ width: 'auto', minWidth: 150 }}
              />
            </span>
            {deleteModeToggle}
            <Button primary onClick={openNew}>+ 새 사진</Button>
          </>
        }
      />
      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          columns={[
            { key: 'thumb', label: '', render: r => (
              <img src={r.image_url} alt="" style={{ width: 64, height: 48, objectFit: 'cover', border: '1px solid #ddd', borderRadius: 3 }} />
            ) },
            { key: 'caption', label: 'Caption', render: r => r.caption || <span style={{ color: '#bbb' }}>—</span> },
            { key: 'album', label: 'Album', render: r => r.album || <span style={{ color: '#bbb' }}>—</span> },
            { key: 'taken_on', label: 'Date', render: r => r.taken_on || '' },
            { key: 'display_order', label: '순서' },
            { key: 'actions', label: '', render: r => (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button onClick={() => openEdit(r)}>편집</Button>
                <Button danger disabled={!deleteMode} onClick={() => del(r)}>삭제</Button>
              </div>
            ) },
          ]}
          rows={visibleRows}
          onRowClick={openEdit}
        />
      )}

      <Modal
        open={!!edit}
        onClose={closeModal}
        width={620}
        title={isNew ? '새 사진' : '사진 편집'}
        mode={isNew ? 'new' : 'edit'}
        headerActions={
          <>
            <Button primary onClick={save} disabled={saving}>{saving ? '저장 중…' : '저장'}</Button>
            <Button onClick={closeModal} disabled={saving}>취소</Button>
          </>
        }
      >
        {edit && (
          <div>
            <Field label="사진" hint="jpg/png/webp, 최대 10MB">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {(previewUrl || edit.image_url) && (
                  <img src={previewUrl || edit.image_url} alt="" style={{ width: 96, height: 72, objectFit: 'cover', border: '1px solid #ccc', borderRadius: 3, flexShrink: 0 }} />
                )}
                <label style={{ display: 'inline-block', fontSize: '0.85rem', cursor: 'pointer', color: '#fff', background: '#222', border: '1px solid #000', padding: '0.4rem 0.8rem', borderRadius: 3 }}>
                  {(previewUrl || edit.image_url) ? '사진 변경' : '＋ 사진 선택'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                    onChange={(e) => { onSelectFile(e.target.files?.[0]); e.target.value = '' }} />
                </label>
                {pendingFile && <span style={{ fontSize: '0.75rem', color: '#888' }}>저장 시 업로드 예정</span>}
              </div>
            </Field>

            <Field label="Caption" hint="사진 아래 표시(선택)">
              <TextInput value={edit.caption || ''} onChange={e => setEdit({ ...edit, caption: e.target.value })} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
              <Field label="Album" hint="예: 2026 MT (비우면 'Lab Life')">
                <TextInput value={edit.album || ''} onChange={e => setEdit({ ...edit, album: e.target.value })} />
              </Field>
              <Field label="촬영일">
                <TextInput type="date" value={dateToInput(edit.taken_on)} onChange={e => setEdit({ ...edit, taken_on: e.target.value || null })} />
              </Field>
              <Field label="순서" hint="작을수록 앞">
                <TextInput type="number" value={edit.display_order ?? 0} onChange={e => setEdit({ ...edit, display_order: e.target.value })} />
              </Field>
            </div>
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Table, Modal, Field, TextInput, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

// Gallery(Lab Life) 관리 — 신규는 여러 장 한 번에 업로드(같은 앨범·촬영일), 편집은 단일.
function emptyItem(email) {
  return { image_url: '', caption: '', album: '', taken_on: '', display_order: 0, created_by: email }
}
function dateToInput(v) { return v ? String(v).slice(0, 10) : '' }

export default function AdminGallery() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [albumFilter, setAlbumFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [pending, setPending] = useState([])   // [{file, url}] — 신규는 다중, 편집은 1장 교체
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState('')
  const savingRef = useRef(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

  function clearPending() {
    setPending((prev) => { prev.forEach((p) => URL.revokeObjectURL(p.url)); return [] })
  }
  function openNew() { clearPending(); setIsNew(true); setEdit(emptyItem(user.email)) }
  function openEdit(row) { clearPending(); setIsNew(false); setEdit({ ...row }) }
  function closeModal() { clearPending(); setEdit(null); setProgress('') }

  function onSelectFiles(fileList, forNew) {
    const files = [...(fileList || [])]
    if (!files.length) return
    const added = files.map((file) => ({ file, url: URL.createObjectURL(file) }))
    setPending((prev) => {
      if (!forNew) { prev.forEach((p) => URL.revokeObjectURL(p.url)); return added.slice(0, 1) }
      return [...prev, ...added]   // 신규: 계속 추가
    })
  }
  function removePending(i) {
    setPending((prev) => { const p = prev[i]; if (p) URL.revokeObjectURL(p.url); return prev.filter((_, k) => k !== i) })
  }

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

  const albums = [...new Set(rows.map((r) => r.album).filter(Boolean))].sort()
  const hasUnfiled = rows.some((r) => !r.album)
  const visibleRows =
    albumFilter === 'all' ? rows
    : albumFilter === '(none)' ? rows.filter((r) => !r.album)
    : rows.filter((r) => r.album === albumFilter)

  async function uploadOne(file) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error(`${file.name}: jpg/png/webp 만 허용`)
    if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name}: 10MB 초과`)
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage.from('gallery-images')
      .upload(path, file, { contentType: file.type })
    if (upErr) throw new Error('업로드 실패: ' + upErr.message)
    return supabase.storage.from('gallery-images').getPublicUrl(path).data.publicUrl
  }

  async function save() {
    if (savingRef.current) return
    if (isNew && pending.length === 0) { setError(new Error('사진을 선택하세요')); return }
    savingRef.current = true
    setSaving(true); setError(null)
    try {
      const album = edit.album?.trim() || null
      const taken_on = edit.taken_on || null
      const baseOrder = Number(edit.display_order) || 0

      if (isNew) {
        // 선택한 파일들을 차례로 업로드 → 한 번에 insert (같은 앨범·촬영일)
        const inserts = []
        for (let i = 0; i < pending.length; i++) {
          setProgress(`업로드 중 ${i + 1}/${pending.length}`)
          const image_url = await uploadOne(pending[i].file)
          inserts.push({
            image_url,
            caption: pending.length === 1 ? (edit.caption?.trim() || null) : null,
            album, taken_on,
            display_order: baseOrder + i,
            created_by: user.email,
          })
        }
        setProgress('저장 중…')
        const { error } = await supabase.from('gallery').insert(inserts)
        if (error) throw error
      } else {
        let image_url = edit.image_url
        if (pending[0]) { setProgress('업로드 중…'); image_url = await uploadOne(pending[0].file) }
        const { error } = await supabase.from('gallery').update({
          image_url,
          caption: edit.caption?.trim() || null,
          album, taken_on,
          display_order: baseOrder,
        }).eq('id', edit.id)
        if (error) throw error
      }
      closeModal(); load()
    } catch (e) { setError(e) } finally { savingRef.current = false; setSaving(false); setProgress('') }
  }

  async function del(row) {
    if (!(await confirm('이 사진을 삭제하시겠습니까?'))) return
    const { error } = await supabase.from('gallery').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  const multi = isNew && pending.length > 1
  const fileBtnLabel = isNew ? (pending.length ? '＋ 사진 추가' : '＋ 사진 선택') : (pending.length || edit?.image_url ? '사진 변경' : '＋ 사진 선택')

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
        title={isNew ? (multi ? `새 사진 (${pending.length}장)` : '새 사진') : '사진 편집'}
        mode={isNew ? 'new' : 'edit'}
        headerActions={
          <>
            <Button primary onClick={save} disabled={saving}>
              {saving ? (progress || '저장 중…') : (multi ? `${pending.length}장 저장` : '저장')}
            </Button>
            <Button onClick={closeModal} disabled={saving}>취소</Button>
          </>
        }
      >
        {edit && (
          <div>
            <Field label="사진" hint={isNew ? 'jpg/png/webp, 최대 10MB · 여러 장 선택 가능' : 'jpg/png/webp, 최대 10MB'}>
              {(pending.length > 0 || (!isNew && edit.image_url)) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {pending.length > 0
                    ? pending.map((p, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={p.url} alt="" style={{ width: 84, height: 63, objectFit: 'cover', border: '1px solid #ccc', borderRadius: 3, display: 'block' }} />
                          <button type="button" onClick={() => removePending(i)} aria-label="제거"
                            style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#c33', color: '#fff', cursor: 'pointer', fontSize: 12, lineHeight: '20px', padding: 0 }}>×</button>
                        </div>
                      ))
                    : <img src={edit.image_url} alt="" style={{ width: 84, height: 63, objectFit: 'cover', border: '1px solid #ccc', borderRadius: 3 }} />}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <label style={{ display: 'inline-block', fontSize: '0.85rem', cursor: 'pointer', color: '#fff', background: '#222', border: '1px solid #000', padding: '0.4rem 0.8rem', borderRadius: 3 }}>
                  {fileBtnLabel}
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple={isNew} style={{ display: 'none' }}
                    onChange={(e) => { onSelectFiles(e.target.files, isNew); e.target.value = '' }} />
                </label>
                {isNew && pending.length > 0 && <span style={{ fontSize: '0.78rem', color: '#666' }}>{pending.length}장 선택됨 · 저장 시 업로드</span>}
                {!isNew && pending.length > 0 && <span style={{ fontSize: '0.78rem', color: '#666' }}>저장 시 교체 업로드</span>}
              </div>
            </Field>

            {!multi ? (
              <Field label="Caption" hint="사진 아래 표시(선택)">
                <TextInput value={edit.caption || ''} onChange={e => setEdit({ ...edit, caption: e.target.value })} />
              </Field>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#888', margin: '0 0 0.6rem' }}>
                여러 장은 캡션 없이 업로드됩니다. 캡션은 목록에서 사진별로 편집하세요.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
              <Field label="Album" hint="예: 2026 MT (비우면 'Lab Life')">
                <TextInput value={edit.album || ''} onChange={e => setEdit({ ...edit, album: e.target.value })} />
              </Field>
              <Field label="촬영일">
                <TextInput type="date" value={dateToInput(edit.taken_on)} onChange={e => setEdit({ ...edit, taken_on: e.target.value || null })} />
              </Field>
              <Field label={multi ? '시작 순서' : '순서'} hint="작을수록 앞">
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

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Button, Table, Modal, Field, TextInput, TextArea, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

const TERMS  = ['Spring', 'Summer', 'Fall', 'Winter']
const LEVELS = ['undergraduate', 'graduate']
const MAX_IMAGES = 10
const IMG_EXT = ['jpg', 'jpeg', 'png', 'webp']

function arrJoin(a) { return Array.isArray(a) ? a.join(', ') : '' }
function arrSplit(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : null }

function emptyLecture() {
  return {
    id: '', code: null, title_en: '', title_ko: null,
    semester: '', year: new Date().getFullYear(), term: 'Spring',
    level: 'undergraduate', description: null,
    objectives: null, images: null, tags: null, display_order: 0,
  }
}

export default function AdminLectures() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()
  const [pendingImages, setPendingImages] = useState([]) // [{ file, url }] 선택만 하고 저장 시 업로드
  const [uploading, setUploading] = useState(false)

  async function load() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from('lectures').select('*').order('year', { ascending: false }).order('term').order('display_order')
    if (error) setError(error)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function resetImages() {
    for (const p of pendingImages) URL.revokeObjectURL(p.url)
    setPendingImages([])
  }
  function openNew() { resetImages(); setIsNew(true); setEdit({ ...emptyLecture(), id: crypto.randomUUID() }) }
  function openEdit(row) { resetImages(); setIsNew(false); setEdit({ ...row }) }
  function closeEdit() { resetImages(); setEdit(null) }

  // 사진 선택 시: 검증 후 메모리에만 보관(업로드는 저장 때). 최대 10장.
  function onSelectImages(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const existing = edit.images?.length || 0
    let remaining = MAX_IMAGES - existing - pendingImages.length
    if (remaining <= 0) { setError(new Error(`사진은 최대 ${MAX_IMAGES}장까지입니다`)); return }
    const next = []
    for (const file of files) {
      if (remaining <= 0) break
      const ext = (file.name.split('.').pop() || '').toLowerCase()
      if (!IMG_EXT.includes(ext)) { setError(new Error('jpg/png/webp 만 허용')); continue }
      if (file.size > 10 * 1024 * 1024) { setError(new Error(`${file.name}: 10MB 초과`)); continue }
      next.push({ file, url: URL.createObjectURL(file) })
      remaining--
    }
    if (next.length) { setError(null); setPendingImages(prev => [...prev, ...next]) }
  }
  function removeExisting(idx) {
    setEdit(e => ({ ...e, images: (e.images || []).filter((_, i) => i !== idx) }))
  }
  function removePending(idx) {
    setPendingImages(prev => {
      const target = prev[idx]
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function uploadPendingImages(lectureId) {
    const urls = []
    for (const { file } of pendingImages) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${lectureId}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage.from('lecture-images').upload(path, file, {
        contentType: file.type, upsert: true,
      })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('lecture-images').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  async function save() {
    setError(null); setUploading(true)
    try {
      if (!edit.title_en || !edit.year || !edit.term || !edit.level) {
        throw new Error('title_en / year / term / level 필수')
      }
      // 선택해둔 사진 업로드 후 기존 + 신규 합치기
      const uploaded = pendingImages.length ? await uploadPendingImages(edit.id) : []
      const images = [...(edit.images || []), ...uploaded]

      const payload = {
        ...edit,
        semester: `${edit.term} ${edit.year}`, // Year + Term 으로 자동 생성
        objectives: typeof edit.objectives === 'string' ? arrSplit(edit.objectives) : edit.objectives,
        tags:       typeof edit.tags === 'string' ? arrSplit(edit.tags) : edit.tags,
        images:     images.length ? images : null,
      }
      const op = isNew
        ? supabase.from('lectures').insert(payload)
        : supabase.from('lectures').update(payload).eq('id', payload.id)
      const { error } = await op
      if (error) throw error
      closeEdit(); load()
    } catch (e) { setError(e) }
    finally { setUploading(false) }
  }

  async function del(row) {
    if (!(await confirm(`강의 "${row.title_en}" 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('lectures').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  const totalImages = (edit?.images?.length || 0) + pendingImages.length

  return (
    <div>
      <PageHeader
        title="Lectures"
        subtitle={`${rows.length}개`}
        actions={<>{deleteModeToggle}<Button primary onClick={openNew}>+ 새 강의</Button></>}
      />
      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          columns={[
            { key: 'id', label: 'ID', render: r => <code style={{ fontSize: '0.7rem' }}>{r.id}</code> },
            { key: 'semester', label: 'Semester' },
            { key: 'level', label: 'Level' },
            { key: 'title_en', label: 'Title', render: r => <>{r.title_en}{r.title_ko ? <div style={{ fontSize: '0.75rem', color: '#666' }}>{r.title_ko}</div> : null}</> },
            { key: 'images', label: '사진', render: r => `${r.images?.length || 0}장` },
            { key: 'code', label: 'Code' },
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
        />
      )}

      <Modal
        open={!!edit}
        onClose={closeEdit}
        title={edit ? (isNew ? '새 강의' : `Edit: ${edit.id}`) : ''}
        footer={<><Button onClick={closeEdit} disabled={uploading}>취소</Button><Button primary onClick={save} disabled={uploading}>{uploading ? '저장 중…' : '저장'}</Button></>}
      >
        {edit && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
            <Field label="ID" hint={isNew ? '자동 생성된 UID (변경 불가)' : '변경 불가.'}><TextInput value={edit.id} disabled /></Field>
            <Field label="Code"><TextInput value={edit.code||''} onChange={e => setEdit({...edit, code: e.target.value || null})} /></Field>
            <Field label="Title (EN)"><TextInput value={edit.title_en||''} onChange={e => setEdit({...edit, title_en: e.target.value})} /></Field>
            <Field label="Title (KO)"><TextInput value={edit.title_ko||''} onChange={e => setEdit({...edit, title_ko: e.target.value || null})} /></Field>
            <Field label="Year"><TextInput type="number" value={edit.year||0} onChange={e => setEdit({...edit, year: Number(e.target.value)||0})} /></Field>
            <Field label="Term"><Select value={edit.term} options={TERMS} onChange={e => setEdit({...edit, term: e.target.value})} /></Field>
            <Field label="Semester (자동)" hint="Year + Term 으로 자동 생성됩니다.">
              <TextInput value={`${edit.term} ${edit.year}`} disabled />
            </Field>
            <Field label="Level"><Select value={edit.level} options={LEVELS} onChange={e => setEdit({...edit, level: e.target.value})} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Description"><TextArea rows={4} value={edit.description||''} onChange={e => setEdit({...edit, description: e.target.value || null})} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Objectives (콤마)"><TextInput value={typeof edit.objectives === 'string' ? edit.objectives : arrJoin(edit.objectives)} onChange={e => setEdit({...edit, objectives: e.target.value})} /></Field>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label={`사진 (${totalImages}/${MAX_IMAGES})`} hint="jpg/png/webp, 각 10MB 이내. 저장을 눌러야 실제로 업로드됩니다.">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  {(edit.images || []).map((src, i) => (
                    <div key={`ex-${i}`} style={{ position: 'relative' }}>
                      <img src={src} alt="" style={{ width: 90, height: 64, objectFit: 'cover', border: '1px solid #ccc' }} />
                      <button type="button" onClick={() => removeExisting(i)} title="삭제"
                        style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', border: '1px solid #a22', background: '#c33', color: '#fff', cursor: 'pointer', lineHeight: '18px', padding: 0 }}>×</button>
                    </div>
                  ))}
                  {pendingImages.map((p, i) => (
                    <div key={`pd-${i}`} style={{ position: 'relative' }}>
                      <img src={p.url} alt="" style={{ width: 90, height: 64, objectFit: 'cover', border: '1px solid #2a6' }} />
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: '0.6rem', textAlign: 'center', background: 'rgba(34,102,68,0.85)', color: '#fff' }}>업로드 예정</span>
                      <button type="button" onClick={() => removePending(i)} title="취소"
                        style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', border: '1px solid #a22', background: '#c33', color: '#fff', cursor: 'pointer', lineHeight: '18px', padding: 0 }}>×</button>
                    </div>
                  ))}
                  {totalImages < MAX_IMAGES && (
                    <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 90, height: 64, border: '1px dashed #888', cursor: 'pointer', fontSize: '0.8rem', color: '#444' }}>
                      ＋ 사진 추가
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }}
                        onChange={e => { onSelectImages(e.target.files); e.target.value = '' }} />
                    </label>
                  )}
                </div>
              </Field>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Tags (콤마)"><TextInput value={typeof edit.tags === 'string' ? edit.tags : arrJoin(edit.tags)} onChange={e => setEdit({...edit, tags: e.target.value})} /></Field>
            </div>
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

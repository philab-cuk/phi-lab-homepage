import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Button, Table, Modal, Field, TextInput, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

const INTERNAL_OPTS = [
  { value: 'false', label: '외부 기관' },
  { value: 'true', label: '내부 (PHI Lab)' },
]

export default function AdminInstitutions() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)   // { id?, name_en, name_ko, is_internal }
  const [isNew, setIsNew] = useState(false)
  const [viewing, setViewing] = useState(false) // 행 클릭 → 보기(읽기 전용), 편집하기 → 수정
  const [original, setOriginal] = useState(null) // 편집 취소 시 되돌릴 원본
  const [saving, setSaving] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()
  const [pendingFile, setPendingFile] = useState(null) // 선택만 하고 저장 시 업로드
  const [previewUrl, setPreviewUrl] = useState(null)

  function resetLogo() { setPendingFile(null); setPreviewUrl(null) }
  function onSelectFile(file) {
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) { setError(new Error('jpg/png/webp/svg 만 허용')); return }
    if (file.size > 5 * 1024 * 1024) { setError(new Error('5MB 초과')); return }
    setError(null); setPendingFile(file); setPreviewUrl(URL.createObjectURL(file))
  }
  async function uploadLogo(id) {
    const ext = (pendingFile.name.split('.').pop() || 'png').toLowerCase()
    const path = `institutions/${id}.${ext}`
    const ctype = ext === 'svg' ? 'image/svg+xml' : pendingFile.type
    const { error: upErr } = await supabase.storage.from('page-images').upload(path, pendingFile, { contentType: ctype, upsert: true })
    if (upErr) throw upErr
    const { data } = supabase.storage.from('page-images').getPublicUrl(path)
    return `${data.publicUrl}?v=${Date.now()}`
  }

  async function load() {
    setLoading(true); setError(null)
    const [{ data: inst, error: e1 }, { data: affs, error: e2 }] = await Promise.all([
      supabase.from('institutions').select('*').order('name_en'),
      supabase.from('research_affiliations').select('institution_id'),
    ])
    if (e1 || e2) { setError(e1 || e2); setLoading(false); return }
    const counts = {}
    for (const a of affs || []) counts[a.institution_id] = (counts[a.institution_id] || 0) + 1
    setRows((inst || []).map(r => ({ ...r, _count: counts[r.id] || 0 })))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function rowToEdit(row) { return { id: row.id, name_en: row.name_en, name_ko: row.name_ko, is_internal: row.is_internal, logo_url: row.logo_url || null } }
  function openNew() { resetLogo(); setIsNew(true); setViewing(false); setOriginal(null); setEdit({ id: crypto.randomUUID(), name_en: '', name_ko: null, is_internal: false, logo_url: null }) }
  function openView(row) { resetLogo(); setIsNew(false); setViewing(true); const s = rowToEdit(row); setOriginal(s); setEdit(s) }
  function openEdit(row) { resetLogo(); setIsNew(false); setViewing(false); const s = rowToEdit(row); setOriginal(s); setEdit(s) }
  function closeEdit() { resetLogo(); setEdit(null); setViewing(false) }
  // 편집 취소: 새 항목이면 닫고, 기존이면 변경 버리고 보기 모드로 복귀
  function cancelEdit() { if (isNew) closeEdit(); else { setEdit(original); setViewing(true) } }

  async function save() {
    setError(null); setSaving(true)
    try {
      const name_en = (edit.name_en || '').trim()
      if (!name_en) throw new Error('기관명(영문)은 필수입니다')
      const payload = {
        name_en, name_ko: edit.name_ko?.trim() || null, is_internal: !!edit.is_internal,
        logo_url: pendingFile ? await uploadLogo(edit.id) : (edit.logo_url || null),
      }
      const op = isNew
        ? supabase.from('institutions').insert({ ...payload, id: edit.id })
        : supabase.from('institutions').update(payload).eq('id', edit.id)
      const { error } = await op
      if (error) throw error
      closeEdit(); load()
    } catch (e) {
      setError(e?.code === '23505' ? new Error('같은 이름의 기관이 이미 있습니다') : e)
    } finally { setSaving(false) }
  }

  async function del(row) {
    if (row._count > 0) {
      setError(new Error(`"${row.name_en}" 은(는) 연구 ${row._count}건에서 쓰고 있어 삭제할 수 없습니다. 먼저 해당 연구의 소속 기관을 바꾸세요.`))
      return
    }
    if (!(await confirm(`기관 "${row.name_en}" 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('institutions').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  return (
    <div>
      <PageHeader
        title="Institutions"
        subtitle="연구의 소속/협력 기관 목록입니다."
        actions={<>{deleteModeToggle}<Button primary onClick={openNew}>+ 새 기관</Button></>}
      />
      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          empty="기관이 없습니다"
          columns={[
            { key: 'logo', label: '로고', render: r => r.logo_url ? <img src={r.logo_url} alt="" style={{ height: 28, width: 'auto', maxWidth: 80, objectFit: 'contain' }} /> : '' },
            { key: 'name_en', label: '기관명 (영문)' },
            { key: 'name_ko', label: '기관명 (한글)', render: r => r.name_ko || '' },
            { key: 'is_internal', label: '구분', render: r => r.is_internal ? '내부' : '외부' },
            { key: '_count', label: '사용 중', render: r => `${r._count}건` },
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

      <Modal
        open={!!edit}
        onClose={closeEdit}
        width={920}
        fixedHeight
        title={edit ? (viewing ? `보기: ${edit.name_en}` : (isNew ? '새 기관' : `Edit: ${edit.name_en}`)) : ''}
        headerActions={viewing
          ? <><Button primary onClick={() => setViewing(false)}>편집하기</Button><Button onClick={closeEdit}>닫기</Button></>
          : <><Button primary onClick={save} disabled={saving}>{saving ? '저장 중…' : '저장'}</Button><Button onClick={cancelEdit} disabled={saving}>취소</Button></>}
      >
        {edit && (
          <fieldset disabled={viewing} style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0, display: 'grid', gap: '0.25rem' }}>
            <Field label="기관명 (영문)" required>
              <TextInput value={edit.name_en} autoFocus onChange={e => setEdit({ ...edit, name_en: e.target.value })} />
            </Field>
            <Field label="기관명 (한글)">
              <TextInput value={edit.name_ko || ''} onChange={e => setEdit({ ...edit, name_ko: e.target.value || null })} />
            </Field>
            <Field label="구분">
              <Select
                value={edit.is_internal ? 'true' : 'false'}
                options={INTERNAL_OPTS}
                onChange={e => setEdit({ ...edit, is_internal: e.target.value === 'true' })}
              />
            </Field>
            <Field label="로고" hint="jpg/png/webp/svg, 5MB 이내. 저장을 눌러야 업로드됩니다.">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {(previewUrl || edit.logo_url) && <img src={previewUrl || edit.logo_url} alt="" style={{ height: 40, width: 'auto', maxWidth: 120, objectFit: 'contain', border: '1px solid #eee' }} />}
                <label style={{ display: 'inline-block', fontSize: '0.85rem', cursor: 'pointer', color: '#fff', background: '#222', border: '1px solid #000', padding: '0.4rem 0.8rem' }}>
                  {(previewUrl || edit.logo_url) ? '로고 변경' : '＋ 로고 선택'}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" style={{ display: 'none' }} onChange={e => { onSelectFile(e.target.files?.[0]); e.target.value = '' }} />
                </label>
                {edit.logo_url && !pendingFile && <Button onClick={() => setEdit({ ...edit, logo_url: null })}>로고 제거</Button>}
                {pendingFile && <span style={{ fontSize: '0.75rem', color: '#888' }}>저장 시 업로드 예정</span>}
              </div>
            </Field>
          </fieldset>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

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
  const [saving, setSaving] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

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

  function openNew() { setIsNew(true); setEdit({ name_en: '', name_ko: null, is_internal: false }) }
  function openEdit(row) { setIsNew(false); setEdit({ id: row.id, name_en: row.name_en, name_ko: row.name_ko, is_internal: row.is_internal }) }

  async function save() {
    setError(null); setSaving(true)
    try {
      const name_en = (edit.name_en || '').trim()
      if (!name_en) throw new Error('기관명(영문)은 필수입니다')
      const payload = { name_en, name_ko: edit.name_ko?.trim() || null, is_internal: !!edit.is_internal }
      const op = isNew
        ? supabase.from('institutions').insert(payload)
        : supabase.from('institutions').update(payload).eq('id', edit.id)
      const { error } = await op
      if (error) throw error
      setEdit(null); load()
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
    <div style={{ maxWidth: 720 }}>
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
        />
      )}

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit ? (isNew ? '새 기관' : `Edit: ${edit.name_en}`) : ''}
        footer={
          <>
            <Button onClick={() => setEdit(null)} disabled={saving}>취소</Button>
            <Button primary onClick={save} disabled={saving}>{saving ? '저장 중…' : '저장'}</Button>
          </>
        }
      >
        {edit && (
          <div style={{ display: 'grid', gap: '0.25rem' }}>
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
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

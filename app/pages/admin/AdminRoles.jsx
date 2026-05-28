import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Button, Table, Modal, Field, TextInput, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

export default function AdminRoles() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)   // { id?, label, _origLabel }
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

  async function load() {
    setLoading(true); setError(null)
    const [{ data: roles, error: e1 }, { data: members, error: e2 }] = await Promise.all([
      supabase.from('member_roles').select('*').order('sort_order'),
      supabase.from('members').select('role'),
    ])
    if (e1 || e2) { setError(e1 || e2); setLoading(false); return }
    const counts = {}
    for (const m of members || []) counts[m.role] = (counts[m.role] || 0) + 1
    setRows((roles || []).map(r => ({ ...r, _count: counts[r.label] || 0 })))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openNew() { setIsNew(true); setEdit({ label: '' }) }
  function openEdit(row) { setIsNew(false); setEdit({ id: row.id, label: row.label, _origLabel: row.label }) }

  async function save() {
    setError(null); setSaving(true)
    try {
      const label = (edit.label || '').trim()
      if (!label) throw new Error('역할 이름은 필수입니다')

      if (isNew) {
        const maxOrder = rows.reduce((m, r) => Math.max(m, r.sort_order || 0), 0)
        const { error } = await supabase.from('member_roles').insert({ label, sort_order: maxOrder + 10 })
        if (error) throw error
      } else {
        // 이름 변경 시: 이 역할을 쓰던 멤버들의 role 텍스트도 함께 갱신(동기화)
        if (label !== edit._origLabel) {
          const { error: mErr } = await supabase.from('members').update({ role: label }).eq('role', edit._origLabel)
          if (mErr) throw mErr
        }
        const { error } = await supabase.from('member_roles').update({ label }).eq('id', edit.id)
        if (error) throw error
      }
      setEdit(null); load()
    } catch (e) {
      // unique 위반 메시지 다듬기
      setError(e?.code === '23505' ? new Error('같은 이름의 역할이 이미 있습니다') : e)
    } finally { setSaving(false) }
  }

  async function del(row) {
    if (row._count > 0) {
      setError(new Error(`"${row.label}" 은(는) ${row._count}명이 쓰고 있어 삭제할 수 없습니다. 먼저 해당 멤버의 역할을 바꾸세요.`))
      return
    }
    if (!(await confirm(`역할 "${row.label}" 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('member_roles').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader
        title="Member Roles"
        subtitle="멤버 폼의 Role 드롭다운에 나오는 목록입니다."
        actions={<>{deleteModeToggle}<Button primary onClick={openNew}>+ 새 역할</Button></>}
      />
      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          empty="역할이 없습니다"
          columns={[
            { key: 'label', label: '역할 이름' },
            { key: '_count', label: '사용 중', render: r => `${r._count}명` },
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
        title={edit ? (isNew ? '새 역할' : `Edit: ${edit._origLabel}`) : ''}
        footer={
          <>
            <Button onClick={() => setEdit(null)} disabled={saving}>취소</Button>
            <Button primary onClick={save} disabled={saving}>{saving ? '저장 중…' : '저장'}</Button>
          </>
        }
      >
        {edit && (
          <Field label="역할 이름" required hint={!isNew ? '이름을 바꾸면 이 역할을 쓰던 멤버도 함께 갱신됩니다.' : undefined}>
            <TextInput value={edit.label} autoFocus onChange={e => setEdit({ ...edit, label: e.target.value })} />
          </Field>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

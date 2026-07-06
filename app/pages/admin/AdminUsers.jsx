import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Table, Modal, Field, TextInput, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

const ROLES = ['admin', 'professor', 'researcher', 'alumni']

// Users — 가입한 계정(admin_users)의 권한(역할) 관리 전용.
// 초대 발급·현황은 Members / Invites 화면에 있다.
export default function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

  // 모달 상태
  const [editUser, setEditUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(false) // 행 클릭 → 보기(읽기 전용)
  const [originalUser, setOriginalUser] = useState(null) // 편집 취소 시 되돌릴 원본

  async function load() {
    setLoading(true); setError(null)
    const { data: u, error: uErr } = await supabase
      .from('admin_users').select('email, role, display_name, invited_by, added_at').order('added_at')
    if (uErr) setError(uErr)
    // 등록순(added_at asc). 같은 시각이면 role 우선순위: professor → admin → 나머지
    const rolePriority = { professor: 0, admin: 1, researcher: 2, alumni: 3 }
    const sortedUsers = (u || []).slice().sort((a, b) => {
      const t = new Date(a.added_at) - new Date(b.added_at)
      if (t !== 0) return t
      return (rolePriority[a.role] ?? 9) - (rolePriority[b.role] ?? 9)
    })
    setUsers(sortedUsers)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSaveUser() {
    setError(null)
    const { error } = await supabase.from('admin_users')
      .update({ role: editUser.role, display_name: editUser.display_name })
      .eq('email', editUser.email)
    if (error) { setError(error); return }
    setEditUser(null)
    load()
  }

  async function handleDeleteUser(row) {
    if (row.email === user.email) {
      setError({ message: '본인 계정은 삭제할 수 없습니다.' })
      return
    }
    if (!(await confirm(`${row.email} 을(를) 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('admin_users').delete().eq('email', row.email)
    if (error) { setError(error); return }
    load()
  }

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`가입한 계정 권한 관리 (${users.length})`}
        actions={<>{deleteModeToggle}</>}
      />
      <div style={{ fontSize: '0.78rem', color: '#666', background: '#f7f7f7', border: '1px solid #eee', padding: '0.5rem 0.6rem', marginBottom: '0.75rem' }}>
        가입한 계정의 <strong>권한(역할) 변경·삭제</strong>를 관리합니다. admin·professor 권한은 여기서 올려주세요. 초대 발급·현황은 <strong>Members / Invites</strong> 화면에 있습니다.
      </div>

      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          columns={[
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'display_name', label: 'Name' },
            { key: 'invited_by', label: 'Invited by' },
            { key: 'added_at', label: 'Added', render: r => new Date(r.added_at).toISOString().slice(0,10) },
            {
              key: 'actions', label: '', render: r => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button onClick={() => { setViewingUser(false); setOriginalUser({ ...r }); setEditUser({ ...r }) }}>편집</Button>
                  <Button danger onClick={() => handleDeleteUser(r)} disabled={!deleteMode || r.email === user.email}>삭제</Button>
                </div>
              )
            },
          ]}
          rows={users}
          onRowClick={(r) => { setViewingUser(true); setOriginalUser({ ...r }); setEditUser({ ...r }) }}
        />
      )}

      {/* edit user modal */}
      <Modal
        open={!!editUser}
        onClose={() => { setViewingUser(false); setEditUser(null) }}
        width={920}
        fixedHeight
        title={editUser ? (viewingUser ? `보기: ${editUser.email}` : `Edit: ${editUser.email}`) : ''}
        mode={viewingUser ? 'view' : 'edit'}
        headerActions={viewingUser
          ? <><Button primary onClick={() => setViewingUser(false)}>편집하기</Button><Button onClick={() => { setViewingUser(false); setEditUser(null) }}>닫기</Button></>
          : <><Button primary onClick={handleSaveUser}>저장</Button><Button onClick={() => { setEditUser(originalUser); setViewingUser(true) }}>취소</Button></>}
      >
        {editUser && (
          <fieldset disabled={viewingUser} style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0 }}>
            <Field label="Email"><TextInput value={editUser.email} disabled /></Field>
            <Field label="Role">
              <Select value={editUser.role} options={ROLES} onChange={e => setEditUser({ ...editUser, role: e.target.value })} />
            </Field>
            <Field label="Display name">
              <TextInput value={editUser.display_name || ''} onChange={e => setEditUser({ ...editUser, display_name: e.target.value })} />
            </Field>
          </fieldset>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

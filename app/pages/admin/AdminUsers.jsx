import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Table, Modal, Field, TextInput, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

const ROLES = ['admin', 'professor', 'researcher', 'alumni']

export default function AdminUsers() {
  const { user } = useAuth()
  const [tab, setTab] = useState('users')   // 'users' | 'invites'
  const [users, setUsers] = useState([])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

  // 모달 상태
  const [editUser, setEditUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(false) // 행 클릭 → 보기(읽기 전용)
  const [originalUser, setOriginalUser] = useState(null) // 편집 취소 시 되돌릴 원본
  const [newInvite, setNewInvite] = useState(null)

  async function load() {
    setLoading(true); setError(null)
    const [{ data: u, error: uErr }, { data: i, error: iErr }] = await Promise.all([
      supabase.from('admin_users').select('email, role, display_name, invited_by, added_at').order('added_at'),
      supabase.from('invites').select('token, role, intended_email, created_by, created_at, expires_at, used_at, used_by_email').order('created_at', { ascending: false }),
    ])
    if (uErr || iErr) setError(uErr || iErr)
    // 등록순(added_at asc). 같은 시각이면 role 우선순위: professor → admin → 나머지
    const rolePriority = { professor: 0, admin: 1, researcher: 2, alumni: 3 }
    const sortedUsers = (u || []).slice().sort((a, b) => {
      const t = new Date(a.added_at) - new Date(b.added_at)
      if (t !== 0) return t
      return (rolePriority[a.role] ?? 9) - (rolePriority[b.role] ?? 9)
    })
    setUsers(sortedUsers)
    setInvites(i || [])
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

  async function handleCreateInvite() {
    setError(null)
    const { error } = await supabase.from('invites').insert({
      intended_email: newInvite.intended_email.trim().toLowerCase(),
      role: newInvite.role,
      created_by: user.email,
    })
    if (error) { setError(error); return }
    setNewInvite(null)
    load()
  }

  async function handleRevokeInvite(row) {
    if (row.used_at) return
    if (!(await confirm(`${row.intended_email} 초대를 회수하시겠습니까?`))) return
    const { error } = await supabase.from('invites').update({ expires_at: new Date().toISOString() }).eq('token', row.token)
    if (error) { setError(error); return }
    load()
  }

  const [copiedToken, setCopiedToken] = useState(null)
  async function copyInviteLink(row) {
    const link = `${window.location.origin}/admin/accept?token=${row.token}`
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      window.prompt('이 링크를 복사해 전달하세요:', link)
    }
    setCopiedToken(row.token)
    setTimeout(() => setCopiedToken((t) => (t === row.token ? null : t)), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Users / Invites"
        subtitle="화이트리스트 + 초대 토큰 관리"
        actions={
          <>
            <Button onClick={() => setTab('users')} primary={tab === 'users'}>Users ({users.length})</Button>
            <Button onClick={() => setTab('invites')} primary={tab === 'invites'}>Invites ({invites.filter(i => !i.used_at && new Date(i.expires_at) > new Date()).length} 활성)</Button>
            {deleteModeToggle}
            <Button primary onClick={() => setNewInvite({ intended_email: '', role: 'researcher' })}>멤버 초대</Button>
          </>
        }
      />

      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : tab === 'users' ? (
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
      ) : (
        <Table
          columns={[
            { key: 'token', label: 'Token', render: r => <code style={{ fontSize: '0.7rem' }}>{r.token.slice(0,8)}…</code> },
            { key: 'intended_email', label: 'Intended email' },
            { key: 'role', label: 'Role' },
            { key: 'created_at', label: 'Created', render: r => new Date(r.created_at).toISOString().slice(0,16).replace('T', ' ') },
            { key: 'expires_at', label: 'Expires', render: r => new Date(r.expires_at).toISOString().slice(0,16).replace('T', ' ') },
            {
              key: 'status', label: 'Status', render: r => {
                if (r.used_at) return <span style={{ color: '#080' }}>used by {r.used_by_email}</span>
                if (new Date(r.expires_at) <= new Date()) return <span style={{ color: '#888' }}>expired</span>
                return <span style={{ color: '#06c' }}>active</span>
              }
            },
            {
              key: 'actions', label: '', render: r => {
                const active = !r.used_at && new Date(r.expires_at) > new Date()
                return (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <Button onClick={() => copyInviteLink(r)} disabled={!active}>
                      {copiedToken === r.token ? '복사됨' : '링크 복사'}
                    </Button>
                    <Button danger onClick={() => handleRevokeInvite(r)} disabled={!deleteMode || !active}>회수</Button>
                  </div>
                )
              }
            },
          ]}
          rows={invites}
        />
      )}

      {/* edit user modal */}
      <Modal
        open={!!editUser}
        onClose={() => { setViewingUser(false); setEditUser(null) }}
        width={920}
        fixedHeight
        title={editUser ? (viewingUser ? `보기: ${editUser.email}` : `Edit: ${editUser.email}`) : ''}
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

      {/* new invite modal */}
      <Modal
        open={!!newInvite}
        onClose={() => setNewInvite(null)}
        title="멤버 초대"
        footer={
          <>
            <Button onClick={() => setNewInvite(null)}>취소</Button>
            <Button primary onClick={handleCreateInvite} disabled={!newInvite?.intended_email}>발급</Button>
          </>
        }
      >
        {newInvite && (
          <>
            <Field label="대상 이메일" hint="이 이메일로 로그인한 사용자만 초대를 사용할 수 있습니다.">
              <TextInput type="email" value={newInvite.intended_email} onChange={e => setNewInvite({ ...newInvite, intended_email: e.target.value })} />
            </Field>
            <Field label="Role">
              <Select value={newInvite.role} options={ROLES} onChange={e => setNewInvite({ ...newInvite, role: e.target.value })} />
            </Field>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
              유효기간: 발급 시점부터 7일. 같은 이메일로 새 초대를 발급하면 기존 활성 초대는 자동 만료됩니다.
            </div>
          </>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

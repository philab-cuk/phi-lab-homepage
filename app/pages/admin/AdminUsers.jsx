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
  const [memberByEmail, setMemberByEmail] = useState({}) // 이메일 → 멤버 이름 (초대↔멤버 대응 표시)

  async function load() {
    setLoading(true); setError(null)
    const [{ data: u, error: uErr }, { data: i, error: iErr }, { data: mem }] = await Promise.all([
      supabase.from('admin_users').select('email, role, display_name, invited_by, added_at').order('added_at'),
      supabase.from('invites').select('token, role, intended_email, created_by, created_at, expires_at, used_at, used_by_email').order('created_at', { ascending: false }),
      supabase.from('members').select('email, name_ko, name'),
    ])
    if (uErr || iErr) setError(uErr || iErr)
    const mmap = {}
    for (const m of (mem || [])) { if (m.email) mmap[m.email.trim().toLowerCase()] = m.name_ko || m.name }
    setMemberByEmail(mmap)
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
        title="Members / Invites"
        subtitle="계정·권한 관리 + 초대 현황 (초대 발급은 Members 화면에서)"
        actions={
          <>
            <Button onClick={() => setTab('users')} primary={tab === 'users'}>Users ({users.length})</Button>
            <Button onClick={() => setTab('invites')} primary={tab === 'invites'}>Invites ({invites.filter(i => !i.used_at && new Date(i.expires_at) > new Date()).length} 활성)</Button>
            {deleteModeToggle}
          </>
        }
      />
      <div style={{ fontSize: '0.78rem', color: '#666', background: '#f7f7f7', border: '1px solid #eee', padding: '0.5rem 0.6rem', marginBottom: '0.75rem' }}>
        초대는 <strong>Members 화면</strong>에서 멤버를 만들고 발급합니다(로그인 시 멤버에 자동 연결). 여기서는 <strong>가입한 계정의 권한(역할) 변경·삭제</strong>와 <strong>발급된 초대 현황</strong>을 관리합니다. admin·professor 권한은 여기서 올려주세요.
      </div>

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
            { key: 'member', label: '멤버', render: r => {
                const nm = memberByEmail[(r.intended_email || '').trim().toLowerCase()]
                return nm ? nm : <span style={{ color: '#c33', fontSize: '0.72rem' }}>멤버 없음</span>
              } },
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
      {confirmUI}
    </div>
  )
}

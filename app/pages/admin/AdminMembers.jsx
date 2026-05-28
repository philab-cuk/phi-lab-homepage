import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Button, Table, Modal, Field, TextInput, TextArea, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'
import AdminRoles from './AdminRoles'

const STATUSES = ['current', 'alumni']

function emptyMember() {
  return {
    id: '', name: '', name_ko: null, role: '', title: null, degree: null,
    student_number: null, department: null, institution: null,
    photo_url: null, email: null, personal_site: null, linkedin: null, google_scholar: null,
    research_interests: null, bio_short: null, bio_full: null,
    education: null, experience: null, service: null,
    joined_at: null, status: 'current', display_order: 0,
  }
}

function arrJoin(a) { return Array.isArray(a) ? a.join(', ') : '' }
function arrSplit(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : null }

export default function AdminMembers() {
  const [rows, setRows] = useState([])
  const [view, setView] = useState('members') // 'members' | 'roles'
  const [tab, setTab] = useState('current')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()
  const [uploading, setUploading] = useState(false)
  const [accounts, setAccounts] = useState([]) // admin_users 목록 (멤버↔계정 매핑용)
  const [roleOptions, setRoleOptions] = useState([]) // member_roles 라벨 목록 (Role 드롭다운)
  const [pendingFile, setPendingFile] = useState(null) // 선택했지만 아직 업로드 안 한 사진
  const [previewUrl, setPreviewUrl] = useState(null)    // 로컬 미리보기(objectURL)

  // 파일 선택 시: 검증 후 메모리에만 보관 (업로드는 저장 때)
  function onSelectFile(file) {
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) { setError(new Error('jpg/png/webp 만 허용')); return }
    if (file.size > 10 * 1024 * 1024) { setError(new Error('10MB 초과')); return }
    setError(null)
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // 저장 시 실제 업로드
  async function uploadPending(memberId) {
    const ext = (pendingFile.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${memberId}/profile.${ext}`
    const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, pendingFile, {
      contentType: pendingFile.type, upsert: true,
    })
    if (upErr) throw upErr
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
    return `${data.publicUrl}?v=${Date.now()}`
  }

  function resetPhoto() { setPendingFile(null); setPreviewUrl(null) }

  async function load() {
    setLoading(true); setError(null)
    const [{ data, error }, { data: accs }, { data: roles }] = await Promise.all([
      supabase.from('members').select('*').order('status').order('joined_at', { ascending: true, nullsFirst: true }).order('display_order'),
      supabase.from('admin_users').select('email, role, display_name').order('added_at'),
      supabase.from('member_roles').select('label').order('sort_order'),
    ])
    if (error) setError(error)
    setRows(data || [])
    setAccounts(accs || [])
    setRoleOptions((roles || []).map(r => r.label))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setIsNew(true)
    resetPhoto()
    setEdit({ ...emptyMember(), id: crypto.randomUUID(), status: tab })
  }
  function openEdit(row) {
    setIsNew(false)
    resetPhoto()
    setEdit({ ...row })
  }
  function closeEdit() {
    resetPhoto()
    setEdit(null)
  }

  async function save() {
    setError(null); setUploading(true)
    try {
      const payload = {
        ...edit,
        research_interests: typeof edit.research_interests === 'string' ? arrSplit(edit.research_interests) : edit.research_interests,
        service: typeof edit.service === 'string' ? arrSplit(edit.service) : edit.service,
      }
      if (!payload.name || !payload.name_ko || !payload.role || !payload.status) {
        throw new Error('Name (English) / Name (Korean) / Role 은 필수 입력입니다')
      }
      if (!payload.joined_at) {
        throw new Error('연구실 합류일은 필수 입력입니다')
      }

      // id 는 폼 열 때 만든 UID (edit.id) 그대로 사용
      const memberId = edit.id

      // 선택해둔 사진이 있으면 이제 업로드 (저장 시점)
      if (pendingFile) {
        payload.photo_url = await uploadPending(memberId)
      }

      const op = isNew
        ? supabase.from('members').insert(payload)
        : supabase.from('members').update(payload).eq('id', payload.id)
      const { error } = await op
      if (error) throw error
      closeEdit()
      load()
    } catch (e) { setError(e) }
    finally { setUploading(false) }
  }

  async function del(row) {
    if (!(await confirm(`멤버 "${row.name}" (${row.id}) 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('members').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  // PI(교수)는 Members 목록에서 숨김 — Professor 화면에서 관리
  const filtered = rows.filter(r => r.status === tab && r.role !== 'Principal Investigator')

  if (view === 'roles') {
    return (
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <Button primary={false} onClick={() => { setView('members'); load() }}>Members</Button>
          <Button primary onClick={() => setView('roles')}>Member Roles</Button>
        </div>
        <AdminRoles />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <Button primary onClick={() => setView('members')}>Members</Button>
        <Button primary={false} onClick={() => setView('roles')}>Member Roles</Button>
      </div>
      <PageHeader
        title="Members"
        subtitle={`current ${rows.filter(r=>r.status==='current').length} · alumni ${rows.filter(r=>r.status==='alumni').length}`}
        actions={
          <>
            <Button onClick={() => setTab('current')} primary={tab==='current'}>Current</Button>
            <Button onClick={() => setTab('alumni')} primary={tab==='alumni'}>Alumni</Button>
            {deleteModeToggle}
            <Button primary onClick={openNew}>+ 새 멤버</Button>
          </>
        }
      />
      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          columns={[
            { key: 'id', label: 'ID', render: r => <code style={{ fontSize: '0.7rem' }}>{r.id}</code> },
            { key: 'name', label: 'Name', render: r => <>{r.name}{r.name_ko ? ` (${r.name_ko})` : ''}</> },
            { key: 'role', label: 'Role' },
            { key: 'joined_at', label: '합류일', render: r => r.joined_at || <span style={{ color: '#c33' }}>미입력</span> },
            { key: 'photo', label: '사진', render: r => r.photo_url ? <img src={r.photo_url} alt="" style={{ width: 32, height: 32, objectFit: 'cover' }} /> : '' },
            { key: 'email', label: 'Email' },
            {
              key: 'actions', label: '', render: r => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button onClick={() => openEdit(r)}>편집</Button>
                  <Button danger disabled={!deleteMode} onClick={() => del(r)}>삭제</Button>
                </div>
              )
            },
          ]}
          rows={filtered}
        />
      )}

      <Modal
        open={!!edit}
        onClose={closeEdit}
        title={edit ? (isNew ? '새 멤버' : `Edit: ${edit.id}`) : ''}
        footer={
          <>
            <Button onClick={closeEdit} disabled={uploading}>취소</Button>
            <Button primary onClick={save} disabled={uploading}>{uploading ? '저장 중…' : '저장'}</Button>
          </>
        }
      >
        {edit && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
            <Field label="ID" hint={isNew ? '자동 생성된 UID (변경 불가)' : '변경 불가.'}>
              <TextInput value={edit.id} disabled />
            </Field>
            <Field label="Status">
              <Select value={edit.status} options={STATUSES} onChange={e => setEdit({ ...edit, status: e.target.value })} />
            </Field>
            <Field label="연구실 합류일" required hint="이 날짜 순서로 멤버가 정렬됩니다.">
              <TextInput type="date" value={edit.joined_at || ''} onChange={e => setEdit({ ...edit, joined_at: e.target.value || null })} />
            </Field>
            <Field label="Name (English)" required><TextInput value={edit.name||''} onChange={e => setEdit({...edit, name: e.target.value})} /></Field>
            <Field label="Name (Korean)" required><TextInput value={edit.name_ko||''} onChange={e => setEdit({...edit, name_ko: e.target.value || null})} /></Field>
            <Field label="Role" required hint="목록은 위 'Member Roles' 탭에서 관리합니다.">
              <Select
                value={edit.role || ''}
                options={[
                  { value: '', label: '(선택)' },
                  ...roleOptions.map(r => ({ value: r, label: r })),
                  ...(edit.role && !roleOptions.includes(edit.role) ? [{ value: edit.role, label: `${edit.role} (목록 외)` }] : []),
                ]}
                onChange={e => setEdit({ ...edit, role: e.target.value })}
              />
            </Field>
            <Field label="Title"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value || null})} /></Field>
            <Field label="Degree"><TextInput value={edit.degree||''} onChange={e => setEdit({...edit, degree: e.target.value || null})} /></Field>
            <Field label="Student number / 학번"><TextInput value={edit.student_number||''} onChange={e => setEdit({...edit, student_number: e.target.value || null})} /></Field>
            <Field label="Department"><TextInput value={edit.department||''} onChange={e => setEdit({...edit, department: e.target.value || null})} /></Field>
            <Field label="Institution"><TextInput value={edit.institution||''} onChange={e => setEdit({...edit, institution: e.target.value || null})} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="사진" hint="jpg/png/webp, 10MB 이내. 저장을 눌러야 실제로 업로드됩니다.">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {(previewUrl || edit.photo_url) && (
                    <img src={previewUrl || edit.photo_url} alt="" style={{ width: 54, height: 72, objectFit: 'cover', border: '1px solid #ccc', flexShrink: 0 }} />
                  )}
                  <label style={{ display: 'inline-block', fontSize: '0.85rem', cursor: 'pointer', color: '#fff', background: '#222', border: '1px solid #000', padding: '0.4rem 0.8rem' }}>
                    {(previewUrl || edit.photo_url) ? '사진 변경' : '＋ 사진 선택'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => { onSelectFile(e.target.files?.[0]); e.target.value = '' }}
                    />
                  </label>
                  {pendingFile && <span style={{ fontSize: '0.75rem', color: '#888' }}>저장 시 업로드 예정</span>}
                </div>
              </Field>
            </div>
            <Field label="연결 계정 (Email)" hint="이 멤버를 쓸 user 계정. 연결하면 그 user 가 'My Profile' 에서 이 정보를 보고 직접 수정합니다.">
              <Select
                value={edit.email || ''}
                options={[
                  { value: '', label: '(연결 안 함)' },
                  ...accounts.map(a => ({ value: a.email, label: `${a.email}${a.display_name ? ` · ${a.display_name}` : ''} (${a.role})` })),
                  ...(edit.email && !accounts.some(a => a.email === edit.email)
                    ? [{ value: edit.email, label: `${edit.email} (목록 외)` }] : []),
                ]}
                onChange={e => setEdit({ ...edit, email: e.target.value || null })}
              />
            </Field>
            <Field label="Personal site"><TextInput value={edit.personal_site||''} onChange={e => setEdit({...edit, personal_site: e.target.value || null})} /></Field>
            <Field label="LinkedIn"><TextInput value={edit.linkedin||''} onChange={e => setEdit({...edit, linkedin: e.target.value || null})} /></Field>
            <Field label="Google Scholar"><TextInput value={edit.google_scholar||''} onChange={e => setEdit({...edit, google_scholar: e.target.value || null})} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Research interests (콤마 구분)">
                <TextInput
                  value={typeof edit.research_interests === 'string' ? edit.research_interests : arrJoin(edit.research_interests)}
                  onChange={e => setEdit({...edit, research_interests: e.target.value})}
                />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Service (콤마 구분)">
                <TextInput
                  value={typeof edit.service === 'string' ? edit.service : arrJoin(edit.service)}
                  onChange={e => setEdit({...edit, service: e.target.value})}
                />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Bio short"><TextArea value={edit.bio_short||''} onChange={e => setEdit({...edit, bio_short: e.target.value || null})} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Bio full"><TextArea rows={6} value={edit.bio_full||''} onChange={e => setEdit({...edit, bio_full: e.target.value || null})} /></Field>
            </div>
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

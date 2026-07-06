import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Table, Modal, Field, TextInput, TextArea, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'
import AdminRoles from './AdminRoles'

const DEGREES = ['학부생', '학사', '석사', '박사', '박사수료']

function emptyMember() {
  return {
    id: '', name: '', name_ko: null, role: '', title: null, degree: null,
    student_number: null, college: null, department: null, institution: null,
    photo_url: null, email: null, personal_site: null, linkedin: null, google_scholar: null,
    research_interests: null, bio_short: null, bio_full: null,
    education: null, experience: null, service: null,
    joined_at: new Date().toLocaleDateString('en-CA'), status: 'current', display_order: 0,
  }
}

function arrJoin(a) { return Array.isArray(a) ? a.join(', ') : '' }
function arrSplit(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : null }

export default function AdminMembers() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [view, setView] = useState('members') // 'members' | 'roles'
  const [tab, setTab] = useState('current')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [viewing, setViewing] = useState(false) // 행 클릭 → 보기(읽기 전용)
  const [original, setOriginal] = useState(null) // 편집 취소 시 되돌릴 원본
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()
  const [uploading, setUploading] = useState(false)
  const [accounts, setAccounts] = useState([]) // admin_users 목록 (멤버↔계정 매핑용)
  const [roleOptions, setRoleOptions] = useState([]) // member_roles 라벨 목록 (Role 드롭다운)
  const [pendingFile, setPendingFile] = useState(null) // 선택했지만 아직 업로드 안 한 사진
  const [previewUrl, setPreviewUrl] = useState(null)    // 로컬 미리보기(objectURL)
  const [inviteLink, setInviteLink] = useState(null)    // 방금 생성한 초대 링크(즉시 표시용)
  const [inviteBusy, setInviteBusy] = useState(false)
  const [copiedInvite, setCopiedInvite] = useState(false)
  const [copiedRow, setCopiedRow] = useState(null)      // 목록에서 링크 복사한 멤버 id (복사됨 표시)
  const [invites, setInvites] = useState([])            // 전체 초대 (연결 상태 배지 + 활성 링크용)

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
  function resetInvite() { setInviteLink(null); setCopiedInvite(false) }

  // 멤버 중심 초대(모든 초대의 정본): 이 멤버의 저장된 이메일로 researcher 초대 링크 발급.
  // 링크로 로그인하면 admin_users 화이트리스트 등록 + 이메일 일치로 이 멤버에 자동 연결.
  // 권한 승격(admin/professor)은 가입 후 Members / Invites 에서. (여긴 멤버 연결 전용)
  const inviteLinkFor = (token) => `${window.location.origin}/admin/accept?token=${token}`
  async function writeClipboard(link) {
    try { await navigator.clipboard.writeText(link) }
    catch { window.prompt('이 링크를 복사해 전달하세요:', link) }
  }
  // 초대 발급 코어: 멤버 이메일로 researcher 초대 1건 생성 → 토큰 반환. (같은 이메일 기존 활성 초대는 DB 트리거가 자동 만료)
  async function createInviteForEmail(email) {
    const e = norm(email)
    if (!e) throw new Error('멤버 이메일을 먼저 입력·저장한 뒤 초대 링크를 만들 수 있습니다.')
    const { data, error } = await supabase.from('invites')
      .insert({ intended_email: e, role: 'researcher', created_by: user?.email })
      .select('token').single()
    if (error) throw error
    await refreshInvites()
    return data.token
  }
  async function revokeInvite(token) {
    setError(null)
    const { error } = await supabase.from('invites').update({ expires_at: new Date().toISOString() }).eq('token', token)
    if (error) { setError(error); return }
    resetInvite()
    await refreshInvites()
  }

  // ── 모달 안 (인라인 링크 표시) ──
  async function generateInvite() {
    setError(null); setInviteBusy(true); resetInvite()
    try { setInviteLink(inviteLinkFor(await createInviteForEmail(original?.email))) }
    catch (e) { setError(e) }
    finally { setInviteBusy(false) }
  }
  async function copyInvite(link) {
    const l = link || inviteLink
    if (!l) return
    await writeClipboard(l)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2000)
  }

  // ── 목록 행 (모달 안 열고 바로 초대) ──
  function flashCopied(id) { setCopiedRow(id); setTimeout(() => setCopiedRow(r => (r === id ? null : r)), 2000) }
  async function rowGenerateInvite(member) {
    setError(null)
    try { const t = await createInviteForEmail(member.email); await writeClipboard(inviteLinkFor(t)); flashCopied(member.id) }
    catch (e) { setError(e) }
  }
  async function rowCopyInvite(member) {
    const inv = activeInviteFor(member.email)
    if (!inv) return
    await writeClipboard(inviteLinkFor(inv.token)); flashCopied(member.id)
  }
  async function rowRevokeInvite(member) {
    const inv = activeInviteFor(member.email)
    if (inv) await revokeInvite(inv.token)
  }

  async function load() {
    setLoading(true); setError(null)
    const [{ data, error }, { data: accs }, { data: roles }, { data: inv }] = await Promise.all([
      // 기본 fetch(안정적 순서). 최종 목록 정렬은 아래 byMember 로 클라이언트에서:
      // 역할(member_roles 순) → 합류일 → 이름 → ID.
      supabase.from('members').select('*').order('id', { ascending: true }),
      supabase.from('admin_users').select('email, role, display_name').order('added_at'),
      supabase.from('member_roles').select('label').order('sort_order'),
      supabase.from('invites').select('token, intended_email, expires_at, used_at').order('created_at', { ascending: false }),
    ])
    if (error) setError(error)
    setRows(data || [])
    setAccounts(accs || [])
    setRoleOptions((roles || []).map(r => r.label))
    setInvites(inv || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function refreshInvites() {
    const { data } = await supabase.from('invites').select('token, intended_email, expires_at, used_at').order('created_at', { ascending: false })
    setInvites(data || [])
  }

  // 멤버 연결 상태: 이메일없음 / 초대 전 / 초대 대기 / 연결됨(가입완료).
  const norm = (e) => (e || '').trim().toLowerCase()
  function activeInviteFor(email) {
    const e = norm(email)
    return invites.find(i => norm(i.intended_email) === e && !i.used_at && new Date(i.expires_at) > new Date()) || null
  }
  function memberStatus(m) {
    const email = norm(m?.email)
    if (!email) return { key: 'no-email', label: '이메일 없음', color: '#999' }
    if (accounts.some(a => norm(a.email) === email)) return { key: 'linked', label: '연결됨', color: '#080' }
    if (activeInviteFor(email)) return { key: 'pending', label: '초대 대기', color: '#06c' }
    return { key: 'not-invited', label: '초대 전', color: '#a60' }
  }

  function openNew() {
    setIsNew(true)
    resetPhoto()
    resetInvite()
    setViewing(false)
    setOriginal(null)
    setEdit({ ...emptyMember(), id: crypto.randomUUID(), status: tab })
  }
  function openView(row) {
    setIsNew(false)
    resetPhoto()
    resetInvite()
    setViewing(true)
    setOriginal({ ...row })
    setEdit({ ...row })
  }
  function openEdit(row) {
    setIsNew(false)
    resetPhoto()
    resetInvite()
    setViewing(false)
    setOriginal({ ...row })
    setEdit({ ...row })
  }
  function closeEdit() {
    resetPhoto()
    resetInvite()
    setViewing(false)
    setEdit(null)
  }
  // 편집 취소: 새 멤버면 닫고, 기존이면 변경 버리고 보기 모드로 복귀
  function cancelEdit() { if (isNew) closeEdit(); else { setEdit(original); setViewing(true) } }

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

  // PI(교수)는 Members 목록에서 숨김 — Professor 화면에서 관리.
  // PI 역할 = member_roles 목록 맨 앞(roleOptions[0]). 과거 한글 값도 함께 제외.
  const piRole = roleOptions[0]
  // 정렬: 역할(member_roles 지정 순서) → 합류일(미입력=창립 맨 앞) → 이름(영문) → ID.
  // 역할 순서는 알파벳이 아니라 member_roles.sort_order(=roleOptions 순서) 기준.
  const roleRank = (role) => { const i = roleOptions.indexOf(role); return i === -1 ? roleOptions.length : i }
  const byMember = (a, b) => {
    const rr = roleRank(a.role) - roleRank(b.role); if (rr) return rr
    const aj = a.joined_at || '', bj = b.joined_at || ''
    if (aj !== bj) { if (!aj) return -1; if (!bj) return 1; return aj < bj ? -1 : 1 }
    const an = a.name || '', bn = b.name || ''
    if (an !== bn) return an < bn ? -1 : 1
    return (a.id || '') < (b.id || '') ? -1 : 1
  }
  const filtered = rows.filter(r => r.status === tab && r.role !== '지도교수' && r.role !== piRole).sort(byMember)

  // 열려 있는 멤버(원본=저장값)의 초대·연결 상태
  const inviteStatus = memberStatus(original || {})
  const activeInvite = activeInviteFor(original?.email)
  const shownInviteLink = inviteLink || (activeInvite ? inviteLinkFor(activeInvite.token) : null)

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
        subtitle={`재학 ${rows.filter(r=>r.status==='current').length} · 졸업 ${rows.filter(r=>r.status==='alumni').length}`}
        actions={
          <>
            <Button onClick={() => setTab('current')} primary={tab==='current'}>재학</Button>
            <Button onClick={() => setTab('alumni')} primary={tab==='alumni'}>졸업</Button>
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
            { key: 'name', label: '이름', render: r => (
              <><strong>{r.name_ko || r.name}</strong>{r.name_ko && r.name ? <span style={{ color: '#888', marginLeft: 6 }}>{r.name}</span> : null}</>
            ) },
            { key: 'role', label: '역할' },
            { key: 'joined_at', label: '합류일', render: r => r.joined_at || <span style={{ color: '#c33' }}>미입력</span> },
            { key: 'photo', label: '사진', render: r => r.photo_url ? <img src={r.photo_url} alt="" style={{ width: 32, height: 32, objectFit: 'cover' }} /> : '' },
            { key: 'email', label: '이메일' },
            { key: 'conn', label: '연결/초대', render: r => {
                const s = memberStatus(r)
                const copied = copiedRow === r.id
                const stop = (fn) => (e) => { e.stopPropagation(); fn(r) }
                const btn = { padding: '0.2rem 0.5rem', fontSize: '0.72rem' }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', color: s.color, whiteSpace: 'nowrap' }}>● {s.label}</span>
                    {s.key === 'not-invited' && (
                      <Button style={btn} onClick={stop(rowGenerateInvite)}>{copied ? '링크 복사됨' : '초대 링크 생성'}</Button>
                    )}
                    {s.key === 'pending' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button style={btn} onClick={stop(rowCopyInvite)}>{copied ? '복사됨' : '링크 복사'}</Button>
                        <Button style={btn} onClick={stop(rowGenerateInvite)}>재발급</Button>
                      </div>
                    )}
                  </div>
                )
              } },
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
          onRowClick={openView}
        />
      )}

      <Modal
        open={!!edit}
        onClose={closeEdit}
        width={920}
        fixedHeight
        title={edit ? (viewing ? `보기: ${edit.name_ko || edit.name}` : (isNew ? '새 멤버' : `Edit: ${edit.id}`)) : ''}
        headerActions={viewing
          ? <><Button primary onClick={() => setViewing(false)}>편집하기</Button><Button onClick={closeEdit}>닫기</Button></>
          : <><Button primary onClick={save} disabled={uploading}>{uploading ? '저장 중…' : '저장'}</Button><Button onClick={cancelEdit} disabled={uploading}>취소</Button></>}
      >
        {edit && (
          <>
          <fieldset disabled={viewing} style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
            <Field label="ID" hint={isNew ? '자동 생성된 UID (변경 불가)' : '변경 불가.'}>
              <TextInput value={edit.id} disabled />
            </Field>
            <Field label="상태">
              <Select
                value={edit.status}
                options={[{ value: 'current', label: '재학' }, { value: 'alumni', label: '졸업' }]}
                onChange={e => setEdit({ ...edit, status: e.target.value })}
              />
            </Field>
            <Field label="연구실 합류일" required hint="이 날짜 순서로 멤버가 정렬됩니다.">
              <TextInput type="date" value={edit.joined_at || ''} onChange={e => setEdit({ ...edit, joined_at: e.target.value || null })} />
            </Field>
            <Field label="역할" required hint="목록은 위 'Member Roles' 탭에서 관리합니다.">
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
            <Field label="이름 (한글)" required hint="대표 이름. 목록·공개 페이지에서 메인으로 표시됩니다."><TextInput value={edit.name_ko||''} onChange={e => setEdit({...edit, name_ko: e.target.value || null})} /></Field>
            <Field label="이름 (영문)" required><TextInput value={edit.name||''} onChange={e => setEdit({...edit, name: e.target.value})} /></Field>
            <Field label="학위">
              <Select
                value={edit.degree || ''}
                options={[
                  { value: '', label: '(선택 안 함)' },
                  ...DEGREES.map(d => ({ value: d, label: d })),
                  ...(edit.degree && !DEGREES.includes(edit.degree) ? [{ value: edit.degree, label: `${edit.degree} (목록 외)` }] : []),
                ]}
                onChange={e => setEdit({ ...edit, degree: e.target.value || null })}
              />
            </Field>
            <Field label="학부" hint="예: 의생명·건강과학부"><TextInput value={edit.college||''} onChange={e => setEdit({...edit, college: e.target.value || null})} /></Field>
            <Field label="학과" hint="예: 바이오메디컬소프트웨어공학과"><TextInput value={edit.department||''} onChange={e => setEdit({...edit, department: e.target.value || null})} /></Field>
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
            <Field label="이메일 (로그인·연결용)" hint="이 사람이 로그인할 이메일. 저장 후 초대 링크를 발급하고, 그 이메일로 로그인하면 이 멤버에 자동 연결됩니다.">
              <TextInput
                type="email"
                list="member-account-emails"
                placeholder="name@example.com"
                value={edit.email || ''}
                onChange={e => setEdit({ ...edit, email: e.target.value || null })}
              />
              {/* 이미 등록된 계정 이메일 자동완성(연결 대상이 이미 가입돼 있을 때 편의) */}
              <datalist id="member-account-emails">
                {accounts.map(a => <option key={a.email} value={a.email}>{a.display_name ? `${a.display_name} (${a.role})` : a.role}</option>)}
              </datalist>
            </Field>
            <Field label="개인 홈페이지"><TextInput value={edit.personal_site||''} onChange={e => setEdit({...edit, personal_site: e.target.value || null})} /></Field>
            <Field label="링크드인 (LinkedIn)"><TextInput value={edit.linkedin||''} onChange={e => setEdit({...edit, linkedin: e.target.value || null})} /></Field>
            <Field label="구글 스칼라 (Google Scholar)"><TextInput value={edit.google_scholar||''} onChange={e => setEdit({...edit, google_scholar: e.target.value || null})} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="연구 관심분야 (콤마로 구분)">
                <TextInput
                  value={typeof edit.research_interests === 'string' ? edit.research_interests : arrJoin(edit.research_interests)}
                  onChange={e => setEdit({...edit, research_interests: e.target.value})}
                />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="소개 (짧게)"><TextArea value={edit.bio_short||''} onChange={e => setEdit({...edit, bio_short: e.target.value || null})} /></Field>
            </div>
          </fieldset>

          {/* 초대·연결 — 저장된 멤버 전용. 모든 초대의 정본. 보기/편집 모드 모두에서 동작. */}
          {!isNew && (
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #eee' }}>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                초대·연결 — 이 멤버의 이메일로 초대 링크(<strong>researcher</strong>)를 만들고, 그 링크로 로그인하면 이 멤버에 자동 연결됩니다.
                <span style={{ color: '#999' }}> 권한 승격(admin·professor)은 가입 후 Members / Invites 에서.</span>
              </div>

              {!original?.email ? (
                <div style={{ fontSize: '0.8rem', color: '#b00' }}>이메일을 입력·저장한 뒤 초대 링크를 만들 수 있습니다.</div>
              ) : inviteStatus.key === 'linked' ? (
                <div style={{ fontSize: '0.8rem', color: '#080' }}>
                  ✓ 연결됨 — <code>{original.email}</code> 계정에 연결(가입 완료). 권한 변경·삭제는 Members / Invites 에서.
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    상태: <span style={{ color: inviteStatus.color }}>● {inviteStatus.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button onClick={generateInvite} disabled={inviteBusy}>
                      {inviteBusy ? '생성 중…' : (activeInvite ? '초대 링크 재발급' : '초대 링크 생성')}
                    </Button>
                    {shownInviteLink && (
                      <>
                        <code style={{ fontSize: '0.72rem', background: '#f5f5f5', padding: '0.3rem 0.4rem', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shownInviteLink}</code>
                        <Button onClick={() => copyInvite(shownInviteLink)}>{copiedInvite ? '복사됨' : '링크 복사'}</Button>
                        {activeInvite && <Button danger onClick={() => revokeInvite(activeInvite.token)}>회수</Button>}
                      </>
                    )}
                  </div>
                  {edit.email !== original?.email && (
                    <div style={{ fontSize: '0.72rem', color: '#a60', marginTop: '0.35rem' }}>변경한 이메일은 저장 후 반영됩니다 — 현재는 저장된 이메일({original?.email})로 발급됩니다.</div>
                  )}
                </>
              )}
            </div>
          )}
          </>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

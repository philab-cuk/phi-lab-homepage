import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Field, TextInput, TextArea, Select, ErrorBanner } from '../../components/admin/AdminUI'

function arrJoin(a) { return Array.isArray(a) ? a.join(', ') : '' }
function arrSplit(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : null }

export default function AdminMyProfile() {
  const { user } = useAuth()
  const email = user?.email
  const [existing, setExisting] = useState(undefined) // undefined=로딩, null=없음, obj=있음
  const [edit, setEdit] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [pendingFile, setPendingFile] = useState(null) // 선택했지만 아직 업로드 안 한 사진
  const [previewUrl, setPreviewUrl] = useState(null)    // 로컬 미리보기(objectURL)
  const [roleOptions, setRoleOptions] = useState([])    // member_roles 라벨 목록 (Role 드롭다운)

  async function load() {
    setError(null)
    const [{ data, error }, { data: roles }] = await Promise.all([
      supabase.from('members').select('*').eq('email', email).maybeSingle(),
      supabase.from('member_roles').select('label').order('sort_order'),
    ])
    if (error) { setError(error); return }
    setRoleOptions((roles || []).map(r => r.label))
    setExisting(data || null)
    setEdit(data
      ? { ...data }
      : { name: '', name_ko: null, role: '', title: null, degree: null, department: null, institution: null,
          photo_url: null, personal_site: null, linkedin: null, google_scholar: null, joined_at: null,
          research_interests: null, bio_short: null, bio_full: null })
  }
  useEffect(() => { if (email) load() }, [email])

  // 파일 선택 시: 검증 후 메모리에만 보관 (업로드는 저장 때)
  function onSelectFile(file) {
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!['jpg','jpeg','png','webp'].includes(ext)) { setError(new Error('jpg/png/webp 만 허용')); return }
    if (file.size > 10 * 1024 * 1024) { setError(new Error('10MB 초과')); return }
    setError(null)
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // 저장 시 실제 업로드
  async function uploadPending(memberId) {
    const ext = (pendingFile.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${memberId}/profile.${ext}`
    const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, pendingFile, { contentType: pendingFile.type, upsert: true })
    if (upErr) throw upErr
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
    return `${data.publicUrl}?v=${Date.now()}`
  }

  async function save() {
    setError(null); setSaving(true); setSavedMsg(false)
    try {
      const common = {
        name: edit.name, name_ko: edit.name_ko || null, role: edit.role, title: edit.title || null,
        degree: edit.degree || null, department: edit.department || null, institution: edit.institution || null,
        photo_url: edit.photo_url || null, personal_site: edit.personal_site || null,
        linkedin: edit.linkedin || null, google_scholar: edit.google_scholar || null,
        research_interests: typeof edit.research_interests === 'string' ? arrSplit(edit.research_interests) : edit.research_interests,
        bio_short: edit.bio_short || null, bio_full: edit.bio_full || null,
        joined_at: edit.joined_at || null,
      }
      if (!common.name || !common.name_ko || !common.role) throw new Error('Name (English) / Name (Korean) / Role 은 필수 입력입니다')
      if (!common.joined_at) throw new Error('연구실 합류일은 필수 입력입니다')

      if (existing) {
        // 본인 행 수정 (email/id/status/display_order 는 건드리지 않음)
        if (pendingFile) common.photo_url = await uploadPending(existing.id)
        const { error } = await supabase.from('members').update(common).eq('id', existing.id)
        if (error) throw error
      } else {
        // 신규 등록: id 는 UID 자동, email 자동(본인), status=current, display_order=맨뒤
        const id = crypto.randomUUID()
        if (pendingFile) common.photo_url = await uploadPending(id)
        const { data: maxRow } = await supabase.from('members')
          .select('display_order').eq('status', 'current')
          .order('display_order', { ascending: false }).limit(1).maybeSingle()
        const display_order = (maxRow?.display_order ?? 0) + 10
        const { error } = await supabase.from('members').insert({
          ...common, id, email, status: 'current', display_order,
        })
        if (error) throw error
      }
      setPendingFile(null); setPreviewUrl(null)
      setSavedMsg(true)
      await load()
    } catch (e) { setError(e) } finally { setSaving(false) }
  }

  if (existing === undefined || !edit) {
    return <div><PageHeader title="My Profile" /><p>로딩 중…</p></div>
  }

  const isNew = !existing
  const disabledStyle = { background: '#f3f3f3', color: '#888' }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="My Profile"
        subtitle={isNew ? '아직 멤버 정보가 없습니다. 등록해 주세요.' : '내 멤버 정보를 수정할 수 있습니다.'}
      />
      <ErrorBanner error={error} />
      {savedMsg && <div style={{ background: '#efe', border: '1px solid #cfc', color: '#070', padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>저장되었습니다.</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
        <Field label="Email (자동)"><TextInput value={email} disabled style={disabledStyle} /></Field>
        <Field label="Status">
          <TextInput value={isNew ? 'current (등록 시 자동)' : existing.status} disabled style={disabledStyle} />
        </Field>
        <Field label="연구실 합류일" required hint="이 날짜 순서로 멤버가 정렬됩니다.">
          <TextInput type="date" value={edit.joined_at || ''} onChange={e => setEdit({ ...edit, joined_at: e.target.value || null })} />
        </Field>
        <Field label="Name (English)" required><TextInput value={edit.name||''} onChange={e => setEdit({...edit, name: e.target.value})} /></Field>
        <Field label="Name (Korean)" required><TextInput value={edit.name_ko||''} onChange={e => setEdit({...edit, name_ko: e.target.value || null})} /></Field>
        <Field label="Role" required hint="목록에서 선택하세요.">
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
        <Field label="Degree"><TextInput value={edit.degree||''} onChange={e => setEdit({...edit, degree: e.target.value || null})} /></Field>
        <Field label="Title"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value || null})} /></Field>
        <Field label="Department"><TextInput value={edit.department||''} onChange={e => setEdit({...edit, department: e.target.value || null})} /></Field>
        <Field label="Institution"><TextInput value={edit.institution||''} onChange={e => setEdit({...edit, institution: e.target.value || null})} /></Field>
        <Field label="Personal site"><TextInput value={edit.personal_site||''} onChange={e => setEdit({...edit, personal_site: e.target.value || null})} /></Field>
        <Field label="LinkedIn"><TextInput value={edit.linkedin||''} onChange={e => setEdit({...edit, linkedin: e.target.value || null})} /></Field>
        <Field label="Google Scholar"><TextInput value={edit.google_scholar||''} onChange={e => setEdit({...edit, google_scholar: e.target.value || null})} /></Field>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="사진" hint="jpg/png/webp, 10MB 이내. 저장을 눌러야 실제로 업로드됩니다.">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {(previewUrl || edit.photo_url) && <img src={previewUrl || edit.photo_url} alt="" style={{ width: 54, height: 72, objectFit: 'cover', border: '1px solid #ccc', flexShrink: 0 }} />}
              <label style={{ display: 'inline-block', fontSize: '0.85rem', cursor: 'pointer', color: '#fff', background: '#222', border: '1px solid #000', padding: '0.4rem 0.8rem' }}>
                {(previewUrl || edit.photo_url) ? '사진 변경' : '＋ 사진 선택'}
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                  onChange={(e) => { onSelectFile(e.target.files?.[0]); e.target.value = '' }} />
              </label>
              {pendingFile && <span style={{ fontSize: '0.75rem', color: '#888' }}>저장 시 업로드 예정</span>}
            </div>
          </Field>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Research interests (콤마 구분)">
            <TextInput value={typeof edit.research_interests === 'string' ? edit.research_interests : arrJoin(edit.research_interests)} onChange={e => setEdit({...edit, research_interests: e.target.value})} />
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Bio short"><TextArea value={edit.bio_short||''} onChange={e => setEdit({...edit, bio_short: e.target.value || null})} /></Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Bio full"><TextArea rows={6} value={edit.bio_full||''} onChange={e => setEdit({...edit, bio_full: e.target.value || null})} /></Field>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Button primary onClick={save} disabled={saving}>
          {saving ? '저장 중…' : (isNew ? '멤버 등록' : '변경 저장')}
        </Button>
        {!isNew && <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: '#888' }}>
          상태(current/alumni)·노출 순서는 운영자(교수님)가 조정합니다.
        </span>}
      </div>
    </div>
  )
}

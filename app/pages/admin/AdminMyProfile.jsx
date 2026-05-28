import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, Button, Field, TextInput, TextArea, ErrorBanner } from '../../components/admin/AdminUI'

function arrJoin(a) { return Array.isArray(a) ? a.join(', ') : '' }
function arrSplit(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : null }
function jsonText(v) { return v ? JSON.stringify(v, null, 2) : '' }
function parseJson(s) { if (!s?.trim()) return null; try { return JSON.parse(s) } catch { throw new Error('JSON 형식 오류') } }

function slugFromEmail(email) {
  return (email.split('@')[0] || 'member').toLowerCase().replace(/[^a-z0-9]/g, '') || 'member'
}

export default function AdminMyProfile() {
  const { user } = useAuth()
  const email = user?.email
  const [existing, setExisting] = useState(undefined) // undefined=로딩, null=없음, obj=있음
  const [edit, setEdit] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  async function load() {
    setError(null)
    const { data, error } = await supabase.from('members').select('*').eq('email', email).maybeSingle()
    if (error) { setError(error); return }
    setExisting(data || null)
    setEdit(data
      ? { ...data, _education_text: jsonText(data.education), _experience_text: jsonText(data.experience) }
      : { name: '', name_ko: null, role: '', title: null, degree: null, department: null, institution: null,
          photo_url: null, personal_site: null, linkedin: null, google_scholar: null,
          research_interests: null, bio_short: null, bio_full: null, _education_text: '', _experience_text: '' })
  }
  useEffect(() => { if (email) load() }, [email])

  async function handlePhotoUpload(file) {
    if (!file) return
    setError(null); setUploading(true)
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      if (!['jpg','jpeg','png','webp'].includes(ext)) throw new Error('jpg/png/webp 만 허용')
      if (file.size > 10 * 1024 * 1024) throw new Error('10MB 초과')
      const key = existing?.id || slugFromEmail(email)
      const path = `${key}/profile.${ext}`
      const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, file, { contentType: file.type, upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
      setEdit((e) => ({ ...e, photo_url: `${data.publicUrl}?v=${Date.now()}` }))
    } catch (e) { setError(e) } finally { setUploading(false) }
  }

  // 등록 시 고유 id 생성 (email prefix, 충돌 시 suffix)
  async function genUniqueId() {
    const base = slugFromEmail(email)
    let id = base, n = 1
    // 최대 몇 번만 시도
    for (let i = 0; i < 20; i++) {
      const { data } = await supabase.from('members').select('id').eq('id', id).maybeSingle()
      if (!data) return id
      n++; id = `${base}${n}`
    }
    return `${base}-${Date.now()}`
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
        education: edit._education_text ? parseJson(edit._education_text) : null,
        experience: edit._experience_text ? parseJson(edit._experience_text) : null,
      }
      if (!common.name || !common.role) throw new Error('이름 / 역할(role) 은 필수입니다')

      if (existing) {
        // 본인 행 수정 (email/id/status/display_order 는 건드리지 않음)
        const { error } = await supabase.from('members').update(common).eq('id', existing.id)
        if (error) throw error
      } else {
        // 신규 등록: id 자동, email 자동(본인), status=current, display_order=맨뒤
        const id = await genUniqueId()
        const { data: maxRow } = await supabase.from('members')
          .select('display_order').eq('status', 'current')
          .order('display_order', { ascending: false }).limit(1).maybeSingle()
        const display_order = (maxRow?.display_order ?? 0) + 10
        const { error } = await supabase.from('members').insert({
          ...common, id, email, status: 'current', display_order,
        })
        if (error) throw error
      }
      setSavedMsg(true)
      await load()
    } catch (e) { setError(e) } finally { setSaving(false) }
  }

  if (existing === undefined || !edit) {
    return <div><PageHeader title="내 프로필" /><p>로딩 중…</p></div>
  }

  const isNew = !existing
  const disabledStyle = { background: '#f3f3f3', color: '#888' }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="내 프로필"
        subtitle={isNew ? '아직 멤버 정보가 없습니다. 등록해 주세요.' : '내 멤버 정보를 수정할 수 있습니다.'}
      />
      <ErrorBanner error={error} />
      {savedMsg && <div style={{ background: '#efe', border: '1px solid #cfc', color: '#070', padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>저장되었습니다.</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
        <Field label="Email (자동)"><TextInput value={email} disabled style={disabledStyle} /></Field>
        <Field label="Status">
          <TextInput value={isNew ? 'current (등록 시 자동)' : existing.status} disabled style={disabledStyle} />
        </Field>
        <Field label="Name (English)"><TextInput value={edit.name||''} onChange={e => setEdit({...edit, name: e.target.value})} /></Field>
        <Field label="Name (Korean)"><TextInput value={edit.name_ko||''} onChange={e => setEdit({...edit, name_ko: e.target.value || null})} /></Field>
        <Field label="Role" hint="예: Undergraduate Researcher"><TextInput value={edit.role||''} onChange={e => setEdit({...edit, role: e.target.value})} /></Field>
        <Field label="Degree"><TextInput value={edit.degree||''} onChange={e => setEdit({...edit, degree: e.target.value || null})} /></Field>
        <Field label="Title"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value || null})} /></Field>
        <Field label="Department"><TextInput value={edit.department||''} onChange={e => setEdit({...edit, department: e.target.value || null})} /></Field>
        <Field label="Institution"><TextInput value={edit.institution||''} onChange={e => setEdit({...edit, institution: e.target.value || null})} /></Field>
        <Field label="Personal site"><TextInput value={edit.personal_site||''} onChange={e => setEdit({...edit, personal_site: e.target.value || null})} /></Field>
        <Field label="LinkedIn"><TextInput value={edit.linkedin||''} onChange={e => setEdit({...edit, linkedin: e.target.value || null})} /></Field>
        <Field label="Google Scholar"><TextInput value={edit.google_scholar||''} onChange={e => setEdit({...edit, google_scholar: e.target.value || null})} /></Field>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="사진" hint="jpg/png/webp, 10MB 이내">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {edit.photo_url && <img src={edit.photo_url} alt="" style={{ width: 54, height: 72, objectFit: 'cover', border: '1px solid #ccc', flexShrink: 0 }} />}
              <label style={{ display: 'inline-block', fontSize: '0.85rem', cursor: uploading ? 'default' : 'pointer', color: '#fff', background: '#222', border: '1px solid #000', padding: '0.4rem 0.8rem' }}>
                {uploading ? '업로드 중…' : (edit.photo_url ? '사진 변경' : '＋ 사진 업로드')}
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} disabled={uploading}
                  onChange={(e) => { handlePhotoUpload(e.target.files?.[0]); e.target.value = '' }} />
              </label>
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
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Education (JSON)" hint='예: [{"degree":"BSc","field":"...","institution":"..."}]'>
            <TextArea rows={4} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }} value={edit._education_text || ''} onChange={e => setEdit({...edit, _education_text: e.target.value})} />
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Experience (JSON)">
            <TextArea rows={5} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }} value={edit._experience_text || ''} onChange={e => setEdit({...edit, _experience_text: e.target.value})} />
          </Field>
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

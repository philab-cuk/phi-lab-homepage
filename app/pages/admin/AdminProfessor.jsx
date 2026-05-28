import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Button, Field, TextInput, TextArea, Select, ErrorBanner } from '../../components/admin/AdminUI'

const PI_ROLE = 'Principal Investigator'
const EXP_CATEGORIES = [
  { value: 'academic', label: 'Academic (학술)' },
  { value: 'technical', label: 'Technical (기술)' },
  { value: 'clinical', label: 'Clinical (임상)' },
  { value: 'other', label: 'Other (기타)' },
]

function arrJoin(a) { return Array.isArray(a) ? a.join(', ') : '' }
function arrSplit(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : null }
function lines(s) { return (s || '').split('\n').map(x => x.trim()).filter(Boolean) }

// 저장용 변환: 화면 편집 구조 → DB JSON
function cleanEducation(list) {
  const out = (list || [])
    .map(e => ({
      degree: e.degree?.trim() || '',
      field: e.field?.trim() || '',
      institution: e.institution?.trim() || '',
      ...(e.period?.trim() ? { period: e.period.trim() } : {}),
    }))
    .filter(e => e.degree || e.field || e.institution)
  return out.length ? out : null
}
function cleanExperience(list) {
  const out = (list || [])
    .map(e => {
      const details = lines(e._detailsText)
      const links = lines(e._linksText).map(line => {
        const [label, url] = line.split('|').map(s => s.trim())
        return { label: label || url || '', url: url || '' }
      }).filter(l => l.url)
      return {
        role: e.role?.trim() || '',
        organization: e.organization?.trim() || '',
        ...(e.period?.trim() ? { period: e.period.trim() } : {}),
        ...(e.location?.trim() ? { location: e.location.trim() } : {}),
        category: e.category || 'other',
        ...(e.focus?.trim() ? { focus: e.focus.trim() } : {}),
        ...(details.length ? { details } : {}),
        ...(links.length ? { externalLinks: links } : {}),
      }
    })
    .filter(e => e.role || e.organization)
  return out.length ? out : null
}

// DB → 화면 편집 구조
function expToEdit(e) {
  return {
    role: e.role || '', organization: e.organization || '', period: e.period || '',
    location: e.location || '', category: e.category || 'other', focus: e.focus || '',
    _detailsText: (e.details || []).join('\n'),
    _linksText: (e.externalLinks || []).map(l => `${l.label} | ${l.url}`).join('\n'),
  }
}

export default function AdminProfessor() {
  const [pi, setPi] = useState(undefined) // undefined=로딩, null=없음, obj=있음
  const [edit, setEdit] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  async function load() {
    setError(null)
    const { data, error } = await supabase.from('members').select('*').eq('role', PI_ROLE).order('created_at').limit(1).maybeSingle()
    if (error) { setError(error); return }
    setPi(data || null)
    if (data) {
      setEdit({
        ...data,
        education: (data.education || []).map(e => ({ degree: e.degree || '', field: e.field || '', institution: e.institution || '', period: e.period || '' })),
        experience: (data.experience || []).map(expToEdit),
      })
    }
  }
  useEffect(() => { load() }, [])

  function onSelectFile(file) {
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) { setError(new Error('jpg/png/webp 만 허용')); return }
    if (file.size > 10 * 1024 * 1024) { setError(new Error('10MB 초과')); return }
    setError(null); setPendingFile(file); setPreviewUrl(URL.createObjectURL(file))
  }
  async function uploadPending(memberId) {
    const ext = (pendingFile.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${memberId}/profile.${ext}`
    const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, pendingFile, { contentType: pendingFile.type, upsert: true })
    if (upErr) throw upErr
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
    return `${data.publicUrl}?v=${Date.now()}`
  }

  // Education 편집
  function addEdu() { setEdit(e => ({ ...e, education: [...(e.education || []), { degree: '', field: '', institution: '', period: '' }] })) }
  function setEdu(i, key, val) { setEdit(e => { const next = [...e.education]; next[i] = { ...next[i], [key]: val }; return { ...e, education: next } }) }
  function delEdu(i) { setEdit(e => ({ ...e, education: e.education.filter((_, k) => k !== i) })) }

  // Experience 편집
  function addExp() { setEdit(e => ({ ...e, experience: [...(e.experience || []), { role: '', organization: '', period: '', location: '', category: 'academic', focus: '', _detailsText: '', _linksText: '' }] })) }
  function setExp(i, key, val) { setEdit(e => { const next = [...e.experience]; next[i] = { ...next[i], [key]: val }; return { ...e, experience: next } }) }
  function delExp(i) { setEdit(e => ({ ...e, experience: e.experience.filter((_, k) => k !== i) })) }
  function moveExp(i, dir) {
    setEdit(e => { const next = [...e.experience]; const j = i + dir; if (j < 0 || j >= next.length) return e; [next[i], next[j]] = [next[j], next[i]]; return { ...e, experience: next } })
  }

  async function save() {
    setError(null); setSaving(true); setSavedMsg(false)
    try {
      if (!edit.name?.trim()) throw new Error('이름(영문)은 필수입니다')
      const payload = {
        name: edit.name, name_ko: edit.name_ko || null, title: edit.title || null,
        degree: edit.degree || null, department: edit.department || null, institution: edit.institution || null,
        personal_site: edit.personal_site || null, linkedin: edit.linkedin || null, google_scholar: edit.google_scholar || null,
        research_interests: typeof edit.research_interests === 'string' ? arrSplit(edit.research_interests) : edit.research_interests,
        bio_short: edit.bio_short || null, bio_full: edit.bio_full || null,
        education: cleanEducation(edit.education),
        experience: cleanExperience(edit.experience),
      }
      if (pendingFile) payload.photo_url = await uploadPending(pi.id)
      const { error } = await supabase.from('members').update(payload).eq('id', pi.id)
      if (error) throw error
      setPendingFile(null); setPreviewUrl(null); setSavedMsg(true)
      await load()
    } catch (e) { setError(e) } finally { setSaving(false) }
  }

  if (pi === undefined) return <div><PageHeader title="Professor" /><p>로딩 중…</p></div>
  if (pi === null) {
    return (
      <div>
        <PageHeader title="Professor" />
        <ErrorBanner error={error} />
        <p>책임교수(role = <code>{PI_ROLE}</code>) 멤버가 없습니다. Members 에서 한 명의 역할을 <strong>{PI_ROLE}</strong> 로 지정하면 여기서 관리됩니다.</p>
      </div>
    )
  }

  const cardStyle = { border: '1px solid #ddd', padding: '0.75rem', marginBottom: '0.6rem', background: '#fff' }

  return (
    <div style={{ maxWidth: 820 }}>
      <PageHeader title="Professor" subtitle="책임교수(PI) 프로필. 공개 Professor 페이지에 표시됩니다." />
      <ErrorBanner error={error} />
      {savedMsg && <div style={{ background: '#efe', border: '1px solid #cfc', color: '#070', padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>저장되었습니다.</div>}

      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 4 }}>기본 정보</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
        <Field label="Name (English)" required><TextInput value={edit.name || ''} onChange={e => setEdit({ ...edit, name: e.target.value })} /></Field>
        <Field label="Name (Korean)"><TextInput value={edit.name_ko || ''} onChange={e => setEdit({ ...edit, name_ko: e.target.value || null })} /></Field>
        <Field label="Title" hint="예: Assistant Professor"><TextInput value={edit.title || ''} onChange={e => setEdit({ ...edit, title: e.target.value || null })} /></Field>
        <Field label="Degree"><TextInput value={edit.degree || ''} onChange={e => setEdit({ ...edit, degree: e.target.value || null })} /></Field>
        <Field label="Department"><TextInput value={edit.department || ''} onChange={e => setEdit({ ...edit, department: e.target.value || null })} /></Field>
        <Field label="Institution"><TextInput value={edit.institution || ''} onChange={e => setEdit({ ...edit, institution: e.target.value || null })} /></Field>
        <Field label="Personal site"><TextInput value={edit.personal_site || ''} onChange={e => setEdit({ ...edit, personal_site: e.target.value || null })} /></Field>
        <Field label="LinkedIn"><TextInput value={edit.linkedin || ''} onChange={e => setEdit({ ...edit, linkedin: e.target.value || null })} /></Field>
        <Field label="Google Scholar"><TextInput value={edit.google_scholar || ''} onChange={e => setEdit({ ...edit, google_scholar: e.target.value || null })} /></Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="사진" hint="jpg/png/webp, 10MB 이내. 저장을 눌러야 업로드됩니다.">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {(previewUrl || edit.photo_url) && <img src={previewUrl || edit.photo_url} alt="" style={{ width: 54, height: 72, objectFit: 'cover', border: '1px solid #ccc' }} />}
              <label style={{ display: 'inline-block', fontSize: '0.85rem', cursor: 'pointer', color: '#fff', background: '#222', border: '1px solid #000', padding: '0.4rem 0.8rem' }}>
                {(previewUrl || edit.photo_url) ? '사진 변경' : '＋ 사진 선택'}
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => { onSelectFile(e.target.files?.[0]); e.target.value = '' }} />
              </label>
              {pendingFile && <span style={{ fontSize: '0.75rem', color: '#888' }}>저장 시 업로드 예정</span>}
            </div>
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Research interests (콤마 구분)">
            <TextInput value={typeof edit.research_interests === 'string' ? edit.research_interests : arrJoin(edit.research_interests)} onChange={e => setEdit({ ...edit, research_interests: e.target.value })} />
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Bio short" hint="멤버 목록 카드용 한 줄 소개"><TextArea value={edit.bio_short || ''} onChange={e => setEdit({ ...edit, bio_short: e.target.value || null })} /></Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Bio full" hint="Professor 페이지 본문 (문단은 빈 줄로 구분)"><TextArea rows={6} value={edit.bio_full || ''} onChange={e => setEdit({ ...edit, bio_full: e.target.value || null })} /></Field>
        </div>
      </div>

      {/* Education */}
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 4, marginTop: '1.5rem' }}>Education</h3>
      {(edit.education || []).map((ed, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem' }}>
            <Field label="Degree" hint="예: Ph.D., MSc, BSc"><TextInput value={ed.degree} onChange={e => setEdu(i, 'degree', e.target.value)} /></Field>
            <Field label="Field (전공)"><TextInput value={ed.field} onChange={e => setEdu(i, 'field', e.target.value)} /></Field>
            <Field label="Institution"><TextInput value={ed.institution} onChange={e => setEdu(i, 'institution', e.target.value)} /></Field>
            <Field label="Period (선택)" hint="예: 2015.3 – 2020.8"><TextInput value={ed.period} onChange={e => setEdu(i, 'period', e.target.value)} /></Field>
          </div>
          <div style={{ textAlign: 'right' }}><Button danger onClick={() => delEdu(i)}>학력 삭제</Button></div>
        </div>
      ))}
      <Button onClick={addEdu}>＋ 학력 추가</Button>

      {/* Experience */}
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 4, marginTop: '1.5rem' }}>Experience</h3>
      {(edit.experience || []).map((ex, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem' }}>
            <Field label="Role (직책)"><TextInput value={ex.role} onChange={e => setExp(i, 'role', e.target.value)} /></Field>
            <Field label="Category (분류)"><Select value={ex.category} options={EXP_CATEGORIES} onChange={e => setExp(i, 'category', e.target.value)} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Organization (기관)"><TextInput value={ex.organization} onChange={e => setExp(i, 'organization', e.target.value)} /></Field>
            </div>
            <Field label="Period" hint="예: 09/2021 – 03/2024"><TextInput value={ex.period} onChange={e => setExp(i, 'period', e.target.value)} /></Field>
            <Field label="Location"><TextInput value={ex.location} onChange={e => setExp(i, 'location', e.target.value)} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Focus (한 줄 요약, 선택)"><TextInput value={ex.focus} onChange={e => setExp(i, 'focus', e.target.value)} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Details (불릿, 한 줄에 하나)"><TextArea rows={3} value={ex._detailsText} onChange={e => setExp(i, '_detailsText', e.target.value)} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Links (한 줄에 하나, 형식: 이름 | 주소)"><TextArea rows={2} value={ex._linksText} onChange={e => setExp(i, '_linksText', e.target.value)} /></Field>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
            <Button onClick={() => moveExp(i, -1)} disabled={i === 0}>↑</Button>
            <Button onClick={() => moveExp(i, 1)} disabled={i === edit.experience.length - 1}>↓</Button>
            <Button danger onClick={() => delExp(i)}>경력 삭제</Button>
          </div>
        </div>
      ))}
      <Button onClick={addExp}>＋ 경력 추가</Button>

      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
        <Button primary onClick={save} disabled={saving}>{saving ? '저장 중…' : '변경 저장'}</Button>
      </div>
    </div>
  )
}

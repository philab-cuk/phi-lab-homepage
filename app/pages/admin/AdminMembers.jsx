import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Button, Table, Modal, Field, TextInput, TextArea, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

const STATUSES = ['current', 'alumni']

function emptyMember() {
  return {
    id: '', name: '', name_ko: null, role: '', title: null, degree: null,
    student_number: null, department: null, institution: null,
    photo_url: null, email: null, personal_site: null, linkedin: null, google_scholar: null,
    research_interests: null, bio_short: null, bio_full: null,
    education: null, experience: null, service: null,
    status: 'current', display_order: 0,
  }
}

function arrJoin(a) { return Array.isArray(a) ? a.join(', ') : '' }
function arrSplit(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : null }

function jsonText(v) { return v ? JSON.stringify(v, null, 2) : '' }
function parseJson(s) {
  if (!s?.trim()) return null
  try { return JSON.parse(s) } catch { throw new Error('JSON 형식 오류') }
}

export default function AdminMembers() {
  const [rows, setRows] = useState([])
  const [tab, setTab] = useState('current')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()
  const [uploading, setUploading] = useState(false)

  async function handlePhotoUpload(file) {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error('jpg/png/webp 만 허용')
      if (file.size > 10 * 1024 * 1024) throw new Error('10MB 초과')
      const entityKey = edit.id?.trim() || '_temp'
      const path = `${entityKey}/profile.${ext}`
      const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, file, {
        contentType: file.type, upsert: true,
      })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
      // 같은 경로 덮어쓰기 시 캐시 갱신용 쿼리
      setEdit((e) => ({ ...e, photo_url: `${data.publicUrl}?v=${Date.now()}` }))
    } catch (e) { setError(e) }
    finally { setUploading(false) }
  }

  async function load() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from('members').select('*').order('status').order('created_at').order('display_order')
    if (error) setError(error)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setIsNew(true)
    setEdit({ ...emptyMember(), status: tab })
  }
  function openEdit(row) {
    setIsNew(false)
    setEdit({ ...row })
  }

  async function save() {
    setError(null)
    try {
      const payload = {
        ...edit,
        research_interests: typeof edit.research_interests === 'string' ? arrSplit(edit.research_interests) : edit.research_interests,
        service: typeof edit.service === 'string' ? arrSplit(edit.service) : edit.service,
        education: typeof edit._education_text === 'string' ? parseJson(edit._education_text) : edit.education,
        experience: typeof edit._experience_text === 'string' ? parseJson(edit._experience_text) : edit.experience,
      }
      delete payload._education_text
      delete payload._experience_text
      if (!payload.id || !payload.name || !payload.role || !payload.status) {
        throw new Error('id / name / role / status 필수')
      }
      const op = isNew
        ? supabase.from('members').insert(payload)
        : supabase.from('members').update(payload).eq('id', payload.id)
      const { error } = await op
      if (error) throw error
      setEdit(null)
      load()
    } catch (e) { setError(e) }
  }

  async function del(row) {
    if (!(await confirm(`멤버 "${row.name}" (${row.id}) 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('members').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  const filtered = rows.filter(r => r.status === tab)

  return (
    <div>
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
            { key: 'display_order', label: '#', render: r => r.display_order },
            { key: 'id', label: 'ID', render: r => <code style={{ fontSize: '0.7rem' }}>{r.id}</code> },
            { key: 'name', label: 'Name', render: r => <>{r.name}{r.name_ko ? ` (${r.name_ko})` : ''}</> },
            { key: 'role', label: 'Role' },
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
        onClose={() => setEdit(null)}
        title={edit ? (isNew ? '새 멤버' : `Edit: ${edit.id}`) : ''}
        footer={
          <>
            <Button onClick={() => setEdit(null)}>취소</Button>
            <Button primary onClick={save}>저장</Button>
          </>
        }
      >
        {edit && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
            <Field label="ID (slug)" hint="hkim 같은 단순 slug. 변경 불가." >
              <TextInput value={edit.id} disabled={!isNew} onChange={e => setEdit({ ...edit, id: e.target.value })} />
            </Field>
            <Field label="Status">
              <Select value={edit.status} options={STATUSES} onChange={e => setEdit({ ...edit, status: e.target.value })} />
            </Field>
            <Field label="Name (English)"><TextInput value={edit.name||''} onChange={e => setEdit({...edit, name: e.target.value})} /></Field>
            <Field label="Name (Korean)"><TextInput value={edit.name_ko||''} onChange={e => setEdit({...edit, name_ko: e.target.value || null})} /></Field>
            <Field label="Role"><TextInput value={edit.role||''} onChange={e => setEdit({...edit, role: e.target.value})} /></Field>
            <Field label="Title"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value || null})} /></Field>
            <Field label="Degree"><TextInput value={edit.degree||''} onChange={e => setEdit({...edit, degree: e.target.value || null})} /></Field>
            <Field label="Student number / 학번"><TextInput value={edit.student_number||''} onChange={e => setEdit({...edit, student_number: e.target.value || null})} /></Field>
            <Field label="Department"><TextInput value={edit.department||''} onChange={e => setEdit({...edit, department: e.target.value || null})} /></Field>
            <Field label="Institution"><TextInput value={edit.institution||''} onChange={e => setEdit({...edit, institution: e.target.value || null})} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="사진" hint="파일 업로드(jpg/png/webp, 10MB 이내) 또는 URL 직접 입력. 새 멤버는 ID 입력 후 업로드하세요.">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  {edit.photo_url && (
                    <img src={edit.photo_url} alt="" style={{ width: 54, height: 72, objectFit: 'cover', border: '1px solid #ccc', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <TextInput value={edit.photo_url || ''} onChange={e => setEdit({ ...edit, photo_url: e.target.value || null })} placeholder="https://… 또는 아래 버튼으로 업로드" />
                    <label style={{ display: 'inline-block', marginTop: '0.4rem', fontSize: '0.8rem', cursor: uploading ? 'default' : 'pointer', color: '#06c' }}>
                      {uploading ? '업로드 중…' : '＋ 파일 업로드'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        disabled={uploading}
                        onChange={(e) => { handlePhotoUpload(e.target.files?.[0]); e.target.value = '' }}
                      />
                    </label>
                  </div>
                </div>
              </Field>
            </div>
            <Field label="Email"><TextInput value={edit.email||''} onChange={e => setEdit({...edit, email: e.target.value || null})} /></Field>
            <Field label="Personal site"><TextInput value={edit.personal_site||''} onChange={e => setEdit({...edit, personal_site: e.target.value || null})} /></Field>
            <Field label="LinkedIn"><TextInput value={edit.linkedin||''} onChange={e => setEdit({...edit, linkedin: e.target.value || null})} /></Field>
            <Field label="Google Scholar"><TextInput value={edit.google_scholar||''} onChange={e => setEdit({...edit, google_scholar: e.target.value || null})} /></Field>
            <Field label="Display order"><TextInput type="number" value={edit.display_order ?? 0} onChange={e => setEdit({...edit, display_order: Number(e.target.value)||0})} /></Field>
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
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Education (JSON)" hint='예: [{"degree":"Ph.D.","field":"Biomedical Informatics","institution":"SNU"}]'>
                <TextArea rows={4} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  value={edit._education_text != null ? edit._education_text : jsonText(edit.education)}
                  onChange={e => setEdit({...edit, _education_text: e.target.value})}
                />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Experience (JSON)">
                <TextArea rows={6} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  value={edit._experience_text != null ? edit._experience_text : jsonText(edit.experience)}
                  onChange={e => setEdit({...edit, _experience_text: e.target.value})}
                />
              </Field>
            </div>
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

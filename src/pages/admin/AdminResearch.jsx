import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Button, Table, Modal, Field, TextInput, TextArea, Select, ErrorBanner, useConfirm } from '../../components/admin/AdminUI'

const STATUSES = ['active', 'completed']

function arrJoin(a) { return Array.isArray(a) ? a.join(', ') : '' }
function arrSplit(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : null }
function jsonText(v) { return v ? JSON.stringify(v, null, 2) : '' }
function parseJson(s) {
  if (!s?.trim()) return null
  try { return JSON.parse(s) } catch { throw new Error('JSON 형식 오류') }
}

function emptyResearch() {
  return {
    id: '', title: '', full_title: null, description_ko: null,
    tags: null, tags_featured: null, collaborators: null,
    notes: null, funding_agency: null,
    featured: false, status: 'active', display_order: 0,
    _affiliations_text: '[]',
  }
}

export default function AdminResearch() {
  const [rows, setRows] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [confirm, confirmUI] = useConfirm()

  async function load() {
    setLoading(true); setError(null)
    const [{ data: r, error: rErr }, { data: ra }, { data: inst }] = await Promise.all([
      supabase.from('research').select('*').order('status').order('display_order'),
      supabase.from('research_affiliations').select('research_id, institution_id, department_en, department_ko, position').order('position'),
      supabase.from('institutions').select('id, name_en, name_ko').order('name_en'),
    ])
    if (rErr) { setError(rErr); setLoading(false); return }
    const byResearch = new Map()
    for (const a of (ra || [])) {
      if (!byResearch.has(a.research_id)) byResearch.set(a.research_id, [])
      byResearch.get(a.research_id).push(a)
    }
    setRows((r || []).map(x => ({ ...x, _affiliations: byResearch.get(x.id) || [] })))
    setInstitutions(inst || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    setError(null)
    try {
      const aff = parseJson(edit._affiliations_text)
      const payload = {
        id: edit.id, title: edit.title, full_title: edit.full_title,
        description_ko: edit.description_ko,
        tags: typeof edit.tags === 'string' ? arrSplit(edit.tags) : edit.tags,
        tags_featured: typeof edit.tags_featured === 'string' ? arrSplit(edit.tags_featured) : edit.tags_featured,
        collaborators: typeof edit._collaborators_text === 'string' ? parseJson(edit._collaborators_text) : edit.collaborators,
        notes: edit.notes, funding_agency: edit.funding_agency,
        featured: !!edit.featured, status: edit.status, display_order: edit.display_order||0,
      }
      if (!payload.id || !payload.title) throw new Error('id / title 필수')
      const op = isNew
        ? supabase.from('research').insert(payload)
        : supabase.from('research').update(payload).eq('id', payload.id)
      const { error: upErr } = await op
      if (upErr) throw upErr

      // affiliations: delete + reinsert (id 별)
      await supabase.from('research_affiliations').delete().eq('research_id', payload.id)
      if (Array.isArray(aff) && aff.length) {
        const affRows = aff.map((a, i) => ({
          research_id: payload.id,
          institution_id: a.institution_id,
          department_en: a.department_en ?? null,
          department_ko: a.department_ko ?? null,
          position: i,
        }))
        const { error: affErr } = await supabase.from('research_affiliations').insert(affRows)
        if (affErr) throw affErr
      }
      setEdit(null); load()
    } catch (e) { setError(e) }
  }

  async function del(row) {
    if (!(await confirm(`연구 "${row.title}" 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('research').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  function openEdit(row) {
    setIsNew(false)
    setEdit({
      ...row,
      _affiliations_text: JSON.stringify(row._affiliations.map(a => ({
        institution_id: a.institution_id,
        department_en: a.department_en,
        department_ko: a.department_ko,
      })), null, 2),
      _collaborators_text: jsonText(row.collaborators),
    })
  }

  return (
    <div>
      <PageHeader
        title="Research"
        subtitle={`${rows.length}개 (institutions ${institutions.length})`}
        actions={<Button primary onClick={() => { setIsNew(true); setEdit(emptyResearch()) }}>+ 새 연구</Button>}
      />
      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          columns={[
            { key: 'display_order', label: '#' },
            { key: 'id', label: 'ID', render: r => <code style={{ fontSize: '0.7rem' }}>{r.id}</code> },
            { key: 'title', label: 'Title', render: r => <>{r.title}{r.featured ? <span style={{ color: '#a60', marginLeft: 4 }}>★</span> : null}</> },
            { key: 'status', label: 'Status' },
            { key: 'tags', label: 'Tags', render: r => (r.tags || []).slice(0, 4).join(', ') },
            { key: 'aff', label: 'Inst.', render: r => r._affiliations.length },
            {
              key: 'actions', label: '', render: r => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button onClick={() => openEdit(r)}>편집</Button>
                  <Button danger onClick={() => del(r)}>삭제</Button>
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
        title={edit ? (isNew ? '새 연구' : `Edit: ${edit.id}`) : ''}
        footer={<><Button onClick={() => setEdit(null)}>취소</Button><Button primary onClick={save}>저장</Button></>}
      >
        {edit && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
            <Field label="ID"><TextInput value={edit.id} disabled={!isNew} onChange={e => setEdit({...edit, id: e.target.value})} /></Field>
            <Field label="Status"><Select value={edit.status} options={STATUSES} onChange={e => setEdit({...edit, status: e.target.value})} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Title"><TextInput value={edit.title||''} onChange={e => setEdit({...edit, title: e.target.value})} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Full title"><TextInput value={edit.full_title||''} onChange={e => setEdit({...edit, full_title: e.target.value || null})} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Description (KO)"><TextArea rows={3} value={edit.description_ko||''} onChange={e => setEdit({...edit, description_ko: e.target.value || null})} /></Field>
            </div>
            <Field label="Tags (콤마)"><TextInput value={typeof edit.tags === 'string' ? edit.tags : arrJoin(edit.tags)} onChange={e => setEdit({...edit, tags: e.target.value})} /></Field>
            <Field label="Tags featured (콤마)"><TextInput value={typeof edit.tags_featured === 'string' ? edit.tags_featured : arrJoin(edit.tags_featured)} onChange={e => setEdit({...edit, tags_featured: e.target.value})} /></Field>
            <Field label="Notes"><TextInput value={edit.notes||''} onChange={e => setEdit({...edit, notes: e.target.value || null})} /></Field>
            <Field label="Funding agency"><TextInput value={edit.funding_agency||''} onChange={e => setEdit({...edit, funding_agency: e.target.value || null})} /></Field>
            <Field label="Featured">
              <Select value={edit.featured ? 'true' : 'false'} options={['true','false']} onChange={e => setEdit({...edit, featured: e.target.value === 'true'})} />
            </Field>
            <Field label="Display order"><TextInput type="number" value={edit.display_order||0} onChange={e => setEdit({...edit, display_order: Number(e.target.value)||0})} /></Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field
                label="Affiliations (JSON 배열)"
                hint={`institutions 마스터 (${institutions.length}개) 의 id 참조. 예: [{"institution_id":"uuid","department_en":"...","department_ko":"..."}]`}
              >
                <TextArea rows={5} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  value={edit._affiliations_text || '[]'}
                  onChange={e => setEdit({...edit, _affiliations_text: e.target.value})}
                />
              </Field>
              <details style={{ marginTop: '0.25rem' }}>
                <summary style={{ fontSize: '0.75rem', color: '#06c', cursor: 'pointer' }}>institutions 목록 보기</summary>
                <ul style={{ fontSize: '0.7rem', maxHeight: 120, overflow: 'auto', background: '#f8f8f8', padding: '0.5rem', margin: '0.25rem 0' }}>
                  {institutions.map(i => <li key={i.id}><code>{i.id}</code> — {i.name_en}{i.name_ko ? ` (${i.name_ko})` : ''}</li>)}
                </ul>
              </details>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Collaborators (JSON)" hint={`자유 형식. 예: [{"name":"...","role":"..."}]`}>
                <TextArea rows={3} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  value={edit._collaborators_text != null ? edit._collaborators_text : jsonText(edit.collaborators)}
                  onChange={e => setEdit({...edit, _collaborators_text: e.target.value})}
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

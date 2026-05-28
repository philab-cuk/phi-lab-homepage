import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageHeader, Button, Table, Modal, Field, TextInput, TextArea, Select, ErrorBanner, useConfirm, useDeleteMode } from '../../components/admin/AdminUI'

const TERMS  = ['Spring', 'Summer', 'Fall', 'Winter']
const LEVELS = ['undergraduate', 'graduate']

function arrJoin(a) { return Array.isArray(a) ? a.join(', ') : '' }
function arrSplit(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : null }

function emptyLecture() {
  return {
    id: '', code: null, title_en: '', title_ko: null,
    semester: '', year: new Date().getFullYear(), term: 'Spring',
    level: 'undergraduate', language: null, description: null,
    objectives: null, images: null, tags: null, display_order: 0,
  }
}

export default function AdminLectures() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [confirm, confirmUI] = useConfirm()
  const [deleteMode, deleteModeToggle] = useDeleteMode()

  async function load() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from('lectures').select('*').order('year', { ascending: false }).order('term').order('display_order')
    if (error) setError(error)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    setError(null)
    try {
      const payload = {
        ...edit,
        objectives: typeof edit.objectives === 'string' ? arrSplit(edit.objectives) : edit.objectives,
        images:     typeof edit.images === 'string' ? arrSplit(edit.images) : edit.images,
        tags:       typeof edit.tags === 'string' ? arrSplit(edit.tags) : edit.tags,
      }
      if (!payload.id || !payload.title_en || !payload.semester || !payload.year || !payload.term || !payload.level) {
        throw new Error('id / title_en / semester / year / term / level 필수')
      }
      const op = isNew
        ? supabase.from('lectures').insert(payload)
        : supabase.from('lectures').update(payload).eq('id', payload.id)
      const { error } = await op
      if (error) throw error
      setEdit(null); load()
    } catch (e) { setError(e) }
  }

  async function del(row) {
    if (!(await confirm(`강의 "${row.title_en}" 을 삭제하시겠습니까?`))) return
    const { error } = await supabase.from('lectures').delete().eq('id', row.id)
    if (error) { setError(error); return }
    load()
  }

  return (
    <div>
      <PageHeader
        title="Lectures"
        subtitle={`${rows.length}개`}
        actions={<>{deleteModeToggle}<Button primary onClick={() => { setIsNew(true); setEdit(emptyLecture()) }}>+ 새 강의</Button></>}
      />
      <ErrorBanner error={error} />
      {loading ? <div>로딩 중…</div> : (
        <Table
          columns={[
            { key: 'id', label: 'ID', render: r => <code style={{ fontSize: '0.7rem' }}>{r.id}</code> },
            { key: 'semester', label: 'Semester' },
            { key: 'level', label: 'Level' },
            { key: 'title_en', label: 'Title', render: r => <>{r.title_en}{r.title_ko ? <div style={{ fontSize: '0.75rem', color: '#666' }}>{r.title_ko}</div> : null}</> },
            { key: 'code', label: 'Code' },
            {
              key: 'actions', label: '', render: r => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button onClick={() => { setIsNew(false); setEdit({ ...r }) }}>편집</Button>
                  <Button danger disabled={!deleteMode} onClick={() => del(r)}>삭제</Button>
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
        title={edit ? (isNew ? '새 강의' : `Edit: ${edit.id}`) : ''}
        footer={<><Button onClick={() => setEdit(null)}>취소</Button><Button primary onClick={save}>저장</Button></>}
      >
        {edit && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
            <Field label="ID (slug)"><TextInput value={edit.id} disabled={!isNew} onChange={e => setEdit({...edit, id: e.target.value})} /></Field>
            <Field label="Code"><TextInput value={edit.code||''} onChange={e => setEdit({...edit, code: e.target.value || null})} /></Field>
            <Field label="Title (EN)"><TextInput value={edit.title_en||''} onChange={e => setEdit({...edit, title_en: e.target.value})} /></Field>
            <Field label="Title (KO)"><TextInput value={edit.title_ko||''} onChange={e => setEdit({...edit, title_ko: e.target.value || null})} /></Field>
            <Field label="Semester (원문)" hint='예: "Spring 2026"'><TextInput value={edit.semester||''} onChange={e => setEdit({...edit, semester: e.target.value})} /></Field>
            <Field label="Year"><TextInput type="number" value={edit.year||0} onChange={e => setEdit({...edit, year: Number(e.target.value)||0})} /></Field>
            <Field label="Term"><Select value={edit.term} options={TERMS} onChange={e => setEdit({...edit, term: e.target.value})} /></Field>
            <Field label="Level"><Select value={edit.level} options={LEVELS} onChange={e => setEdit({...edit, level: e.target.value})} /></Field>
            <Field label="Language"><TextInput value={edit.language||''} onChange={e => setEdit({...edit, language: e.target.value || null})} /></Field>
            <Field label="Display order"><TextInput type="number" value={edit.display_order||0} onChange={e => setEdit({...edit, display_order: Number(e.target.value)||0})} /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Description"><TextArea rows={4} value={edit.description||''} onChange={e => setEdit({...edit, description: e.target.value || null})} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Objectives (콤마)"><TextInput value={typeof edit.objectives === 'string' ? edit.objectives : arrJoin(edit.objectives)} onChange={e => setEdit({...edit, objectives: e.target.value})} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Images (콤마, URL)"><TextInput value={typeof edit.images === 'string' ? edit.images : arrJoin(edit.images)} onChange={e => setEdit({...edit, images: e.target.value})} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Tags (콤마)"><TextInput value={typeof edit.tags === 'string' ? edit.tags : arrJoin(edit.tags)} onChange={e => setEdit({...edit, tags: e.target.value})} /></Field>
            </div>
          </div>
        )}
      </Modal>
      {confirmUI}
    </div>
  )
}

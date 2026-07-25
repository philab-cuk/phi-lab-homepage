import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { usePageMeta } from '../lib/usePageMeta'
import Calendar from '../components/Calendar'
import {
  CATEGORIES, CATEGORY_MAP, fetchSchedules, formatRange, todayYmd, ymd,
} from '../lib/schedules'
import {
  Modal, Button, Field, TextInput, TextArea, Select, ErrorBanner,
  useConfirm, useNotice, isPermissionError, permissionLines,
} from '../components/admin/AdminUI'

// Schedule — 로그인한 화이트리스트 구성원만 보는 공유 캘린더.
// 공개 Layout(헤더/푸터) 안에 있지만 데이터는 RLS 로 막혀 있어, 비로그인 방문자는
// 안내 화면만 본다(요청해도 빈 결과가 돌아온다).

function Gate({ title, children }) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1>Schedule</h1>
      <div className="mt-8 rounded-lg border border-rule bg-beige-50 px-6 py-10 text-center">
        <p className="my-0 text-lg font-semibold text-brand-900">{title}</p>
        <div className="mt-2 text-muted">{children}</div>
      </div>
    </div>
  )
}

function CategoryBadge({ category }) {
  const c = CATEGORY_MAP[category]
  if (!c) return null
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px]"
      style={{ background: `${c.color}1f`, color: c.color }}
    >
      <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: c.color }} />
      {c.label}
    </span>
  )
}

function emptyEvent(startsOn) {
  return { title: '', description: '', category: 'lab_meeting', startsOn, endsOn: '' }
}

export default function Schedule() {
  usePageMeta({ title: 'Schedule' })
  const { loading: authLoading, isAuthenticated, isWhitelisted, user, profile, role, isEditor } = useAuth()

  const now = new Date()
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [events, setEvents] = useState(null)   // null=로딩
  const [error, setError] = useState(null)

  const [detail, setDetail] = useState(null)   // 상세 모달
  const [dayList, setDayList] = useState(null) // 그날 목록 모달
  const [edit, setEdit] = useState(null)       // 등록/편집 폼
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  const [notify, noticeUI] = useNotice()
  const [confirm, confirmUI] = useConfirm()

  async function load() {
    setError(null)
    try {
      setEvents(await fetchSchedules())
    } catch (e) {
      setError(e)
      setEvents([])
    }
  }
  useEffect(() => {
    if (isWhitelisted) load()
  }, [isWhitelisted])

  // 보이는 달과 겹치는 일정만 캘린더에 넘긴다.
  const monthEvents = useMemo(() => {
    if (!events) return []
    const from = ymd(new Date(cursor.y, cursor.m, 1))
    const to = ymd(new Date(cursor.y, cursor.m + 1, 0))
    return events.filter((e) => e.startsOn <= to && (e.endsOn || e.startsOn) >= from)
  }, [events, cursor])

  const canEdit = (ev) => isEditor || (ev?.ownerEmail && ev.ownerEmail === user?.email)

  function move(delta) {
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }
  function goToday() {
    const d = new Date()
    setCursor({ y: d.getFullYear(), m: d.getMonth() })
  }

  function openNew(startsOn) {
    setIsNew(true)
    setDetail(null)
    setDayList(null)
    setEdit(emptyEvent(startsOn || todayYmd()))
  }
  function openEdit(ev) {
    setIsNew(false)
    setDetail(null)
    setEdit({ ...ev, description: ev.description ?? '', endsOn: ev.endsOn ?? '' })
  }

  async function save() {
    if (savingRef.current) return
    const title = edit.title?.trim()
    if (!title) { setError(new Error('제목을 입력하세요')); return }
    if (!edit.startsOn) { setError(new Error('시작일을 선택하세요')); return }
    if (edit.endsOn && edit.endsOn < edit.startsOn) {
      setError(new Error('종료일이 시작일보다 빠릅니다'))
      return
    }
    savingRef.current = true
    setSaving(true); setError(null)
    try {
      const payload = {
        title,
        description: edit.description?.trim() || null,
        category: edit.category,
        starts_on: edit.startsOn,
        ends_on: edit.endsOn || null,
      }
      if (isNew) {
        const { error } = await supabase.from('schedules').insert({
          ...payload,
          owner_email: user.email,
          owner_name: profile?.display_name || user.email,
        })
        if (error) throw error
      } else {
        // RLS 로 걸러지면 에러 없이 0행이 갱신된다 → .select() 로 실제 반영 확인.
        const { data, error } = await supabase
          .from('schedules')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', edit.id)
          .select('id')
        if (error) throw error
        if (!data || data.length === 0) {
          notify('저장되지 않았습니다 — 수정 권한 없음',
            permissionLines({ email: user?.email, role, subject: '이 일정', action: '수정' }))
          return
        }
      }
      setEdit(null)
      load()
    } catch (e) {
      if (isPermissionError(e)) {
        notify('저장되지 않았습니다 — 권한 없음',
          permissionLines({ email: user?.email, role, subject: '이 일정', action: isNew ? '등록' : '수정' }))
      } else setError(e)
    } finally { savingRef.current = false; setSaving(false) }
  }

  async function del(ev) {
    if (!(await confirm(`일정 "${ev.title}" 을 삭제하시겠습니까?`))) return
    const { data, error } = await supabase.from('schedules').delete().eq('id', ev.id).select('id')
    if (error) {
      if (isPermissionError(error)) {
        notify('삭제되지 않았습니다 — 권한 없음',
          permissionLines({ email: user?.email, role, subject: '이 일정', action: '삭제' }))
      } else setError(error)
      return
    }
    if (!data || data.length === 0) {
      notify('삭제되지 않았습니다 — 삭제 권한 없음',
        permissionLines({ email: user?.email, role, subject: '이 일정', action: '삭제' }))
      return
    }
    setDetail(null)
    load()
  }

  // ── 접근 제어 ────────────────────────────────────────────────────────────
  if (authLoading) {
    return <div className="mx-auto max-w-[1200px] px-6 py-12"><p className="text-muted">Loading…</p></div>
  }
  if (!isAuthenticated) {
    return (
      <Gate title="로그인이 필요합니다">
        <p className="my-0">연구실 구성원만 볼 수 있는 일정입니다.</p>
        <p className="mt-4 mb-0">
          <Link to="/admin/login" className="no-underline">
            <span className="rounded bg-brand-700 px-4 py-2 text-white">로그인</span>
          </Link>
        </p>
      </Gate>
    )
  }
  if (!isWhitelisted) {
    return (
      <Gate title="접근 권한이 없습니다">
        <p className="my-0">
          <code>{user?.email}</code> 계정은 연구실 구성원으로 등록되어 있지 않습니다.
        </p>
        <p className="mt-2 mb-0">관리자에게 초대를 요청하세요. (philab.cuk@gmail.com)</p>
      </Gate>
    )
  }

  const dayItems = dayList
    ? monthEvents.filter((e) => {
        const end = e.endsOn || e.startsOn
        return e.startsOn <= dayList && end >= dayList
      })
    : []

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="my-0">Schedule</h1>
        <p className="my-0 text-[15px] text-meta">연구실 공유 일정 · 구성원만 볼 수 있습니다</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => move(-1)} aria-label="이전 달"
            className="rounded border border-rule px-2.5 py-1 text-ink hover:bg-brand-50">‹</button>
          <span className="min-w-[124px] text-center text-lg font-semibold text-brand-900">
            {cursor.y}년 {cursor.m + 1}월
          </span>
          <button type="button" onClick={() => move(1)} aria-label="다음 달"
            className="rounded border border-rule px-2.5 py-1 text-ink hover:bg-brand-50">›</button>
        </div>
        <button type="button" onClick={goToday}
          className="rounded border border-rule px-3 py-1 text-[14px] text-ink hover:bg-brand-50">오늘</button>
        <div className="flex-1" />
        <button type="button" onClick={() => openNew()}
          className="rounded bg-brand-700 px-3.5 py-1.5 text-[14px] text-white hover:bg-brand-800">+ 새 일정</button>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted">
        {CATEGORIES.map((c) => (
          <span key={c.value} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[8px] w-[8px] rounded-full" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <ErrorBanner error={error} />
      </div>

      {events === null ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <Calendar
          year={cursor.y}
          month={cursor.m}
          events={monthEvents}
          onSelectEvent={(ev) => setDetail(ev)}
          onSelectDay={(d) => setDayList(d)}
        />
      )}

      {/* 상세 */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        width={560}
        title="일정 상세"
        mode="view"
        footer={
          detail && canEdit(detail) ? (
            <>
              <Button primary onClick={() => openEdit(detail)}>편집</Button>
              <Button danger onClick={() => del(detail)}>삭제</Button>
              <Button onClick={() => setDetail(null)}>닫기</Button>
            </>
          ) : (
            <Button onClick={() => setDetail(null)}>닫기</Button>
          )
        }
      >
        {detail && (
          <div>
            <CategoryBadge category={detail.category} />
            <p className="mt-3 mb-2 text-2xl font-semibold text-ink">{detail.title}</p>
            <p className="my-0 text-[15px] text-muted">{formatRange(detail.startsOn, detail.endsOn)}</p>
            <p className="my-0 text-[15px] text-meta">{detail.ownerName || detail.ownerEmail || '—'}</p>
            {detail.description && (
              <p className="mt-4 mb-0 whitespace-pre-wrap border-t border-rule pt-4 leading-relaxed">
                {detail.description}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* 그날 목록 */}
      <Modal
        open={!!dayList}
        onClose={() => setDayList(null)}
        width={480}
        title={dayList ? formatRange(dayList) : ''}
        mode="view"
        footer={
          <>
            <Button primary onClick={() => openNew(dayList)}>+ 이 날 일정 추가</Button>
            <Button onClick={() => setDayList(null)}>닫기</Button>
          </>
        }
      >
        {dayItems.length === 0 ? (
          <p className="my-0 text-muted">등록된 일정이 없습니다.</p>
        ) : (
          <div>
            {dayItems.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => { setDayList(null); setDetail(ev) }}
                className="flex w-full items-center gap-2.5 border-b border-rule py-2.5 text-left last:border-b-0 hover:bg-brand-50"
              >
                <span className="inline-block h-[9px] w-[9px] shrink-0 rounded-full"
                  style={{ background: CATEGORY_MAP[ev.category]?.color ?? '#888' }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ink">{ev.title}</span>
                  <span className="block text-[13px] text-meta">{ev.ownerName || ev.ownerEmail}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* 등록 / 편집 */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        width={560}
        title={isNew ? '새 일정' : '일정 편집'}
        mode={isNew ? 'new' : 'edit'}
        headerActions={
          <>
            <Button primary onClick={save} disabled={saving}>{saving ? '저장 중…' : '저장'}</Button>
            <Button onClick={() => setEdit(null)} disabled={saving}>취소</Button>
          </>
        }
      >
        {edit && (
          <div>
            <Field label="제목" required>
              <TextInput value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <Field label="구분">
                <Select
                  value={edit.category}
                  options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                  onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                />
              </Field>
              <Field label="시작일" required>
                <TextInput type="date" value={edit.startsOn}
                  onChange={(e) => setEdit({ ...edit, startsOn: e.target.value })} />
              </Field>
              <Field label="종료일" hint="여러 날이면 지정">
                <TextInput type="date" value={edit.endsOn}
                  onChange={(e) => setEdit({ ...edit, endsOn: e.target.value })} />
              </Field>
            </div>
            <Field label="내용" hint="선택">
              <TextArea value={edit.description}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
            </Field>
          </div>
        )}
      </Modal>

      {confirmUI}
      {noticeUI}
    </div>
  )
}

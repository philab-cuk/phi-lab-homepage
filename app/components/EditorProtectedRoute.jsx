import { Outlet } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import Forbidden from '../pages/admin/Forbidden'

// editor(admin/professor) 전용 가드. ProtectedRoute(인증+whitelist) 안쪽에 중첩.
export default function EditorProtectedRoute() {
  const { loading, isEditor } = useAuth()
  if (loading) return <div style={{ padding: '2rem' }}>로딩 중…</div>
  if (!isEditor) return <Forbidden />
  return <Outlet />
}

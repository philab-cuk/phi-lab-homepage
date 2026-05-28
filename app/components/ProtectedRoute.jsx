import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import Forbidden from '../pages/admin/Forbidden'

/**
 * 인증/권한 가드.
 * - 미인증: /admin/login 으로 redirect (원래 경로 state 저장)
 * - 인증됐지만 admin_users 에 없음: <Forbidden /> 인라인 render (redirect 루프 방지)
 * - requireEditor=true 인데 editor 아님: <Forbidden />
 * - allowedRoles 지정 시 그 안에 포함돼야
 */
export default function ProtectedRoute({ requireEditor = false, allowedRoles }) {
  const { loading, isAuthenticated, isWhitelisted, isEditor, role } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: '2rem' }}>로딩 중…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!isWhitelisted) {
    return <Forbidden />
  }

  if (requireEditor && !isEditor) {
    return <Forbidden />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Forbidden />
  }

  return <Outlet />
}
